<template>
<div v-if="gInfo">
  <v-layout column >
    <div class="body-2">
      <nuxt-link :to="`/s/${gInfo.sID}/${underscoreTitle(gInfo.sName)}`"
      >{{ gInfo.sName }}</nuxt-link>
    </div>
    <v-flex my-1>
    <div class="title">{{ gInfo.name }}</div>
    </v-flex>

    <v-layout row>
      <div :title="gInfo.timestamp" class="font-italic">{{`Est. ${groupDate(gInfo.timestamp)}`}}</div>
      <div v-if="user">
      <v-menu bottom right offset-y v-if="user.uid === gInfo.aID">
        <template v-slot:activator="{ on }">
      <v-btn v-on="on" icon style="margin:0 0 0 30px !important; width: 16px !important; height: 16px !important">
      <v-icon style="font-size: 16px">arrow_drop_down</v-icon>
      </v-btn>
        </template>
        <v-list style="padding: 0 8px !important">
          <div>
              <v-list-tile @click="onClickOpen">
                <v-list-tile-title style="font-size: 11px !important">Delete</v-list-tile-title>
              </v-list-tile>
          </div>
        </v-list>
      </v-menu>
      </div>
    </v-layout>

    <v-layout mt-3 row wrap>
    <v-flex xs4>
    <FollowButton :follow="following"
    @click.native="toggleFollow" :spinner="followSpinner" />
    </v-flex>
    <v-flex xs4 text-xs-center>
      <v-card flat height="0">
        <v-card-text style="padding:0">{{ gInfo.followsCt ? gInfo.followsCt : 0 }}</v-card-text>
        <v-card-text style="padding:0; padding-top:2px">following</v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs4 text-xs-right>
    <PostUploadButton text="g" :id="gInfo.id" />
    </v-flex>
    </v-layout>

    <v-flex mt-2>
      <v-tabs v-model="active" @change="changeActive">
        <v-tab v-for="t in tabs" :key="t" class="text-capitalize font-weight-bold"
        style="font-size:12px"
        >{{ t }}</v-tab>
      </v-tabs>
    </v-flex>

    <v-flex mt-2>
        <v-list v-if="items[tabs[active]].length>0" class="mt-2">
            <PostItem v-for="item in items[tabs[active]]"
            :key="item.id" :post="item" :route="item | getRoute(active)" />
        </v-list>
        <v-list v-else-if="loaded[tabs[active]]"><v-list-tile>nothing here</v-list-tile></v-list>
    </v-flex>
    <no-ssr>
    <infinite-loading @infinite="infiniteHandler" :identifier="infiniteID"></infinite-loading>
    </no-ssr>
    <Confirm v-model="showDialog" ref="confirm" /> 
  </v-layout>
</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { firestore } from '~/plugins/firebase'
import InfiniteLoading from 'vue-infinite-loading'
import FollowButton from '~/components/FollowButton.vue'
import PostItem from '~/components/PostItem.vue'
import PostUploadButton from '~/components/PostUploadButton.vue'
import util from '~/assets/js/util'
import Confirm from  '~/components/Confirm.vue'

export default {
  data () {
    return {
      tabs: ['recent'].concat(process.env.cats.split(',')),
      active: 0,
      items: this.toObject("i",['recent'].concat(process.env.cats.split(','))),
      last: this.toObject("last",['recent'].concat(process.env.cats.split(','))),
      loaded: this.toObject("load",['recent'].concat(process.env.cats.split(','))),
      followSpinner: false,
      showDialog: false,
      infiniteID: +new Date()
    }
  },
  filters: {
    getRoute: function (v,t) {
      switch(parseInt(t)) {
        case 1: return `/g/${v.id}/${util.underscoreTitle(v.name)}`;
        case 2: return `/s/${v.id}/${util.underscoreTitle(v.name)}`;
        default: return `/p/${v.id}/${util.underscoreTitle(v.name)}`;
      }
    }
  },
  components: {
    FollowButton, PostUploadButton, PostItem, InfiniteLoading, Confirm
  },
  computed: {
    ...mapGetters(['user']),
    gInfo () { return this.$store.state.g.gInfo },
    following () { return this.$store.state.g.following },
  },
  async validate({ params, query, store }){
    const gid = params.id
    const gRef = `groups/${gid}`
    let proms = [], newG
    proms.push(firestore.doc(gRef).get())
    if(store.getters.user)
      proms.push(firestore.doc(`groups/${gid}/follows/${store.getters.user.uid}`).get())
    else store.commit('g/setFollowing', null)
    const results = await Promise.all(proms)
    newG = results[0].data()
    newG.id = results[0].id
    newG.timestamp = results[0].data().timestamp.toDate().toUTCString()
    if(results[1])
      store.commit('g/setFollowing',results[1].data())
    store.commit('g/setGroup',newG)
    if(newG) return true
    return false
  },
  beforeMount(){
    if(this.$store.getters.user){
      let unsub = firestore.doc(`groups/${this.$route.params.id}/follows/${this.$store.getters.user.uid}`)
      .onSnapshot(doc=> this.$store.commit('g/setFollowing', doc.exists ? doc.data() : null))
      this.$store.commit('g/setUnsub', unsub)
    }
  },
  beforeDestroy(){
    if(this.$store.state.g.unsub) this.$store.state.g.unsub()
  },
  methods: {
    underscoreTitle (val){
      return util.underscoreTitle(val)
    },
    toObject (t,arr){
      var type
      switch(t){
        case "i": type = []; break
        case "last": type = null; break
        case "load": type = false; break
        default: type = []
      }
      const rv = {}
      for (var i = 0; i < arr.length; ++i)
        rv[arr[i]] = type
      return rv
    },
    toggleFollow(){
      if(this.$store.getters.user){
        this.followSpinner = true
        const path = `groups/${this.$route.params.id}/follows/${this.$store.getters.user.uid}`
        const ref = firestore.doc(path)
        if (!this.$store.state.g.following)
          ref.set({name: this.$store.getters.user.displayName},{merge:true})
          .then((_)=>this.followSpinner = false)
        else
          ref.delete().then((_)=>this.followSpinner = false)
      }else
        this.$router.push('/account/login')
    },
    changeActive(){
      this.infiniteID += 1
    },
    groupDate(d){
      return util.groupDate(d)
    },
    async onClickOpen () {
      this.changeDialog()
      const yes = await this.$refs.confirm
      .open('Delete This Group', 'Are you sure?', {color: 'white'})
      if (yes) {
        this.deleteGroup()
      }
    } ,
    deleteGroup(){
      firestore.collection('groups').doc(this.gInfo.id).delete()
      .then(()=>this.$router.push(`/s/${this.gInfo.sID}`))
    },
    changeDialog (){
      this.showDialog = this.showDialog === false
    },
    infiniteHandler($state){
      const gid = this.$route.params.id
      const activeTab = this.tabs[this.active]
      const activeItems = this.items[activeTab]
      const last = this.last[activeTab]
      const pre = this.active>0 ? 
      firestore.collection('posts').where('gID','==',gid).where('cat','==',activeTab)
      : firestore.collection('posts').where('gID','==',gid)
      const q = last ? pre.orderBy('timestamp','desc').startAfter(last) : pre.orderBy('timestamp','desc')
      q.limit(10).get().then(snaps=>{
        if(snaps.docs.length>0){
          snaps.forEach(doc=>{
            let i = doc.data()
            i.id = doc.id
            const d = i.timestamp.toDate().toUTCString()
            i.timestamp = d
            if(!util.duplicate(i, this.items[activeTab])) this.items[activeTab].push(i)
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
  head (){
    return {titleTemplate: `${this.gInfo ? this.gInfo.name : process.env.name}`}
  },
}
</script>
<style>
</style>