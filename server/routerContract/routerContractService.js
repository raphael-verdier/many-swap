const PUBLIC_ROUTER_CONTRACT_ADDRESS =
  process.env.PUBLIC_ROUTER_CONTRACT_ADDRESS

const getRouterContractAddress = () => {
  return PUBLIC_ROUTER_CONTRACT_ADDRESS
}

module.exports = { getRouterContractAddress }
