const TOKEN_LIST = [
  {
    id: 'wbitcoin',
    label: 'Wrapped Bitcoin',
    icon: 'mdi-bitcoin',
    symbol: 'WBTC'
  },
  {
    id: 'link',
    label: 'ChainLink Token',
    icon: 'mdi-hexagon-outline',
    symbol: 'LINK'
  },
  {
    id: 'tether',
    label: 'Tether USD',
    icon: 'mdi-currency-usd',
    symbol: 'USDT'
  }
]

const getAllTokens = () => {
  return TOKEN_LIST
}

module.exports = { getAllTokens }
