import nodemailer from "nodemailer";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { email, itemName } = req.query;

  if (!email || !itemName) {
    return res.status(400).json({ error: "Missing email or itemName" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Item Verified</title>
    </head>
    <body style="margin: 0; padding: 0; background: #f5f5f5; font-family: Arial, sans-serif;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; margin-top: 30px; border-radius: 10px; overflow: hidden;">
        <tr>
          <td style="background: #2563eb; padding: 18px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0;">Lost & Found Portal</h2>
          </td>
        </tr>

        <tr>
          <td style="padding: 25px;">
            <h3 style="margin: 0 0 15px; color: #333333;">Your item is verified ✔</h3>
            <p style="margin: 0 0 15px; color: #555555; font-size: 15px;">
              Hello,
            </p>
            <p style="margin: 0 0 15px; color: #555555; font-size: 15px;">
              Your lost item listing has been successfully <strong>verified by the admin</strong>.
            </p>

            <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 15px; background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px;">
              <tr>
                <td style="padding: 15px;">
                  <p style="margin: 0; font-size: 14px; color: #444;">
                    <strong>Item Name:</strong> ${itemName}
                  </p>
                  <p style="margin: 10px 0 0; font-size: 14px; color: #444;">
                    Status: <strong style="color: green;">Verified</strong>
                  </p>
                </td>
              </tr>
            </table>

            <div style="text-align: center; margin: 25px 0;">
              <a href="https://lostorfound.netlify.app/" 
                style="background: #2563eb; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-size: 15px; display: inline-block;">
                View Your Item
              </a>
            </div>

            <p style="font-size: 13px; color: #777777;">
              If you did not expect this email, please disregard it.
            </p>
          </td>
        </tr>

        <tr>
          <td style="text-align: center; padding: 15px; background: #f0f0f0;">
            <p style="font-size: 12px; color: #777777; margin: 0;">
              © ${new Date().getFullYear()} Lost & Found Portal
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from: `"Lost & Found" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "🎉 Your Lost Item Has Been Verified",
      html: htmlTemplate,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Send error:", error);
    return res.status(500).json({ error: "Email failed" });
  }
}
