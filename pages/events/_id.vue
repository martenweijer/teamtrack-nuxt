<template>
  <v-card v-if="event">
    <v-card-text>
      <div class="display-1">
        {{ event.name }}
      </div>
      <v-subheader class="capitalize">
        {{ event.date | text }}
      </v-subheader>

      <v-layout>
        <v-flex xs6>
          <v-btn :text="!isAvailable()" block color="success" @click="doStatus(1)" large>
            Present
          </v-btn>
        </v-flex>
        <v-flex xs6>
          <v-btn :text="!isUnavailable()" block color="error" @click="doStatus(2)" large>
            Afwezig
          </v-btn>
        </v-flex>
      </v-layout>

      <v-divider class="event-status-divider"/>

      <v-card color="green lighten-4" class="white--text">
        <v-card-actions>
          <v-chip class="ma-2" color="green" text-color="white">
            <v-avatar left class="green darken-4">
              {{ available.length }}
            </v-avatar>
            Present
          </v-chip>
        </v-card-actions>
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="auto">
              <v-chip color="blue-grey darken-4" label text-color="white" v-for="user in available" :key="user.id" class="ma-1">
                {{ name(user.name) }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-divider class="event-status-divider"/>

      <v-card color="red lighten-4" class="white--text">
        <v-card-actions>
          <v-chip class="ma-2" color="red" text-color="white">
            <v-avatar left class="red darken-4">
              {{ unavailable.length }}
            </v-avatar>
            Afwezig
          </v-chip>
        </v-card-actions>
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="auto">
              <v-chip color="blue-grey darken-4" label text-color="white" v-for="user in unavailable" :key="user.id" class="ma-1">
                {{ name(user.name) }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-divider class="event-status-divider"/>

      <v-card color="blue-grey lighten-4" class="white--text">
        <v-card-actions>
          <v-chip class="ma-2" color="blue-grey" text-color="white">
            <v-avatar left class="blue-grey darken-4">
              {{ undecided.length }}
            </v-avatar>
            Niet gereageerd
          </v-chip>
        </v-card-actions>
        <v-card-text class="pa-2">
          <v-row>
            <v-col cols="auto">
              <v-chip color="blue-grey darken-4" label text-color="white" v-for="user in undecided" :key="user.id" class="ma-1">
                {{ name(user.name) }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>
    <v-card-actions>
      <v-btn block color="secondary" :to="'/edit-event/'+ event.id">Aanpassen</v-btn>
    </v-card-actions>
    <v-card-actions>
      <v-btn block color="error" @click="dialog = true">Verwijderen</v-btn>
    </v-card-actions>
    <v-card-actions>
      <v-btn target="_blank" :href="'whatsapp://send?text='+ whatsapp()" text block color="success">
        <img src="/whatsapp.svg" style="margin-right: 10px"/>
        Stuur Whatsapp herinnering
      </v-btn>
    </v-card-actions>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-actions></v-card-actions>
        <v-card-text>
          Weet je zeker dat je het evenement wilt verwijderen?
        </v-card-text>
        <v-card-actions>
          <v-btn color="success" @click="doRemove">Ja</v-btn>
          <v-btn color="error" @click.native="dialog = false">Nee</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import _ from 'lodash'
import Vue from "vue"

export default {
  computed: {
    available() {
      return _.get(this.event, 'available', [])
    },
    unavailable() {
      return _.get(this.event, 'unavailable', [])
    },
    undecided() {
      if (this.team && this.event) {
        return this.team.users.filter(user => !_.find(this.available, ['id', user.id]) && !_.find(this.unavailable, ['id', user.id]))
      }

      return []
    },
    ...mapState(['account', 'user', 'team']),
  },
  data() {
    return {
      event: null,
      dialog: false
    }
  },
  filters: {
    text(date) {
      return moment(date.toDate()).locale('nl').format('dddd D MMMM, HH:mm')
    }
  },
  methods: {
    name(value) {
      if (this.$vuetify.breakpoint.mdAndUp) {
        return value
      }

      return value.substring(0, 15)
    },
    isAvailable() {
      return _.find(_.get(this.event, 'available'), ['id', this.user.user_id])
    },
    isUnavailable() {
      return _.find(_.get(this.event, 'unavailable'), ['id', this.user.user_id])
    },
    async doStatus(status) {
      try {
        this.$store.commit('startLoading')
        await this.$store.dispatch('changeStatus', {
          event_id: this.event.id,
          status
        })

        await this.loadEvent()
      } finally {
        this.$store.commit('stopLoading')
      }
    },
    async loadEvent() {
      let result = await this.$fire.firestore.collection('events').doc(this.$route.params.id).get()
      if (result.exists) {
        let { id } = result
        let data = result.data()
        this.event = { id, ...data }

        if (this.event.team_id !== this.account.active_team_id) {
          this.$router.push('/')
        }
      } else {
        this.$router.push('/')
      }
    },
    async doRemove() {
      await this.$store.dispatch('deleteEvent', this.event.id)
      this.$router.push('/')
    },
    whatsapp() {
      let text = _.join(
        _.map(this.undecided, u => u.name),
        ', '
      )
      text += ' kunnen jullie je aanwezigheid nog even opgeven voor '
      text += this.event.name
      text += ' op: '
      text += 'https://app.teamtrack.nl/event/'+ this.event.id
      return text
    },
  },
  async mounted() {
    await this.loadEvent()
  }
}
</script>
