const jwt = require('jsonwebtoken')
require('dotenv').config()

const { findById } = require('../models/userModel')

const authMiddleware = async (req, res, next) => {
	const authHeader = req.header('Authorization')

	// Проверка наличия заголовка Authorization и формата токена
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Access denied' })
	}

	const token = authHeader.replace('Bearer ', '')

	try {
		// console.log('Starts Verif')
		const verified = jwt.verify(token, process.env.JWT_SECRET)
		// console.log('Verified', verified)

		req.user = verified
		// console.log('req.user', req.user)

		// Извлечение пользователя из базы данных
		const user = await findById(req.user.id)
		// console.log('User from DB', user)

		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		if (user.is_banned) {
			return res.status(403).json({ error: 'User is banned' })
		}

		req.user.role = user.role
		next()
	} catch (err) {
		console.error('Error in authMiddleware:', err.message)
		res.status(400).json({ error: 'Invalid token' })
	}
}
const adminMiddleware = (req, res, next) => {
	const token = req.headers['authorization'].split(' ')[1]

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			res.status(401).json({ valid: false })
		} else {
			console.log('decoded.role', decoded.role)
			next()
		}
	})
}

module.exports = { authMiddleware, adminMiddleware }
