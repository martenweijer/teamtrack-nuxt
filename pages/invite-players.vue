<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-text>
          <v-alert border="top" type="error" dark v-if="error">
            Er ging iets mis.
          </v-alert>

          <v-alert border="top" type="success" dark v-if="success">
            Uitnodiging succesvol.
          </v-alert>

          <v-text-field v-model="email" label="E-mailadres" type="email"/>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="onSubmit">Uitnodigen</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      email: null,

      error: false,
      success: false
    }
  },
  methods: {
    async onSubmit() {
      this.error = false
      this.success = false
      try {
        this.$store.commit('startLoading')
        await this.$store.dispatch('invitePlayer', this.email)

        this.email = null
        this.success = true
      } catch (e) {
        this.error = true
        console.log(e)
      } finally {
        this.$store.commit('stopLoading')
      }
    }
  },
}
</script>
