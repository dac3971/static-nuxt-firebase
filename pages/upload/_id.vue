<template>
<v-layout row wrap justify-center v-if="gInfo">
    <v-flex xs12 sm10 md7 mt-2>
      <div class="title"><nuxt-link
      :to="`/g/${gInfo.id}/${underscore(gInfo.name)}`"
      >{{ gInfo.name }}</nuxt-link></div>
    </v-flex>

    <v-flex xs12 sm10 md7 mt-2 v-if="!uploading">
        <div class="font-weight-bold">Category:</div>
      <v-radio-group v-model="active" row v-if="!uploading">
        <v-flex xs6 sm4 v-for="cat in cats" :key="cat">
        <v-radio :label="cat" :value="cat" class="text-uppercase" />
        </v-flex>
      </v-radio-group>
    </v-flex>

    <v-flex xs12 sm10 md7 v-if="!uploading">
      <div class="font-weight-bold">Title:</div>
      <v-text-field flat spellcheck="false"
        style="border: 1px solid black !important;"
        v-model="title" clearable
        single-line hide-details ref="title">
      </v-text-field>
        <div class="font-weight-bold mt-3">Text:</div>
      <v-textarea flat spellcheck="false"
        style="border: 1px solid black !important;"
        v-model="text" clearable hide-details ref="text">
      </v-textarea>

      <v-layout row wrap class="my-4">
        <v-flex xs4 class="font-weight-bold">File (Optional):</v-flex>
        <v-flex xs4>
        <v-btn v-show="fileList.length==0" small
          @click.native="selectFile" flat outline
          style="margin: 0 !important;"
        >file<v-icon
            right small
            aria-hidden="true">file_copy</v-icon>
        </v-btn>
        <input v-show="false"
          id="image"
          type="file"
          name="file"
          ref="uploadInput"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.xml,application/msword,
          application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          :multiple="false"
          @change="detectFiles($event)" />
        </v-flex>

        <v-flex xs4>
          <v-btn v-show="fileList.length==0" small
          @click.native="selectFiles" flat outline
          style="margin: 0 !important"
          >images<v-icon
            right small
            aria-hidden="true">add_photo_alternate</v-icon>
        </v-btn>
        <input v-show="false"
          id="files"
          type="file"
          name="file"
          ref="uploadInput2"
          accept="image/*"
          :multiple="true"
          @change="detectFiles($event)" />
        </v-flex>
      </v-layout>
  
      <v-text-field v-for="(file,i) in fileList"
      @click:append="removeFile(i)" :value="file.name"
      append-icon="clear" :key="i" readonly />

      <div class="text-xs-center">
        <v-btn flat outline @click="upload">upload</v-btn>
      </div>

    </v-flex>
    <v-flex xs12 sm10 md7 mt-5 v-if="uploading">
    <div class="text-xs-center">
       <v-progress-circular
        v-if="uploading && !uploadEnd"
        :size="100"
        :width="15"
        :rotate="360"
        :value="progress"
        color="primary">
        {{ progress }}%
      </v-progress-circular>
    </div>
    </v-flex>
</v-layout>
</template>
<script>
import { mapGetters } from 'vuex'
import { firestoreNamespace, firestore, storage } from '~/plugins/firebase'
import util from '~/assets/js/util'

export default {
    data(){
        return {
            title: '',
            text: '',
            active: 'papers',
            progress: 1,
            progressUploads: [],
            uploading: false,
            uploadTasks: [],
            uploadURLs: {},
            uploadEnd: false,
            fileList: [],
            ready: false,
            cats: process.env.cats.split(',')
        }
    },
    computed: {
      ...mapGetters(['user']),
      gInfo (){ return this.$store.state.upload.gInfo }
    },
    async validate({ params, query, store }){
      if(!store.state.user) return false
      const gid = params.id
      const gRef = `groups/${gid}`
      let proms = [], newG
      proms.push(firestore.doc(gRef).get())
      const results = await Promise.all(proms)
      newG = results[0].data()
      newG.id = results[0].id
      newG.timestamp = results[0].data().timestamp.toDate().toUTCString()
      store.commit('upload/setGroup',newG)
      if(newG) return true
      return false
    },
    methods: {
      selectFile(){
        this.$refs.uploadInput.click()
      },
      selectFiles(){
        this.$refs.uploadInput2.click()
      },
      detectFiles(e){
        let files = e.target.files || e.dataTransfer.files
        let fileList = Array.from(Array(files.length).keys()).map(x => {
          return files[x]
        })
        this.fileList = fileList
      },
      removeFile (i){
        this.fileList.splice(i,1)
      },
      setReady (){
        this.ready = true
      },
      underscore (v){ return util.underscoreTitle(v) },
      upload (){
        if(this.text.length>0 && this.title.length>0){
          this.uploading = true
          let ready = this.setReady
          const uid = this.user.uid
          const pid = firestore.collection('p').doc().id
          let proms = []
          const fileCt = this.fileList.length
          if(fileCt>0){
            let tasks = this.uploadTasks
            const firstFile = this.fileList[0]
            if(fileCt===1 && !firstFile['type'].includes('image')){
              let ext = firstFile.name.split('.').pop().toLowerCase()
              tasks.push(storage.ref(`${uid}/${pid}/0.${ext}`).put(firstFile))
              ready()
            }
            else{
              Array.from(Array(fileCt).keys()).map(i => {
                const file = this.fileList[i]
                const reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onload = event => {
                  const img = new Image()
                  img.src = event.target.result
                  img.onload = function () {
                    const w = this.width
                    const h = this.height
                    const elem = document.createElement('canvas')
                    elem.id = `${i}`
                    elem.width = w
                    elem.height = h
                    const ctx = elem.getContext('2d')
                    ctx.drawImage(img,0,0,w,h)
                    ctx.canvas.toBlob((blob)=> {
                        const newFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        })
                        tasks.push(storage.ref(`${uid}/${pid}/${i}.jpg`)
                        .put(newFile))
                        if(tasks.length===fileCt) ready()
                    }, 'image/jpeg', 0.6)
                  },
                  reader.onerror = error => console.log(error)
                }
              })
            }
          }else ready()
        }else console.log('error')
      }
    },
    watch: {
      ready: function () {
        let data = {
          aID: this.user.uid,
          aName: this.user.displayName,
          body: this.text,
          cat: this.active,
          commentsCt: 0,
          gID: this.gInfo.id,
          gName: this.gInfo.name,
          likesCt: 0,
          name: this.title,
          sID: this.gInfo.sID,
          savesCt: 0,
          search: util.createSearchMap(this.title),
          subject: this.gInfo.subject,
          timestamp: firestoreNamespace.FieldValue.serverTimestamp()
        }
        const tasks = this.uploadTasks
        if(tasks.length>0){
          const portionOfPie = 98 / tasks.length
          tasks.forEach(task=>{
            this.progressUploads.push(0)
            const i = this.progressUploads.length-1
            task.on('state_changed', sp => {
              this.progressUploads[i] = 
              Math.floor(sp.bytesTransferred / sp.totalBytes * portionOfPie)
              this.progress = this.progressUploads.reduce((a,b)=> a+b)
            })
            task.then(snap=>{
              const arr = snap.ref.fullPath.split('/')
              const len = arr.length
              const i = arr[len-1].split('.')[0]
              const pid = arr[len-2]
              snap.ref.getDownloadURL().then(url=>{
                this.uploadURLs[i] = url
                const fileCt = Object.keys(this.uploadURLs).length
                if(fileCt === this.fileList.length){
                  data['filesCt'] = fileCt
                  data['urls'] = this.uploadURLs
                  firestore.doc(`posts/${pid}`).set(data)
                    .then((_)=> this.$router.replace(`/p/${pid}`))
                }
              })
            })
          })
        }
        else firestore.collection('posts').add(data)
            .then((docRef)=> this.$router.replace(`/p/${docRef.id}`))
      }
    },
    head (){
      return {titleTemplate: `${this.gInfo ? 'Upload | '+this.gInfo.name : 'Upload'}`}
    }
}
</script>
<style>
  .v-radio>div>i { font-size: 16px !important }
  .v-radio>label { font-size: 14px !important }
  .v-radio>div>.v-input--selection-controls__ripple {
    left: -16px;
  }
  .v-text-field > .v-input__control > .v-input__slot:before{
    border: none !important;
  }
  /* .v-input__append-inner {
    margin-top: 6px !important;
  } */
</style>