const express = require('express')
const {
	register,
	verifyEmail,
	login,
	forgotPassword,
	resetPassword,
	getProfile,
	verifyToken,
	updateProfile,
	confirmNewEmail,
	uploadAvatar,
} = require('../controllers/authController')
const upload = require('../middleware/uploadMiddleware')

const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register', register)
router.get('/verify/:token', verifyEmail)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/profile', getProfile)
router.post('/verifyToken', verifyToken)
router.put('/profile', authMiddleware, updateProfile)

// Подтверждение нового email
router.get('/confirm-new-email/:token', confirmNewEmail)
router.post(
	'/upload-avatar',
	authMiddleware,
	upload.single('avatar'),
	uploadAvatar
)

module.exports = router
