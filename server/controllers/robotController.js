const db = require('../utils/db')
const { createRobotTables } = require('../models/robotModel')

// Создание нового робота
createRobotTables()
const createRobot = async (req, res) => {
	const {
		name,
		description,
		dailyPercentage,
		weeklyPercentage,
		symbol,
		robotType,
		roi,
		minInvestment,
	} = req.body

	try {
		await db.none(
			'INSERT INTO robots(name, description, daily_percentage, weekly_percentage, symbol, robot_type, roi, min_investment) VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
			[
				name,
				description,
				dailyPercentage,
				weeklyPercentage,
				symbol,
				robotType,
				roi,
				minInvestment,
			]
		)
		res.status(201).json({ message: 'Robot created successfully' })
	} catch (err) {
		console.error('Error creating robot:', err.message)
		res.status(500).json({ error: 'Internal Server Error' })
	}
}

// Получение списка роботов
const getRobots = async (req, res) => {
	try {
		const robots = await db.any('SELECT * FROM robots')
		res.status(200).json(robots)
	} catch (err) {
		console.error('Error fetching robots:', err.message)
		res.status(500).json({ error: 'Internal Server Error' })
	}
}

// Подключение пользователя к роботу
const connectRobot = async (req, res) => {
	const { robotId, amount, period } = req.body
	const userId = req.user.id
	const investmentAmount = parseFloat(amount)

	try {
		const user = await db.one('SELECT main_balance FROM users WHERE id = $1', [
			userId,
		])

		if (user.main_balance < investmentAmount) {
			return res.status(400).json({ error: 'Insufficient balance' })
		}

		const robot = await db.one(
			'SELECT min_investment FROM robots WHERE id = $1',
			[robotId]
		)

		if (investmentAmount < robot.min_investment) {
			return res
				.status(400)
				.json({ error: `Minimum investment is ${robot.min_investment}` })
		}

		await db.none(
			'UPDATE users SET main_balance = main_balance - $1 WHERE id = $2',
			[investmentAmount, userId]
		)

		const startDate = new Date()
		const endDate = new Date(startDate)

		if (period === 'daily') {
			endDate.setDate(startDate.getDate() + 1)
		} else if (period === 'weekly') {
			endDate.setDate(startDate.getDate() + 7)
		}

		await db.none(
			'INSERT INTO robot_transactions(user_id, robot_id, amount, start_date, end_date) VALUES($1, $2, $3, $4, $5)',
			[userId, robotId, investmentAmount, startDate, endDate]
		)

		res.status(201).json({ message: 'Robot connected successfully' })
	} catch (err) {
		console.error('Error connecting robot:', err.message)
		res.status(500).json({ error: 'Internal Server Error' })
	}
}

// Автоматическое отключение пользователей с истекшими сроками подключения
// Автоматическое отключение пользователей с истекшими сроками подключения
// Автоматическое отключение пользователей с истекшими сроками подключения и возврат инвестированной суммы
const autoDisconnectExpiredUsers = async robotId => {
	try {
		// Получаем все транзакции с истекшим сроком и статусом "active"
		const expiredTransactions = await db.any(
			`SELECT * FROM robot_transactions 
			 WHERE robot_id = $1 
			 AND status = 'active' 
			 AND end_date <= NOW()`,
			[robotId]
		)

		for (const transaction of expiredTransactions) {
			const { user_id: userId, amount: investedAmount } = transaction

			// Возвращаем инвестированную сумму на баланс пользователя
			await db.none(
				'UPDATE users SET main_balance = main_balance + $1 WHERE id = $2',
				[investedAmount, userId]
			)

			// Обновляем статус транзакции на "completed"
			await db.none('UPDATE robot_transactions SET status = $1 WHERE id = $2', [
				'completed',
				transaction.id,
			])

			console.log(
				`Returned invested amount ${investedAmount} to user ${userId} and completed transaction ${transaction.id}`
			)
		}

		console.log(
			`Auto-disconnected ${expiredTransactions.length} users with expired connections for robot ${robotId}`
		)
	} catch (error) {
		console.error('Error auto-disconnecting expired users:', error.message)
	}
}

// Расчет и распределение прибыли
const calculateAndDistributeEarnings = async robotId => {
	try {
		console.log('Starting profit calculation for robot:', robotId)

		// Автоматически отключаем пользователей с истекшими подключениями
		await autoDisconnectExpiredUsers(robotId)

		// Получаем только ордера, которые еще не были учтены
		const orders = await db.any(
			'SELECT * FROM orders WHERE robot_id = $1 AND status = $2 ORDER BY created_at ASC',
			[robotId, 'pending']
		)

		if (orders.length === 0) {
			console.log('No pending orders found for robot:', robotId)
			return
		}

		console.log('Pending orders:', orders)

		// Получаем все активные транзакции, чтобы распределить прибыль
		const transactions = await db.any(
			'SELECT * FROM robot_transactions WHERE robot_id = $1 AND status = $2',
			[robotId, 'active'] // Получаем только активные транзакции
		)

		if (transactions.length === 0) {
			console.log('No active transactions found for robot:', robotId)
			return
		}

		let totalBought = 0
		let totalSold = 0
		let buyOrderCount = 0
		let sellOrderCount = 0

		// Проходим по каждому ордеру
		orders.forEach(order => {
			const orderAmount = parseFloat(order.price)
			if (order.type === 'buy') {
				totalBought += orderAmount
				buyOrderCount++
			} else if (order.type === 'sell') {
				totalSold += orderAmount
				sellOrderCount++
			}
		})

		console.log(`Total bought: ${totalBought}, Buy orders: ${buyOrderCount}`)
		console.log(`Total sold: ${totalSold}, Sell orders: ${sellOrderCount}`)

		if (buyOrderCount === 0 || sellOrderCount === 0) {
			console.log(
				'No complete transactions (buy/sell pair) found for robot:',
				robotId
			)
			return
		}

		const totalProfit = totalSold - totalBought
		console.log('Total profit:', totalProfit)

		if (totalProfit > 0) {
			const userInvestments = {}
			let totalInvested = 0

			transactions.forEach(transaction => {
				const { user_id: userId, amount: investedAmount } = transaction
				const amount = parseFloat(investedAmount)
				totalInvested += amount
				userInvestments[userId] = (userInvestments[userId] || 0) + amount
			})

			console.log('User investments:', userInvestments)

			const averageBuyOrderAmount = totalBought / buyOrderCount

			for (const [userId, investedAmount] of Object.entries(userInvestments)) {
				const coefficient = investedAmount / averageBuyOrderAmount
				const userProfit = coefficient * totalProfit

				console.log(`User ${userId} profit:`, userProfit)

				// Обновляем баланс пользователя
				await db.none(
					'UPDATE users SET main_balance = main_balance + $1 WHERE id = $2',
					[userProfit, userId]
				)

				// Сохраняем прибыль пользователя
				await db.none(
					'INSERT INTO user_profits(user_id, robot_id, profit) VALUES($1, $2, $3)',
					[userId, robotId, userProfit]
				)

				// Не меняем статус транзакции, так как она еще активна
			}

			const updatedOrders = await db.result(
				'UPDATE orders SET status = $1 WHERE robot_id = $2 AND status = $3',
				['completed', robotId, 'pending']
			)

			console.log(`Updated ${updatedOrders.rowCount} orders to 'completed'`)
		} else {
			console.log('No profit to distribute for robot:', robotId)
		}
	} catch (error) {
		console.error('Error calculating and distributing earnings:', error.message)
		throw error
	}
}

// Добавление нового ордера
const addOrder = async (req, res) => {
	const { robotId, type, price } = req.body

	try {
		await db.none(
			'INSERT INTO orders(robot_id, type, price, status) VALUES($1, $2, $3, $4)',
			[robotId, type, price, 'pending']
		)

		if (type === 'sell') {
			await calculateAndDistributeEarnings(robotId)
		}

		res.status(201).json({ message: 'Order added successfully' })
	} catch (err) {
		console.error('Error adding order:', err.message, err)
		res.status(500).json({ error: 'Internal Server Error' })
	}
}

// Получение прибыли пользователя по роботам
const getUserTotalProfit = async (req, res) => {
	const userId = req.user.id

	try {
		const userProfits = await db.any(
			'SELECT * FROM user_profits WHERE user_id = $1',
			[userId]
		)

		if (userProfits.length > 0) {
			let totalProfitByRobot = {}
			userProfits.forEach(profit => {
				const robotId = profit.robot_id
				const profitAmount = parseFloat(profit.profit)
				if (!totalProfitByRobot[robotId]) {
					totalProfitByRobot[robotId] = 0
				}
				totalProfitByRobot[robotId] += profitAmount
			})
			res.status(200).json(totalProfitByRobot)
		} else {
			res.status(200).json({})
		}
	} catch (error) {
		console.error('Error fetching user total profit:', error.message)
		res.status(500).json({ error: 'Internal Server Error' })
	}
}

// Получение прибыли пользователя по конкретному роботу
const getUserProfit = async (req, res) => {
	const userId = req.user.id
	const { robotId } = req.params

	try {
		// Запрос для получения суммарной прибыли пользователя по конкретному роботу
		const userProfit = await db.oneOrNone(
			'SELECT SUM(profit) as total_profit FROM user_profits WHERE user_id = $1 AND robot_id = $2',
			[userId, robotId]
		)

		// Если есть прибыль, возвращаем её, иначе сообщаем, что данных не найдено
		if (userProfit && userProfit.total_profit !== null) {
			console.log('User profit:', userProfit.total_profit)
			res.status(200).json({ profit: userProfit.total_profit })
		} else {
			res.status(404).json({ error: 'Profit not found' })
		}
	} catch (error) {
		console.error('Error fetching user profit:', error.message)
		res.status(500).json({ error: 'Internal Server Error' })
	}
}

// Получение ордеров по роботу
const getOrdersByRobot = async (req, res) => {
	const { robotId } = req.params

	try {
		const orders = await db.any('SELECT * FROM orders WHERE robot_id = $1', [
			robotId,
		])
		res.status(200).json(orders)
	} catch (err) {
		console.error('Error fetching orders:', err.message)
		res.status(500).json({ error: 'Internal Server Error' })
	}
}

// Проверка, подключен ли пользователь к роботу
const isUserConnectedToRobot = async (req, res) => {
	const { robotId } = req.params
	const userId = req.user.id

	try {
		const transaction = await db.oneOrNone(
			'SELECT * FROM robot_transactions WHERE robot_id = $1 AND user_id = $2 AND status = $3',
			[robotId, userId, 'active']
		)

		if (transaction) {
			res.status(200).json({ isConnected: true, transaction })
		} else {
			res.status(200).json({ isConnected: false })
		}
	} catch (err) {
		console.error('Error checking user connection to robot:', err.message)
		res.status(500).json({ error: 'Internal Server Error' })
	}
}

module.exports = {
	createRobot,
	getRobots,
	connectRobot,
	addOrder,
	calculateAndDistributeEarnings,
	getOrdersByRobot,
	getUserProfit,
	getUserTotalProfit,
	isUserConnectedToRobot,
}
