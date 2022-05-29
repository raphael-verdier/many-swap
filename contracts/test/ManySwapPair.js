const chai = require('chai')
const { expect } = chai

const ERC20Mock = artifacts.require('ERC20Mock')
const ManySwapPair = artifacts.require('ManySwapPair')
const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  time
} = require('@openzeppelin/test-helpers')
chai.use(require('chai-bn')(BN))

contract('ManySwapPair', accounts => {
  const INITIAL_TOKEN_BALANCE_VALUE = new BN(10 ** 5)
  const MINIMUM_LIQUIDITY = new BN(10 ** 3)

  let manySwapPairContract
  const testTokenInitalBalances = [
    INITIAL_TOKEN_BALANCE_VALUE,
    INITIAL_TOKEN_BALANCE_VALUE
  ]
  const testTokenContracts = []
  const placeHolderAddress = accounts[7]
  const firstMinterAddress = accounts[2]
  const secondMinterAddress = accounts[3]

  const deployTestTokens = async () => {
    testTokenContracts[0] = await ERC20Mock.new(
      'Test Token 0',
      'TST0',
      placeHolderAddress,
      0
    )
    testTokenContracts[1] = await ERC20Mock.new(
      'Test Token 1',
      'TST1',
      placeHolderAddress,
      0
    )
  }

  const addToTestTokens = async (token0Amount, token1Amount) => {
    await testTokenContracts[0].mint(manySwapPairContract.address, token0Amount)
    await testTokenContracts[1].mint(manySwapPairContract.address, token1Amount)
  }

  const runFirstMint = async () => {
    await manySwapPairContract.mint(firstMinterAddress)
  }

  const addFundsAndMint = async (
    addedToken1Funds = INITIAL_TOKEN_BALANCE_VALUE,
    addedToken2Funds = INITIAL_TOKEN_BALANCE_VALUE
  ) => {
    await time.increase(100)
    await addToTestTokens(addedToken1Funds, addedToken2Funds)
    await manySwapPairContract.mint(secondMinterAddress)
  }

  beforeEach(async function () {
    await deployTestTokens()
    manySwapPairContract = await ManySwapPair.new(
      testTokenContracts[0].address,
      testTokenContracts[1].address
    )
    await addToTestTokens(
      testTokenInitalBalances[0],
      testTokenInitalBalances[1]
    )
  })

  describe('Setup checks', () => {
    it('Given a ManySwap contract and some test tokens, when deploying it, then token accounts addresses are well set', async () => {
      expect(await manySwapPairContract.token0()).to.equal(
        testTokenContracts[0].address
      )
      expect(await manySwapPairContract.token1()).to.equal(
        testTokenContracts[1].address
      )
    })

    it('Given some test tokens, when deploying them, then the swap contract funds are well funded', async () => {
      expect(
        await testTokenContracts[0].balanceOf(manySwapPairContract.address)
      ).to.be.bignumber.equal(testTokenInitalBalances[0])
      expect(
        await testTokenContracts[1].balanceOf(manySwapPairContract.address)
      ).to.be.bignumber.equal(testTokenInitalBalances[1])
    })
  })

  describe('Minting', () => {
    it('Given some test tokens initial balance, when doing the first mint, then a minimum liquidity amount is locked', async () => {
      await runFirstMint()
      expect(
        await manySwapPairContract.balanceOf(constants.ZERO_ADDRESS)
      ).to.be.bignumber.equal(MINIMUM_LIQUIDITY)
    })

    it('Given some test tokens initial balance, when doing the first mint, then the minter has the corresponding liquidity without the minium locked', async () => {
      await runFirstMint()
      expect(
        await manySwapPairContract.balanceOf(firstMinterAddress)
      ).to.be.bignumber.equal(INITIAL_TOKEN_BALANCE_VALUE - MINIMUM_LIQUIDITY)
    })

    it('Given the first mint was already ran and some new funds are added, when miniting, then the new pooler has received liquidity', async () => {
      await runFirstMint()
      await addToTestTokens(
        testTokenInitalBalances[0],
        testTokenInitalBalances[1]
      )
      await manySwapPairContract.mint(secondMinterAddress)
      expect(
        await manySwapPairContract.balanceOf(secondMinterAddress)
      ).to.be.bignumber.equal(new BN(INITIAL_TOKEN_BALANCE_VALUE))
    })

    it('Given the first mint was already ran and some new funds are added, when the funds provided are different, then the new pooler has the appropriate liquidity', async () => {
      await runFirstMint()
      await addToTestTokens(
        testTokenInitalBalances[0] * 2,
        testTokenInitalBalances[1] * 2
      )
      await manySwapPairContract.mint(secondMinterAddress)
      expect(
        await manySwapPairContract.balanceOf(secondMinterAddress)
      ).to.be.bignumber.equal(new BN(INITIAL_TOKEN_BALANCE_VALUE * 2))
    })
  })

  describe('Burning', () => {
    it('Given an account transfered liquidity, when burning liquidity, then proprotionate amounts of tokens are sent to the account', async () => {
      await runFirstMint()
      await manySwapPairContract.transfer(
        manySwapPairContract.address,
        INITIAL_TOKEN_BALANCE_VALUE * 0.1,
        {
          from: firstMinterAddress
        }
      )
      await manySwapPairContract.burn(firstMinterAddress)

      expect(
        await testTokenContracts[0].balanceOf(firstMinterAddress)
      ).to.be.bignumber.equal(new BN(INITIAL_TOKEN_BALANCE_VALUE * 0.1))
      expect(
        await testTokenContracts[1].balanceOf(firstMinterAddress)
      ).to.be.bignumber.equal(new BN(INITIAL_TOKEN_BALANCE_VALUE * 0.1))
    })
  })

  describe('Price oracle', () => {
    const getTokenPrices = async () => {
      return Promise.all([
        manySwapPairContract.price0CumulativeLast(),
        manySwapPairContract.price1CumulativeLast()
      ])
    }

    it('Given some liquidity is minted from funds, when both tokens are provided with the same amount, then they are worth the same', async () => {
      await runFirstMint()
      await time.increase(1)
      await addToTestTokens(
        testTokenInitalBalances[0],
        testTokenInitalBalances[1]
      )
      await addFundsAndMint()

      const tokenPrices = await getTokenPrices()
      expect(tokenPrices[0]).to.be.bignumber.equal(tokenPrices[1])
    })

    it('Given some liquidity is minted from funds, when tokens are provided with different amount, then their price adjust proportionally', async () => {
      await runFirstMint()

      await addFundsAndMint(
        new BN(testTokenInitalBalances[0] * 3),
        testTokenInitalBalances[0]
      )
      await addFundsAndMint(
        new BN(testTokenInitalBalances[0] * 3),
        testTokenInitalBalances[0]
      )

      const tokenPrices = await getTokenPrices()
      expect(tokenPrices[0]).to.be.bignumber.equal(
        new BN(804806013072898282422226931029114880)
      )
      expect(tokenPrices[1]).to.be.bignumber.equal(
        new BN(1614804323004331392472984358387449856)
      )
    })
  })

  describe.only('Swap', () => {
    it('Given token are sent preemptively, when swaping tokens, then send the correct amount to the caller', async () => {
      await runFirstMint()
      await addFundsAndMint()
      await addFundsAndMint()

      await addToTestTokens(0, 1000)
      await manySwapPairContract.swap(
        new BN(100),
        new BN(0),
        firstMinterAddress
      )

      expect(
        await testTokenContracts[0].balanceOf(firstMinterAddress)
      ).to.be.bignumber.equal(new BN(100))
    })
  })
})
