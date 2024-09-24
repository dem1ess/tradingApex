const db = require('../utils/db')

const banUser = async (req, res) => {
	const { userId } = req.params
	const { reason } = req.body

	try {
		if (req.user.role !== 'admin') {
			return res.status(403).json({ error: 'Only admins can ban users' })
		}

		await db.none(
			'UPDATE users SET is_banned = TRUE, ban_reason = $1 WHERE id = $2',
			[reason, userId]
		)

		await db.none(
			'INSERT INTO notifications(user_id, message) VALUES($1, $2)',
			[userId, 'You have been banned for the following reason: ' + reason]
		)

		res
			.status(200)
			.json({ message: 'User banned and notification sent successfully' })
	} catch (err) {
		console.error('Error banning user:', err)
		res.status(500).json({ error: 'Error banning user' })
	}
}

const updateUser = async (req, res) => {
	const { userId } = req.params
	const updates = req.body

	try {
		if (req.user.role !== 'admin') {
			return res.status(403).json({ error: 'Only admins can update users' })
		}

		const fields = Object.keys(updates).map(
			(field, index) => `${field} = $${index + 1}`
		)
		const values = Object.values(updates)
		values.push(userId)

		await db.none(
			`UPDATE users SET ${fields.join(', ')} WHERE id = $${values.length}`,
			values
		)

		res.status(200).json({ message: 'User updated successfully' })
	} catch (err) {
		console.error('Error updating user:', err)
		res.status(500).json({ error: 'Error updating user' })
	}
}

const updateMainBalance = async (req, res) => {
	const { userId } = req.params
	const { amount } = req.body

	try {
		await db.none('UPDATE users SET main_balance = $1 WHERE id = $2', [
			amount,
			userId,
		])
		res.status(200).json({ message: 'Main balance updated successfully' })
	} catch (err) {
		res.status(500).json({ error: 'Error updating main balance' })
	}
}

const getAllUsers = async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			return res.status(403).json({ error: 'Only admins can view all users' })
		}

		const users = await db.any('SELECT * FROM users')
		res.status(200).json(users)
	} catch (err) {
		console.error('Error fetching users:', err)
		res.status(500).json({ error: 'Error fetching users' })
	}
}

const addCreditBalance = async (req, res) => {
	const { userId } = req.params
	const { amount } = req.body

	try {
		await db.none(
			'UPDATE users SET credit_balance = credit_balance + $1 WHERE id = $2',
			[amount, userId]
		)
		res.status(200).json({ message: 'Credit balance added successfully' })
	} catch (err) {
		res.status(500).json({ error: 'Error adding credit balance' })
	}
}

module.exports = {
	banUser,
	updateMainBalance,
	addCreditBalance,
	getAllUsers,
	updateUser,
}
