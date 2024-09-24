const westwallet = require('westwallet-api')
const westwalletErrors = require('westwallet-api/lib/errors')

const publicKey = '2BH26Ny5BIPe8IWCGGQxAG1U89xwEP3yusP5Uvjl'
const privateKey = '9V93BUFvyfRFbM3For5wF9-OGK6JSLVW3YPOXj1j571bfngfU8vaIg'

const createWallet = async () => {
	const client = new westwallet.WestWalletAPI(publicKey, privateKey)

	try {
		const data = await client.generateAddress(
			'USDTTRC',
			'TKBXfJdpujkspqvum33zjEjYYQ4KzLkrnt'
		)
		console.log(data)
		return data
	} catch (error) {
		console.error('Error generating address:', error)

		// Проверка на наличие ошибки в формате JSON
		if (error.response && error.response.data && error.response.data.error) {
			const apiError = error.response.data.error

			// Обработка различных типов ошибок API
			if (apiError === 'CurrencyNotFoundError') {
				throw new Error('No such currency')
			} else {
				throw new Error(`API error: ${apiError}`)
			}
		} else {
			throw new Error(`Error generating address: ${error.message}`)
		}
	}
}

module.exports = { createWallet }
