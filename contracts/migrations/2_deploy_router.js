const ERC20Mock = artifacts.require('ERC20Mock')
const Router = artifacts.require('Router')

module.exports = async function (deployer, network, accounts) {
  if (network === 'develop') {
    await deployer.deploy(Router)
    const router = await Router.deployed()
    const firstUserAccount = accounts[0]
    const secondUserAccount = accounts[1]
    const thirdUserAccount = accounts[2]

    const [bitcoinInstance, linkInstance, tetherInstance] = await Promise.all([
      await ERC20Mock.new('Wrapped Bitcoin', 'WBTC', firstUserAccount, 1000000),
      await ERC20Mock.new('Link', 'LINK', firstUserAccount, 1000000),
      await ERC20Mock.new('Tether USD', 'USDT', firstUserAccount, 1000000)
    ])

    await bitcoinInstance.mint(thirdUserAccount, 2000000)
    await linkInstance.mint(thirdUserAccount, 2000000)
    await tetherInstance.mint(thirdUserAccount, 2000000)

    await router.createPair(bitcoinInstance.address, linkInstance.address)
    await router.createPair(bitcoinInstance.address, tetherInstance.address)
    await router.createPair(linkInstance.address, tetherInstance.address)
  }
}
