const db = require('../utils/db')

const setWestWalletApiKeys = async (req, res) => {
	const { publicKey, privateKey } = req.body

	try {
		const existing = await db.oneOrNone('SELECT * FROM settings WHERE id = 1')
		if (existing) {
			await db.none(
				'UPDATE settings SET westwallet_api_public_key = $1, westwallet_api_private_key = $2 WHERE id = 1',
				[publicKey, privateKey]
			)
		} else {
			await db.none(
				'INSERT INTO settings(westwallet_api_public_key, westwallet_api_private_key) VALUES($1, $2)',
				[publicKey, privateKey]
			)
		}

		res.status(200).json({ message: 'API keys set successfully' })
	} catch (err) {
		res.status(500).json({ error: err })
	}
}

const getWestWalletApiKeys = async () => {
	try {
		const setting = await db.one(
			'SELECT westwallet_api_public_key, westwallet_api_private_key FROM settings WHERE id = 1'
		)
		return {
			publicKey: setting.westwallet_api_public_key,
			privateKey: setting.westwallet_api_private_key,
		}
	} catch (err) {
		console.error('Error fetching API keys', err)
		throw new Error('Could not fetch API keys')
	}
}

module.exports = { setWestWalletApiKeys, getWestWalletApiKeys }
