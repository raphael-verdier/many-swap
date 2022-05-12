<template>
  <div>
    <v-text-field
      label="First token"
      min="0"
      type="number"
      v-model="token1.amount"
    >
    </v-text-field>
    <v-text-field
      label="Second token"
      min="0"
      type="number"
      v-model="token2.amount"
    >
    </v-text-field>
    <v-btn>Swapp</v-btn>
  </div>
</template>

<script>
export default {
  name: 'SwappingTool',
  props: {
    tokens: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      token1: {
        amount: 0
      },
      token2: {
        amount: 0
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
