const db = require('../utils/db')
const { sendPriceUpdateToPairsClients } = require('../utils/wsServer') // Импорт функции

// Функция для создания таблицы стаканов
async function createQuotesTable() {
	try {
		await db.none(`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        asset_type VARCHAR(20) NOT NULL,
        pair VARCHAR(20) NOT NULL,
        bid_price NUMERIC,
        bid_size NUMERIC,
        ask_price NUMERIC,
        ask_size NUMERIC,
        timestamp TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `)
		console.log('Table "quotes" created successfully')
	} catch (error) {
		console.error('Error creating quotes table:', error)
	}
}

createQuotesTable()

// Функция для сохранения котировок в базу данных
async function savePriceQuote({
	assetType,
	pair,
	bidPrice,
	bidSize,
	askPrice,
	askSize,
	timestamp,
}) {
	try {
		await db.none(
			`
      INSERT INTO quotes (asset_type, pair, bid_price, bid_size, ask_price, ask_size, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
			[
				assetType,
				pair,
				bidPrice,
				bidSize,
				askPrice,
				askSize,
				new Date(timestamp),
			]
		)
		// console.log(`Quote for ${pair} (${assetType}) saved successfully`)

		// Отправка обновления через WebSocket
		await sendPriceUpdateToPairsClients(pair, {
			bidPrice,
			bidSize,
			askPrice,
			askSize,
			timestamp,
		})
	} catch (error) {
		console.error('Error saving quote:', error)
	}
}

module.exports = { createQuotesTable, savePriceQuote }
