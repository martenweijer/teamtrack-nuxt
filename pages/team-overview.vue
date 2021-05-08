<template>
  <v-row justify="center" align="center">
    <v-col cols="12" v-if="team">
      <v-card>
        <v-list class="pa-0">
          <template v-for="(user, index) in team.users">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  {{ user.name }}
                  <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-divider v-if="index < team.users.length - 1" :key="index"></v-divider>
          </template>
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import {mapState} from 'vuex'

export default {
  computed: mapState(['account', 'team']),
}
</script>
