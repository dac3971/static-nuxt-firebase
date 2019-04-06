<template>
  <div class="text-xs-center">
    <div class="title py-3">{{$route.query.a ? 'Please Login Again' : 'Login'}}</div>
    <FirebaseUI />
  </div>
</template>

<script>
import FirebaseUI from '~/components/account/FirebaseUI.vue'
import { mapGetters } from 'vuex'
export default {
  components: { FirebaseUI },
  computed: mapGetters(['user']),
  watchQuery: ['a'],
  validate ({store, params, query}){
    const notSignedIn = store.getters.user == null || store.getters.user == undefined
    const fromAccount = query.a !== null || query.a !== undefined
    return notSignedIn || fromAccount
  },
  head () {
    return {title: 'Login'}
  }
}
</script>
