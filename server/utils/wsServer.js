const { Server } = require('socket.io')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { getAllCurrentPrices } = require('./priceUtils')

// Create HTTP server
const httpServer = http.createServer((req, res) => {
	res.writeHead(200)
	res.end('Hello Secure World!\n')
})

// Configure Socket.IO to work with the server
const io = new Server(httpServer, {
	cors: {
		origin: '*',
	},
})

// Namespace for "prices"
const pricesNamespace = io.of('/prices')
const pricesClientSubscriptions = new Map()

const sendPriceUpdateToPricesClients = async (symbol, priceData) => {
	const clients = [...pricesClientSubscriptions.keys()]

	for (const socket of clients) {
		if (pricesClientSubscriptions.get(socket) === symbol) {
			socket.emit('priceData', priceData)
		}
	}
}

pricesNamespace.on('connection', socket => {
	const symbol = socket.handshake.query.symbol
	console.log(`Client connected for symbol: ${symbol}`)
	pricesClientSubscriptions.set(socket, symbol)

	socket.on('disconnect', () => {
		console.log(`Client disconnected for symbol: ${symbol}`)
		pricesClientSubscriptions.delete(socket)
	})
})

pricesNamespace.on('error', error => {
	console.error('Socket.IO server error (pricesNamespace):', error)
})

// Namespace for "pair"
const pairsNamespace = io.of('/pair')
const pairsClientSubscriptions = new Map()

const sendPriceUpdateToPairsClients = async (pair, priceData) => {
	const clients = [...pairsClientSubscriptions.keys()]

	for (const socket of clients) {
		if (pairsClientSubscriptions.get(socket) === pair) {
			socket.emit('priceData', priceData)
		}
	}
}

pairsNamespace.on('connection', socket => {
	const pair = socket.handshake.query.symbol
	console.log(`Client connected for pair: ${pair}`)
	pairsClientSubscriptions.set(socket, pair)

	socket.on('disconnect', () => {
		console.log(`Client disconnected for pair: ${pair}`)
		pairsClientSubscriptions.delete(socket)
	})
})

pairsNamespace.on('error', error => {
	console.error('Socket.IO server error (pairsNamespace):', error)
})

// Namespace for "allPrices"
const allPricesNamespace = io.of('/allPrices')
const allPricesClients = new Set()

const sendPriceUpdateToAllPricesClients = async prices => {
	for (const socket of allPricesClients) {
		socket.emit('allPrices', prices)
	}
}

allPricesNamespace.on('connection', async socket => {
	console.log('Client connected for all prices')
	allPricesClients.add(socket)

	// Immediately send current prices to the connected client
	try {
		const allPricesData = await getAllCurrentPrices()
		socket.emit('allPrices', allPricesData)
	} catch (error) {
		console.error('Error sending initial prices:', error.message)
	}

	socket.on('disconnect', () => {
		console.log('Client disconnected for all prices')
		allPricesClients.delete(socket)
	})
})

allPricesNamespace.on('error', error => {
	console.error('Socket.IO server error (allPricesNamespace):', error)
})

// Function to periodically send all prices
const updateAllPricesPeriodically = async () => {
	try {
		const allPricesData = await getAllCurrentPrices()
		await sendPriceUpdateToAllPricesClients(allPricesData)
	} catch (error) {
		console.error('Error updating all prices:', error.message)
	}
}

// Start periodic updates
setInterval(updateAllPricesPeriodically, 60000) // Every 60 seconds

// Start the HTTP server
httpServer.listen(8000, () => {
	console.log('Socket.IO server is running on http://localhost:8000')
})

// Export functions for sending data
module.exports = {
	sendPriceUpdateToPricesClients,
	sendPriceUpdateToPairsClients,
	sendPriceUpdateToAllPricesClients,
}
