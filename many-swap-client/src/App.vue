<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">Many swapp</div>

      <v-spacer></v-spacer>

      <v-btn>
        <span class="mr-2">Connect wallet</span>
        <v-icon>mdi-wallet</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <ToolsContainer />
    </v-main>
  </v-app>
</template>

<script>
import ToolsContainer from './components/ToolsContainer'

export default {
  name: 'App',

  components: {
    ToolsContainer
  },

  data: () => ({
    //
  })
}
</script>
