// eslint-disable-next-line no-unused-vars
import setup from './setup'

import * as routerContract from '@/services/routerContract'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { expect } from 'chai'
import SwappingTool from '@/components/SwappingTool.vue'
import Vuetify from 'vuetify'
import flushPromises from 'flush-promises'
import sinon from 'sinon'

const localVue = createLocalVue()
let vuetify
const toastSuccess = sinon.stub()
const toastError = sinon.stub()
const wrapperFactory = options => {
  return shallowMount(SwappingTool, {
    localVue,
    vuetify,
    mocks: {
      $toast: {
        success: toastSuccess,
        error: toastError
      }
    },
    ...options
  })
}

const selectPair = (wrapper, pair = { token0: {}, token1: {} }) => {
  return wrapper.find('[data-test="pair-select"]').vm.$emit('input', pair)
}
const getSwappingForm = wrapper => {
  return wrapper.find('[data-test="swapping-form"]')
}

const getTokenPriceInput = (wrapper, tokenNumber) => {
  return wrapper.find('[data-test="price-input-' + tokenNumber + '"]')
}
const getTokenAmountInput = (wrapper, tokenNumber) => {
  return wrapper.find('[data-test="amount-input-' + tokenNumber + '"]')
}
const setTokenAmount = (wrapper, tokenNumber, value) => {
  const tokenInputWrapper = getTokenAmountInput(wrapper, tokenNumber)
  return tokenInputWrapper.vm.$emit('input', value)
}

const getSwapButton = wrapper => {
  return wrapper.find('[data-test="swap-btn"]')
}
const clickSwapButton = wrapper => {
  return getSwapButton(wrapper).vm.$emit('click')
}

describe('SwappingTool', function () {
  let getPairPrices, swapTokens

  const setFakeTokenPrices = ([token0Price, token1Price] = [100, 50]) => {
    getPairPrices.resolves([token0Price, token1Price])
  }

  before(function () {
    getPairPrices = sinon.stub(routerContract, 'getPairPrices')
    swapTokens = sinon.stub(routerContract, 'swapTokens')
  })

  beforeEach(function () {
    vuetify = new Vuetify()
    swapTokens.resolves()
    setFakeTokenPrices()
  })

  afterEach(function () {
    sinon.reset()
  })

  after(function () {
    sinon.restore()
  })

  describe('Select pair', function () {
    it('Given a mounted component, when a pair is selected, then display the swap form', async function () {
      const wrapper = wrapperFactory()
      await selectPair(wrapper)
      expect(getSwappingForm(wrapper).isVisible()).to.be.equal(true)
    })

    it('Given a mounted component, when a pair is selected, then load and display prices', async function () {
      const token0Price = 100
      const token1Price = 50
      setFakeTokenPrices([token0Price, token1Price])
      const wrapper = wrapperFactory()
      await selectPair(wrapper)
      await flushPromises()
      expect(getTokenPriceInput(wrapper, 0).props('value')).to.be.equal(
        token0Price
      )
      expect(getTokenPriceInput(wrapper, 1).props('value')).to.be.equal(
        token1Price
      )
    })

    it('Given a selected pair, when a new pair is selected, then amounts are set back to 0', async function () {
      const wrapper = wrapperFactory()
      await selectPair(wrapper)
      await flushPromises()
      await setTokenAmount(wrapper, 0, 10)
      await selectPair(wrapper, { token0: {}, token1: {} })
      expect(getTokenAmountInput(wrapper, 0).props('value')).to.be.equal(0)
    })
  })

  describe('Disabled swap', function () {
    it('Given we selected a pair, when an amount was not set, then the swap button is disabled', async function () {
      const wrapper = wrapperFactory()
      await selectPair(wrapper)
      await flushPromises()
      expect(getSwapButton(wrapper).attributes('disabled')).to.be.equal('true')
    })

    it('Given we selected a pair, when an amount is set, then the swap button is not disabled', async function () {
      const wrapper = wrapperFactory()
      await selectPair(wrapper)
      await flushPromises()
      await setTokenAmount(wrapper, 0, 10)
      expect(getSwapButton(wrapper).attributes('disabled')).to.be.equal(
        undefined
      )
    })

    it('Given an amount is set, when cliking the swap button, then the swap button is disabled', async function () {
      const wrapper = wrapperFactory()
      await selectPair(wrapper)
      await flushPromises()
      await setTokenAmount(wrapper, 0, 10)
      await clickSwapButton(wrapper)

      expect(getSwapButton(wrapper).attributes('disabled')).to.be.equal('true')
    })
  })

  describe('Swap tokens', function () {
    describe('Basic flow', function () {
      it('Given we selected a pair and an amount, when clicking the swap button, then call the contract service with the amounts and the pair', async function () {
        const wrapper = wrapperFactory()
        await selectPair(wrapper, { token0: { x: 1 }, token1: { x: 2 } })
        await flushPromises()
        await setTokenAmount(wrapper, 0, 10)

        await clickSwapButton(wrapper)
        await flushPromises()

        expect(swapTokens.getCall(0).args).to.be.deep.equal([
          {
            token0: { x: 1 },
            token1: { x: 2 }
          },
          10,
          1000,
          0
        ])
      })

      it('Given we clicked the swap button, when the swap is successful, then toast a success message', async function () {
        const wrapper = wrapperFactory()
        await selectPair(wrapper)
        await flushPromises()

        await clickSwapButton(wrapper)
        await flushPromises()

        expect(toastSuccess.called).to.be.equal(true)
      })

      it('Given we clicked the swap button, when the swap throws an error, then toast an error message', async function () {
        swapTokens.rejects(new Error('Test error'))
        const wrapper = wrapperFactory()
        await selectPair(wrapper)
        await flushPromises()

        await clickSwapButton(wrapper)
        await flushPromises()

        expect(toastError.called).to.be.equal(true)
      })
    })

    describe('Current token selling', function () {
      it('Given a mounted component, when selecting a pair, then display the default selling token', async function () {
        const wrapper = wrapperFactory()
        await selectPair(wrapper, {
          token0: { name: 'Token 0' },
          token1: { name: 'Token 1' }
        })

        expect(
          wrapper.find('[data-test="swap-direction-symbol"]').text()
        ).to.be.equal('mdi-arrow-right-thin')
        expect(
          wrapper.find('[data-test="swap-direction-label"]').text()
        ).to.be.equal('Selling Token 0')
      })

      it('Given a selected pair, when click to switch sold token, then display the reverse selling token', async function () {
        const wrapper = wrapperFactory()
        await selectPair(wrapper, {
          token0: { name: 'Token 0' },
          token1: { name: 'Token 1' }
        })
        await wrapper
          .find('[data-test="reverse-swap-direction-btn"]')
          .vm.$emit('click')

        expect(
          wrapper.find('[data-test="swap-direction-symbol"]').text()
        ).to.be.equal('mdi-arrow-left-thin')
        expect(
          wrapper.find('[data-test="swap-direction-label"]').text()
        ).to.be.equal('Selling Token 1')
      })
    })
  })

  describe('Price update', function () {
    it('Given a selected, when inputing an amount at token 0, then update the amount of token 1', async function () {
      const wrapper = wrapperFactory()
      await selectPair(wrapper)
      await flushPromises()

      await setTokenAmount(wrapper, 0, 100)
      await flushPromises()

      expect(
        wrapper.find('[data-test="amount-input-1"]').props('value')
      ).to.be.equal(10000)
    })

    it('Given a selected, when inputing an amount at token 1, then update the amount of token 0', async function () {
      const wrapper = wrapperFactory()
      await selectPair(wrapper)
      await flushPromises()

      await setTokenAmount(wrapper, 1, 100)
      await flushPromises()

      expect(
        wrapper.find('[data-test="amount-input-0"]').props('value')
      ).to.be.equal(5000)
    })
  })
})
