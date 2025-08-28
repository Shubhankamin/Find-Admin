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
});
