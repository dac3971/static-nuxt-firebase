import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify, {
  theme: {
    primary: '#000000', //'#121212', // a color that is not in the material colors palette
    accent: '#000000', //.grey.darken3,
    secondary: '#000000', //colors.amber.darken3,
    info: '#000000', //colors.teal.lighten1,
    warning: '#000000', //colors.amber.base,
    error: '#000000', //colors.deepOrange.accent4,
    success: '#000000', //colors.green.accent3
  }
})
