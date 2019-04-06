<template>
    <v-layout column justify-center v-if="user">
        <v-flex xs12 sm10 md7 mt-2>
            <div class="title">Notifications</div>
        </v-flex>
        <v-flex>
            <v-list v-if="items.length>0">
                <v-list-tile v-for="item in items" class="my-3"
                :key="item.id" nuxt :to="`/p/${item.pID}`">
                <v-list-tile-content>
                <v-list-tile-title>
                    <span class="font-weight-bold">{{item.aName}}</span
                    >{{ item | getType }}</v-list-tile-title>
                    <v-list-tile-title class="text-truncate">{{ item.text }}</v-list-tile-title>
                </v-list-tile-content>
                </v-list-tile>
            </v-list>
            <v-list v-else-if="loaded"><v-list-tile>nothing here</v-list-tile></v-list>
        </v-flex>
        <no-ssr>
        <infinite-loading @infinite="infiniteHandler" :identifier="infiniteID"></infinite-loading>
        </no-ssr>
    </v-layout>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { firestore } from '~/plugins/firebase'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  data () {
    return {
      infiniteID: +new Date(),
      items: [],
      last: null,
      loaded: false,
    }
  },
  computed: {
      ...mapGetters(['user','nots','notsCt']),
  },
  filters : {
    getType (not) {
        return (not.parentComID ? ' replied' : ' commented')
    }
  },
  methods: {
      infiniteHandler($state) {
        const user = this.user
        if(user){
          const pre = firestore.collection(`users/${this.user.uid}/notifications`).orderBy('timestamp','desc')
          const q = this.last ? pre.startAfter(this.last) : pre
            q.limit(10).get().then(snaps=>{
              if(snaps.docs.length>0){
                  snaps.forEach(doc=>{
                      let i = doc.data()
                      i.id = doc.id
                      const d = i.timestamp.toDate().toUTCString()
                      i.timestamp = d
                      this.items.push(i)
                  })
                  this.last = snaps.docs[snaps.docs.length-1]
                  this.loaded = true
                  $state.loaded()
              }else{
                this.loaded = true
                $state.complete()
              }
          })
        }
      }
  },
  components: { InfiniteLoading },
  head () {
    return {title: 'Notifications'}
  }
}
</script>
