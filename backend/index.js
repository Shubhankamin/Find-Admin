import express from "express";
import nodemailer from "nodemailer";
import admin from "firebase-admin";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

// GLOBAL CORS FIX — REQUIRED FOR VERCEL
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
// Firebase Admin init
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}
const db = admin.firestore();

// Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Build HTML email
const buildLostItemEmail = ({
  variant,
  itemName,
  expiryDate,
  appName,
  userName = "User",
  ctaUrl,
  supportEmail = process.env.SUPPORT_EMAIL || process.env.GMAIL_USER,
}) => {
  const formattedDate = expiryDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  let title, bodyText, itemStatus, daysLeft;

  if (variant === "5_days") {
    daysLeft = 5;
    title = "Reminder: Your lost item expires in 5 days";
    bodyText = `This is a reminder that your lost item listing is close to expiry. Kindly review it soon.`;
    itemStatus = "Active";
  } else if (variant === "1_day") {
    daysLeft = 1;
    title = "Reminder: Your lost item expires tomorrow";
    bodyText = `Your lost item listing will expire tomorrow. Please check your request if needed.`;
    itemStatus = "Active (expiring soon)";
  } else if (variant === "expired") {
    daysLeft = null;
    title = "Your lost item listing has expired";
    bodyText = `Your lost item listing has reached its expiry date and is now marked as expired.`;
    itemStatus = "Expired";
  } else {
    throw new Error("Unknown email variant");
  }

  return `
<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
<head>
<meta charset="UTF-8"/>
<title>${title}</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f7;">
<table width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;">
<tr><td align="center">
<table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; background:#fff; border-radius:8px; overflow:hidden;">
<tr>
<td style="padding:16px 24px; background:#111827;">
<span style="font-size:20px; color:#fff; font-weight:600;">Lost & Found</span>
</td>
</tr>
<tr>
<td style="padding:24px;">
<h2 style="margin:0 0 12px; font-size:20px; color:#111827;">${title}</h2>
<p style="margin:0 0 16px; font-size:14px; color:#4b5563;">Hi ${userName},</p>
<p style="margin:0 0 16px; font-size:14px; color:#4b5563;">${bodyText}</p>
</td>
</tr>
<tr>
<td style="padding:0 24px 16px;">
<table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb; border-radius:8px; background:#f9fafb;">
<tr><td style="padding:12px 16px;">
<p style="margin:0; font-size:14px; color:#111827;"><strong>Item:</strong> ${itemName}</p>
<p style="margin:4px 0; font-size:14px; color:#111827;"><strong>Status:</strong> ${itemStatus}</p>
<p style="margin:4px 0; font-size:14px; color:#111827;"><strong>Expires on:</strong> ${formattedDate}
${
  daysLeft
    ? `<span style="color:#6b7280;"> (${daysLeft} day${
        daysLeft === 1 ? "" : "s"
      } left)</span>`
    : ""
}
</p>
</td></tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 24px 24px;">
<a href="${ctaUrl}" style="background:#2563eb; color:#fff; padding:10px 18px; border-radius:999px; text-decoration:none; font-size:14px;">
View Item
</a>
<p style="margin-top:12px; font-size:12px; color:#9ca3af;">If the button doesn't work, use this link:<br>${ctaUrl}</p>
</td>
</tr>
<tr>
<td style="padding:16px 24px 24px;">
<p style="margin:0; font-size:12px; color:#9ca3af;">
If this was not you, contact: <a href="mailto:${supportEmail}" style="color:#6b7280;">${supportEmail}</a>
</p>
</td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>`;
};

// app.get("/sendVerificationEmail", async (req, res) => {
//   try {
//     await transporter.sendMail({
//       from: process.env.GMAIL_USER,
//       to: "test@gmail.com", // static test email
//       subject: "GET method test",
//       text: "This is a GET request email test.",
//     });

//     return res.send("GET email sent successfully");
//   } catch (err) {
//     console.error(err);
//     return res.status(500).send("Email failed: " + err.message);
//   }
// });

// Test endpoint
app.get("/test-mail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Lost & Found" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "SMTP Working ✔",
      html: "<h1>SMTP is working</h1><p>You received this test email successfully.</p>",
    });
    res.send("Test mail sent successfully ✔");
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

// Daily expiry cron
app.get("/check-expiry", async (req, res) => {
  // TEMPORARILY DISABLED SECURITY
  console.warn("⚠️ /check-expiry accessed without security key");

  try {
    const now = new Date();
    const snapshot = await db.collection("lost_item").get();

    for (const doc of snapshot.docs) {
      const item = doc.data();
      if (!item.expiryDate || item.status === "claimed") continue;

      const expiry = item.expiryDate.toDate
        ? item.expiryDate.toDate()
        : new Date(item.expiryDate);
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      const email = item.contactEmail;
      if (!email) continue;

      let subject = null;
      let html = null;

      if (daysLeft === 5 && !item.mail_5) {
        subject = "Reminder: Your Lost Item Expires in 5 Days";
        html = buildLostItemEmail({
          variant: "5_days",
          itemName: item.itemName,
          expiryDate: expiry,
          userName: item.userName || "User",
          appName: "Lost & Found Portal",
          ctaUrl: "https://lostorfound.netlify.app/",
        });
        await doc.ref.update({ mail_5: true });
      } else if (daysLeft === 1 && !item.mail_1) {
        subject = "Reminder: Your Lost Item Expires Tomorrow";
        html = buildLostItemEmail({
          variant: "1_day",
          itemName: item.itemName,
          expiryDate: expiry,
          userName: item.userName || "User",
          appName: "Lost & Found Portal",
          ctaUrl: "https://lostorfound.netlify.app/",
        });
        await doc.ref.update({ mail_1: true });
      } else if (daysLeft <= 0 && !item.mail_expired) {
        subject = "Your Lost Item Has Expired";
        html = buildLostItemEmail({
          variant: "expired",
          itemName: item.itemName,
          expiryDate: expiry,
          userName: item.userName || "User",
          appName: "Lost & Found Portal",
          ctaUrl: "https://lostorfound.netlify.app/",
        });
        await doc.ref.update({ mail_expired: true, status: "expired" });
      }

      if (subject && html) {
        await transporter.sendMail({
          from: `"Lost & Found" <${process.env.GMAIL_USER}>`,
          to: email,
          subject,
          html,
        });
      }
    }

    res.send("Expiry check completed");
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.get("/testEmail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "YOUR_PERSONAL_EMAIL@gmail.com",
      subject: "Backend Email Test",
      text: "This is a test email from the backend.",
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Email test failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// app.post("/sendVerificationEmail", async (req, res) => {
//   const { email, itemName } = req.body;

//   if (!email || !itemName) {
//     return res.status(400).json({ error: "Missing email or itemName" });
//   }

//   try {
//     await transporter.sendMail({
//       from: process.env.GMAIL_USER,
//       to: email,
//       subject: "Your lost item is verified",
//       text: `Your item "${itemName}" is now verified and visible on the client site.`,
//     });

//     return res.json({ success: true });
//   } catch (err) {
//     console.error("Error sending verification email:", err);
//     return res.status(500).json({ error: "Failed to send email" });
//   }
// });

// fetch(
//   "https://lostfound-backend-iqbon08zf-shubhanks-projects-2f076b2d.vercel.app/sendVerificationEmail",
//   {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       email: "test@gmail.com",
//       itemName: "Test item",
//     }),
//   }
// )
//   .then((r) => r.json())
//   .then(console.log)
//   .catch(console.error);

// app.options("/verifyItem", (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   res.status(200).end();
// });

// app.get("/verifyItem", (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   const { email, itemName } = req.query;

//   if (!email || !itemName) {
//     return res.status(400).json({ error: "Missing email or itemName" });
//   }

//   transporter.sendMail(
//     {
//       from: process.env.GMAIL_USER,
//       to: email,
//       subject: "Your lost item is verified!",
//       text: `Your item "${itemName}" is now verified.`,
//     },
//     (err) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: "Email failed" });
//       }

//       return res.json({ success: true });
//     }
//   );
// });

// app.get("/ping", (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.json({ message: "pong", time: Date.now() });
// });

// REQUIRED FOR VERCEL — do NOT use app.listen()
export default app;
