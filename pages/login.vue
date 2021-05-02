<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-text>
          <v-alert border="top" type="error" dark v-if="error">
            Er ging iets mis.
          </v-alert>

          <v-text-field v-model="email" label="E-mailadres" type="email"/>
          <v-text-field v-model="pass" label="Wachtwoord" type="password"/>
        </v-card-text>
        <v-card-actions>
          <a @click="forgot_password = true; forgot_email = email">Wachtwoord vergeten?</a>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="onSubmit">Inloggen</v-btn>
        </v-card-actions>
      </v-card>

      <v-dialog v-model="forgot_password" width="500">
        <v-card>
          <v-card-actions></v-card-actions>
          <v-card-text>
            <v-text-field v-model="forgot_email" label="E-mailadres" type="email"/>
          </v-card-text>
          <v-card-actions>
            <v-btn color="secondary" @click="forgotSubmit">Nieuw wachtwoord aanvragen</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar" color="accent" top>
        We hebben je een email gestuurd.
      </v-snackbar>
    </v-col>
  </v-row>
</template>

<script>
export default {
  layout: 'no-auth',
  data() {
    return {
      email: null,
      pass: null,

      forgot_password: false,
      forgot_email: null,
      snackbar: false,

      error: false
    }
  },
  methods: {
    async onSubmit() {
      this.error = false
      try {
        this.$store.commit('startLoading')
        await this.$store.dispatch('userLogin', {
          email: this.email,
          pass: this.pass
        })

        await this.$router.push('/')
      } catch (e) {
        this.error = true
      } finally {
        this.$store.commit('stopLoading')
      }
    },
    async forgotSubmit() {
      this.error = false
      try {
        this.$store.commit('startLoading')
        await this.$fire.auth.sendPasswordResetEmail(this.forgot_email)
        this.snackbar = true
      } catch (e) {
        this.error = true
      } finally {
        this.forgot_password = false
        this.$store.commit('stopLoading')
      }
    }
  }
}
</script>
