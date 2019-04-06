import { firestoreAction } from 'vuexfire'
import { firestore } from '~/plugins/firebase'

export const state = () => ({
    sInfo: null,
    sid: null,
    subjects: null,
    following: null,
    unsub: null
})

export const mutations = {
    setSubjects (state, s) { state.subjects = s },
    setSID (state, id) { state.sid = id },
    setFollowing (state, f) { state.following = f },
    deleteFollowing (state) { state.following = null },
    setUnsub (state,f) { state.unsub = f }
}

export const actions = {
    init: firestoreAction(({ bindFirestoreRef, commit }, path) => {
        // commit('setSID', path.split('/').pop())
        commit('setSID', path.id)
        return bindFirestoreRef('sInfo', path)//firestore.doc(path))
    }),
    checkFollowing: firestoreAction(({ bindFirestoreRef, commit }, path) => {
        commit('deleteFollowing')
        return bindFirestoreRef('following', firestore.doc(path))
    }),
}