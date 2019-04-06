import { firestoreAction } from 'vuexfire'
import { firestore } from '~/plugins/firebase'

export const state = () => ({
    gInfo: null,
    following: null,
    unsub: null
})

export const mutations = {
    setGroup (state,g) { state.gInfo = g},
    deleteFollowing (state) { state.following = null },
    setFollowing (state,v) { state.following = v },
    setUnsub (state,f) { state.setUnsub = f}
}

export const actions = {
    // init: firestoreAction(({ bindFirestoreRef }, path) => {
    //     return bindFirestoreRef('gInfo', firestore.doc(path))
    // }),
    // checkFollowing: firestoreAction(async ({ bindFirestoreRef, commit }, path) => {
    //     commit('deleteFollowing')
    //     return bindFirestoreRef('following', firestore.doc(path))
    // }),
    attachListener ({commit},data){
        let u = firestore.doc(`groups/${data.id}/follows/${data.uid}`)
        .onSnapshot(doc=> commit('setFollowing', doc.exists ? doc.data() : null))
        // commit('setUnsub', u) gives cannot stringify function error
    },
}