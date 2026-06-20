import ckeditor5 from "@ckeditor/vite-plugin-ckeditor5";
import svgLoader from "vite-svg-loader";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const larkTheme = require.resolve("@ckeditor/ckeditor5-theme-lark");

export default defineNuxtConfig({
  compatibilityDate: "2024-10-27",
  app: {
    head: {
      charset: "utf-16",
      viewport: "width=device-width, initial-scale=1",
      /* titleTemplate: "%s | ویلاطور",
      title: "vilator",
      meta: [
        { name: "description", content: "My amazing site." },
      ], */
    },
  },

  telemetry: false,

  routeRules: {
    "/**": { ssr: true, prerender: false },
    // Don't add any /secret/** URLs to the sitemap.xml
    "/auth/**": { prerender: false },
  },

  css: ["@/assets/scss/main.scss"],

  pages: true,

  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxtjs/color-mode",
    ["@nuxtjs/robots", { configPath: "~/config/robots.config" }],
  ],

  plugins: [
    "~/plugins/axios.js",
    "~/plugins/datePicker.client.ts",
    "~/plugins/ckeditor.client.ts",
    "~/plugins/vselect.ts",
    "~/plugins/validate-rules.js",
    "~/plugins/validate-components.ts",
  ],

  runtimeConfig: {
    public: {
      baseURL: process.env.API_BASE_URL,
      API_BASE_URL: process.env.API_BASE_URL,
      API_TOKEN: process.env.API_TOKEN,
    },
  },

  colorMode: {
    classSuffix: "",
  },

  tailwindcss: {
    exposeConfig: true,
    cssPath: "./assets/scss/tailwind.scss",
    configPath: "~/config/tailwind.config",
  },

  vite: {
    ssr: { noExternal: ["jalali-moment"] },
    plugins: [
      ckeditor5({
        theme: larkTheme,
      }),
      svgLoader(),
    ],
  },

  nitro: {
    compressPublicAssets: true,
  },

  postcss: {
    plugins: {
      "postcss-import": {},
      "tailwindcss/nesting": {},
      "postcss-nesting": {
        preserve: false, // برای نادیده گرفتن @nest
      },
      autoprefixer: {},
      tailwindcss: {},
    },
  },

  sourcemap: true,
});
