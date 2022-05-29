import * as accountBalances from './accountBalances'
import * as metamask from './metamask'
import {
  ROUTER_ADDRESS,
  getPairContract,
  getRouterContract,
  getTokenContract
} from './contracts'
import { utils } from 'ethers'

let pairs

const _getTokenDetails = async tokenAddress => {
  const tokenContract = getTokenContract(tokenAddress)

  const [name, symbol] = await Promise.all([
    tokenContract.name(),
    tokenContract.symbol()
  ])
  return {
    name,
    symbol
  }
}

const _getPairDetails = async pairAddress => {
  const pairContract = getPairContract(pairAddress)
  const [token0Address, token1Address, token0Price, token1Price] =
    await Promise.all([
      pairContract.token0(),
      pairContract.token1(),
      pairContract.price0CumulativeLast(),
      pairContract.price1CumulativeLast()
    ])

  const [token0Details, token1Details] = await Promise.all([
    _getTokenDetails(token0Address),
    _getTokenDetails(token1Address)
  ])

  return {
    address: pairAddress,
    token0: {
      address: token0Address,
      price: token0Price,
      ...token0Details
    },
    token1: {
      address: token1Address,
      price: token1Price,
      ...token1Details
    }
  }
}

export const loadPairs = async () => {
  const routerContract = getRouterContract()
  const allPairsLength = await routerContract.getAllPairsLength()
  const pairAddresses = []
  for (let pairIndex = 0; pairIndex < allPairsLength; pairIndex++) {
    const pairAddress = await routerContract.allPairs(pairIndex)
    pairAddresses.push(pairAddress)
  }

  pairs = await Promise.all(pairAddresses.map(_getPairDetails))
}

export const getPairPrices = async pairAddress => {
  const pairContract = getPairContract(pairAddress)
  const prices = []
  const [reserve0, reserve1] = await pairContract.getReserves()
  if (reserve0) {
    prices[0] = reserve1 / reserve0
  }
  if (reserve1) {
    prices[1] = reserve0 / reserve1
  }
  return prices
}

export const getPairs = () => {
  return pairs
}

export const getPairDetailsByAddress = addressToFind => {
  return JSON.parse(
    JSON.stringify(pairs.find(pair => pair.address === addressToFind))
  )
}

const _allowTransfer = (tokenContract, amount) => {
  return tokenContract.increaseAllowance(ROUTER_ADDRESS, amount * 2)
}

export const addLiquidity = async (
  token0Address,
  token1Address,
  token0Amount,
  token1Amount
) => {
  await _allowTransfer(getTokenContract(token0Address, true), token0Amount)
  await _allowTransfer(getTokenContract(token1Address, true), token1Amount)
  const routerContract = getRouterContract(true)
  const liquidityTransaction = await routerContract.addLiquidity(
    token0Address,
    token1Address,
    token0Amount,
    token1Amount
  )
  await liquidityTransaction.wait()
  accountBalances.refreshAccountBalances()
}

export const swapTokens = async (
  pair,
  token0Amount,
  token1Amount,
  currentTokenNumberSelling
) => {
  token0Amount = parseInt(token0Amount, 10)
  token1Amount = parseInt(token1Amount, 10)
  let allowanceTransaction
  if (currentTokenNumberSelling == 1) {
    token0Amount = 0
    allowanceTransaction = await _allowTransfer(
      getTokenContract(pair.token1.address, true),
      token1Amount
    )
  } else {
    token1Amount = 0
    allowanceTransaction = await _allowTransfer(
      getTokenContract(pair.token0.address, true),
      token0Amount
    )
  }
  const routerContract = getRouterContract(true)
  await allowanceTransaction.wait()

  const swapTransaction = await routerContract.swap(
    pair.token0.address,
    pair.token1.address,
    token0Amount,
    token1Amount
  )
  await swapTransaction.wait()
}
