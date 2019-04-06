<template>
  <div>
  <v-layout column justify-center>
    <v-flex xs12 my-3>
      <div v-if="pInfo" class="title">
        <nuxt-link :to="`/p/${pInfo.id}/${underscore(pInfo.name)}`">{{pInfo.name}}</nuxt-link></div>
    </v-flex>
    <v-flex xs12>

      <no-ssr>
        <v-img :src="first">
        </v-img>
        <v-img v-for="(pic,i) in remainder" :key=i :src="pic.src">
        </v-img>
      </no-ssr>

    </v-flex>
  </v-layout>
  </div>
</template>

<script>
import util from '~/assets/js/util'
import { firestore } from '~/plugins/firebase'
export default {
  data () {
    return {
      first: this.$route.params.url1,
      remainder: [],
      pInfo: null,
      cHeight: 0
    }
  },
  created () {
    firestore.doc(`posts/${this.$route.params.id}`).get().then(doc=>{
      let i = []
      if(doc.exists){
        let p = doc.data()
        p.id = doc.id
        this.pInfo = p
        if(doc.data().urls)
          Object.keys(doc.data().urls).forEach(k=> {
            if(k!=='0') i.push({src: doc.data().urls[k]});
          })
      }
      this.remainder = i
    })
  },
  computed: {
    xs() { return this.$vuetify.breakpoint.name === 'xs'? true:false}
  },
  methods: {
    underscore(v){
      return util.underscoreTitle(v)
    }
  },
  head (){
    return {titleTemplate: this.title ? this.title : process.env.name}
  },
}
</script>

<style>

</style>