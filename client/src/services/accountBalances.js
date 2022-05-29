import * as metamask from './metamask'
import * as routerContract from './routerContract'
import { getPairContract } from './contracts'

let accountBalanceUpdateCallback

export const setAccountBalancedUpdateCallback = callback => {
  accountBalanceUpdateCallback = callback
}

const _getLiquidityBalance = async pair => {
  const pairContract = getPairContract(pair.address)
  const balance = await pairContract.balanceOf(metamask.getUserAddress())
  return {
    name: `${pair.token0.name} & ${pair.token1.name}`,
    balance,
    address: pair.address
  }
}

export const refreshAccountBalances = async () => {
  if (accountBalanceUpdateCallback) {
    const pairs = routerContract.getPairs()
    const liquidityBalances = await Promise.all(pairs.map(_getLiquidityBalance))

    accountBalanceUpdateCallback(liquidityBalances)
    return liquidityBalances
  }
}
