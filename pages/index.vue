<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6" v-if="account">
      <v-card v-for="invite in account.invites" :key="invite.team_id" v-if="account">
        <v-card-title>Je bent uitgenodigd voor het team: {{ invite.team_name }}</v-card-title>
        <v-card-text>
          <v-layout>
            <v-flex xs6>
              <v-btn block color="success" @click="doAccept(invite)">
                Accepteren
              </v-btn>
            </v-flex>
            <v-flex xs6>
              <v-btn block color="error" @click="doDecline(invite)">
                Weigeren
              </v-btn>
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-text>
          {{account}}
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: mapState(['account']),
  methods: {
    async doAccept(invite) {
      try {
        this.$store.commit('startLoading')
        await this.$store.dispatch('acceptInvite', invite)

        await this.$router.go()
      } finally {
        this.$store.commit('stopLoading')
      }
    },
    async doDecline(invite) {
      try {
        this.$store.commit('startLoading')
        await this.$store.dispatch('declineInvite', invite)

        await this.$router.push('/')
      } finally {
        this.$store.commit('stopLoading')
      }
    }
  }
}
</script>
