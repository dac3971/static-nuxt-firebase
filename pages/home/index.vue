<template>
    <v-layout column justify-center v-if="user">
        <v-flex>
        <v-tabs fixed-tabs v-model="active" @change="changeActive">
            <v-tab v-for="t in tabs" :key="t">{{ t }}</v-tab>
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
    <infinite-loading @infinite="infiniteHandler" :identifier="infiniteID"></infinite-loading>
        </no-ssr>
    </v-layout>
    <v-layout column v-else>
        <v-flex>Please sign in</v-flex>
    </v-layout>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading'
import { mapGetters } from 'vuex'
import { firestore } from '~/plugins/firebase'
import PostItem from '~/components/PostItem.vue'
import util from '~/assets/js/util'

export default {
  data () {
    return {
      tabs: [ 'activity','groups', process.env.unitPlural ],
      active: 0,
      infiniteID: +new Date(),
      items: {
          activity: [],
          groups: [],
          [process.env.unitPlural]: []
      },
      last: {
          activity: null,
          groups: null,
          [process.env.unitPlural]: null
      },
      loaded: {
          activity: false,
          groups: false,
          [process.env.unitPlural]: false
      },
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  validate ({store, redirect}){
      if(!store.getters.user) {
          redirect('/')
          return true//throw new Error("No access")
      }
      return store.getters.user != null && store.getters.user != undefined
  },
  components: { PostItem, InfiniteLoading},
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
        const pre = firestore.collection(`users/${this.user.uid}/${activeTab}`).orderBy('timestamp','desc')
        const q = last ? pre.startAfter(last) : pre
        q.limit(20).get().then(snaps=>{
            if(snaps.docs.length){
                snaps.forEach(doc=>{
                    let i = doc.data()
                    i.id = doc.id
                    this.items[activeTab].push(i)
                })
                this.last[activeTab]=snaps.docs[snaps.docs.length-1]
                this.loaded[activeTab]=true
                $state.loaded()
            }else{
                this.loaded[activeTab]=true
                $state.complete()
            }
        })
      }
  },
  head () {
    return {titleTemplate: process.env.name}
  }
}
</script>
