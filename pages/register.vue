<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-text>
          <v-alert border="top" type="error" dark v-if="error">
            Er ging iets mis tijdens het aanmelden.
          </v-alert>

          <v-text-field v-model="name" label="Naam"/>
          <v-text-field v-model="email" label="E-mailadres" type="email"/>
          <v-text-field v-model="pass" label="Wachtwoord" type="password"/>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="onSubmit">Aanmelden</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  layout: 'no-auth',
  data() {
    return {
      name: null,
      email: null,
      pass: null,

      error: false
    }
  },
  methods: {
    async onSubmit() {
      this.error = false
      try {
        this.$store.commit('startLoading')
        await this.$store.dispatch('userRegister', {
          name: this.name,
          email: this.email,
          pass: this.pass
        })

        await this.$router.push('/')
      } catch (e) {
        this.error = true
      } finally {
        this.$store.commit('stopLoading')
      }
    }
  }
}
</script>
