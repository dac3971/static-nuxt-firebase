const pkg = require('./package')
require('dotenv').config()

const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

module.exports = {
  mode: 'spa',

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    // meta: [
    //   { charset: 'utf-8' },
    //   { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    //   { hid: 'description', name: 'description', content: pkg.description }
    // ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Material+Icons' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Bitter' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Source+Code+Pro' },
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  manifest: {
    start_url: "/home/"
  },
  /*
  ** Global CSS
  */
  css: [
    '~/assets/style/app.styl'
  ],
  env: {
    apiKey: process.env.API_KEY,
    mapsKey: process.env.MAPS_KEY,
    projectId: process.env.PROJECT_ID,
    messagingSenderId: process.env.SENDER_ID,
    name: process.env.NAME,
    description: process.env.DESCRIPTION,
    cats: process.env.CATS,
    unit: process.env.UNIT,
    unitPlural: process.env.UNIT_PLURAL
  },
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/vuetify',
    '~/plugins/auth.js',//'~/plugins/firebase.js'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/pwa',
    '@nuxtjs/dotenv',
  ],
  // router: {
  //   middleware: 'check-auth',
    // prefetchLinks: false
  // },
  /*
  ** Build configuration
  */
  build: {
    transpile: ['vuetify/lib'],
    plugins: [new VuetifyLoaderPlugin()],
    loaders: {
      stylus: {
        import: ["~assets/style/variables.styl"]
      }
    },
    
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      
    }
  }
}
