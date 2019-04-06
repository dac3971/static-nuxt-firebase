<template>
   <v-list>
      <v-card v-for="(comment,i) in comments" :id="comment.id" :key="comment.id" 
      nuxt tile flat>
        
        <!-- comment text -->
        <div class="mt-4">
          <v-card-title class="mt-0">
          <div class="font-weight-bold body-2">{{ comment.aName }}</div>
          <div v-if="user">
            <v-menu bottom right offset-y v-if="user.uid===comment.aID">
            <template v-slot:activator="{ on }">
            <v-btn small v-on="on" icon
            style="margin:0 0 0 10px; width: 16px !important; height: 16px !important">
            <v-icon small style="font-size: 16px">arrow_drop_down</v-icon>
            </v-btn>
            </template>
            <v-list style="padding: 0 8px !important">
              <v-list-tile @click="deleteCom(comment.id,i)">
                <v-list-tile-title style="font-size: 11px !important">Delete</v-list-tile-title>
              </v-list-tile>
            </v-list>
            </v-menu>
          </div>
          <v-spacer />
          <div class="font-italic" style="font-size: 10px" :title="comment.timestamp"
          >{{ convertDate(comment.timestamp) }}</div>
          </v-card-title>
          <div class="body-2">{{ comment.text }}</div>

          <!-- reply button -->
          <v-card-actions>

            <v-text-field v-if="replyingTo === comment.id"
            @keyup.enter.native="submitReply(i)"
            @keyup.esc.native="hideReplyForm"
            v-model.trim="replyText"
            color="white"
            autofocus
            single-line
            placeholder="reply..."
            hide-details
            append-icon="send"
            prepend-icon="clear"
            @click:append="submitReply(i)"
            @click:prepend="hideReplyForm"
            background-color="white"
            style="padding: 1px 4px 0 4px !important;border: 1px solid black !important"
            class="body-2" />

            <div v-else-if="replyingTo === i">
            <v-progress-circular :width=2
            size="12" indeterminate></v-progress-circular>
            </div>

            <div v-else>
            <v-breadcrumbs-item @click.native="showReplyForm(comment.id)"
            style="font-size:12px"
            >reply</v-breadcrumbs-item>
            </div>

          </v-card-actions>
        </div>

        <ReplyList :index="i" :r="r" :pid="pid" :replies="comment.replies"
        :cid="comment.id" :currentRepLimit="comment.currentRepLimit" :showD="showD" />

        <!-- additional replies button -->
        <div>
        <v-card-actions v-if="comment.nextRepliesFunc">
          <div class="ml-5 pt-1 pb-0 mb-0">
            <v-progress-circular :width=2 v-if="replyLoading===i"
            size="12" indeterminate></v-progress-circular>
            <v-breadcrumbs-item  v-else
            @click.native="showMoreReplies(i)"
            class="text-uppercase" style="text-decoration: underline; font-size:12px;"
            >view more</v-breadcrumbs-item>
        </div>
        </v-card-actions>
        </div>
      </v-card>
    </v-list>
</template>
<script>
import ReplyList from '~/components/post/ReplyList.vue'
import util from '~/assets/js/util'
import Confirm from  '~/components/Confirm.vue'
import { firestoreNamespace, firestore } from '~/plugins/firebase'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      replyingTo: null,
      replyText: '',
      replyLoading: null
    }
  },
  computed: {
    ...mapGetters(['user']),
    repLimit () { return this.$store.state.p.initialReplyLimit }
  },
  methods: {
    showMoreReplies (index){
        this.replyLoading = index
        this.$store.dispatch('p/loadMoreReps', {comment: this.comments[index], index: index})
        .then((_)=> this.replyLoading = null)
    },
    submitReply (i){
      // this.replyingTo = index
      let com = this.comments[i]
      const path = `posts/${this.pid}/comments/${com.id}/replies`
      const repRef = firestore.collection(path)
      const data = {
        aID: this.user.uid,
        aName: this.user.displayName,
        parentComAuth: com.aID,
        text: this.replyText,
        timestamp: firestoreNamespace.FieldValue.serverTimestamp()
      }
      repRef.add(data).then((d)=>{
        this.replyingTo = null
        this.replyText = ''
        d.get().then((doc)=>{
            let rep = doc.data()
            rep.id = doc.id
            const d = rep.timestamp.toDate().toUTCString()
            rep.timestamp = d
            if(!util.duplicate(rep,com.replies)){
                com.currentRepLimit = com.currentRepLimit + 1
                com.replies.unshift(rep)
                this.$store.commit('p/refreshComment',{index: i, newCom: com})
            }
        })
      })
    },
    async deleteCom (id,i) {
      this.showD()
      const yes = await this.r
      .open('Delete This Comment', 'Are you sure?', {color: 'white'})
      if (yes) {
        this.deleteComment(id,i)
      }
    } ,
    deleteComment(id,i){
      firestore.collection(`posts/${this.pid}/comments`)
      .doc(id).delete().then(()=>this.$store.commit('p/removeComment',i))
    },
    showReplyForm (id) {
      if(this.user){
        this.replyingTo = id
      }else
        this.$router.push('/account/login')
    },
    hideReplyForm () {
      this.replyingTo = null
      this.replyText = ''
    },
    convertDate (d){
      return util.convertDate(d)
    }
  },
  components: { ReplyList, Confirm },
  props: ['showD','pid','comments', 'r']
}
</script>
<style>
input, textarea {
  /* color: white !important; */
  caret-color: black !important;
}
 </style>