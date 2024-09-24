const db = require('../utils/db')

const createUserTable = async () => {
	await db.none(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      reset_password_token VARCHAR(255),
      reset_password_expires TIMESTAMP,
      role VARCHAR(255) DEFAULT 'user',
      wallets JSONB,
      main_balance DECIMAL DEFAULT 0,
      credit_balance DECIMAL DEFAULT 0,
      max_risk NUMERIC DEFAULT 10000, -- Добавлено поле max_risk
      country VARCHAR(255),
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      date_of_birth DATE,
			avatar_url VARCHAR(255),
			phone VARCHAR(20), -- Добавлено поле телефона
      is_banned BOOLEAN DEFAULT FALSE,
      ban_reason TEXT
    )
  `)
}

createUserTable()

const findById = async userId => {
	try {
		const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', userId)
		return user
	} catch (error) {
		console.error('Error finding user by ID:', error.message)
		return null
	}
}

async function getUserCryptoWallet(userId) {
	try {
		const user = await db.oneOrNone('SELECT wallet FROM users WHERE id = $1', [
			userId,
		])
		return user ? user.wallet : null
	} catch (error) {
		throw new Error('Error fetching user crypto wallet')
	}
}

module.exports = {
	findById,
	getUserCryptoWallet,
}
