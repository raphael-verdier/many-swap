const chai = require('chai')
const { expect } = chai
const ERC20Mock = artifacts.require('ERC20Mock')
const ManySwapPair = artifacts.require('ManySwapPair')
const Router = artifacts.require('Router')

const {
  BN, // Big Number support
  constants,
  time
} = require('@openzeppelin/test-helpers')
chai.use(require('chai-bn')(BN))

contract('Router', accounts => {
  let RouterContract
  const testTokenContracts = []
  const firstUserAddress = accounts[2]
  const INITIAL_LIQUIDITY = new BN(10 ** 10)

  const deployTestTokens = async () => {
    testTokenContracts[0] = await ERC20Mock.new(
      'Test Token 0',
      'TST0',
      firstUserAddress,
      new BN(10 ** 4)
    )
    testTokenContracts[1] = await ERC20Mock.new(
      'Test Token 1',
      'TST1',
      firstUserAddress,
      new BN(10 ** 4)
    )
  }

  const allowTransfer = (tokenContract, amount, ownerAccount) => {
    return tokenContract.increaseAllowance(RouterContract.address, amount, {
      from: ownerAccount
    })
  }

  const addToTestTokens = async (
    manySwapPairContract,
    token0Amount,
    token1Amount
  ) => {
    await testTokenContracts[0].mint(manySwapPairContract.address, token0Amount)
    await testTokenContracts[1].mint(manySwapPairContract.address, token1Amount)
  }

  const addFundsAndMint = async (
    manySwapPairContract,
    addedToken1Funds = INITIAL_LIQUIDITY,
    addedToken2Funds = INITIAL_LIQUIDITY
  ) => {
    await time.increase(100)
    await addToTestTokens(
      manySwapPairContract,
      addedToken1Funds,
      addedToken2Funds
    )
    await manySwapPairContract.mint(firstUserAddress)
  }

  beforeEach(async function () {
    RouterContract = await Router.new()
  })

  describe('Setup checks', () => {
    it('Given a Router contract, when deploying it, then it has no pair', async () => {
      expect(await RouterContract.getAllPairsLength()).to.be.bignumber.equal(
        new BN(0)
      )
    })
  })

  describe('New pair', () => {
    it('Given a new pair, when adding it, then it is registered', async () => {
      await deployTestTokens()
      await RouterContract.createPair(
        testTokenContracts[0].address,
        testTokenContracts[1].address
      )
      expect(await RouterContract.getAllPairsLength()).to.be.bignumber.equal(
        new BN(1)
      )
    })
    it('Given a new pair, when adding it, then we can get its address', async () => {
      await deployTestTokens()
      await RouterContract.createPair(
        testTokenContracts[0].address,
        testTokenContracts[1].address
      )
      expect(
        await RouterContract.getPair(
          testTokenContracts[0].address,
          testTokenContracts[1].address
        )
      ).not.to.be.equal(constants.ZERO_ADDRESS)
    })
  })

  describe('Add liquidity', () => {
    const setupForLiquidityAddition = async (
      token0Amount,
      token1Amount,
      userAddress
    ) => {
      await deployTestTokens()
      await RouterContract.createPair(
        testTokenContracts[0].address,
        testTokenContracts[1].address
      )
      await allowTransfer(testTokenContracts[0], token0Amount, userAddress)
      await allowTransfer(testTokenContracts[1], token1Amount, userAddress)
    }

    it('Given some allowed liquidity transfer, when adding them, then properly return the liquidity', async () => {
      const token0Amount = new BN(10 ** 3)
      const token1Amount = new BN(10 ** 3 * 2)
      await setupForLiquidityAddition(
        token0Amount,
        token1Amount,
        firstUserAddress
      )
      const liquidity = await RouterContract.addLiquidity.call(
        testTokenContracts[0].address,
        testTokenContracts[1].address,
        token0Amount,
        token1Amount,
        {
          from: firstUserAddress
        }
      )
      expect(liquidity).to.be.bignumber.equal(new BN(414))
    })

    it('Given some allowed liquidity transfer, when adding them, then properly mint the liquidity to the account', async () => {
      const token0Amount = new BN(10 ** 3)
      const token1Amount = new BN(10 ** 3 * 2)
      await setupForLiquidityAddition(
        token0Amount,
        token1Amount,
        firstUserAddress
      )
      await RouterContract.addLiquidity(
        testTokenContracts[0].address,
        testTokenContracts[1].address,
        token0Amount,
        token1Amount,
        {
          from: firstUserAddress
        }
      )
      await time.advanceBlock()
      const pairAddress = await RouterContract.getPair(
        testTokenContracts[0].address,
        testTokenContracts[1].address
      )
      const manySwapPairContract = await ManySwapPair.at(pairAddress)
      expect(
        await manySwapPairContract.balanceOf(firstUserAddress)
      ).to.be.bignumber.equal(new BN(414))
    })
  })

  describe('Swap', () => {
    const setupForSwap = async (tokenAmount, tokenIndex, userAddress) => {
      await deployTestTokens()
      await RouterContract.createPair(
        testTokenContracts[0].address,
        testTokenContracts[1].address
      )
      await time.advanceBlock()
      const pairAddress = await RouterContract.getPair(
        testTokenContracts[0].address,
        testTokenContracts[1].address
      )
      const manySwapPairContract = await ManySwapPair.at(pairAddress)
      await addFundsAndMint(manySwapPairContract)
      await time.advanceBlock()
      await addFundsAndMint(manySwapPairContract)
      await time.advanceBlock()

      await allowTransfer(
        testTokenContracts[tokenIndex],
        tokenAmount,
        userAddress
      )
    }

    it.only('Given some allowed swap transfer, when processing the swap, then properly wire amount of tokens', async () => {
      const token0Amount = new BN(10 ** 3)
      const token1Amount = new BN(0)
      await setupForSwap(token0Amount, 0, firstUserAddress)

      await RouterContract.swap(
        testTokenContracts[0].address,
        testTokenContracts[1].address,
        token0Amount,
        token1Amount,
        {
          from: firstUserAddress
        }
      )
      await time.advanceBlock()

      const token1NewBalance = await testTokenContracts[1].balanceOf(
        firstUserAddress
      )

      expect(token1NewBalance).to.be.bignumber.equal(new BN(10999))
    })
  })
})
