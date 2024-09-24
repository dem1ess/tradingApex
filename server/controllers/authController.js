const db = require('../utils/db')
const westwallet = require('westwallet-api')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/sendEmail')
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const readFileAsync = promisify(fs.readFile)
const upload = require('../middleware/uploadMiddleware')

const register = async (req, res) => {
	const {
		email,
		password,
		first_name,
		last_name,
		date_of_birth,
		country,
		phone,
	} = req.body

	try {
		// Хэшируем пароль
		const hashedPassword = await bcrypt.hash(password, 10)

		// URL для аватарки по умолчанию
		const defaultAvatarUrl = '/uploads/avatars/default-avatar.png'

		// Вставляем нового пользователя в БД и получаем его ID
		const newUser = await db.one(
			'INSERT INTO users(email, password, first_name, last_name, date_of_birth, country, phone, avatar_url) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
			[
				email,
				hashedPassword,
				first_name,
				last_name,
				date_of_birth,
				country,
				phone,
				defaultAvatarUrl,
			]
		)

		// Создаем токен для подтверждения по email
		const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		})

		// Формирование ссылки для подтверждения по email
		const verificationLink = `https://apexfinance.io/confirm-email/${token}`

		const emailTemplatePath = path.join(
			__dirname,
			'../emailTemplates/emailVerification.html'
		)
		const emailTemplate = await readFileAsync(emailTemplatePath, 'utf8')

		// Заменяем метку {{ verificationLink }} в шаблоне на актуальную ссылку
		const htmlEmail = emailTemplate.replace(
			'{{ verificationLink }}',
			verificationLink
		)

		// Отправляем email с HTML-шаблоном
		await sendEmail(email, 'Email Verification', htmlEmail)

		console.log(verificationLink)

		// Возвращаем успешный ответ сразу после отправки email
		res.status(201).json({
			message:
				'User registered successfully. Please check your email to verify your account.',
		})

		// Инициализируем API-клиент WestWallet
		let client = new westwallet.WestWalletAPI(
			process.env.PUBLIC_KEY,
			process.env.PRIVATE_KEY
		)

		// Список всех валют и их тикеров
		const currencies = [
			{ name: 'Bitcoin', tickers: ['BTC'] },
			{ name: 'Ethereum', tickers: ['ETH'] },
			{ name: 'Tether ERC-20', tickers: ['USDT'] },
			{ name: 'TRON', tickers: ['TRX'] },
			{ name: 'Tether TRC-20', tickers: ['USDTTRC'] },
			{ name: 'Toncoin', tickers: ['TON'] },
			{ name: 'Ripple', tickers: ['XRP'] },
			{ name: 'Solana', tickers: ['SOL'] },
			{ name: 'Litecoin', tickers: ['LTC'] },
			{ name: 'Dogecoin', tickers: ['DOGE'] },
			{ name: 'Monero', tickers: ['XMR'] },
			{ name: 'Cardano', tickers: ['ADA'] },
			{ name: 'Dash', tickers: ['DASH', 'DSH'] },
			{ name: 'Bitcoin Cash', tickers: ['BCH'] },
			{ name: 'Zcash', tickers: ['ZEC', 'ZCASH'] },
			{ name: 'Notcoin', tickers: ['NOT'] },
			{ name: 'Ethereum Classic', tickers: ['ETC'] },
			{ name: 'EOS', tickers: ['EOS'] },
			{ name: 'Stellar', tickers: ['XLM'] },
		]

		const wallets = {}

		// Создаем кошелек для каждого тикера
		for (let currency of currencies) {
			for (let ticker of currency.tickers) {
				try {
					const data = await client.generateAddress(ticker)
					wallets[ticker] = {
						address: data.address,
						amount: 0, // Начальная сумма = 0
					}
					console.log(`Generated ${ticker} address: ${data.address}`)
				} catch (error) {
					console.error(`Error generating address for ${ticker}:`, error)
				}
			}
		}

		// Сохраняем кошельки в базе данных после отправки email
		await db.none('UPDATE users SET wallets = $1 WHERE id = $2', [
			wallets, // Сохраняем все кошельки в формате JSON
			newUser.id,
		])
	} catch (err) {
		console.error('Error registering user', err)
		res.status(500).json({ error: 'Error registering user' })
	}
}

const getProfile = async (req, res) => {
	const authHeader = req.headers['authorization']

	if (!authHeader) {
		return res.status(401).json({ error: 'Authorization header is missing' })
	}

	const token = authHeader.replace('Bearer ', '') // Извлечение токена

	if (!token) {
		return res.status(401).json({ error: 'Bearer token is missing' })
	}

	try {
		const user = await getUserByToken(token)
		res.status(200).json(user)
	} catch (error) {
		if (error.message === 'User is banned') {
			res.status(403).json({ error: 'User is banned' })
		} else {
			console.error('Error fetching user by token:', error)
			res.status(400).json({ error: 'Invalid token' })
		}
	}
}

const verifyEmail = async (req, res) => {
	const { token } = req.params

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		await db.none('UPDATE users SET is_verified = true WHERE id = $1', [
			decoded.id,
		])
		res.status(200).json({ message: 'Email verified successfully' })
	} catch (err) {
		console.error('Error verifying email:', err)
		res.status(400).json({ error: 'Invalid or expired token' })
	}
}

const login = async (req, res) => {
	const { email, password } = req.body
	try {
		const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [
			email,
		])

		// Проверяем, существует ли пользователь с таким email
		if (!user) {
			return res.status(400).json({ error: 'Invalid email or password' })
		}

		// Проверяем, верифицирован ли email пользователя
		if (!user.is_verified) {
			return res.status(400).json({ error: 'Email not verified' })
		}

		// Проверяем правильность пароля
		const isMatch = await bcrypt.compare(password, user.password)

		if (!isMatch) {
			return res.status(400).json({ error: 'Invalid email or password' })
		}

		// Создаем JWT токен
		const token = jwt.sign(
			{ id: user.id, role: user.role },
			process.env.JWT_SECRET,
			{
				expiresIn: '3h',
			}
		)

		// Возвращаем токен и информацию о пользователе
		res.status(200).json({ user, token })
	} catch (err) {
		console.error('Error logging in', err)
		res.status(500).json({ error: 'Error logging in', err })
	}
}

const forgotPassword = async (req, res) => {
	const { email } = req.body

	try {
		// Проверяем, существует ли пользователь с указанным email
		const user = await db.one('SELECT * FROM users WHERE email = $1', [email])

		// Генерируем токен с коротким сроком действия (1 час)
		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		})

		// Ссылка для сброса пароля
		const resetLink = `https://apexfinance.io/reset-password/${token}`

		// Читаем HTML-шаблон письма из файла
		const emailTemplatePath = path.join(
			__dirname,
			'../emailTemplates/resetPasswordEmail.html'
		)
		const emailTemplate = await readFileAsync(emailTemplatePath, 'utf8')

		// Заменяем метку {{ resetLink }} в шаблоне на актуальную ссылку
		const htmlEmail = emailTemplate.replace('{{ resetLink }}', resetLink)

		// Отправляем email с HTML-шаблоном
		await sendEmail(user.email, 'Password Reset', htmlEmail)

		// Обновляем токен и время его действия в базе данных
		await db.none(
			"UPDATE users SET reset_password_token = $1, reset_password_expires = NOW() + INTERVAL '1 hour' WHERE id = $2",
			[token, user.id]
		)

		res.status(200).json({ message: 'Password reset email sent' })
	} catch (err) {
		console.error('Error sending reset email:', err)
		res.status(500).json({ error: 'Error sending reset email' })
	}
}
const resetPassword = async (req, res) => {
	const { token, newPassword } = req.body

	try {
		// Проверяем и декодируем токен
		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		// Проверяем существование пользователя и валидность токена
		const user = await db.one(
			'SELECT * FROM users WHERE id = $1 AND reset_password_token = $2 AND reset_password_expires > NOW()',
			[decoded.id, token]
		)

		// Хэшируем новый пароль
		const hashedPassword = await bcrypt.hash(newPassword, 10)

		// Обновляем пароль пользователя и сбрасываем токен срока действия
		await db.none(
			'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
			[hashedPassword, user.id]
		)

		res.status(200).json({ message: 'Password reset successfully' })
	} catch (err) {
		console.error('Error resetting password:', err)
		res.status(400).json({ error: 'Invalid or expired token' })
	}
}

const updateProfile = async (req, res) => {
	const { first_name, last_name, phone, date_of_birth, country, new_email } =
		req.body
	const userId = req.user.id // Предполагаем, что в `req.user` содержится информация о пользователе из токена
	console.log(req.body)

	try {
		// Изменение email требует верификации
		if (new_email && new_email !== req.user.email) {
			// Создаем токен для верификации нового email
			const emailToken = jwt.sign(
				{ id: userId, new_email },
				process.env.JWT_SECRET,
				{ expiresIn: '1h' }
			)

			const verificationLink = `https://apexfinance.io/confirm-new-email/${emailToken}`

			// Загружаем шаблон письма для подтверждения email
			const emailTemplatePath = path.join(
				__dirname,
				'../emailTemplates/confirmNewEmail.html'
			)
			const emailTemplate = await readFileAsync(emailTemplatePath, 'utf8')
			const htmlEmail = emailTemplate.replace(
				'{{ verificationLink }}',
				verificationLink
			)

			// Отправляем письмо для подтверждения нового email
			await sendEmail(new_email, 'Email Verification', htmlEmail)

			return res.status(200).json({
				message: 'Verification email sent. Please confirm your new email.',
			})
		}

		// Обновляем имя, фамилию, телефон, дату рождения и страну
		await db.none(
			`UPDATE users SET first_name = $1, last_name = $2, phone = $3, date_of_birth = $4, country = $5 WHERE id = $6`,
			[first_name, last_name, phone, date_of_birth, country, userId]
		)

		res.status(200).json({ message: 'Profile updated successfully.' })
	} catch (err) {
		console.error('Error updating profile:', err)
		res.status(500).json({ error: 'Error updating profile.' })
	}
}

const confirmNewEmail = async (req, res) => {
	const { token } = req.params

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const { id, new_email } = decoded

		// Обновляем email пользователя после успешной верификации
		await db.none(
			'UPDATE users SET email = $1, is_verified = true WHERE id = $2',
			[new_email, id]
		)

		res.status(200).json({ message: 'Email updated successfully.' })
	} catch (err) {
		console.error('Error confirming new email:', err)
		res.status(400).json({ error: 'Invalid or expired token.' })
	}
}

const getUserByToken = async token => {
	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET)
		const user = await db.one('SELECT * FROM users WHERE id = $1', [
			verified.id,
		])

		if (user.is_banned) {
			throw new Error('User is banned')
		}

		return user
	} catch (error) {
		console.error('Error fetching user by token:', error)
		throw error
	}
}

const verifyToken = (req, res) => {
	const token = req.headers['authorization'].split(' ')[1]

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			res.status(401).json({ valid: false })
		} else {
			res.json({ valid: true, role: decoded.role })
		}
	})
}

const uploadAvatar = async (req, res) => {
	const userId = req.user.id

	// Проверка наличия файла
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' })
	}

	try {
		// Формируем URL для аватарки
		const avatarUrl = `/uploads/avatars/${req.file.filename}`

		// Обновляем запись пользователя в БД
		await db.none('UPDATE users SET avatar_url = $1 WHERE id = $2', [
			avatarUrl,
			userId,
		])

		res.status(200).json({ message: 'Avatar uploaded successfully', avatarUrl })
	} catch (err) {
		console.error('Error uploading avatar:', err)
		res.status(500).json({ error: 'Error uploading avatar' })
	}
}

module.exports = {
	register,
	verifyEmail,
	login,
	forgotPassword,
	resetPassword,
	getUserByToken,
	getProfile,
	verifyToken,
	updateProfile,
	confirmNewEmail,
	uploadAvatar,
}
