const axios = require('axios')
require('dotenv').config()

const sendEmail = async (to, subject, htmlContent) => {
	const url =
		'https://crm.apexfinance.io/api/send-mail?token=4oZQWEUZj87CDaZGofJI' // Ваш API-адрес
	const emailData = {
		email: to,
		subject: subject,
		message: htmlContent, // Здесь указываем HTML-контент
	}

	try {
		const response = await axios.post(url, emailData)

		console.log(`Email sent: ${response.data}`)
	} catch (error) {
		console.error(`Error sending email: ${error.message}`)
		throw error
	}
}

module.exports = sendEmail
