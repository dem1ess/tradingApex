const db = require('../utils/db')

const createSettingsTable = async () => {
	await db.none(`
    CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  westwallet_api_public_key VARCHAR(255),
  westwallet_api_private_key VARCHAR(255)
  );
`)
}

createSettingsTable()

module.exports = db
