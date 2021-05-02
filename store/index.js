import firebase from 'firebase'
import {getUserFromCookie, getUserFromSession} from '../helpers'
import Cookies from 'js-cookie'

export const state = () => ({
  user: null,
  account: null,
  loading: false,
})

export const mutations = {
  setUser(state, {authUser}) {
    if (authUser) {
      const {user_id, email} = authUser
      state.user = {user_id, email}
    } else {
      state.user = null
    }
  },

  setAccount(state, {account}) {
    if (account) {
      const {name, email} = account
      state.account = {name, email}
    } else {
      state.account = null
    }
  },

  startLoading(state) {
    state.loading = true
  },
  stopLoading(state) {
    state.loading = false
  }
}

export const actions = {
  async nuxtServerInit({dispatch}, {req}) {
    const user = getUserFromCookie(req)
    if (user) {
      await dispatch('setUser', user)
    }
  },

  async setUser(ctx, user) {
    ctx.commit('setUser', {authUser: user})
    return firebase.firestore().collection('accounts' ).doc(user.user_id).get()
      .then(doc => {
        if (doc.exists) {
          let account = doc.data()
          ctx.commit('setAccount', { account })
        }
      })
  },

  userLogin(ctx, user) {
    return firebase.auth()
      .signInWithEmailAndPassword(user.email, user.pass)
      .then(async userCredential => {
        let token = await firebase.auth().currentUser.getIdToken(true)
        Cookies.set('access_token', token)

        await ctx.dispatch('setUser', {
          user_id: userCredential.user.uid,
          email: userCredential.user.email
        })
      })
  },
  userLogout(ctx) {
    firebase.auth().signOut()
    ctx.commit('setUser', {authUser: null})
    Cookies.remove('access_token')
  },
  userRegister(ctx, user) {
    return firebase.auth()
      .createUserWithEmailAndPassword(user.email, user.pass)
      .then(async userCredential => {
        await firebase.firestore().doc('accounts/'+ userCredential.user.uid).set({
          name: user.name,
          email: user.email
        })

        await ctx.dispatch('userLogin', user)
      })
  }
}

export const getters = {
  isAuthenticated(state) {
    return !!state.user
  }
}
