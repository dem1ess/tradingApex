const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/admin')
const tradeHistory = require('./routes/tradeHistory')
const notificationRoutes = require('./routes/notifications')
const transactionRoutes = require('./routes/transactionRoute')
const settingsRoutes = require('./routes/settings')
const robotRoutes = require('./routes/robots')
const futuresRoutes = require('./controllers/futuresController').router
const spotRoutes = require('./routes/spotRoutes') // Импорт маршрутов спотовой торговли

const { processOrders } = require('./utils/matchingEngine')

require('./controllers/priceController')
require('dotenv').config()
require('./utils/wsServer')

const app = express()

app.use(
	cors({
		origin: '*', // Замените на адрес вашего фронтенда
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(bodyParser.json())

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/robots', robotRoutes)
app.use('/api/trade-history', tradeHistory)

// Подключение роутов для фьючерсной и спотовой торговли
app.use('/api/futures', futuresRoutes)
app.use('/api/spot', spotRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
