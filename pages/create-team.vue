<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-text>
          <v-alert border="top" type="error" dark v-if="error">
            Er ging iets mis.
          </v-alert>

          <v-text-field v-model="name" label="Naam"/>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="onSubmit">Team maken</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      name: null,

      error: false
    }
  },
  methods: {
    async onSubmit() {
      this.error = false
      try {
        this.$store.commit('startLoading')
        await this.$store.dispatch('createTeam', this.name)

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
