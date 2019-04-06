<template>
  <v-container>
  <v-layout row wrap justify-center>
    <v-flex xs12 sm10 md7 mt-2>
      <div class="title">Search:</div>
    </v-flex>
    <v-flex xs12 sm10 md7>
      <v-radio-group v-model="active" class="text-uppercase">
        <v-layout row>
        <v-flex xs4>
        <v-radio :label="unitPlural" :value="unitPlural" @click.native="foc" />
        </v-flex>
        <v-flex xs4>
        <v-radio label="GROUPS" value="groups" @click.native="foc" />
        </v-flex>
        <v-flex xs4>
        <v-radio label="POSTS" value="posts" @click.native="foc" />
        </v-flex>
        </v-layout>
      </v-radio-group>
    </v-flex>
    <v-flex xs12 sm10 md7>
      <v-text-field flat autofocus spellcheck="false"
        style="border: 1px solid black !important; padding: 1px 0"
        v-model="searchText" clearable @click="clear"
        single-line hide-details ref="searchBar">
      </v-text-field>
    </v-flex>
    <v-flex xs12 sm10 md7 mt-2>
      <v-list>
      <v-list-tile v-if="searchText && items.length == 0 && !isLoading">
      <v-list-tile-title>Nothing found</v-list-tile-title>
      </v-list-tile>
      <v-list-tile v-else
      v-for="item in items"
      :id="item.id"
      :key="item.id"
      nuxt
      :to="`/${active===unitPlural?'s':active[0]}/${item.id}/${underscore(item.name)}`">
        <v-list-tile-avatar v-if="item.cat">
            <v-icon>image</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-sub-title class="font-weight-bold"
          :style="getColor(item.cat)" v-if="item.cat"
          >{{ item.cat.toUpperCase() }}</v-list-tile-sub-title>
          <v-list-tile-sub-title v-else-if="item.sName"
          >{{ item.sName }}</v-list-tile-sub-title>
          <v-list-tile-title>{{ item.name }}</v-list-tile-title>
          <v-list-tile-sub-title v-if="item.state">{{ `${item.state}` }}</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      </v-list>
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
      searchText: '',
      isLoading: false,
      items: [],
      active: process.env.unitPlural,
      unit: process.env.unit,
      unitPlural: process.env.unitPlural
    }
  },
  watch: {
    searchText (to,from) {
      if(typeof to === "string" && to.length>0 && to.length>from.length){
        this.items = []
        this.isLoading = true
        const v = this.underscore(to)
        firestore.collection(this.active).where('search.'+v,'==',true)
        .limit(10).get().then(results=>{
          let unitArray = []
          results.forEach(res=>{
            let d = res.data()
            d.id = res.id
            unitArray.push(d)
          })
          return unitArray
        }).then(newArray=>{
          this.items = this.searchText?newArray:[]
          this.isLoading = false
        })
      }else if(!to || to.length===0){
        this.items = []
        this.isLoading = false
      }
    },
    active (to,from) {
      this.items = []
      this.searchText = ''
      this.isLoading = false
    }
  },
  methods: {
    underscore (val) {
      return util.underscoreTitle(val)
    },
    getColor (cat) {
      return util.getColor(cat)
    },
    clear () {
      this.searchText = ''
    },
    foc () {
      this.$refs.searchBar.focus()
    }
  },
  head (){
    return {title: 'Search'}
  },
}
</script>

<style>
  .v-radio>div>i{ font-size: 16px !important}
  .v-radio>label
  { font-size: 14px !important}
  .v-radio>div>.v-input--selection-controls__ripple {
    left: -16px;
  }
  .v-input--selection-controls>.v-input__control {
    flex-grow: 1 !important
  }
  /* .v-input__append-inner {
    margin-top: 6px !important;
  } */
</style>