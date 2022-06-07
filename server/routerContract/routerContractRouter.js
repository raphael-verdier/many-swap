const express = require('express')
const routerContractController = require('./routerContractController')

const router = express.Router()

router.get('/address', routerContractController.getRouterContractAddress)

module.exports = router
