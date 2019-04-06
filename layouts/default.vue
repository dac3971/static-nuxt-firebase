<template>
  <v-app>
<v-toolbar dense style="border-bottom: 3px double black; background: white !important"
      flat fixed app>
          <nuxt-link :to="user?'/home':'/'" style="text-decoration: none">
            <v-toolbar-title
            style="font-family: 'Source Code Pro', monospace; letter-spacing: 2px"
            >{{ name }}</v-toolbar-title>
          </nuxt-link>
          <v-spacer />
          <v-btn icon small nuxt to="/search">
            <v-icon small>search</v-icon>
          </v-btn>
              <v-menu bottom left v-if="user"
              :nudge-width="280" offset-y offset-x>
              <template v-slot:activator="{ on }">
                <v-btn small v-on="on" icon
                @click="zeroOut"><v-icon small
                :style="`color: ${getColor()} !important`"
                >{{ getIcon() }}</v-icon></v-btn>
              </template>
                <v-list style="padding: 0 8px !important">
                  <v-list-tile v-for="not in nots" :key="not.id" nuxt :to="`/p/${not.pID}`">
                    <v-list-tile-content>
                    <v-list-tile-sub-title>
                      <span class="font-weight-bold">{{not.aName}}</span
                      >{{ not | getType }}</v-list-tile-sub-title>
                    <v-list-tile-sub-title class="text-truncate">{{ not.text }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                  </v-list-tile>
                  <v-list-tile nuxt :to="`/nots`">
                    <v-list-tile-content>
                    <v-list-tile-sub-title>
                      <span class="font-weight-bold">See all notifications >></span></v-list-tile-sub-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>
              </v-menu>

              <v-menu bottom left offset-y>
                <template v-slot:activator="{ on }">
                <v-btn small v-on="on" icon><v-icon small>more_vert</v-icon></v-btn>
                </template>
                <v-list style="padding: 0 8px !important">
                  <v-list-tile nuxt to="/activity" v-if="user">
                    <v-list-tile-title>My Activity</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile nuxt to="/account" v-if="user">
                    <v-list-tile-title>My Account</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile @click="logout">
                    <v-list-tile-title>{{user ? 'Log Out' : 'Sign in' }}</v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>

    </v-toolbar>
    <v-content>

      <v-container style="max-width: 960px;">
        <nuxt />
      </v-container>

    </v-content>
    <v-footer 
      absolute
      app style="border-top: 1px solid black; background: white !important"
    >
      <v-flex ml-3 text-xs-left
      style="font-family: Bitter; letter-spacing: 1px; font-size: 10px"
      >{{`&copy; 2019 ${name}`}}</v-flex>
      <v-spacer></v-spacer>
      <v-flex mr-3 text-xs-right
      style="font-family: Bitter; letter-spacing: 1px; font-size: 10px">
        <nuxt-link to='/privacy'>Privacy</nuxt-link>
      </v-flex>
    </v-footer>
  </v-app>
</template>

<script>
  import { mapState, mapGetters } from 'vuex';
  import { firestore } from '~/plugins/firebase'

  export default {
    data() {
      return {
        searching: false,
        searchText: '',
        name: process.env.name
      }
    },
    computed: {
      ...mapGetters(['user','nots','notsCt'])
    },
    filters : {
      getType (not) {
        return (not.parentComID ? ' replied' : ' commented')
      }
    },
    methods: {
      logout(){
        if(this.user)
          this.$store.dispatch('logout').then((_)=>this.$router.push('/account/login'))
        else
          this.$router.push('/account/login')
      },
      zeroOut () {
        firestore.doc(`users/${this.user.uid}/private/privateDoc`)
        .set({notsCt:0},{merge: true})
      },
      getColor () {
        if(this.user && !this.notsCt ) return 'white'
        if(this.user && this.notsCt.notsCt > 0) return '#E64A19'
        return 'black'
      },
      getIcon () {
        const n = this.notsCt ? this.notsCt.notsCt : 0
        switch (n){
          case 1:
            return 'filter_1'
          case 2:
            return 'filter_2'
          case 3:
            return 'filter_3'
          case 4:
            return 'filter_4'
          case 5:
            return 'filter_5'
          case 6:
            return 'filter_6'
          case 7:
            return 'filter_7'
          case 8:
            return 'filter_8'
          case 9:
            return 'filter_9'
          default:
            return (n>9) ?'filter_9_plus' : 'expand_more'
        }
      }
    }
  }
</script>

<style>
body {
  font-family: "Source Code Pro", monospace;
  font-size: 11px;
}
a {
  text-decoration: none;
}
main {
  margin-bottom: 100px !important;
}
.btn__content {
  color: white !important;
}
.application--light {
  background: white !important;
  background-color: white !important;
  color: black !important;
}
.v-btn--active:before, .v-btn:focus:before, .v-btn:hover:before {
  background-color: white !important;
}
.v-input__control {
  padding: 0 6px 1px 6px !important;
}
.v-input__slot:before,.v-input__slot:hover:before {
  border-color: white !important;
}
.v-input__slot {
  font-size: 13px !important;
}
.v-input--is--focused {
  padding: 1px 12px !important;
}
.theme--light.v-text-field > .v-input__control > .v-input__slot:before {
  border-color: #fff !important;
}
.v-text-field {
  padding-top: 0 !important;
}
.v-input:not(.v-input--is-disabled) {
  color: #fff !important;
}
.infinite-status-prompt[style="color: rgb(102, 102, 102); font-size: 14px; padding: 10px 0px;"] {
  display: none;
}
.infinite-status-prompt[style="color: rgb(102, 102, 102); font-size: 14px; padding: 10px 0px;"]>i {
  display: block !important;
}
.v-list__tile--highlighted {
  border: 1px dashed black !important;
}
.v-breadcrumbs__item {
  /* width: 72px !important; */
  cursor: pointer !important;
  font-weight: bold !important;
}
.v-breadcrumbs li:last-child a {
  pointer-events: all !important;
}
.v-breadcrumbs__divider {
  display: none !important;
}
i.white--text {
  color: black !important;
  font-size: 16px !important;
}
i.v-icon--link {
  color: black !important;
  font-size: 16px !important;
}
.v-tabs__item:not(.v-tabs__item--active) {
  opacity: 1 !important;
}
</style>
