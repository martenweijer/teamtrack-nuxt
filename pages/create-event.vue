<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-text>
          <v-alert border="top" type="error" dark v-if="error">
            Er ging iets mis.
          </v-alert>

          <v-text-field v-model="name" label="Naam"/>
          <v-date-picker first-day-of-week="1" :show-current="false" locale="nl" v-model="date"></v-date-picker>
          <v-time-picker v-model="time" format="24hr"></v-time-picker>

          <v-switch v-model="repeat" label="Herhaling toevoegen"/>

          <div v-if="repeat">
            <v-radio-group v-model="repeat_type">
              <v-radio label="Wekelijks" value="1"/>
              <v-radio label="Maandelijks" value="2"/>
            </v-radio-group>

            <v-subheader>Herhalen tot:</v-subheader>

            <v-date-picker first-day-of-week="1" :show-current="false" locale="nl" v-model="repeat_to"/>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="onSubmit">Evenement toevoegen</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import moment from 'moment'

export default {
  data() {
    return {
      name: null,
      date: moment().format('YYYY-MM-DD'),
      time: '14:00',

      repeat: false,

      repeat_type: '1',
      repeat_to: null,

      error: false
    }
  },
  methods: {
    async onSubmit() {
      this.error = false

      if (this.name == null || this.name.length < 2) {
        this.error = true
        return
      }

      try {
        this.$store.commit('startLoading')

        if (this.repeat) {
          let date = moment(this.date)

          do {
            this.repeat_type === '1' ? date.add(7, 'days') : date.add(1, 'month')
            await this.$store.dispatch('createEvent', {
              name: this.name,
              date: date.format('YYYY-MM-DD'),
              time: this.time
            })
          } while (date < moment(this.repeat_to))
        }

        let id = await this.$store.dispatch('createEvent', {
          name: this.name,
          date: this.date,
          time: this.time
        })

        this.$router.push('/events/'+ id)
      } catch (e) {
        this.error = true
        console.log(e)
      } finally {
        this.$store.commit('stopLoading')
      }
    }
  }
}
</script>
