const express = require('express')
const routerContractRouter = require('./routerContract/routerContractRouter')
const tokenRouter = require('./token/tokenRouter')

const app = express()

app.use('/router-contract', routerContractRouter)
app.use('/tokens', tokenRouter)

module.exports = app
