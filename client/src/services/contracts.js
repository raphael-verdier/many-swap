import * as metamask from './metamask'
import { ethers } from 'ethers'
import ERC20 from '../../../contracts/build/contracts/ERC20.json'
import ManySwapPair from '../../../contracts/build/contracts/ManySwapPair.json'
import Router from '../../../contracts/build/contracts/Router.json'
const NETWORK_ID = 5777

export const ROUTER_ADDRESS = Router.networks[NETWORK_ID].address

export const getRouterContract = (isSigned = false) => {
  return new ethers.Contract(
    ROUTER_ADDRESS,
    Router.abi,
    isSigned ? metamask.getSigner() : metamask.getProvider()
  )
}

export const getTokenContract = (tokenAddress, isSigned = false) => {
  return new ethers.Contract(
    tokenAddress,
    ERC20.abi,
    isSigned ? metamask.getSigner() : metamask.getProvider()
  )
}

export const getPairContract = pairAddress => {
  return new ethers.Contract(
    pairAddress,
    ManySwapPair.abi,
    metamask.getProvider()
  )
}
