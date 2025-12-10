import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
export default defineNuxtConfig({
  //...
  build: {
    transpile: ["vuetify", "@vuepic/vue-datepicker"],
  },
  css: ["@/assets/css/style.css"],

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    //...
  ],
  vite: {
    // plugins: [tailwindcss()],
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      CLOUDINARY_CLOUD_NAME: process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_UPLOAD_PRESET:
        process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    },
  },
});
