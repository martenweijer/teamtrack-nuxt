<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-spacer></v-spacer>
      <v-btn to="/login" text>Inloggen</v-btn>
      <v-btn to="/register" text>Aanmelden</v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>

    <Spinner v-show="loading"/>
  </v-app>
</template>

<script>
import Spinner from '../components/Spinner'
import { mapState } from 'vuex'

export default {
  components: {
    Spinner,
  },
  computed: mapState(['loading']),
  middleware: ['no-auth'],
}
</script>
