const express = require('express')
const routerContractRouter = require('./routerContract/routerContractRoutes')

const app = express()

app.use('/router-contract', routerContractRouter)

module.exports = app
