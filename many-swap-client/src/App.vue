<template>
  <v-app id="app-container">
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">Many swapp</div>

      <v-spacer></v-spacer>
      <div class="mr-3" v-show="currentAccount">
        Connected to account {{ currentAccount }}
      </div>
      <v-btn
        v-if="!currentAccount"
        @click="loadAccount"
        :disabled="!isMetamaskInstalled"
        :loading="isLoadingAccount"
      >
        <span class="mr-2">Connect wallet</span>
        <v-icon>mdi-wallet</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main :loading="isLoadingPairs">
      <ToolsContainer v-if="!isLoadingPairs && currentAccount" />
      <v-card
        v-else
        class="mx-auto my-15 px-6 py-6 text-center welcome-message text-body-1"
      >
        <span class="text-h6">
          Welcome to the Many Swapp liquidity pool client.<br />
        </span>
        <span v-if="isMetamaskInstalled">
          Please connect to your wallet to start interacting with the liquidity
          pool.
        </span>
        <span v-else>
          Please install Metamask to start interacting with the liquidity pool.
        </span>

        <v-btn
          @click="loadAccount"
          :disabled="!isMetamaskInstalled"
          :loading="isLoadingAccount"
          class="mt-7"
        >
          <span class="mr-2">Connect wallet</span>
          <v-icon>mdi-wallet</v-icon>
        </v-btn>
      </v-card>
    </v-main>
  </v-app>
</template>

<script>
import * as metamask from './services/metamask'
import * as routerContract from './services/routerContract'
import ToolsContainer from './components/ToolsContainer'

export default {
  name: 'App',

  components: {
    ToolsContainer
  },

  data: () => ({
    isMetamaskInstalled: false,
    isLoadingAccount: false,
    isLoadingPairs: true,
    currentAccount: undefined
  }),
  mounted() {
    this.isMetamaskInstalled = metamask.isMetamaskInstalled()
    if (this.isMetamaskInstalled) {
      this.loadPairs()
    }
  },
  methods: {
    async loadAccount() {
      this.isLoadingAccount = true
      try {
        await metamask.loadAccount()
        this.currentAccount = await metamask.getUserAddress()
        this.$toast.success('Metamask account loaded')
      } catch (error) {
        console.error(error)
        this.$toast.error(`Error when adding loading account: ${error.message}`)
      }
      this.isLoadingAccount = false
    },
    async loadPairs() {
      try {
        this.isLoadingPairs = true
        await routerContract.loadPairs()
        this.isLoadingPairs = false
      } catch (error) {
        console.error(error)
        this.$toast.error(`Error when adding loading pairs: ${error.message}`)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#app-container {
  background: #0f0c29; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #24243e,
    #302b63,
    #0f0c29
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #24243e,
    #302b63,
    #0f0c29
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.welcome-message {
  width: 750px;
  max-width: calc(100vw - 30px);
}
</style>
