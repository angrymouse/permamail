import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  fallback: true,
  
  modules: ['@nuxtjs/tailwindcss'],
  ssr: false,
  mode: "spa",
  target:"static",
      colorMode: {
    dataValue: "halloween"
    },
    app: {
        head: {
        htmlAttrs:{"data-theme": "halloween",}
    }
    },
  buildModules: [
    // ...
  
  ],
})
