<template>
    <v-layout column justify-center v-if="user">
        <v-flex xs12 sm10 md7>
  <v-tabs fixed-tabs v-model="active" @change="changeActive">
      <v-tab v-for="t in tabs" :key="t" class="text-capitalize"
      >{{ t }}</v-tab>
      <v-tab-item v-for="t in tabs" :key="t" :transition="false" :reverse-transition="false">
        <v-list v-if="items[tabs[active]].length>0" class="mt-2">
            <PostItem v-for="item in items[tabs[active]]"
            :key="item.id" :post="item" :route="item | getRoute(active)" />
        </v-list>
        <v-list v-else-if="loaded[tabs[active]]"><v-list-tile>nothing here</v-list-tile></v-list>
      </v-tab-item>
  </v-tabs>
        </v-flex>
        <no-ssr>
    <infinite-loading v-if="user" @infinite="infiniteHandler" :identifier="infiniteID"></infinite-loading>
        </no-ssr>
    </v-layout>
    <v-layout column v-else>
        <v-flex>Please sign in</v-flex>
    </v-layout>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import { firestore } from '~/plugins/firebase'
import InfiniteLoading from 'vue-infinite-loading'
import PostItem from '~/components/PostItem.vue'
import util from '~/assets/js/util'
export default {
  data () {
    return {
      tabs: [ 'likes','posts','comments','groups','saves' ],
      active: 0,
      infiniteID: +new Date(),
      items: {
          likes: [],
          posts: [],
          comments: [],
          groups: [],
          saves: [],
      },
      last: {
          likes: null,
          posts: null,
          comments: null,
          groups: null,
          saves: null,
      },
      loaded: {
          likes: false,
          posts: false,
          comments: false,
          groups: false,
          saves: false,
      }
    }
  },
  filters: {
      getRoute: function (v,t) {
        switch(parseInt(t)) {
        case 3:
            return `/g/${v.id}/${util.underscoreTitle(v.name)}`;
        default:
            return `/p/${v.name? v.id: v.pID}/${v.name ? util.underscoreTitle(v.name) : '#'+v.id}`;
        }
      }
  },
  components: { PostItem, InfiniteLoading },
  computed: mapGetters(['user']),
  validate ({store}){
      if(!store.getters.user) throw new Error("No access")
      return store.getters.user != null && store.getters.user != undefined
  },
  methods: {
      changeActive(){
          this.infiniteID += 1 
      },
      getColor (cat) {
        return util.getColor(cat)
      },
      infiniteHandler($state) {
          const activeTab = this.tabs[this.active]
          const activeItems = this.items[activeTab]
          const last = this.last[activeTab]
          const pre = this.tabs.indexOf(activeTab) !== 1
          ? firestore.collection(`users/${this.user.uid}/${activeTab}`)
          : firestore.collection(`${activeTab}`).where('aID','==',this.user.uid)
          const q = last ? pre.orderBy('timestamp','desc').startAfter(last) : pre.orderBy('timestamp','desc')
          q.limit(20).get().then(snaps =>{
              if(snaps.docs.length){
                  snaps.forEach(doc=>{
                      let i = doc.data()
                      i.id = doc.id
                      this.items[activeTab].push(i)
                  })
                  this.last[activeTab] = snaps.docs[snaps.docs.length -1]
                  this.loaded[activeTab] = true
                  $state.loaded()
              }else{
                  this.loaded[activeTab] = true
                  $state.complete()
              }
          })
      }
  },
  head () {
      return {titleTemplate: this.user ? this.user.name : process.env.name }
  }
}
</script>