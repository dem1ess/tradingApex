const db = require('../utils/db')

const createRobotTables = async () => {
	await db.none(`
    CREATE TABLE IF NOT EXISTS robots (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      daily_percentage DECIMAL NOT NULL,
      weekly_percentage DECIMAL NOT NULL,
      symbol VARCHAR(20) NOT NULL,
      robot_type VARCHAR(10) NOT NULL,
      roi DECIMAL NOT NULL,
      min_investment DECIMAL NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

	console.log('Robots table created or exists.')

	await db.none(`
    CREATE TABLE IF NOT EXISTS robot_transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      robot_id INTEGER NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
      amount DECIMAL NOT NULL,
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      status VARCHAR(255) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

	console.log('Robot transactions table created or exists.')

	await db.none(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      robot_id INTEGER NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
      type VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
      price DECIMAL NOT NULL,
      status VARCHAR(20) DEFAULT 'pending', -- 'pending' or 'completed'
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

	console.log('Orders table created or exists.')

	await db.none(`
    CREATE TABLE IF NOT EXISTS user_profits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      robot_id INTEGER NOT NULL REFERENCES robots(id) ON DELETE CASCADE,
      profit DECIMAL NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

	console.log('User profits table created or exists.')
}

createRobotTables()

const createRobotInDB = async robotData => {
	const {
		name,
		description,
		dailyPercentage,
		weeklyPercentage,
		symbol,
		robotType,
		roi,
		minInvestment,
	} = robotData

	return db.none(
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
}

// Получение списка роботов
const getAllRobots = async () => {
	return db.any('SELECT * FROM robots')
}

// Получение информации о пользователе по id
const getUserById = async userId => {
	return db.one('SELECT main_balance FROM users WHERE id = $1', [userId])
}

// Получение робота по id
const getRobotById = async robotId => {
	return db.one('SELECT min_investment FROM robots WHERE id = $1', [robotId])
}

// Обновление баланса пользователя
const updateUserBalance = async (userId, amount) => {
	return db.none(
		'UPDATE users SET main_balance = main_balance - $1 WHERE id = $2',
		[amount, userId]
	)
}

// Создание транзакции робота
const createRobotTransaction = async transactionData => {
	const { userId, robotId, investmentAmount, startDate, endDate } =
		transactionData
	return db.none(
		'INSERT INTO robot_transactions(user_id, robot_id, amount, start_date, end_date) VALUES($1, $2, $3, $4, $5)',
		[userId, robotId, investmentAmount, startDate, endDate]
	)
}

// Получение активной транзакции пользователя
const getActiveTransaction = async (robotId, userId) => {
	return db.oneOrNone(
		'SELECT * FROM robot_transactions WHERE robot_id = $1 AND user_id = $2 AND status = $3',
		[robotId, userId, 'active']
	)
}

// Добавление нового ордера
const addNewOrder = async orderData => {
	const { robotId, type, price } = orderData
	return db.none(
		'INSERT INTO orders(robot_id, type, price, status) VALUES($1, $2, $3, $4)',
		[robotId, type, price, 'pending']
	)
}

// Получение всех ордеров по роботу
const getOrdersByRobotId = async robotId => {
	return db.any('SELECT * FROM orders WHERE robot_id = $1', [robotId])
}

// Обновление статуса ордеров
const updateOrderStatus = async robotId => {
	const result = await db.result(
		'UPDATE orders SET status = $1 WHERE robot_id = $2 AND status = $3',
		['completed', robotId, 'pending']
	)
	console.log(`${result.rowCount} orders updated.`)
}

// Другие функции работы с базой данных...

module.exports = {
	createRobotInDB,
	getAllRobots,
	getUserById,
	getRobotById,
	updateUserBalance,
	createRobotTransaction,
	getActiveTransaction,
	addNewOrder,
	getOrdersByRobotId,
	updateOrderStatus,
	createRobotTables,
}
