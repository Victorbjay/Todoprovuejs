// nuxt.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  ssr: false, // render purely on client to avoid server-side auth issues
  compatibilityDate: "2025-09-29",
  modules: ["@pinia/nuxt"], // removed @nuxtjs/supabase
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: {
    public: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
    },
  },
  typescript: { strict: true, typeCheck: true },
});
