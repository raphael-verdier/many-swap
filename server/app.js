require('dotenv').config()
const cors = require('cors')
const errorHandler = require('./middlewares/errorHandler')
const express = require('express')
const logger = require('./helpers/logger')
const router = require('./router')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use('', router)

errorHandler.loadErrorHandler(app)

const serverPort = process.env.SERVER_PORT || 8000
app.listen(serverPort, () => {
  logger.info(`ready on port ${serverPort}`)
})
