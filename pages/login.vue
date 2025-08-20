<template>
  <v-container fluid class="bg-grey-lighten-4 fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-8" elevation="10" rounded="xl">
          <!-- Logo -->
          <div class="text-center mb-6">
            <v-icon color="primary" size="48">mdi-shield-lock</v-icon>
            <h2 class="text-h5 font-weight-bold mt-3">Admin Login</h2>
          </div>

          <!-- Login Form -->
          <v-form @submit.prevent="handleLogin" v-model="isFormValid">
            <v-text-field
              v-model="email"
              placeholder="Enter your email"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              type="email"
              :rules="[rules.required, rules.email]"
              class="mb-4"
              required
            ></v-text-field>

            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              variant="outlined"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="togglePassword"
              :rules="[rules.required]"
              class="mb-6"
              required
            ></v-text-field>

            <!-- Submit Button -->
            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
            >
              Login
            </v-btn>
          </v-form>

          <!-- Forgot Password -->
          <div class="text-center mt-4">
            <NuxtLink
              to="/admin/forgot-password"
              class="text-primary text-decoration-none"
            >
              Forgot Password?
            </NuxtLink>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");
const password = ref('')
const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
const loading = ref(false);
const isFormValid = ref(false);

const rules = {
  required: (value) => !!value || "Required",
  email: (value) => /.+@.+\..+/.test(value) || "Invalid email",
};

const handleLogin = () => {
  if (!isFormValid.value) return;

  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    console.log("Email:", email.value, "Password:", password.value);
    // Redirect after successful login
    navigateTo("/admin");
  }, 1500);
};
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
