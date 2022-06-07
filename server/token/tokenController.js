const tokenService = require('./tokenService')

const getAllTokens = (req, res, next) => {
  try {
    const tokens = tokenService.getAllTokens()

    res.send({
      success: true,
      tokens
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllTokens
}
