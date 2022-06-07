import Vue from 'vue'
import Vuetify, { VBtn, VIcon, VSnackbar } from 'vuetify/lib'
import VuetifyToast from 'vuetify-toast-snackbar'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify, {
  components: {
    VSnackbar,
    VBtn,
    VIcon
  }
})

Vue.use(VuetifyToast)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#6a6aa9',
        secondary: colors.grey.darken1,
        accent: colors.shades.black,
        error: colors.red.accent3
      }
    }
  }
})
