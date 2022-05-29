<template>
  <v-select
    @input="selectPair"
    :items="pairs"
    label="Pair"
    item-value="address"
    outlined
  >
    <template v-slot:selection="{ item }">
      <v-chip color="primary" small>{{ getPairLabel(item) }}</v-chip>
    </template>
    <template v-slot:item="{ item, attrs, on }">
      <v-list-item v-on="on" v-bind="attrs">
        {{ getPairLabel(item) }}
      </v-list-item>
    </template>
  </v-select>
</template>

<script>
import * as routerContract from '../services/routerContract'

export default {
  name: 'PairSelect',
  props: {
    value: {
      type: Object,
      default: () => undefined
    }
  },
  data() {
    return {
      pairs: []
    }
  },
  mounted() {
    this.refreshPairs()
  },
  methods: {
    selectPair(pairAdddress) {
      this.$emit('input', routerContract.getPairDetailsByAddress(pairAdddress))
    },
    refreshPairs() {
      this.pairs = routerContract.getPairs()
    },
    getPairLabel(pair) {
      return `${pair.token0.name} & ${pair.token1.name}`
    }
  }
}
</script>
