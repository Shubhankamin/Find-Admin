// middleware/admin.global.ts
import { doc, getDoc } from "firebase/firestore";

export default defineNuxtRouteMiddleware(async (to) => {
  const { $db } = useNuxtApp();
  const userCookie = useCookie("user");

  // If no user → redirect
  if (!userCookie.value) {
    if (to.path !== "/login") return navigateTo("/login");
    return;
  }

  if (process.client) {
    try {
      const snap = await getDoc(doc($db, "admins", userCookie.value.uid));
      if (!snap.exists()) {
        userCookie.value = null;
        if (to.path !== "/login") {
          return navigateTo("/login?error=not_admin");
        }
      }
    } catch (err) {
      console.error("Admin check failed:", err);
      userCookie.value = null;
      return navigateTo("/login?error=firestore");
    }
  }

  // Redirect to dashboard if already logged in and hits /login
  if (userCookie.value && to.path === "/login") {
    return navigateTo("/");
  }
});
