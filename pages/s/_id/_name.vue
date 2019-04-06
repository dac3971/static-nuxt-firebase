<template>
  <div v-if="sInfo && sid">
  <v-layout column >
    <div class="title">{{ sInfo.name }}</div>
    <v-flex mt-1>
    <div class="body-2">{{ sInfo.state }}</div>
    </v-flex>

    <v-flex mt-1>
      <v-layout row outline>
    <div class="body-2 font-italic"
    >{{ `Population: ${sInfo.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` }}

    <span>{{ ` (${sInfo.pop_density_per_km2.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}/km` }}</span>
    <sup>2</sup>)
    </div>
      </v-layout>
    </v-flex>

    <!-- <gmap-map v-bind:center="center" v-bind:zoom="7" style="height: 300px">
      <gmap-marker
        v-for="(item, index) in markers"
        v-bind:key="index"
        v-bind:position="item.position"
        v-bind:clickable="true"
      />
    </gmap-map> -->

    <v-layout mt-3 row wrap>
    <v-flex xs4>
    <FollowButton v-if="sInfo" :follow="following"
    @click.native="toggleFollow" :spinner="followSpinner" />
    </v-flex>
    <v-flex xs4 text-xs-center>
      <v-card flat height="0">
        <v-card-text style="padding:0">{{ sInfo.followsCt ? sInfo.followsCt : 0 }}</v-card-text>
        <v-card-text style="padding:0; padding-top:2px">following</v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs4 text-xs-right>
    <PostUploadButton text="s" :id="sid" />
    </v-flex>
    </v-layout>
    <v-flex mt-4>
      <div class="pb-1 font-weight-bold">Choose a subject:</div>
      <v-select
        :items="subjects"
        color="black"
        single-line
        flat
        box
        v-model="active"
        @change="changeActive"
        hide-details
        style="border: 1px solid black !important; padding: 1px !important;
        margin: 0 !important; font-size: 13px !important;"
        background-color="white"
        dense
      />
    </v-flex>
    
    <v-flex mt-1>
    <v-list v-if="groups.length>0">
      <PostItem v-for="group in groups" :followsCt="group.followsCt || '0' "
      :id="group.id" :key="group.id" :post="group"
      :route="`/g/${group.id}/${underscore(group.name)}`" />
    </v-list>
    <v-list v-else-if="loaded">
      <PostItem :post="{text: 'nothing here'}" />
    </v-list>
    </v-flex>
    <no-ssr>
    <infinite-loading v-if="subjects" @infinite="infiniteHandler" :identifier="infiniteID"></infinite-loading>
    </no-ssr>
  </v-layout>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import InfiniteLoading from 'vue-infinite-loading'
import { firestore } from '~/plugins/firebase'
import FollowButton from '~/components/FollowButton.vue'
import PostItem from '~/components/PostItem.vue'
import PostUploadButton from '~/components/PostUploadButton.vue'
import util from '~/assets/js/util'

export default {
  data () {
    return {
      active: '10',
      infiniteID: +new Date(),
      groups: [],
      last: null,
      loaded: false,
      followSpinner: false,
      unit: process.env.unit,
      unitPlural: process.env.unitPlural,
      center: { lat: -3.350235, lng: 111.995865 },
      markers: [
        { position: { lat: -0.48585, lng: 117.1466 } },
        { position: { lat: -6.9127778, lng: 107.6205556 } }
      ]
    }
  },
  components: {
    FollowButton, PostUploadButton, PostItem, InfiniteLoading
  },
  computed: {
    ...mapGetters(['user']),
    sInfo () { return this.$store.state.s.sInfo },
    sid () { return this.$store.state.s.sid },
    subjects () {
      const subObj = this.$store.state.s.subjects || {}
      subObj['10'] = 'All'
      let subs = []
      Object.keys(subObj).forEach(k=>{
        subs.push({value: k, text: subObj[k]})
      })
      return subs
    },
    following () { return this.$store.state.s.following },
  },
  async validate({ params, query, store }){
    const sid = params.id
    const sRef = `${process.env.unitPlural}/${sid}`
    let proms = []
    const path = firestore.doc(sRef)
    proms.push(store.dispatch('s/init', path))
    if(store.getters.user)
      proms.push(firestore.doc(`${sRef}/follows/${store.getters.user.uid}`).get())
    else store.commit('s/deleteFollowing')
    const results = await Promise.all(proms)
    store.commit('s/setSubjects', results[0] ? results[0].subjects : {} )
    if(results[1])
      store.commit('s/setFollowing',results[1].data())
    if(true) return true
    return false
  },
  beforeMount(){
    if(this.$store.getters.user){
      let unsub = firestore.doc(`${this.unitPlural}/${this.$route.params.id}/follows/${this.$store.getters.user.uid}`)
      .onSnapshot(doc=> this.$store.commit('s/setFollowing', doc.exists ? doc.data() : null))
      this.$store.commit('s/setUnsub', unsub)
    }
  },

  beforeDestroy(){
    if(this.$store.state.s.unsub) this.$store.state.s.unsub()
  },
  methods: {
    underscore (v) {
      return util.underscoreTitle(v)
    },
    toggleFollow () {
      if(this.$store.getters.user){
        this.followSpinner = true
        const path = `${this.unitPlural}/${this.$route.params.id}/follows/${this.$store.getters.user.uid}`
        const ref = firestore.doc(path)
        if (!this.$store.state.s.following)
          ref.set({name: this.$store.getters.user.displayName},{merge:true})
          .then((_)=>this.followSpinner = false)
        else
          ref.delete().then((_)=>this.followSpinner = false)
      }else
        this.$router.push('/account/login')
    },
    changeActive(){
      this.last = null
      this.groups = []
      this.infiniteID += 1
    },
    infiniteHandler($state){
      // const active = parseInt(this.active)-100 > 0 ? parseInt(this.active)-100 : 0
      // const activeItems = this.groups2[active]['items']
      const pre = firestore.collection('groups').where('sID','==',this.$route.params.id)
      const pre2 = this.active === '10' ? pre : pre.where('subject','==',this.active)
      const q = this.last ? pre2.startAfter(this.last) : pre2
      q.limit(20).get().then(snaps=>{
        if(snaps.docs.length){
          snaps.forEach(doc=>{
            let i = doc.data()
            i.id = doc.id
            if(!util.duplicate(i, this.groups)) this.groups.push(i)
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
  },
  head (){
    return {titleTemplate: `${this.sInfo ? this.sInfo.name : process.env.name}`}
  }
}
</script>
<style>
  .v-select-list{
      padding-left: 12px !important;
      padding-right: 12px !important;
  }
  .v-text-field > .v-input__control > .v-input__slot:before{
      border: none !important;
  }
  .v-select__slot {
    cursor: pointer;
  }
</style>