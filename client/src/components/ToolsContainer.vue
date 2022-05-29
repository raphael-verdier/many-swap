<template>
  <v-card class="mx-auto my-15 tools-container" :loading="isLoadingTokens">
    <v-tabs fixed-tabs v-model="currentSelectedTab">
      <v-tabs-slider></v-tabs-slider>
      <v-tab key="swapping"> Swapping </v-tab>
      <v-tab key="pooling"> Pooling </v-tab>
    </v-tabs>
    <v-tabs-items v-model="currentSelectedTab">
      <v-tab-item key="swapping">
        <v-card flat>
          <v-card-text> <SwappingTool /> </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item key="pooling">
        <v-card flat>
          <v-card-text> <PoolingTool /> </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
const DEFAULT_SELECTED_TAB = 'swapping'
import * as manySwappApi from '../services/manySwappApi'
import PoolingTool from './PoolingTool.vue'
import SwappingTool from './SwappingTool.vue'

export default {
  name: 'ToolsContainer',
  components: {
    SwappingTool,
    PoolingTool
  },
  data: () => ({
    currentSelectedTab: DEFAULT_SELECTED_TAB,
    tokens: [],
    isLoadingTokens: true
  }),
  mounted() {
    this.loadTokens()
  },
  methods: {
    async loadTokens() {
      try {
        this.isLoadingTokens = true
        this.tokens = await manySwappApi.getAllTokens()
        this.isLoadingTokens = false
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tools-container {
  width: 750px;
  max-width: calc(100vw - 30px);
}
</style>
