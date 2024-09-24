const db = require('../utils/db')
// Создание таблицы price_adjustments
const createPriceAdjustmentTable = async () => {
	await db.none(`
        CREATE TABLE IF NOT EXISTS price_adjustments (
            symbol VARCHAR(50) PRIMARY KEY,
            adjustment DECIMAL
        )
    `)
}
createPriceAdjustmentTable()

// Устанавливаем процент изменения для символа
const setPriceAdjustment = async (symbol, adjustment) => {
	await db.none(
		`
        INSERT INTO price_adjustments (symbol, adjustment)
        VALUES ($1, $2)
        ON CONFLICT (symbol) DO UPDATE
        SET adjustment = EXCLUDED.adjustment
    `,
		[symbol, adjustment]
	)
}

module.exports = { createPriceAdjustmentTable, setPriceAdjustment }
