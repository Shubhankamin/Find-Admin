// middleware/admin.ts
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default defineNuxtRouteMiddleware(async () => {
  const { $auth, $db } = useNuxtApp();

  const user = await new Promise<import("firebase/auth").User | null>(
    (resolve) =>
      onAuthStateChanged(
        $auth,
        (u) => resolve(u),
        () => resolve(null)
      )
  );

  if (!user || !user.emailVerified) return navigateTo("/login");

  const snap = await getDoc(doc($db, "admins", user.uid));
  if (!snap.exists()) return navigateTo("/login");
});
