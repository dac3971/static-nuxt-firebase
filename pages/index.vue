<template>
  <v-container text-xs-center>
    <v-layout row wrap justify-center :v-if="styleObj !== null">
      <v-flex xs12 mb-3 mt-4>
        <div flat class="title">{{ description }}</div>
      </v-flex>
      <v-flex text-xs-left xs12 sm10 md7 mt-4 mb-2
      class="font-weight-bold body-2 text-capitalize">
        {{`search ${unitPlural}:`}}
      </v-flex>
      <v-flex xs12 sm10 md7 :style="styleObj">
        <v-autocomplete
        append-icon=""
        :no-data-text="`${!isLoading && search ? `${unit} not found` : ''}`"
        autocomplete
        :autofocus="styleObj ? true : false"
        :single-line="styleObj ? true : false"
        hide-details
        box
        v-model="model"
        spellcheck="false"
        no-filter
        background-color="white"
        :loading="isLoading"
        :search-input.sync="search"
        :items="items"
        @change= "onSelect"
        >
          <template
            slot="selection"
            slot-scope="data"
          >{{data.selected}}
          </template>
          <template
            slot="item"
            slot-scope="data"
          >
            <v-list-tile-content v-if="items.length>0">
              <v-list-tile-title v-text="data.item.name" />
              <v-list-tile-sub-title v-text="data.item.state" />
            </v-list-tile-content>
          </template>
        </v-autocomplete>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import util from '~/assets/js/util'
import { firestore } from '~/plugins/firebase'
export default {
  data () {
    return {
      styleObj: null,
      search: '',
      isLoading: false,
      items: [],
      model: '',
      description: process.env.description,
      unit: process.env.unit,
      unitPlural: process.env.unitPlural
    }
  },
  beforeMount: function (){
    this.styleObj = {
        border: '1px solid black !important',
        'padding-right': '1px !important',
        'padding-bottom': '1px !important'
    }
  },
  watch: {
    search (to,from) {
      this.isLoading = true
      if(typeof to === "string" && to.length>0){
        const v = this.underscore(to)
        firestore.collection(this.unitPlural).where('search.'+ v,'==',true)
        .limit(10).get().then(results=>{
          let schoolArray = []
          results.forEach(res=>{
            let d = res.data()
            d.id = res.id
            schoolArray.push(d)
          })
          return schoolArray
        }).then(newArray=>{
          this.items = this.search?newArray:[]
          this.isLoading = false
        })
      }else{
        this.items = []
        this.isLoading = false
      }
    }
  },
  methods: {
    onSelect (event) {
      this.isLoading = true
      this.$router.push("/s/"+event.id+"/"+Object.keys(event.search).sort(function (a, b) { return b.length - a.length; })[0])
    },
    underscore (val) {
      return util.underscoreTitle(val)
    }
  },
  head (){
    return {title: process.env.name}
  },
}
</script>

<style>
.v-select__slot {
  line-height: 1.2;
}
input:focus {
  outline: none !important;
}
input[role=combobox]{
  margin-top: 0 !important;
  font-size: 13px;
  padding: 0;
}
</style>