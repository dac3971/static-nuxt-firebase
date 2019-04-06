import { vuexfireMutations, firestoreAction } from 'vuexfire'
import { firestore } from '~/plugins/firebase'

export const state = () => ({
    activity: [],
    groups: [],
    [process.env.unitPlural]: []
})

export const actions = {
    setAct: firestoreAction(({ bindFirestoreRef }, path) => {
        return bindFirestoreRef(path.split('/')[2], firestore.collection(path))
    }),
}