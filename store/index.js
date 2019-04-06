import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebaseApp, { firestore } from '~/plugins/firebase'
import { setToken, unsetToken } from '~/helpers';

export const strict = false

export const state = () => ({
  user: null,
  nots: [],
  notsCt: null,
})

export const getters = {
  user(state) { return state.user },
  nots(state) { return state.nots },
  notsCt(state) { return state.notsCt },
}

export const mutations = {
  ...vuexfireMutations,
  setUser (state, user){ state.user = user }
}

export const actions = {

  // async nuxtServerInit ({dispatch}, {req, isDev}) {
  //   if(!isDev) return
  //   const user = getUserFromCookie(req)
  //   // const uid = getUserFromSession(req)

  //   // if (req.session) {
  //   //   await dispatch('saveUID', req.session.userId)
  //   // }
  //   if(user) {
  //     await dispatch('setUser', {
  //       displayName: user.displayName,
  //       name: user.displayName,
  //       email: user.email,
  //       uid: user.uid
  //     })
  //   }
  // },
  // async nuxtClientInit () {
  //   const user = getUserFromLocalStorage()
  //   if(user){
  //     await dispatch('setUser', {
  //       displayName: user.displayName,
  //       name: user.displayName,
  //       email: user.email,
  //       uid: user.uid
  //     })
  //   }
  // },

  async login ({ dispatch, state }, user){
    const alreadyLogged = state.user != null
    const token = await firebaseApp.auth().currentUser.getIdToken(true)
    const userInfo = {
      displayName: user.displayName,
      name: user.displayName,
      email: user.email,
      uid: user.uid
    }

    setToken(token)
    await dispatch('setUser', userInfo).then((_)=>{
      if(alreadyLogged) this.$router.push('/account?v=1')
      else this.$router.push('/home')
    })
  },

  async logout ({ commit }){
    await firebaseApp.auth().signOut()
    unsetToken()
    commit('setUser', null)
  },
  
  setUser ({ commit }, user){
    commit('setUser', user)
  },

  getNots: firestoreAction(({ bindFirestoreRef }, path) => {
    return bindFirestoreRef('nots', firestore.collection(path))
  }),
  getNotsCt: firestoreAction(({ bindFirestoreRef }, path) => {
    return bindFirestoreRef('notsCt', firestore.doc(path))
  })
}
