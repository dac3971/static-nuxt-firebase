import { vuexfireMutations, firestoreAction } from 'vuexfire'
import util from '~/assets/js/util'
import { firestore } from '~/plugins/firebase'

export const state = () => ({
    pInfo: null,
    initialReplyLimit: 2,
    comments: [],
    liked: null,
    saved: null,
    unsubLike: null,
    unsubSave: null,
})

export const mutations = {
    setPost (state,p) { state.pInfo = p},
    prependComment (state, o) { if(!util.duplicate(o, state.comments)) state.comments.unshift(o) },
    addComment (state, o) { if(!util.duplicate(o, state.comments)) state.comments.push(o) },
    refreshComment (state, o) {
        let com = o.newCom
        // com.repliesChecked = true
        state.comments[o.index] = com
    },
    removeComment (state,i) { state.comments.splice(i,1) },
    clearComments (state) { state.comments = [] },
    setLike (state,v) { state.liked = v },
    setSave (state,v) { state.saved = v },
    setUnsubLike (state,v) { state.unsubLike = v },
    setUnsubSave (state,v) { state.unsubSave = v },
}

export const actions = {
    // init: firestoreAction(({ bindFirestoreRef }, path )=>{
    //     bindFirestoreRef('pInfo', fireDB.doc(path))
    // }),
    // checkUserStuff: firestoreAction(({ bindFirestoreRef, commit }, {path,uid} )=>{
    //     Promise.all([
    //         bindFirestoreRef('liked', fireDB.doc(`${path}/likes/${uid}`))
    //         .then((_)=>commit('setLiked',true)),
    //         bindFirestoreRef('saved', fireDB.doc(`${path}/saves/${uid}`))
    //         .then((_)=>commit('setSaved',true))
    //     ])
    // }),
    addComment ({commit, state},{comment,pid}){
        // const commentIndex = state.comments.length
        commit('addComment',comment)
        const rRef = firestore.collection(`posts/${pid}/comments/${comment.id}/replies`)
        rRef.orderBy('timestamp').limit(state.initialReplyLimit+1).get().then(snaps=>{
            let com = comment
            const repSnapsArr = snaps.docs
            if(repSnapsArr.length>0){
                const lastRep = repSnapsArr[repSnapsArr.length-1]
                const nextRepliesFunc = repSnapsArr.length <= state.initialReplyLimit ? null :
                rRef.orderBy('timestamp').startAfter(lastRep)
                snaps.forEach(doc=>{
                    let rep = doc.data()
                    rep.id = doc.id
                    const d = rep.timestamp.toDate().toUTCString()
                    rep.timestamp = d
                    com.replies.push(rep)
                })
                com.repliesChecked = true
                com.nextRepliesFunc = nextRepliesFunc
            }
            // commit('refreshComment', {index: commentIndex, newCom: com})
        })
    },
    loadMoreReps ({commit,state},{comment,index}){
        let com = comment
        comment.nextRepliesFunc.limit(8)//state.initialReplyLimit)
            .get().then(snaps=>{
            com.currentRepLimit = comment.currentRepLimit+state.initialReplyLimit
            com.nextRepliesFunc = null
            const repSnapsArr = snaps.docs
            if(repSnapsArr.length>0){
                const lastRep = repSnapsArr[repSnapsArr.length-1]
                com.nextRepliesFunc = repSnapsArr.length < state.initialReplyLimit ? null :
                firestore.collection(`posts/${state.pInfo.id}/comments/${comment.id}/replies`)
                .orderBy('timestamp').startAfter(lastRep)

                snaps.forEach(doc=>{
                    let rep = doc.data()
                    rep.id = doc.id
                    const d = rep.timestamp.toDate().toUTCString()
                    rep.timestamp = d
                    if(!util.duplicate(rep, com.replies))
                        com.replies.push(rep)
                })
            }
            commit('refreshComment', {index: index, newCom: com})
        })
    },
}