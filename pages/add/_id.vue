<template>
    <v-layout row wrap v-if="sInfo">
        <v-flex xs12 sm10 md7 mt-2>
        <div class="title">Create Group</div>
        <div class="font-weight-bold mt-3 text-capitalize">{{ `${unit}:` }}</div>
      <div class="mt-1 mb-3 body-2">
          <nuxt-link :to="`/s/${sInfo.id}/${underscoreTitle(sInfo.name)}`"
      >{{ sInfo.name }}</nuxt-link></div>
        </v-flex>
        <v-flex xs12 sm10 md7>
            <v-form ref="form" @submit.prevent="submit" style="padding: 1px">
            <div class="font-weight-bold">Title:</div>
        <v-text-field flat autofocus spellcheck="false"
            style="border: 1px solid black !important; padding: 0 4px !important"
            v-model="title" clearable
            single-line hide-details ref="title">
        </v-text-field>

            <div class="font-weight-bold mt-4 mb-1">Subject:</div>
      <v-select v-if="subjects"
        :items="subjects"
        color="black"
        single-line
        flat
        box
        v-model="subject"
        hide-details
        style="border: 1px solid black !important; padding: 1px !important;
        margin: 0 !important; font-size: 13px !important;"
        background-color="white"
        dense
      ></v-select>
      <div class="text-xs-center mt-4">
        <v-btn flat outline class="ma-0"
        @click.prevent="submit">submit</v-btn>
      </div>
        </v-form>
        </v-flex>
    </v-layout>
</template>
<script>
import util from '~/assets/js/util'
import { firestoreNamespace, firestore } from '~/plugins/firebase'
import { mapGetters } from 'vuex';

export default {
    data(){
        return {
            title: '',
            subject: '',
            unit: process.env.unit
        }
    },
    computed: {
        ...mapGetters(['user']),
        sInfo () { return this.$store.state.add.sInfo },
        subjects (){
            const subs = this.$store.state.add.subjectObj
            return Object.keys(subs)
            .map(k=>{ return { value: k, text: subs[k] }; })
        },
    },
    async validate({ params, query, store }){
        const sid = params.id
        const sRef = `${process.env.unitPlural}/${sid}`
        let proms = []
        proms.push(firestore.doc(sRef).get())
        proms.push(firestore.doc('subjects/subjects').get())
        const results = await Promise.all(proms)
        const newS = results[0] ? results[0].data() : null
        if(newS) newS.id = results[0].id
        store.commit('add/setUnit', newS)
        store.commit('add/setSubjects', results[1] ? results[1].data() : {})
        if(store.state.add.sInfo) return true
        return false
    },
    methods: {
        submit (v){
            if(this.title.length > 0)
                firestore.collection('groups').add({
                    aID: this.user.uid,
                    aName: this.user.displayName,
                    followsCt: 0,
                    name: this.title,
                    postsCt: 0,
                    sID: this.sInfo.id,
                    //below has to be transferred to the cloud funcs
                    search: util.createSearchMap(this.title),
                    sName: this.sInfo.name,
                    subject: this.subject,
                    subjectName: this.$store.state.add.subjectObj[this.subject],
                    timestamp: firestoreNamespace.FieldValue.serverTimestamp()
                }).then((docRef)=> this.$router.replace(`/g/${docRef.id}`))
        },
        underscoreTitle(v){ return util.underscoreTitle(v)}
    },
    head (){
      return {titleTemplate: `${this.sInfo ? 'Add Group | '+this.sInfo.name : 'Add Group'}`}
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