<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6" v-if="account">
      <v-card v-for="invite in account.invites" :key="invite.team_id" v-if="account">
        <v-card-title>Je bent uitgenodigd voor het team: {{ invite.team_name }}</v-card-title>
        <v-card-text>
          <v-layout>
            <v-flex xs6>
              <v-btn block color="success" @click="doAccept(invite)">
                Accepteren
              </v-btn>
            </v-flex>
            <v-flex xs6>
              <v-btn block color="error" @click="doDecline(invite)">
                Weigeren
              </v-btn>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>

      <v-card-text>
        <v-btn color="secondary" to="/create-event" v-if="account.active_team_id">
          Nieuw evenement aanmaken
        </v-btn>
        <v-btn color="secondary" to="/create-team" v-if="!account.active_team_id">
          Nieuw team aanmaken
        </v-btn>
      </v-card-text>

      <v-card v-for="event in events" :key="event.id" class="elevation-24 event-details">
        <v-layout>
          <v-flex xs4 class="event-left">
            <NuxtLink :to="'/events/'+ event.id">
              <div class="display-1">{{ event.date | day }}</div>
              <div class="subheading">{{ event.date | time }}</div>
              <div class="body-2">{{ event.date | date }}</div>
            </NuxtLink>
          </v-flex>
          <v-flex xs8 class="event-right">
            <div class="title">
              <NuxtLink :to="'/events/'+ event.id">
                {{ event.name }}
              </NuxtLink>
            </div>

            <v-divider class="event-divider"/>

            <v-layout>
              <v-flex xs6>
                <v-btn :text="!isAvailable(event)" block color="success" @click="doStatus(event, 1)">
                  Present
                </v-btn>
              </v-flex>
              <v-flex xs6>
                <v-btn :text="!isUnavailable(event)" block color="error" @click="doStatus(event, 2)">
                  Afwezig
                </v-btn>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import _ from 'lodash'
import Vue from 'vue'

export default {
  data() {
    return {
      events: null,
    }
  },
  computed: mapState(['account', 'user']),
  filters: {
    day(date) {
      return moment(date.toDate()).locale('nl').format('dddd').substring(0, 2).toUpperCase()
    },
    time(date) {
      return moment(date.toDate()).locale('nl').format('HH:mm')
    },
    date(date) {
      return moment(date.toDate()).locale('nl').format('D') +' '+ moment(date.toDate()).locale('nl').format('MMM')
    }
  },
  methods: {
    async doAccept(invite) {
      try {
        this.$store.commit('startLoading')
        await this.$store.dispatch('acceptInvite', invite)

        await this.$router.go()
      } finally {
        this.$store.commit('stopLoading')
      }
    },
    async doDecline(invite) {
      try {
        this.$store.commit('startLoading')
        await this.$store.dispatch('declineInvite', invite)

        await this.$router.push('/')
      } finally {
        this.$store.commit('stopLoading')
      }
    },
    async loadEvents() {
      if (!this.account.active_team_id) {
        return
      }

      let { docs } = await this.$store.dispatch('loadEvents')
      this.events = docs.map(doc => {
        let { id } = doc
        let data = doc.data()
        return { id, ...data }
      })

      this.$store.commit('stopLoading')
    },
    async doStatus(event, status) {
      try {
        this.$store.commit('startLoading')
        await this.$store.dispatch('changeStatus', {
          event_id: event.id,
          status
        })

        await this.loadEvents()
      } finally {
        this.$store.commit('stopLoading')
      }
    },
    isAvailable(event) {
      return _.find(_.get(event, 'available'), ['id', this.user.user_id])
    },
    isUnavailable(event) {
      return _.find(_.get(event, 'unavailable'), ['id', this.user.user_id])
    }
  },
  async created() {
    try {
      if (this.account == null) {
        this.$store.watch(state => state.account, async (newValue, oldValue) => {
          if (newValue != null) {
            await this.loadEvents()
          }
        })
      } else {
        await this.loadEvents()
      }
    } finally {
      this.$store.commit('stopLoading')
    }
  }
}
</script>
