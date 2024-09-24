// const cron = require('node-cron')
// const db = require('../models/transactionModel')
// const robotDb = require('../models/robotModel')
// const userDb = require('../models/userModel')

// // Эта функция должна быть реализована для получения текущей цены на актив
// const getCurrentPrice = async asset => {
// 	// Логика получения текущей цены (здесь просто возвращаем пример цены)
// 	return 100 // пример цены
// }

// const checkStopLosses = async () => {
// 	try {
// 		// Проверка стоп-лоссов для обычных транзакций
// 		const transactions = await db.any(
// 			'SELECT * FROM transactions WHERE stop_loss IS NOT NULL'
// 		)

// 		for (const transaction of transactions) {
// 			const currentPrice = await getCurrentPrice(transaction.asset)

// 			if (
// 				transaction.type === 'spot' &&
// 				currentPrice <= transaction.stop_loss
// 			) {
// 				// Закрываем спотовую позицию
// 				await db.none('DELETE FROM transactions WHERE id = $1', [
// 					transaction.id,
// 				])

// 				// Возвращаем баланс пользователю
// 				await userDb.none(
// 					'UPDATE users SET main_balance = main_balance + $1 WHERE id = $2',
// 					[transaction.amount * currentPrice, transaction.user_id]
// 				)
// 			} else if (
// 				transaction.type === 'futures' &&
// 				currentPrice <= transaction.stop_loss
// 			) {
// 				// Логика закрытия фьючерсной позиции
// 			}
// 		}

// 		// Проверка транзакций роботов
// 		const robotTransactions = await robotDb.any(
// 			'SELECT * FROM robot_transactions WHERE end_date <= NOW() AND status = $1',
// 			['active']
// 		)

// 		for (const robotTransaction of robotTransactions) {
// 			const robot = await robotDb.one('SELECT * FROM robots WHERE id = $1', [
// 				robotTransaction.robot_id,
// 			])

// 			const currentPrice = await getCurrentPrice(robot.asset)

// 			// Логика начисления прибыли для роботов
// 			const profit = robotTransaction.amount * (robot.daily_percentage / 100)

// 			await userDb.none(
// 				'UPDATE users SET main_balance = main_balance + $1 WHERE id = $2',
// 				[profit, robotTransaction.user_id]
// 			)

// 			// Пометить транзакцию робота как завершенную
// 			await robotDb.none(
// 				'UPDATE robot_transactions SET status = $1 WHERE id = $2',
// 				['completed', robotTransaction.id]
// 			)
// 		}
// 	} catch (err) {
// 		console.error('Error checking stop losses', err)
// 	}
// }

// // Запуск задачи каждые 10 минут
// cron.schedule('*/10 * * * *', checkStopLosses)
