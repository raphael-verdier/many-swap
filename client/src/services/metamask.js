const ethereum = window.ethereum
import { ethers } from 'ethers'
let signer
let provider
if (ethereum) {
  provider = new ethers.providers.Web3Provider(ethereum)
}

export const isMetamaskInstalled = () => {
  return typeof ethereum !== 'undefined'
}

export const loadAccount = async () => {
  await provider.send('eth_requestAccounts', [])
  await window.ethereum.request({
    method: 'eth_requestAccounts'
  })
  signer = provider.getSigner()
}

export const getUserAddress = async () => {
  return await signer.getAddress()
}

export const getSigner = () => {
  return signer
}
export const getProvider = () => {
  return provider
}

export const getBalance = async () => {
  return await provider.getBalance(await signer.getAddress())
}
