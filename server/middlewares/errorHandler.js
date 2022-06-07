const logger = require('../helpers/logger')

const loadErrorHandler = server => {
  server.use((error, req, res, next) => {
    logger.error(error)
    return res.status(500).send({
      success: false,
      message: `Error on route: ${JSON.stringify(req.route)}`
    })
  })

  process.on('unhandledRejection', reason => {
    logger.error(reason)
  })
}

module.exports = { loadErrorHandler }
