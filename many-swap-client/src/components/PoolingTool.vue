<template>
  <div>
    <div v-if="liquidityBalances.length">
      <div class="text-h6">Your liquidity balances:</div>
      <div
        class="text-body-1"
        v-for="liquidityBalance in liquidityBalances"
        :key="liquidityBalance.address"
      >
        {{ liquidityBalance.name }}: {{ liquidityBalance.balance }}
      </div>
      <v-divider class="my-4"></v-divider>
    </div>
    <pair-select v-model="currentSelectedPair"></pair-select>
    <div v-if="currentSelectedPair">
      <v-text-field
        :label="getTokenName(0) + ' amount'"
        min="0"
        type="number"
        v-model="token0Amount"
      >
      </v-text-field>
      <v-text-field
        :label="getTokenName(1) + ' amount'"
        min="0"
        type="number"
        v-model="token1Amount"
      >
      </v-text-field>

      <div class="text-center">
        <v-btn
          color="primary"
          :disabled="isPoolingDisabled"
          :loading="isAddingLiquidity"
          @click="addLiquidity"
          >Add to pool</v-btn
        >
      </div>
    </div>
  </div>
</template>

<script>
import * as accountBalances from '../services/accountBalances'
import * as routerContract from '../services/routerContract'
import PairSelect from './PairSelect.vue'

export default {
  name: 'PoolingTool',
  components: {
    PairSelect
  },
  data() {
    return {
      currentSelectedPair: undefined,
      token0Amount: 0,
      token1Amount: 0,
      isAddingLiquidity: false,
      liquidityBalances: []
    }
  },
  computed: {
    isPoolingDisabled() {
      return this.isAddingLiquidity || !this.currentSelectedPair
    }
  },
  mounted() {
    accountBalances.setAccountBalancedUpdateCallback(
      this.updateLiquidityBalances
    )
    accountBalances.refreshAccountBalances()
  },
  methods: {
    getTokenName(tokenNumber) {
      return this.currentSelectedPair['token' + tokenNumber].name
    },
    resetAmounts() {
      this.token0Amount = 0
      this.token1Amount = 0
    },
    async addLiquidity() {
      try {
        this.isAddingLiquidity = true
        const token0Address = this.currentSelectedPair.token0.address
        const token1Address = this.currentSelectedPair.token1.address
        await routerContract.addLiquidity(
          token0Address,
          token1Address,
          this.token0Amount,
          this.token1Amount
        )
        this.resetAmounts()
        this.$toast.success('Liquidity added to the pool')
      } catch (error) {
        console.error(error)
        this.$toast.error(
          `Error when adding liquidity: ${error.message} - ${
            error.data ? error.data.message : ''
          } `
        )
      }
      this.isAddingLiquidity = false
    },
    getPairLabel(pair) {
      return `${pair.token0.name} & ${pair.token1.name}`
    },
    updateLiquidityBalances(newLiquidityBalances) {
      this.liquidityBalances = newLiquidityBalances
    }
  }
}
</script>
