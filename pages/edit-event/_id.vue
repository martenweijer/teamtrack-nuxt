<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card v-if="event">
        <v-card-text>
          <v-alert border="top" type="error" dark v-if="error">
            Er ging iets mis.
          </v-alert>

          <v-text-field v-model="event.name" label="Naam"/>
          <v-date-picker first-day-of-week="1" :show-current="false" locale="nl" v-model="event.date"></v-date-picker>
          <v-time-picker v-model="event.time" format="24hr"></v-time-picker>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="onSubmit">Evenement bewerken</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import moment from 'moment'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      event: null,

      error: false
    }
  },
  computed: mapState(['account', 'user']),
  methods: {
    async onSubmit() {
      this.error = false
      try {
        this.$store.commit('startLoading')
        await this.$store.dispatch('editEvent', this.event)

        this.$router.push('/events/'+ this.event.id)
      } catch (e) {
        this.error = true
        console.log(e)
      } finally {
        this.$store.commit('stopLoading')
      }
    }
  },
  async created() {
    let result = await this.$fire.firestore.collection('events').doc(this.$route.params.id).get()
    if (result.exists) {
      let { id } = result
      let data = result.data()
      this.event = { id, ...data }

      let date = moment(this.event.date.toDate())
      this.event.date = date.format('YYYY-MM-DD')
      this.event.time = date.format('HH:mm')

      if (this.event.team_id !== this.account.active_team_id) {
        this.$router.push('/')
      }
    } else {
      this.$router.push('/')
    }
  }
}
</script>
