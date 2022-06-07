<template>
  <div>
    <div v-if="liquidityBalances.length">
      <div class="text-h6">Your liquidity balances:</div>

      <div
        class="text-body-1"
        v-for="liquidityBalance in liquidityBalances"
        :key="liquidityBalance.address"
      >
        <v-row>
          <v-col col="8">
            {{ liquidityBalance.name }}: {{ liquidityBalance.balance }}
          </v-col>
          <v-col class="text-right" col="4">
            <v-dialog v-model="isWithdrawDialogShown" width="500">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  @click="setCurrentLiquidityWithdrawn(liquidityBalance)"
                  v-bind="attrs"
                  v-on="on"
                  color="secondary"
                  >Withdraw</v-btn
                >
              </template>

              <v-card>
                <v-card-title class="text-h5">
                  Withdrawing liquidity
                </v-card-title>

                <v-card-text>
                  <v-text-field
                    label="Amount to withdraw"
                    min="0"
                    type="number"
                    v-model="withdrawnAmount"
                  >
                  </v-text-field>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="red"
                    text
                    @click="isWithdrawDialogShown = false"
                  >
                    Cancel
                  </v-btn>
                  <v-btn color="success" text @click="withdrawLiquidity">
                    Withdraw
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
        </v-row>
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
        :disabled="isChangingLiquidity"
      >
      </v-text-field>
      <v-text-field
        :label="getTokenName(1) + ' amount'"
        min="0"
        type="number"
        v-model="token1Amount"
        :disabled="isChangingLiquidity"
      >
      </v-text-field>

      <div class="text-center">
        <v-btn
          color="primary"
          :disabled="isPoolingDisabled"
          :loading="isChangingLiquidity"
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
      isChangingLiquidity: false,
      isWithdrawDialogShown: false,
      liquidityBalances: [],
      currentBalanceWithdrawn: undefined,
      withdrawnAmount: 0
    }
  },
  computed: {
    isPoolingDisabled() {
      return (
        this.isChangingLiquidity ||
        !this.currentSelectedPair ||
        (!this.token1Amount && !this.token0Amount)
      )
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
        this.isChangingLiquidity = true
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
      this.isChangingLiquidity = false
    },
    getPairLabel(pair) {
      return `${pair.token0.name} & ${pair.token1.name}`
    },
    updateLiquidityBalances(newLiquidityBalances) {
      this.liquidityBalances = newLiquidityBalances
    },
    setCurrentLiquidityWithdrawn(liquidityBalance) {
      this.currentBalanceWithdrawn = liquidityBalance
    },
    async withdrawLiquidity() {
      try {
        this.isChangingLiquidity = true
        await routerContract.withdrawLiquidity(
          this.currentBalanceWithdrawn.address,
          this.withdrawnAmount
        )
        this.withdrawnAmount = 0
        this.$toast.success(
          'Liquidity withdrawn from the pool. Tokens were sent to your account.'
        )
      } catch (error) {
        console.error(error)
        this.$toast.error(
          `Error when withdrawing liquidity: ${error.message} - ${
            error.data ? error.data.message : ''
          } `
        )
      }
      this.isChangingLiquidity = false
    }
  }
}
</script>
