import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=PT+Sans+Narrow:wght@400;700&family=Space+Grotesk:wght@300..700&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap' }
      ]
    }
  },

  modules: [
    '@nuxtjs/supabase',
    '@nuxt/eslint',
  ],

  supabase: {
    redirect: false // Usually good for simple apps so it doesn't force redirects on all pages initially
  },

  vite: {
    plugins: [tailwindcss() as any],
  },

  css: ['~/assets/css/main.css'],

  eslint: {
    config: {
      stylistic: true
    }
  }
})
