// composables/auth.ts
import { ref, onMounted } from "vue";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useCookie } from "#app";

export const useAuth = () => {
  const { $auth, $db } = useNuxtApp();
  const currentUser = ref<any>(null);
  const error = ref<string | null>(null);
  const message = ref<string | null>(null);

  // Sign up (for both normal users and for the admin’s *first* creation)
  const signUp = async (fullName: string, email: string, password: string) => {
    error.value = null;
    const cred = await createUserWithEmailAndPassword($auth, email, password);
    await updateProfile(cred.user, { displayName: fullName });
    await sendEmailVerification(cred.user);
    await signOut($auth); // block access until verified
    message.value = "Verification link sent. Verify email before logging in.";
    return cred.user;
  };

  // Admin login (call this in your admin login page)
  const adminLogin = async (email: string, password: string) => {
    error.value = null;
    const cred = await signInWithEmailAndPassword($auth, email, password);

    // must be verified
    if (!cred.user.emailVerified) {
      await signOut($auth);
      throw new Error("Please verify your email before logging in.");
    }

    // must exist in admins collection
    const snap = await getDoc(doc($db, "admins", cred.user.uid));
    if (!snap.exists()) {
      await signOut($auth);
      throw new Error("You do not have admin access.");
    }

    // set cookie token if you need it
    const token = await cred.user.getIdToken();
    useCookie("accessToken", { maxAge: 3600 }).value = token;

    currentUser.value = cred.user;
    return cred.user;
  };

  const logout = async () => {
    await $auth.signOut();
    useCookie("accessToken").value = null;
    currentUser.value = null;
  };

  onMounted(() => {
    onAuthStateChanged($auth, (user) => {
      currentUser.value = user ?? null;
    });
  });

  return { currentUser, error, message, signUp, adminLogin, logout };
};
