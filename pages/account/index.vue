<template>
  <v-layout column>
    <v-flex xs12 sm10 md7 my-3>
      <div class="title">Account</div>
    </v-flex>
  <v-flex xs12 sm10 md7>
    <div class="font-weight-bold">Display Name:</div>
    <v-text-field flat spellcheck="false"
      style="border: 1px solid black !important; padding: 0 4px !important"
      v-model.trim="name" class="mb-3"
      single-line hide-details ref="name">
    </v-text-field>
    <div class="font-weight-bold">Email:</div>
    <v-text-field flat spellcheck="false"
      style="border: 1px solid black !important; padding: 0 4px !important"
      v-model="email" class="mb-3"
      single-line hide-details ref="email">
    </v-text-field>
    <div class="text-xs-center">
      <v-btn flat outline @click="edit">submit changes</v-btn>
    </div>
  </v-flex>
  </v-layout>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import firebaseApp from '~/plugins/firebase'
export default {
  computed: mapGetters(['user']),
  data () {
    return {
      email: this.$store.state.user.email,
      name: this.$store.state.user.displayName,
    }
  },
  methods: {
    edit () {
      let proms = [], user = firebaseApp.auth().currentUser;
      
      if (user.displayName !== this.name){
        proms.push(user.updateProfile({displayName: this.name}))
      }
      if (user.email !== this.email){
        proms.push(user.updateEmail(this.email))
      }
      Promise.all(proms).then(function() {
        console.log('success')
      }).catch(function(error) {
        console.log(error)
      });
    },
  },
  middleware: 'account',
  validate ({store}){
    const signedIn = store.getters.user != null && store.getters.user != undefined
    return signedIn
  },
  head () {
    return {titleTemplate: this.user.name ? this.user.name : process.env.unitPlural }
  }
}
</script>

<style>
.v-input__is-focused > .v-input__control > .v-input__slot:before{
  border-style: none !important;
  border-width: none !important;
}
.v-input > .v-input__control > .v-input__slot:before{
  border-style: none !important;
  border-width: none !important;
}
.v-text-field {
  border-style: none !important;
  border-width: none !important;
}
</style>