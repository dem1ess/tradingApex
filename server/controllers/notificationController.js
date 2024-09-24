const db = require('../utils/db')

const sendNotification = async (req, res) => {
	const { userId, message } = req.body

	try {
		await db.none(
			'INSERT INTO notifications(user_id, message) VALUES($1, $2)',
			[userId, message]
		)
		res.status(200).json({ message: 'Notification sent successfully' })
	} catch (err) {
		res.status(500).json({ error: 'Error sending notification' })
	}
}

const getNotifications = async (req, res) => {
	const { userId } = req.params

	try {
		const notifications = await db.any(
			'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
			[userId]
		)
		res.status(200).json(notifications)
	} catch (err) {
		res.status(500).json({ error: 'Error fetching notifications' })
	}
}

const markAsRead = async (req, res) => {
	const { notificationId } = req.params

	try {
		await db.none('UPDATE notifications SET is_read = TRUE WHERE id = $1', [
			notificationId,
		])
		res.status(200).json({ message: 'Notification marked as read' })
	} catch (err) {
		res.status(500).json({ error: 'Error marking notification as read' })
	}
}

module.exports = { sendNotification, getNotifications, markAsRead }
