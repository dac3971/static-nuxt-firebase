import firebaseApp from '~/plugins/firebase'

export default context => {
  const { store } = context

  return new Promise((resolve, reject) => {
    firebaseApp.auth().onAuthStateChanged(user => {
      if (user) {
        let promises = []
        promises.push(store.dispatch('getNots',
        `users/${user.uid}/notifications`))
        promises.push(store.dispatch('getNotsCt',
        `users/${user.uid}/private/privateDoc`))
        promises.push(store.dispatch('setUser', {
            displayName: user.displayName,
            name: user.displayName,
            email: user.email,
            uid: user.uid
          }))
        return resolve(Promise.all(promises))
      }
      return resolve()
    })
  })
}