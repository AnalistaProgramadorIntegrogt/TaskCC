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
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap' }
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
