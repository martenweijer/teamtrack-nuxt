<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-text>
          <v-alert border="top" type="error" dark v-if="error">
            Er ging iets mis.
          </v-alert>

          <v-text-field v-model="name" label="Naam"/>
          <v-text-field v-model="email" label="E-mailadres" type="email" disabled/>
          <v-text-field v-model="pass" label="Nieuw Wachtwoord" type="password"/>
          <v-text-field v-model="pass_repeat" label="Nieuw wachtwoord herhalen" type="password"/>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="onSubmit">Aanpassen</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      name: null,
      email: null,
      pass: null,
      pass_repeat: null,

      error: false
    }
  },
  computed: mapState(['account']),
  methods: {
    async onSubmit() {
      this.error = false
      try {
        this.$store.commit('startLoading')
        await this.$store.dispatch('settings', {
          name: this.name,
          pass: this.pass,
          pass_repeat: this.pass_repeat
        })

        await this.$router.push('/')
      } catch (e) {
        this.error = true
        console.log(e)
      } finally {
        this.$store.commit('stopLoading')
      }
    }
  },
  created() {
    if (this.account != null) {
      this.name = this.account.name
      this.email = this.account.email
    }
  }
}
</script>
