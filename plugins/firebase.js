import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

const config = {
  apiKey: process.env.apiKey,
  authDomain: `${process.env.projectId}.firebaseapp.com`,
  databaseURL: `${process.env.projectId}.firebaseio.com`,
  projectId: process.env.projectId,
  storageBucket: `${process.env.projectId}.appspot.com`,
  messagingSenderId: process.env.messagingSenderId
}

const firebaseApp = !firebase.apps.length ? firebase.initializeApp(config) : firebase.app()

const authNamespace = firebase.auth
const firestoreNamespace = firebase.firestore

const firestore = firebaseApp.firestore()//firebase.firestore()
const storage = firebaseApp.storage()//firebase.storage()

export default firebaseApp

export { firestore, storage, authNamespace, firestoreNamespace }