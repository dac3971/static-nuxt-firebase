<template>
    <v-layout column justify-center>
      <v-flex mt-1 v-if="uInfo">
        <div class="title">{{ uInfo.displayName }}</div>
      </v-flex>
      <v-flex>
      <v-tabs fixed-tabs v-model="active" @input="changeActive">
          <v-tab v-for="t in tabs" :key="t">{{ t }}</v-tab>
      </v-tabs>
      </v-flex>
      <v-flex mt-2>
      <v-list v-if="loaded[tabs[active]]">
        <v-list-tile v-if="items[tabs[active]].length===0">
          <v-list-tile-title>nothing here</v-list-tile-title>
        </v-list-tile>
        <v-list-tile
        v-for="item in items[tabs[active]]"
        :id="item.id"
        :key="item.id"
        nuxt
        :to="item | getRoute(active)">
          <v-list-tile-avatar v-if="item.cat">
              <v-icon>image</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-sub-title class="font-weight-bold"
            :style="getColor(item.cat)" v-if="item.cat"
            >{{ item.cat.toUpperCase() }}</v-list-tile-sub-title>
            <v-list-tile-title>{{ item.name }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      </v-flex>
      <no-ssr>
    <infinite-loading @infinite="infiniteHandler" :identifier="infiniteID"></infinite-loading>
      </no-ssr>
    </v-layout>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading'
import { mapState, mapGetters } from 'vuex'
import { firestore } from '~/plugins/firebase'
import util from '~/assets/js/util'

export default {
  data () {
    return {
      tabs: ['posts','groups',process.env.unitPlural],
      active: 0,
      infiniteID: +new Date(),
      items: {posts:[],groups:[],[process.env.unitPlural]:[]},
      last: {posts: null,groups:null,[process.env.unitPlural]:null},
      loaded: {posts:false,groups:false,[process.env.unitPlural]:false},
    }
  },
  computed: {
    uInfo () { return this.$store.state.u.uInfo },
  },
  async validate({ params, query, store }){
    if(!store.getters.user) return false
    const uid = params.id
    const uRef = `users/${uid}`
    let proms = [], newU
    proms.push(firestore.doc(uRef).get())
    const results = await Promise.all(proms)
    newU = results[0].data()
    newU.id = results[0].id
    store.commit('u/setUInfo',newU)
    if(newU) return true
    return false
  },
  filters: {
      getRoute: function (v,t) {
        switch(parseInt(t)) {
        case 1:
            return `/g/${v.id}/${util.underscoreTitle(v.name)}`;
        case 2:
            return `/s/${v.id}/${util.underscoreTitle(v.name)}`;
        default:
            return `/p/${v.id}/${util.underscoreTitle(v.name)}`;
        }
      }
  },
  methods: {
    underscoreTitle (val){
      return util.underscoreTitle(val)
    },
    getColor (cat) {
      return util.getColor(cat)
    },
    changeActive(){
      this.infiniteID += 1
    },
    getQuery(v){
      const uid = this.$route.params.id
      if(v==="posts") return firestore.collection('posts').where('aID','==',uid)
      return firestore.collection(`users/${uid}/${v}`)
    },
    infiniteHandler($state){
      const activeTab = this.tabs[this.active]
      const activeItems = this.items[activeTab]
      const last = this.last[activeTab]
      const pre = this.getQuery(activeTab)
      const q = last ? pre.startAfter(last) : pre
      q.limit(10).get().then(snaps=>{
        if(snaps.docs.length>0){
          snaps.forEach(doc=>{
            let i = doc.data()
            i.id = doc.id
            const d = i.timestamp.toDate().toUTCString()
            i.timestamp = d
            this.items[activeTab].push(i)
          })
          this.last[activeTab] = snaps.docs[snaps.docs.length-1]
          this.loaded[activeTab] = true
          $state.loaded()
        }else{
          this.loaded[activeTab] = true
          $state.complete()
        }
      })
    }
  },
  components: { InfiniteLoading },
  head (){
    return {titleTemplate: `${this.uInfo ? this.uInfo.displayName : process.env.name }`}
  },
}
</script>