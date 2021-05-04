<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="6" md="4" v-if="team" v-for="user in team.users" :key="user.id">
      <v-card>
        <v-list class="pa-0">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                {{ user.name }}
                <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import {mapState} from 'vuex'
import Vue from 'vue'

export default {
  computed: mapState(['account', 'team']),
}
</script>
