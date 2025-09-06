<template>
  <v-container
    fluid
    class="fill-height d-flex flex-column align-center justify-center text-center"
  >
    <!-- Logo -->
    <v-img
      src="/images/logo-2.png"
      alt="Logo"
      max-width="140"
      class="mb-12"
      contain
    ></v-img>

    <!-- Illustration Icon -->
    <v-icon size="120" color="primary" class="mb-6">
      mdi-file-search-outline
    </v-icon>

    <!-- Error Code -->
    <h1
      class="text-h1 font-weight-black mb-4"
      style="
        background: linear-gradient(90deg, #ff5252, #ff9800);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      "
    >
      404
    </h1>

    <!-- Title -->
    <h2 class="text-h5 font-weight-bold mb-3">Page Not Found</h2>

    <!-- Description -->
    <p class="text-body-1 text-grey-darken-1 mb-8">
      Sorry, the page you’re looking for doesn’t exist.<br />
      It might have been moved or deleted.
    </p>

    <!-- Action Button -->
    <v-btn
      color="primary"
      size="large"
      class="px-10"
      rounded="xl"
      elevation="6"
      @click="goToHome()"
    >
      Go Home
    </v-btn>
  </v-container>
</template>
<script setup>
const router = useRouter();

const goToHome = () => {
  router.push("/");
};
</script>
