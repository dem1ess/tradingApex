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

const convertToLocalTime = timestampInSeconds => {
	const date = new Date(timestampInSeconds * 1000) // Преобразуем в миллисекунды

	// Получаем смещение временной зоны в минутах и вычитаем его
	const timezoneOffsetInSeconds = date.getTimezoneOffset() * 60

	// Преобразуем время в локальное с учетом временной зоны
	const localTimeInSeconds = timestampInSeconds - timezoneOffsetInSeconds

	return localTimeInSeconds
}

const TradingViewWidget = () => {
	const containerRef = useRef(null)
	const chartRef = useRef(null)
	const dispatch = useDispatch()
	const candlestickSeriesRef = useRef(null)
	const selectedSymbol = useSelector(state => state.symbol.selectedSymbol)
	const apiKey = 'wLiRhMrM4hHPEUjAsNMy3b07vA2ryR4W'
	const [selectedRange, setSelectedRange] = useState('1d')
	const [currentCandle, setCurrentCandle] = useState(null)
	// eslint-disable-next-line no-unused-vars
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
			multiplier: 1,
			interval: 'hour',
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
		}/${fromDateMilliseconds}/${today}?adjusted=false&apiKey=${apiKey}`

		try {
			const response = await axios.get(url)
			const historicalData = response.data.results.map(item => ({
				time: convertToLocalTime(item.t / 1000),
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
					const logo = document.getElementById('tv-attr-logo')
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

	// Изменение диапазона при выборе из селектора
	const handleRangeChange = e => {
		setSelectedRange(e.target.value)
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
				console.log('Price data received:', priceData)
				const date =
					typeof priceData.date === 'string'
						? new Date(priceData.date)
						: priceData.date
				const candleData = {
					time: convertToLocalTime(date.getTime() / 1000),
					open: parseFloat(priceData.open.toFixed(2)),
					high: parseFloat(priceData.high.toFixed(2)),
					low: parseFloat(priceData.low.toFixed(2)),
					close: parseFloat(priceData.close.toFixed(2)),
				}
				console.log('Formatted candle data:', candleData)
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
		<div className='tradingview-widget complete-card complete-card--type-4 aos-init aos-animate'>
			<div className='header'>
				<div className='symbol-info'>
					{/* Единый селектор с категориями Crypto и Stocks и их символами */}
					<select
						className='form-control border-secondary text-white bg-transparent placeholder-light'
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

					{currentCandle && (
						<div className='price-info'>
							<p className='fb-sm complete-card__head-menu'>
								O:{' '}
								<span className='complete-card__head-value'>
									{currentCandle.open}
								</span>
							</p>
							<p className='fb-sm complete-card__head-menu'>
								H:{' '}
								<span className='complete-card__head-value'>
									{currentCandle.high}
								</span>
							</p>
							<p className='fb-sm complete-card__head-menu'>
								L:{' '}
								<span className='complete-card__head-value'>
									{currentCandle.low}
								</span>
							</p>
							<p className='fb-sm complete-card__head-menu'>
								C:{' '}
								<span className='complete-card__head-value'>
									{currentCandle.close}
								</span>
							</p>
						</div>
					)}
				</div>

				{/* Селектор для выбора диапазона */}
				<div className='range-selector'>
					<select
						className='form-control border-secondary text-white bg-transparent placeholder-light'
						value={selectedRange}
						onChange={handleRangeChange}
					>
						{Object.keys(rangeOptions).map(range => (
							<option key={range} value={range}>
								{rangeOptions[range].label}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className='chart-container' ref={containerRef}></div>
		</div>
	)
}

export default TradingViewWidget
