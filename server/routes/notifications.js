const express = require('express')
const {
	sendNotification,
	getNotifications,
	markAsRead,
} = require('../controllers/notificationController')
const {
	authMiddleware,
	adminMiddleware,
} = require('../middleware/authMiddleware')
const router = express.Router()

router.use(authMiddleware)

router.post('/send', adminMiddleware, sendNotification)
router.get('/:userId', getNotifications)
router.put('/read/:notificationId', markAsRead)

module.exports = router
