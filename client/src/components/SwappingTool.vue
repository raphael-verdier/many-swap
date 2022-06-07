<template>
  <div>
    <pair-select
      data-test="pair-select"
      v-model="currentSelectedPair"
    ></pair-select>
    <v-card data-test="swapping-form" flat v-if="currentSelectedPair">
      <v-row>
        <v-col>
          <v-text-field
            :label="getTokenName(0) + ' amount'"
            min="0"
            type="number"
            v-model="token0Amount"
            @input="computeTokenAmount(1)"
            :disabled="isSwappingTokens || isLoadingPrices"
            data-test="amount-input-0"
          >
          </v-text-field>
          <v-text-field
            :label="getTokenName(0) + ' price'"
            min="0"
            type="number"
            v-model="token0Price"
            :disabled="true"
            data-test="price-input-0"
          ></v-text-field>
        </v-col>

        <v-col md="3" cols="12" class="text-center">
          <v-icon data-test="swap-direction-symbol" x-large>{{
            swapDirectionSymbol
          }}</v-icon>
          <div
            data-test="swap-direction-label"
            class="text-subtitle-2 text-uppercase"
          >
            Selling {{ this.getTokenName(this.currentTokenNumberSelling) }}
          </div>
          <v-btn
            data-test="reverse-swap-direction-btn"
            class="mt-5"
            @click="reverseSwapDirection"
            >Reverse <v-icon>mdi-swap-horizontal</v-icon></v-btn
          >
        </v-col>
        <v-col>
          <v-text-field
            :label="getTokenName(1) + ' amount'"
            min="0"
            type="number"
            v-model="token1Amount"
            @input="computeTokenAmount(0)"
            :disabled="isSwappingTokens || isLoadingPrices"
            data-test="amount-input-1"
          >
          </v-text-field>
          <v-text-field
            :label="getTokenName(1) + ' price'"
            min="0"
            type="number"
            v-model="token1Price"
            :disabled="true"
            class="mb-3"
            data-test="price-input-1"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12 text-center mb-4 font-weight-bold">
          {{ currentSwapSentence }}
        </v-col>
      </v-row>
      <div class="text-center">
        <v-btn
          color="primary"
          :disabled="isSwapDisabled"
          :loading="isSwappingTokens"
          @click="swapTokens"
          data-test="swap-btn"
          >Swap</v-btn
        >
      </div>
    </v-card>
  </div>
</template>

<script>
import * as routerContract from '../services/routerContract'
import PairSelect from './PairSelect.vue'

export default {
  name: 'SwappingTool',
  components: {
    PairSelect
  },
  data() {
    return {
      currentSelectedPair: undefined,
      token0Amount: 0,
      token1Amount: 0,
      token0Price: 0,
      token1Price: 0,
      currentTokenNumberSelling: 0,
      isSwappingTokens: false
    }
  },
  computed: {
    isSwapDisabled() {
      return (
        !this.token0Amount ||
        !this.token1Amount ||
        !this.currentSelectedPair ||
        !this.token0Price ||
        !this.token1Price ||
        this.isSwappingTokens
      )
    },
    swapDirectionSymbol() {
      return this.currentTokenNumberSelling === 0
        ? 'mdi-arrow-right-thin'
        : 'mdi-arrow-left-thin'
    },
    swapDirectionLabel() {
      return this.currentTokenNumberSelling === 0 ? 'Selling' : 'Buying'
    },
    otherTokenNumberSelling() {
      return Math.abs(this.currentTokenNumberSelling - 1)
    },
    currentSwapSentence() {
      return `Selling ${
        this['token' + this.currentTokenNumberSelling + 'Amount']
      } ${this.getTokenName(this.currentTokenNumberSelling)} for ${
        this['token' + this.otherTokenNumberSelling + 'Amount']
      } ${this.getTokenName(this.otherTokenNumberSelling)}`
    }
  },
  watch: {
    currentSelectedPair() {
      this.resetAmounts()
      this.loadPrices()
    }
  },
  methods: {
    async loadPrices() {
      try {
        this.isLoadingPrices = true
        const [token0Price, token1Price] = await routerContract.getPairPrices(
          this.currentSelectedPair.address
        )
        this.token0Price = token0Price
        this.token1Price = token1Price
        this.isLoadingPrices = false
      } catch (error) {
        console.error(error)
        this.$toast.error(
          `Error when loading prices: ${error.message} - ${
            error.data ? error.data.message : ''
          } `
        )
      }
    },
    computeTokenAmount(tokenToUpdate) {
      const tokenSet = 1 - tokenToUpdate
      const tokenSetAmount = this['token' + tokenSet + 'Amount']
      const tokenSetPrice = this['token' + tokenSet + 'Price']
      const tokenToUpdateAmount =
        parseInt(tokenSetAmount, 10) * parseFloat(tokenSetPrice, 10)
      this['token' + tokenToUpdate + 'Amount'] = tokenToUpdateAmount
    },
    getTokenName(tokenNumber) {
      return this.currentSelectedPair['token' + tokenNumber].name
    },
    reverseSwapDirection() {
      this.currentTokenNumberSelling = Math.abs(
        this.currentTokenNumberSelling - 1
      )
    },
    resetAmounts() {
      this.token0Amount = 0
      this.token1Amount = 0
    },
    async swapTokens() {
      try {
        this.isSwappingTokens = true
        await routerContract.swapTokens(
          this.currentSelectedPair,
          this.token0Amount,
          this.token1Amount,
          this.currentTokenNumberSelling
        )
        this.loadPrices()
        this.resetAmounts()
        this.$toast.success('Swap confirmed')
      } catch (error) {
        console.error(error)
        this.$toast.error(
          `Error when swapping tokens: ${error.message} - ${
            error.data ? error.data.message : ''
          } `
        )
      }
      this.isSwappingTokens = false
    }
  }
}
</script>
