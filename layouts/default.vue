<template>
  <v-app>

    <v-navigation-drawer app right v-model="drawer" v-if="account">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            {{ account.name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ account.email }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <template v-if="account.active_team_name">
        <v-toolbar color="primary" dark>
          <v-toolbar-title>{{ account.active_team_name }}</v-toolbar-title>
        </v-toolbar>

        <v-list dense nav>
          <v-list-item to="/">
            <v-list-item-icon>
              <v-icon>mdi-calendar-range</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Evenementen</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/team-overview">
            <v-list-item-icon>
              <v-icon>mdi-library</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Team overzicht</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/create-event">
            <v-list-item-icon>
              <v-icon>mdi-badge-account-horizontal</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Evenement toevoegen</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item to="/invite-players">
            <v-list-item-icon>
              <v-icon>mdi-account-box</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Speler(s) uitnodigen</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>
      </template>

      <v-toolbar color="primary" dark>
        <v-toolbar-title>Persoonlijk</v-toolbar-title>
      </v-toolbar>

      <v-list dense nav>
        <v-list-item to="/create-team">
          <v-list-item-icon>
            <v-icon>mdi-plus-circle-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Team maken</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/settings">
          <v-list-item-icon>
            <v-icon>mdi-cog</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Instellingen</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="doLogout">
          <v-list-item-icon>
            <v-icon>mdi-exit-to-app</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Uitloggen</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <NuxtLink to="/">
        <img class="logo-img" src="/teamtracklogo.png" alt="Teamtrack Logo"/>
      </NuxtLink>
      <v-spacer></v-spacer>
      <v-menu v-if="account">
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on">
            {{ account.active_team_name }}
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="doChange(team)" v-for="team in account.teams" :key="team.id">
            <v-list-item-title>{{ team.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <v-main>
      <v-container>
        <nuxt/>
      </v-container>
    </v-main>

    <Spinner v-show="loading"/>
  </v-app>
</template>

<script>
import {mapState} from 'vuex'
import Spinner from '../components/Spinner'

export default {
  components: {
    Spinner,
  },
  middleware: ['auth'],
  data: () => ({drawer: null}),
  computed: mapState(['account', 'loading']),
  methods: {
    async doLogout() {
      await this.$store.dispatch('userLogout')
      this.$router.push('/login')
    },
    async doChange(team) {
      if (team.id === this.account.active_team_id) {
        return
      }

      await this.$store.dispatch('changeTeam', team)

      if (this.$route.name === 'index') {
        this.$router.go()
      } else {
        this.$router.push('/')
      }
    }
  }
}
</script>
