<template>
<div style='border-left: 1px dashed black' class='ml-4 pl-2 mb-2'>
        <!-- reply cards -->
    <div v-for="(reply,i) in replies" :key="reply.id">
        <v-card flat  v-if="i<currentRepLimit">
        <v-card-title>
          <div class="font-weight-bold body-2">{{ reply.aName }}</div>
          <div v-if="user">
          <v-menu bottom right offset-y v-if="user.uid===reply.aID">
            <template v-slot:activator="{ on }">
          <v-btn small v-on="on" icon
          style="margin:0 0 0 10px; width: 16px !important; height: 16px !important">
          <v-icon small style="font-size: 16px">arrow_drop_down</v-icon>
          </v-btn>
            </template>
            <v-list style="padding: 0 8px !important">
                <v-list-tile @click="deleteCom(reply,i)">
                  <v-list-tile-title style="font-size: 11px !important">Delete</v-list-tile-title>
                </v-list-tile>
              </v-list>
          </v-menu>
          </div>
          <v-spacer />
          <div class="font-italic" style="font-size: 10px" :title="reply.timestamp"
          >{{ convertDate(reply.timestamp) }}</div>
        </v-card-title>
        <div class="body-2">{{ reply.text }}</div>

        <!-- reply button -->
        <!-- <v-card-actions>
            <v-breadcrumbs v-if="replyingTo != reply.id">
            <v-breadcrumbs-item @click.native="showReplyForm(reply.id)"
            style="font-size:12px; cursor: pointer; font-weight: bold"
            >reply</v-breadcrumbs-item>
            </v-breadcrumbs>
            <v-text-field v-else
            @keyup.enter.native="submitReply"
            @keyup.esc.native="hideReplyForm"
            v-model="replyText"
            box
            autofocus
            single-line
            label=""
            placeholder="reply..."
            hide-details
            append-icon="clear"
            @click:append="hideReplyForm"
            background-color="white"
            class="bord body-2">
            </v-text-field>
        </v-card-actions> -->
        </v-card>
    </div>
</div>
</template>
<script>
import util from '~/assets/js/util'
import Confirm from  '~/components/Confirm.vue'
import { firestoreNamespace, firestore } from '~/plugins/firebase'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      replyingTo: null,
      replyText: '',
    }
  },
  computed: {
    ...mapGetters(['user']),
  },
  methods: {
    convertDate(d){
      return util.convertDate(d)
    },
    async deleteCom (reply,i) {
      this.showD()
      const yes = await this.r
      .open('Delete This Reply', 'Are you sure?', {color: 'white'})
      if (yes) {
        this.deleteComment(reply,i)
      }
    } ,
    deleteComment(reply,i){
      firestore.collection(`posts/${this.pid}/comments/${this.cid}/replies`)
      .doc(reply.id).delete()
      .then(()=>{
        let com = this.$store.state.p.comments[this.index]
        com.replies.splice(i, 1)
        this.$store.commit('p/refreshComment', {index: this.index, newCom: com})
      })
    },
  },
  components: { Confirm },
  props: ['replies','currentRepLimit', 'index','r', 'pid', 'cid', 'showD']
}
</script>