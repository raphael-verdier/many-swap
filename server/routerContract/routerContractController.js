const routerContractService = require('./routerContractService')

const getRouterContractAddress = (req, res, next) => {
  try {
    const routerContractAddress =
      routerContractService.getRouterContractAddress()

    res.send({
      success: true,
      routerContractAddress
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getRouterContractAddress
}
