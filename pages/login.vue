<template>
  <v-container fluid class="bg-grey-lighten-4 fill-height">
    <v-row justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="4" class="d-flex align-center">
        <v-card class="pa-8 w-100" elevation="10" rounded="xl">
          <!-- Logo -->
          <div class="text-center mb-6">
            <v-icon color="primary" size="48">mdi-shield-lock</v-icon>
            <h2 class="text-h5 font-weight-bold mt-3">Admin Login</h2>
          </div>

          <v-form ref="form" v-model="valid" @submit.prevent="login">
            <!-- Email -->
            <v-text-field
              v-model="email"
              placeholder="Enter your email"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              type="email"
              class="mb-4"
              :rules="emailRules"
              required
            ></v-text-field>

            <!-- Password -->
            <v-text-field
              v-model="password"
              placeholder="Enter your password"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              type="password"
              class="mb-6"
              :rules="passwordRules"
              required
            ></v-text-field>

            <!-- Submit Button -->
            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
              :disabled="!valid"
            >
              Login
            </v-btn>
          </v-form>

          <!-- Forgot Password -->
          <!-- <div class="text-center mt-4">
            <NuxtLink
              to="/admin/forgot-password"
              class="text-primary text-decoration-none"
            >
              Forgot Password?
            </NuxtLink>
          </div> -->
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor">
      {{ snackbarMessage }}
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

definePageMeta({
  layout: "custom",
});
const email = ref("");
const password = ref("");
const valid = ref(false);
const loading = ref(false);

const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error"); // 'success' for success messages

const router = useRouter();
const auth = getAuth();
const db = getFirestore();

// ✅ Validation rules
const emailRules = [
  (v) => !!v || "Email is required",
  (v) => /.+@.+\..+/.test(v) || "Email must be valid",
];
const passwordRules = [
  (v) => !!v || "Password is required",
  (v) => v.length >= 6 || "Password must be at least 6 characters",
];

const login = async () => {
  const form = valid;
  if (!valid.value) return;

  loading.value = true;
  snackbar.value = false;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    const user = userCredential.user;

    // Check if user is admin
    const adminRef = doc(db, "admins", user.uid);
    console.log("Checking admin access for UID:", user.uid);
    const adminDoc = await getDoc(adminRef);
    console.log("Admin document data:", adminDoc.data());

    if (adminDoc.exists()) {
      console.log("Admin data:", adminDoc.data());
      const userCookie = useCookie("user");
      userCookie.value = {
        uid: user.uid,
        email: user.email,
      };

      snackbarColor.value = "success";
      snackbarMessage.value = "Login successful!";
      snackbar.value = true;

      await router.push("/");
    } else {
      await signOut(auth);
      snackbarColor.value = "error";
      snackbarMessage.value = "Access denied: You are not an admin.";
      snackbar.value = true;

      // form.reset();
    }
  } catch (error) {
    console.error("Login error:", error.code, error.message);
    snackbarColor.value = "error";
    snackbarMessage.value = error.message; // show actual reason
    snackbar.value = true;
  } finally {
    loading.value = false;
  }
};
</script>
