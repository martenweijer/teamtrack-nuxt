import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import {getUserFromCookie, getUserFromSession} from '../helpers'
import Cookies from 'js-cookie'
import _ from 'lodash'
import moment from 'moment'

export const state = () => ({
  user: null,
  account: null,
  team: null,
  loading: true,
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
      const {name, email, active_team_id, active_team_name, invites, teams} = account
      state.account = {name, email, active_team_id, active_team_name, invites, teams}
    } else {
      state.account = null
    }
  },

  setName(state, name) {
    state.account.name = name
  },

  setTeam(state, team) {
    const {name, users} = team
    state.team = {name, users}
  },

  removeInvite(state, { invite }) {
    state.account.invites = _.reject(state.account.invites, {
      team_id: invite.team_id
    })
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
    await ctx.dispatch('loadAccount')
  },

  async loadTeam(ctx) {
    let result = await firebase.firestore().collection('teams').doc(ctx.state.account.active_team_id).get()
    if (result.exists) {
      let team = result.data()
      ctx.commit('setTeam', team)
    }
  },
  async loadAccount(ctx) {
    let doc = await firebase.firestore().collection('accounts').doc(ctx.state.user.user_id).get()
    if (doc.exists) {
      let account = doc.data()
      ctx.commit('setAccount', {account})

      if (account.active_team_id) {
        await ctx.dispatch('loadTeam')
      }
    }
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
        await firebase.firestore().doc('accounts/' + userCredential.user.uid).set({
          name: user.name,
          email: user.email
        })

        await ctx.dispatch('userLogin', user)
      })
  },

  async settings(ctx, data) {
    await firebase.firestore().collection('accounts').doc(ctx.state.user.user_id).update({
      name: data.name
    })
    ctx.commit('setName', data.name)

    if (data.pass != null && data.pass.length >= 6 && data.pass === data.pass_repeat) {
      await firebase.auth().currentUser.updatePassword(data.pass)
    }
  },

  async createTeam(ctx, name) {
    if (name == null || name.length < 2) {
      throw new Error('empty team name')
    }

    let result = await firebase.firestore().collection('teams').add({
      name: name,
      users: [{
        id: ctx.state.user.user_id,
        email: ctx.state.user.email,
        name: ctx.state.account.name
      }]
    })

    await firebase.firestore().collection('accounts').doc(ctx.state.user.user_id).update({
      active_team_id: result.id,
      active_team_name: name,
      teams: firebase.firestore.FieldValue.arrayUnion({
        id: result.id,
        name: name
      })
    })

    await ctx.dispatch('loadAccount')
  },
  async changeTeam(ctx, team) {
    await firebase.firestore().doc('accounts/'+ ctx.state.user.user_id).update({
      active_team_id: team.id,
      active_team_name: team.name
    })

    await ctx.dispatch('loadAccount')
  },

  async invitePlayer(ctx, email) {
    let result = await firebase.firestore().collection('accounts').where('email', '==', email).get()
    if (result.docs.length !== 1) {
      throw new Error('no email')
    }

    for (var i = 0; i < result.docs.length; i++) {
      let doc = result.docs[i]
      let account = await firebase.firestore().doc('accounts/'+ doc.id).get()
      if (!account.exists) {
        throw new Error('no account found')
      }

      let data = account.data()

      if (data.teams && _.find(data.teams, ['id', ctx.state.account.active_team_id])) {
        throw new Error('already in team')
      }

      await firebase.firestore().doc('accounts/'+ doc.id).update({
        invites: firebase.firestore.FieldValue.arrayUnion({
          team_id: ctx.state.account.active_team_id,
          team_name: ctx.state.account.active_team_name
        })
      })
    }
  },

  async acceptInvite(ctx, invite) {
    await firebase.firestore().collection('accounts').doc(ctx.state.user.user_id).update({
      active_team_id: invite.team_id,
      active_team_name: invite.team_name,
      teams: firebase.firestore.FieldValue.arrayUnion({
        id: invite.team_id,
        name: invite.team_name
      }),
      invites: firebase.firestore.FieldValue.arrayRemove({
        team_id: invite.team_id,
        team_name: invite.team_name
      })
    })

    await firebase.firestore().doc('teams/'+ invite.team_id).update({
      users: firebase.firestore.FieldValue.arrayUnion({
        id: ctx.state.user.user_id,
        email: ctx.state.user.email,
        name: ctx.state.account.name
      })
    })

    ctx.commit('removeInvite', { invite })
  },
  async declineInvite(ctx, invite) {
    await firebase.firestore().collection('accounts').doc(ctx.state.user.user_id).update({
      invites: firebase.firestore.FieldValue.arrayRemove({
        team_id: invite.team_id,
        team_name: invite.team_name
      })
    })

    ctx.commit('removeInvite', { invite })
  },

  async createEvent(ctx, event) {
    let date = moment(event.date +' '+ event.time +':00')

    let result = await firebase.firestore().collection('events').add({
      name: event.name,
      team_id: ctx.state.account.active_team_id,
      date: date.toDate()
    })
    return result.id
  },
  async editEvent(ctx, event) {
    let date = moment(event.date +' '+ event.time +':00')

    await firebase.firestore().collection('events').doc(event.id).update({
      name: event.name,
      date: date.toDate()
    })
  },
  async deleteEvent(ctx, id) {
    await firebase.firestore().collection('events').doc(id).delete()
  },
  async changeStatus(ctx, data) {
    if (data.status === 1) {
      await firebase.firestore().collection('events').doc(data.event_id).update({
        available: firebase.firestore.FieldValue.arrayUnion({
          id: ctx.state.user.user_id,
          name: ctx.state.account.name
        }),
        unavailable: firebase.firestore.FieldValue.arrayRemove({
          id: ctx.state.user.user_id,
          name: ctx.state.account.name
        }),
      })
    } else if (data.status === 2) {
      await firebase.firestore().collection('events').doc(data.event_id).update({
        available: firebase.firestore.FieldValue.arrayRemove({
          id: ctx.state.user.user_id,
          name: ctx.state.account.name
        }),
        unavailable: firebase.firestore.FieldValue.arrayUnion({
          id: ctx.state.user.user_id,
          name: ctx.state.account.name
        }),
      })
    }
  },

  async loadEvents(ctx) {
    return this.$fire.firestore.collection('events')
      .where('team_id', '==', ctx.state.account.active_team_id)
      .where('date', '>', firebase.firestore.Timestamp.now())
      .orderBy('date', 'asc')
      .get()
  }
}

export const getters = {
  isAuthenticated(state) {
    return !!state.user
  }
}
