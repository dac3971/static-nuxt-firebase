<template>
<div v-if="pInfo.aID">
  <v-layout column >
    <v-flex>
      <v-layout row>
          <div class="body-2">
            <nuxt-link :to="`/g/${pInfo.gID}/${underscoreTitle(pInfo.gName)}`"
            >{{ pInfo.gName }}</nuxt-link>
          </div>
          <v-spacer />
              <v-menu bottom left offset-y v-show="user && user.uid===pInfo.aID">
                <template v-slot:activator="{ on }">
          <v-btn small v-on="on" icon style="margin:0; width: 16px !important; height: 16px !important">
          <v-icon small style="font-size: 16px">more_horiz</v-icon>
          </v-btn>
                </template>
            <v-list style="padding: 0 8px !important">
                  <v-list-tile @click="onClickOpen">
                    <v-list-tile-title style="font-size: 11px !important">Delete</v-list-tile-title>
                  </v-list-tile>
              </v-list>
              </v-menu>
      </v-layout>
    </v-flex>
    <v-flex my-2>
      <div class="title">{{ pInfo.name }}</div>
    </v-flex>
    <v-flex>
      <v-layout row>
          <div class="body-2"><span class="font-italic">by</span>
            <nuxt-link class="font-weight-bold" :to="user ? `/u/${pInfo.aID}` : '/account/login'"
            >{{ pInfo.aName }}</nuxt-link>
          </div>
          <v-spacer />
          <div v-if="pInfo.urls">
        <a v-if="Object.keys(pInfo.urls).length===1" target="_blank" rel="noopener noreferrer" :href="pInfo.urls['0']"
        class="font-weight-bold" style="border: 1px solid black; padding: 3px 4px; border-radius: 4px">VIEW »</a>
        <nuxt-link v-else :to="`/album/${pInfo.id}/${encodeURIComponent(pInfo.urls['0'])}`"
        class="font-weight-bold" style="border: 1px solid black; padding: 3px 4px; border-radius: 4px">VIEW »</nuxt-link>
          </div>
      </v-layout>
    </v-flex>
    <v-flex mb-2 mt-3>
      <div class="well body-2"
      >{{ pInfo.body }}</div>
    </v-flex>
    <v-flex>
      <v-layout row>
      <div style="width: 100px !important">
        <v-layout row>
        <v-breadcrumbs-item v-if="likeSpinner || !pInfo">
        <v-progress-circular :width=1
        size="10" indeterminate></v-progress-circular>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item @click.native="toggle('like')" v-else
        class="text-uppercase" style="font-size: 12px"
        >{{ likedSaved(liked, 'like') }}</v-breadcrumbs-item>
        <v-spacer />
        <v-breadcrumbs-item v-if="saveSpinner || !pInfo">
        <v-progress-circular :width=1
        size="10" indeterminate></v-progress-circular>
        </v-breadcrumbs-item>
        <v-breadcrumbs-item @click.native="toggle('save')" v-else
        class="text-uppercase" style="font-size: 12px"
        >{{ likedSaved(saved, 'save') }}</v-breadcrumbs-item>
        </v-layout>
      </div>
      <v-spacer />
        <div :title="pInfo.timestamp" class="font-italic"
        >{{ convertDate(pInfo.timestamp) }}</div>
      </v-layout>
    </v-flex>
    <v-flex mb-2 mt-4>
      <div class="font-weight-bold" style="text-decoration: underline; font-size: 13px"
      >COMMENTS ({{ pInfo.commentsCt || 0 }})</div>
    </v-flex>
    <v-flex mt-2>
      <v-form ref="form" @submit.prevent="submit" style="padding: 1px 2px 0 0">
        <v-text-field
        @click="showButton"
        @keyup.esc.native="hideButton"
        v-model.trim="commentText"
        box
        single-line
        label=""
        placeholder="comment..."
        hide-details
        color="white"
        background-color="white"
        style="padding:0px !important; padding: 0 0 1px 1px !important; 
        border: 1px solid black !important;"
        class="body-2" />
      <v-btn v-if="commentText != null" style="margin-left:0; margin-bottom:0"
      flat small
      outline @click.prevent="submit"
      >submit</v-btn>
      <v-btn v-if="commentText != null" style="margin-left:0; margin-bottom:0"
      flat small
      outline @click.prevent="hideButton"
      >cancel</v-btn>
      </v-form>
    </v-flex>
    <v-flex mt-3>
      
      <CommentList :showD="changeDialog" :pid="pInfo.id" :comments="comments" :r="$refs.confirm" />

    </v-flex>
    <no-ssr>
    <infinite-loading @infinite="infiniteHandler"></infinite-loading>
    </no-ssr>
    <Confirm v-model="showDialog" ref="confirm" />
  </v-layout>
</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { firestoreNamespace, firestore } from '~/plugins/firebase'
import InfiniteLoading from 'vue-infinite-loading'
import util from '~/assets/js/util'
import CommentList from '~/components/post/CommentList.vue'
import TPTextArea from '~/components/TPTextArea.vue'
import Confirm from  '~/components/Confirm.vue'

export default {
  data () {
    return {
      commentText: null,
      replyText: '',
      commentRules: [v => !! v || "Please enter comment"],
      last: null,
      loaded: false,
      likeSpinner: false,
      saveSpinner: false,
      showDialog: false
    }
  },
  computed: {
    ...mapGetters(['user']),
    pInfo () { return this.$store.state.p.pInfo },
    liked () { return this.$store.state.p.liked },
    saved () { return this.$store.state.p.saved },
    comments () { return this.$store.state.p.comments.filter(function(c){
      if(c) return c
    }) },
  },
  async validate({ params, query, store }){
    const pid = params.id
    const pRef = `posts/${pid}`
    let proms = []
    proms.push(firestore.doc(pRef).get())
    if(store.getters.user){
      proms.push(firestore.doc(`${pRef}/likes/${store.getters.user.uid}`).get())
      proms.push(firestore.doc(`${pRef}/saves/${store.getters.user.uid}`).get())
    }
    else {
      store.commit('p/setLike', null)
      store.commit('p/setSave', null)
    }
    const results = await Promise.all(proms)
    let newP = results[0].data()
    newP.id = results[0].id
    newP.timestamp = results[0].data().timestamp.toDate().toUTCString()
    if(results[1])
      store.commit('p/setLike', results[1].data())
    if(results[2])
      store.commit('p/setSave', results[2].data())
    store.commit('p/setPost',newP)
    if(newP) return true
    return false
  },
  beforeMount(){
    if(this.$store.getters.user){
      let unsubLike = firestore.doc(`posts/${this.$route.params.id}/likes/${this.$store.getters.user.uid}`)
      .onSnapshot(doc=> this.$store.commit('p/setLike', doc.exists ? doc.data() : null))
      let unsubSave = firestore.doc(`posts/${this.$route.params.id}/saves/${this.$store.getters.user.uid}`)
      .onSnapshot(doc=> this.$store.commit('p/setSave', doc.exists ? doc.data() : null))
      this.$store.commit('p/setUnsubLike', unsubLike)
      this.$store.commit('p/setUnsubSave', unsubSave)
    }
  },
  beforeDestroy(){
    if(this.$store.state.p.unsubLike) this.$store.state.p.unsubLike()
    if(this.$store.state.p.unsubSave) this.$store.state.p.unsubSave()
    this.$store.commit('p/clearComments')
  },
  methods: {
    infiniteHandler($state){
      const pid = this.$route.params.id
      const pre = firestore.collection(`posts/${pid}/comments`).orderBy('timestamp')
      const q = this.last ? pre.startAfter(this.last) : pre
      const items = this.items
      q.limit(10).get().then(snaps=>{
        if(snaps.docs.length>0){
          snaps.forEach(doc=>{
            let i = doc.data()
            i.id = doc.id
            const d = i.timestamp.toDate().toUTCString()
            i.timestamp = d
            i.replies = []
            i.currentRepLimit = this.$store.state.p.initialReplyLimit
            this.$store.dispatch('p/addComment', { pid: pid, comment: i })
          })
          this.last = snaps.docs[snaps.docs.length-1]
          this.loaded = true
          $state.loaded()
        }else{
          this.loaded = true
          $state.complete()
        }
      })
    },
    submit (v) {
      if(this.user){
        const form = this.$refs.form
        if (form.validate()){
          const comRef = firestore.collection(`posts/${this.pInfo.id}/comments`)
          const data = {
            aID: this.user.uid,
            aName: this.user.displayName,
            pAuthor: this.pInfo.aID,
            pName: this.pInfo.name,
            rCt: 0,
            text: this.commentText,
            timestamp: firestoreNamespace.FieldValue.serverTimestamp()
          }
          comRef.add(data).then((d)=>{
            form.reset()
            d.get().then((snap)=>{
              let com = snap.data()
              com.id = snap.id
              const d = com.timestamp.toDate().toUTCString()
              com.timestamp = d
              com.replies = []
              com.repliesChecked = true
              com.currentRepLimit = this.$store.state.p.initialReplyLimit
              this.$store.commit('p/prependComment', com)
            })
          })
        }
      }
      else
        this.$router.push('/account/login')
    },
    toggle (type) {
      if(this.$store.getters.user){
        this[`${type}Spinner`] = true
        const path = `posts/${this.pInfo.id}/${type}s/${this.user.uid}`
        const ref = firestore.doc(path)
        if (!this[`${type}d`])
          ref.set({name: this.user.displayName},{merge:true})
          .then((_)=>this[`${type}Spinner`] = false)
        else
          ref.delete().then((_)=>this[`${type}Spinner`] = false)
      }else
        this.$router.push('/account/login')
    },
    async onClickOpen () {
      this.changeDialog()
      const yes = await this.$refs.confirm
      .open('Delete This Post', 'Are you sure?', {color: 'white'})
      if (yes) {
        this.deletePost()
      }
    },
    deletePost(){
      firestore.collection('posts').doc(this.pInfo.id).delete()
      .then(()=>this.$router.push(`/g/${this.pInfo.gID}`))
    },
    changeDialog (){
      this.showDialog = this.showDialog === false
    },
    likedSaved (v,t) {
      return v ? 'un'+t : t
    },
    hideButton () {
      if(this.commentText!=null) this.commentText=null
      this.$refs.form.reset()
    },
    showButton () {
      if(this.user){
        if(this.commentText==null) this.commentText=''
      }else
        this.$router.push('/account/login')
    },
    underscoreTitle (n) {
      return util.underscoreTitle(n)
    },
    convertDate(d){
      return util.convertDate(d)
    },
  },
  components: { CommentList, TPTextArea, InfiniteLoading, Confirm },
  head (){
    return {titleTemplate: `${this.pInfo ? this.pInfo.name : process.env.name}`}
  }
}
</script>

<style>
.v-card__title {
  margin-left: 0;
  padding-left: 0;
  margin-right: 0;
  padding-right: 0;
  padding-bottom: 4px;
  margin-top: 16px;
  padding-top: 0;
}
.v-input__is-focused > .v-input__control > .v-input__slot:before{
  border-style: none !important;
  border-width: none !important;
}
.v-text-field {
  border-style: none !important;
  border-width: none !important;
}
.v-card__actions {
  padding: 8px 0;
}
.well {
  border: 1px solid black;
  padding: 20px;
}
div>li {
  display: inline !important;
}
</style>