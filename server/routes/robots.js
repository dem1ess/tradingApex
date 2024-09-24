const express = require('express')
const robotController = require('../controllers/robotController')
const {
	authMiddleware,
	adminMiddleware,
} = require('../middleware/authMiddleware')
const router = express.Router()

// Применяем middleware для аутентификации ко всем маршрутам
router.post(
	'/create',
	adminMiddleware,
	authMiddleware,
	robotController.createRobot
)

// Получение списка роботов
router.get('/', authMiddleware, robotController.getRobots)

// Подключение пользователя к роботу
router.post('/connect', authMiddleware, robotController.connectRobot)

// Добавление нового ордера
router.post(
	'/orders',
	adminMiddleware,
	authMiddleware,
	robotController.addOrder
)

// Проверка, подключен ли пользователь к роботу
router.get(
	'/:robotId/is-connected',
	authMiddleware,
	robotController.isUserConnectedToRobot
)

// Получение прибыли пользователя по конкретному роботу
router.get('/profits/:robotId', authMiddleware, robotController.getUserProfit)

// Получение прибыли пользователя по всем роботам
router.get('/profits', authMiddleware, robotController.getUserTotalProfit)

// Получение ордеров для конкретного робота
router.get('/orders/:robotId', authMiddleware, robotController.getOrdersByRobot)

module.exports = router
