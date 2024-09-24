import axios from 'axios'
import { createChart } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import io from 'socket.io-client'
import {
	setLastPrice,
	setSelectedSymbol,
} from '../../../store/slices/symbolSlice'
import './TradingViewWidget.css'

const usdPairs = [
	'BTC-USD',
	'ETH-USD',
	'USDT-USD',
	'XRP-USD',
	'ADA-USD',
	'SOL-USD',
	'DOGE-USD',
	'LTC-USD',
	'SHIB-USD',
	'TRX-USD',
	'XLM-USD',
	'ETC-USD',
	'BCH-USD',
	'XMR-USD',
	'EOS-USD',
	'ZEC-USD',
	'DASH-USD',
]

const stocks = [
	'AAPL',
	'MSFT',
	'GOOGL',
	'AMZN',
	'FB',
	'TSLA',
	// more stocks...
]

const TradingViewWidget = () => {
	const containerRef = useRef(null)
	const chartRef = useRef(null)
	const dispatch = useDispatch()
	const candlestickSeriesRef = useRef(null)
	const selectedSymbol = useSelector(state => state.symbol.selectedSymbol)
	const apiKey = 'wLiRhMrM4hHPEUjAsNMy3b07vA2ryR4W'
	const [selectedRange, setSelectedRange] = useState('1d')
	const [currentCandle, setCurrentCandle] = useState(null)
	const [currentPrice, setCurrentPrice] = useState(null)

	const rangeOptions = {
		'1d': {
			label: '1D',
			multiplier: 1,
			interval: 'minute',
			timeScale: { timeVisible: true, secondsVisible: false },
		},
		'5d': {
			label: '5D',
			multiplier: 5,
			interval: 'minute',
			timeScale: { timeVisible: true, secondsVisible: false },
		},
		'1mo': {
			label: '1M',
			multiplier: 5,
			interval: 'minute',
			timeScale: { timeVisible: true, secondsVisible: false },
		},
		'6mo': {
			label: '6M',
			multiplier: 1,
			interval: 'day',
			timeScale: { timeVisible: true, secondsVisible: false },
		},
		'1y': {
			label: '1Y',
			multiplier: 1,
			interval: 'day',
			timeScale: { timeVisible: true, secondsVisible: false },
		},
	}

	const fetchHistoricalData = async () => {
		const today = new Date().getTime()
		const rangeOption = rangeOptions[selectedRange]

		if (!rangeOption) {
			console.error('Invalid range selected:', selectedRange)
			return
		}

		const fromDate = new Date()
		switch (selectedRange) {
			case '1d':
				fromDate.setDate(fromDate.getDate() - 1)
				break
			case '5d':
				fromDate.setDate(fromDate.getDate() - 5)
				break
			case '1mo':
				fromDate.setMonth(fromDate.getMonth() - 1)
				break
			case '6mo':
				fromDate.setMonth(fromDate.getMonth() - 6)
				break
			case '1y':
				fromDate.setFullYear(fromDate.getFullYear() - 1)
				break
			default:
				return
		}

		const fromDateMilliseconds = fromDate.getTime()
		const symbolForAPI = selectedSymbol.replace(/[-/]/g, '')
		const tickerPrefix = selectedSymbol.includes('-USD') ? 'X:' : ''

		const url = `https://api.polygon.io/v2/aggs/ticker/${tickerPrefix}${symbolForAPI.toUpperCase()}/range/${
			rangeOption.multiplier
		}/${
			rangeOption.interval
		}/${fromDateMilliseconds}/${today}?&apiKey=${apiKey}`

		try {
			const response = await axios.get(url)
			const historicalData = response.data.results.map(item => ({
				time: item.t / 1000,
				open: item.o,
				high: item.h,
				low: item.l,
				close: item.c,
			}))

			if (!chartRef.current) {
				chartRef.current = createChart(containerRef.current, {
					width: containerRef.current.offsetWidth,
					height: containerRef.current.offsetHeight,
					layout: {
						textColor: 'rgba(93, 101, 136, 1)',
						fontFamily: 'Graphik',
						background: {
							type: 'solid',
							color: 'rgba(30, 31, 37, 1)',
						},
					},
					grid: {
						vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
						horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
					},
					timeScale: rangeOption.timeScale,
					priceScale: {
						borderColor: 'rgba(255, 255, 255, 0.1)',
						scaleMargins: { top: 0.1, bottom: 0.2 },
						locked: true,
					},
				})
				const removeLogo = () => {
					const logo = document.getElementById('tv-attr-logo') // Замените на правильный селектор
					if (logo) {
						logo.remove()
					}
				}
				setTimeout(removeLogo, 10)

				candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
					upColor: '#26a69a',
					downColor: '#ef5350',
					borderVisible: false,
					wickUpColor: '#26a69a',
					wickDownColor: '#ef5350',
				})
			} else {
				chartRef.current.applyOptions({ timeScale: rangeOption.timeScale })
			}

			candlestickSeriesRef.current.setData(historicalData)
			if (historicalData.length > 0) {
				const lastPriceClose = historicalData[historicalData.length - 1].close
				setCurrentPrice(lastPriceClose)
				setCurrentCandle(historicalData[historicalData.length - 1])
				dispatch(setLastPrice(lastPriceClose))
			}
		} catch (error) {
			console.error('Ошибка при получении исторических данных:', error)
		}
	}

	// Изменение символа при выборе из селектора
	const handleSymbolChange = e => {
		dispatch(setSelectedSymbol(e.target.value))
	}

	useEffect(() => {
		fetchHistoricalData()
	}, [selectedRange, selectedSymbol])

	useEffect(() => {
		let socket = null

		const connectAndSubscribe = () => {
			socket = io('https://api.apexfinance.io:8000/prices', {
				query: { symbol: selectedSymbol },
			})

			socket.on('connect', () => {
				console.log('Socket.IO connection established')
			})

			socket.on('priceData', priceData => {
				const date =
					typeof priceData.date === 'string'
						? new Date(priceData.date)
						: priceData.date
				const candleData = {
					time: date.getTime() / 1000,
					open: parseFloat(priceData.open.toFixed(2)),
					high: parseFloat(priceData.high.toFixed(2)),
					low: parseFloat(priceData.low.toFixed(2)),
					close: parseFloat(priceData.close.toFixed(2)),
				}

				if (candlestickSeriesRef.current) {
					candlestickSeriesRef.current.update(candleData)
					setCurrentCandle(candleData)
					setCurrentPrice(candleData.close)
					dispatch(setLastPrice(candleData.close))
				}
			})

			socket.on('disconnect', () => {
				console.log('Socket.IO connection closed')
			})

			socket.on('connect_error', error => {
				console.error('Socket.IO connection error:', error)
			})
		}

		connectAndSubscribe()

		return () => {
			if (socket) {
				socket.close()
			}
		}
	}, [selectedSymbol])

	return (
		<div className='tradingview-widget'>
			<div className='header'>
				<div className='symbol-info'>
					{/* Единый селектор с категориями Crypto и Stocks и их символами */}
					<select
						className='symbol-selector'
						value={selectedSymbol}
						onChange={handleSymbolChange}
					>
						<optgroup label='Crypto'>
							{usdPairs.map(symbol => (
								<option key={symbol} value={symbol}>
									{symbol}
								</option>
							))}
						</optgroup>
						<optgroup label='Stocks'>
							{stocks.map(symbol => (
								<option key={symbol} value={symbol}>
									{symbol}
								</option>
							))}
						</optgroup>
					</select>

					<span className='pair'>{currentPrice}</span>
					{currentCandle && (
						<div className='price-info'>
							<span>O: {currentCandle.open}</span>
							<span>H: {currentCandle.high}</span>
							<span>L: {currentCandle.low}</span>
							<span>C: {currentCandle.close}</span>
						</div>
					)}
				</div>
				<div className='range-selector'>
					{Object.keys(rangeOptions).map(range => (
						<button
							key={range}
							className={`range-button ${
								selectedRange === range ? 'active' : ''
							}`}
							onClick={() => setSelectedRange(range)}
						>
							{rangeOptions[range].label}
						</button>
					))}
				</div>
			</div>
			<div className='chart-container' ref={containerRef}></div>
		</div>
	)
}

export default TradingViewWidget

