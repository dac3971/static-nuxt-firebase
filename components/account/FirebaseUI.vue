<template>
  <div id="firebaseui-auth-container"></div>
</template>
<script>
import * as firebase from 'firebase/app'
import * as firebaseui from 'firebaseui/dist/firebaseui.css'
import { mapActions } from 'vuex'

let ui
export default {
    name: 'FirebaseUI',
    methods: {
        ...mapActions(['login']),
        signInSuccessWithAuthResult(authResult, redirectUrl){
            // Do something.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            this.login(authResult.user)
            return false
        }
    },
    mounted () {
        var uiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: this.signInSuccessWithAuthResult
            },
            signInOptions: [
                // TODO(developer): Remove the providers you don't need for your app.
                  {
                    provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                    // Required to enable this provider in One-Tap Sign-up.
                    authMethod: 'https://accounts.google.com',
                    // Required to enable ID token credentials for this provider.
                    // clientId: CLIENT_ID
                  },
                {
                    provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                    scopes :[
                    //   'public_profile',
                    'email',
                    //   'user_likes',
                    //   'user_friends'
                    ]
                },
                //   firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                //   firebase.auth.GithubAuthProvider.PROVIDER_ID,
                {
                    provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                    // Whether the display name should be displayed in Sign Up page.
                    requireDisplayName: true
                },
                //   {
                //     provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                //     recaptchaParameters: {
                //       size: getRecaptchaMode()
                //     }
                //   },
                //   firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
            ],
            signInFlow: 'popup'
        }
        let firebaseui = require('firebaseui')
        ui = firebaseui.auth.AuthUI.getInstance()
        if(!ui){
            ui = new firebaseui.auth.AuthUI(firebase.auth())
        }
        ui.start('#firebaseui-auth-container', uiConfig)
    },
    beforeDestroy () {
        ui.reset()
    }
}
</script>
<style>
.md1-button, .mdl-button--raised{
    border: 1px solid black !important;
}
.firebaseui-idp-text{
    font-family: "Bitter" !important;
}
.firebaseui-idp-google
>.firebaseui-idp-text{
    color: black !important;
}
.firebaseui-idp-text-short,
.firebaseui-idp-text-long
{
    color: white !important;
}
.firebaseui-idp-password,
.firebaseui-idp-password:hover,
.mdl-button.firebaseui-idp-password:active,
.mdl-button.firebaseui-idp-password:focus{
    background-color: white !important;
}
.firebaseui-idp-password
>.firebaseui-idp-text{
    color: black !important;
}
.firebaseui-idp-password
>.firebaseui-idp-icon-wrapper{
    background-color: black !important;
}
</style>