const express = require('express')
const routerContractController = require('./tokenController')

const router = express.Router()

router.get('', routerContractController.getAllTokens)

module.exports = router
