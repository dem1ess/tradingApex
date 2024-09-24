const express = require('express')
const { setWestWalletApiKeys } = require('../controllers/settingsController')
const {
	authMiddleware,
	adminMiddleware,
} = require('../middleware/authMiddleware')
const router = express.Router()

router.use(authMiddleware)
router.use(adminMiddleware)
router.post('/westwallet-api-key', setWestWalletApiKeys)

module.exports = router
