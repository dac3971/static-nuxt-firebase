<template>
  <div>
    <FirebaseUI />
    <form v-on:submit.prevent="signup">
      
      <div class="form-actions mt-2" style="text-align: center">
        <GoogleButton label="Sign In With Google" />
      </div>

      <div class="mt-4 mb-4" style="text-align: center">
        <div style="display: inline-block">- OR -</div>
      </div>

      <div class="form-group">
        <label>Email</label>
        <div class="control">
          <v-text-field flat spellcheck="false" class="form-control"
            style="border: 1px solid black; padding: 0 4px"
            v-model="email" clearable :class="{ 'is-danger': invalidEmail }"
            type="email" single-line hide-details>
          </v-text-field>
        </div>
        <p class="error" v-if="invalidEmail">This email is invalid</p>
      </div>

      <div class="form-group">
        <label>Password</label>
        <div class="control">
          <v-text-field flat spellcheck="false" class="form-control"
            style="border: 1px solid black; padding: 0 4px"
            v-model="password" clearable :class="{ 'is-danger': invalidPassword }"
            type="password" single-line hide-details>
          </v-text-field>
        </div>
        <p class="error" v-if="invalidPassword">This password is invalid</p>
      </div>

      <div class="form-actions">
        <v-btn flat outline
         type="submit" class="ml-0">Log In</v-btn>
      </div>

      <div class="form-group">
        <div class="flash flash-error" v-if="formError.length > 0" v-text="formError"></div>
      </div>

      <div class="form-group" style="text-align: center">
        <p><nuxt-link to="/account/signup">Register for an account</nuxt-link></p>
      </div>


    </form>
  </div>
</template>

<script>
import GoogleButton from '~/components/account/3rd-party/GoogleButton.vue'
import FirebaseUI from '~/components/account/FirebaseUI.vue'
export default {
  name: 'LoginForm',
  components: {
    GoogleButton,
    FirebaseUI
  },
  data () {
    return {
      email: '',
      password: '',
      formError: ''
    }
  },
  computed: {
    invalidEmail () {
      return false // !this.email.includes('@')
    },
    invalidPassword () {
      return false // !this.password.length > 12
    }
  },
  methods: {
    signup () {
      this.formError = ''
      this.$store.dispatch('userLogin', {
        email: this.email,
        password: this.password
      })
        .then(() => {
          this.$router.push('/account')
        })
        .catch((error) => {
          console.log(error)
          this.formError = error.message
        })
    }
  }
}
</script>