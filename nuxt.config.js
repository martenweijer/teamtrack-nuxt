import colors from 'vuetify/es5/util/colors'

export default {
  head: {
    titleTemplate: '%s - Team communicatie eenvoudig gemaakt.',
    title: 'Teamtrack',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale = 1.0, maximum-scale=1.0, user-scalable=no' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  css: [
    '@/assets/main.scss'
  ],

  plugins: [
  ],

  components: true,

  buildModules: [
    '@nuxtjs/vuetify',
  ],

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/firebase',
  ],

  axios: {},

  vuetify: {
    theme: {
      dark: false,
      themes: {
        light: {
          primary: colors.lightBlue.darken3,
          accent: colors.orange.lighten1,
          secondary: colors.blueGrey.lighten1,
        }
      }
    }
  },

  firebase: {
    config: {
      apiKey: process.env.apiKey,
      authDomain: process.env.authDomain,
      projectId: process.env.projectId,
      storageBucket: process.env.storageBucket,
      messagingSenderId: process.env.messagingSenderId,
      appId: process.env.appId
    },
    services: {
      auth: {
        initialize: {
          onAuthStateChangedMutation: 'stopLoading',
          subscribeManually: false
        },
      },
      firestore: true
    }
  },

  build: {
    babel: {
      plugins: [['@babel/plugin-proposal-private-methods', { loose: true }]],
    },
  },

  server: {
    port: 8080,
    host: '0.0.0.0',
    timing: false
  }
}
