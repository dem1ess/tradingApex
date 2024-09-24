import { FaRobot } from 'react-icons/fa'
import { RiStockLine } from 'react-icons/ri'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom' // Добавляем импорт Link
import Slider from 'react-slick'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'
import '../assets/scss/pages/landing-page-v2.scss'
import Footer from '../components/Footer'
import Header from '../components/Header'

export default function LandingPage() {
	const prices = useSelector(state => state.prices.prices || [])

	// Функция для получения цены по тикеру
	const getPriceForTicker = ticker => {
		const symbolTickerMap = {
			BTC: 'BTC',
			ETH: 'ETH',
			USDT: 'USDT',
			BNB: 'BNB',
			XRP: 'XRP',
		}
		const baseTicker = symbolTickerMap[ticker] || ticker
		const symbol = `${baseTicker}-USD`
		const priceData = prices.find(price => price.symbol === symbol)
		return priceData ? priceData.price : null
	}

	const cryptoGraphSettings = {
		centerMode: true,
		slidesToShow: 1,
		slidesToScroll: 1,
		dots: true,
		infinite: true,
		cssEase: 'linear',
		variableWidth: true,
		arrows: false,
		appendDots: dots => (
			<div className='crypto-graph-carousel__slick-slider-dots'>{dots}</div>
		),
		responsive: [
			{
				breakpoint: 768,
				settings: {
					centerMode: true,
					slidesToShow: 1,
				},
			},
		],
	}

	return (
		<>
			<Header />
			<section className='hero hero-v2'>
				<div className='hero__background hero__background--grid'>
					<img
						className='hero__grid-bg'
						src='/images/landing-page-v2/landing-page-v2-hero-grid-bg.png'
						alt='Background Grid Hero'
					/>
				</div>
				<div className='hero__background hero__background--pattern'>
					<img
						className='hero__pattern-bg'
						src='/images/landing-page-v2/landing-page-v2-hero-pattern.png'
						alt='Background Pattern Hero'
					/>
				</div>
				<div className='hero__background--mobile hero__background--grid'>
					<img
						className='hero__grid-bg'
						src='/images/landing-page-v2/mobile-landing-page-v2-hero-grid.png'
						alt='Background Grid Hero'
					/>
				</div>
				<div className='hero__background--mobile hero__background--pattern'>
					<img
						className='hero__pattern-bg'
						src='/images/landing-page-v2/mobile-landing-page-v2-hero-pattern.png'
						alt='Background Pattern Hero'
					/>
				</div>
				<div className='container'>
					<div className='hero__container'>
						<div className='hero__content' data-aos='fade-right'>
							<h1 className='hero__title'>Trade and invest with confidence</h1>
							<p className='fb-lg hero__subtitle'>
								Choose assets with high liquidity to quickly implement your
								strategy
							</p>
							<Link
								to='/sign-in'
								className='btn btn-primary btn-lg btn-pill hero__link'
							>
								Get Started Now
							</Link>
						</div>
						<div
							className='hero__illustration'
							data-aos='zoom-in-up'
							data-aos-delay='100'
						>
							<img
								src='/images/landing-page-v2/landing-page-v2-hero-illustration.png'
								alt='Hero Illustration'
							/>
						</div>
					</div>
				</div>
				<div
					className='container crypto-graph'
					data-aos='fade-up'
					data-aos-delay='200'
				>
					<div className='crypto-graph-carousel'>
						<Slider {...cryptoGraphSettings}>
							{/* Слайд 1 - Bitcoin */}
							<div className='crypto-graph-carousel__items'>
								<div className='crypto-graph-item'>
									<img
										className='crypto-graph-item__crypto-icon'
										src='/images/icons/logo-btc.svg'
										alt='btc'
									/>
								</div>
								<div className='crypto-graph-item crypto-graph-item__graph'>
									<div className='crypto-graph-item-graph__img'>
										<div
											id='crypto-graph-item-graph__graph-1'
											className='crypto-graph-item-graph__img-render'
										></div>
									</div>
									<div className='crypto-graph-item-graph__inflution crypto-graph-item-graph__inflution--bullish'>
										<img src='/images/icons/arrow-bullish.svg' alt='Up' />
										<p className='fd-lg--bold'>2.31%</p>
									</div>
								</div>
								<div className='crypto-graph-item crypto-graph-item--fullname'>
									<p className='fb-regular crypto-graph-item__name'>Bitcoin</p>
								</div>
								<div className='crypto-graph-item crypto-graph-item--price-codename'>
									<p className='fd-md fd-md--bold crypto-graph-item__price'>
										{getPriceForTicker('BTC')
											? `USD ${getPriceForTicker('BTC')}`
											: 'N/A'}
									</p>
									<p className='fb-regular crypto-graph-item__code'>BTC</p>
								</div>
							</div>

							{/* Слайд 2 - Ethereum */}
							<div className='crypto-graph-carousel__items'>
								<div className='crypto-graph-item'>
									<img
										className='crypto-graph-item__crypto-icon'
										src='/images/icons/logo-eth.svg'
										alt='eth'
									/>
								</div>
								<div className='crypto-graph-item crypto-graph-item__graph'>
									<div className='crypto-graph-item-graph__img'>
										<div
											id='crypto-graph-item-graph__graph-2'
											className='crypto-graph-item-graph__img-render'
										></div>
									</div>
									<div className='crypto-graph-item-graph__inflution crypto-graph-item-graph__inflution--bearish'>
										<img src='/images/icons/arrow-bearish.svg' alt='Down' />
										<p className='fd-lg--bold'>2.31%</p>
									</div>
								</div>
								<div className='crypto-graph-item crypto-graph-item--fullname'>
									<p className='fb-regular crypto-graph-item__name'>Ethereum</p>
								</div>
								<div className='crypto-graph-item crypto-graph-item--price-codename'>
									<p className='fd-md fd-md--bold crypto-graph-item__price'>
										{getPriceForTicker('ETH')
											? `USD ${getPriceForTicker('ETH')}`
											: 'N/A'}
									</p>
									<p className='fb-regular crypto-graph-item__code'>ETH</p>
								</div>
							</div>

							{/* Слайд 3 - Tether */}
							<div className='crypto-graph-carousel__items'>
								<div className='crypto-graph-item'>
									<img
										className='crypto-graph-item__crypto-icon'
										src='/images/icons/logo-usdt.svg'
										alt='usdt'
									/>
								</div>
								<div className='crypto-graph-item crypto-graph-item__graph'>
									<div className='crypto-graph-item-graph__img'>
										<div
											id='crypto-graph-item-graph__graph-3'
											className='crypto-graph-item-graph__img-render'
										></div>
									</div>
									<div className='crypto-graph-item-graph__inflution crypto-graph-item-graph__inflution--bullish'>
										<img src='/images/icons/arrow-bullish.svg' alt='Up' />
										<p className='fd-lg--bold'>2.31%</p>
									</div>
								</div>
								<div className='crypto-graph-item crypto-graph-item--fullname'>
									<p className='fb-regular crypto-graph-item__name'>Tether</p>
								</div>
								<div className='crypto-graph-item crypto-graph-item--price-codename'>
									<p className='fd-md fd-md--bold crypto-graph-item__price'>
										{getPriceForTicker('USDT')
											? `USD ${getPriceForTicker('USDT')}`
											: 'N/A'}
									</p>
									<p className='fb-regular crypto-graph-item__code'>USDT</p>
								</div>
							</div>

							{/* Другие слайды */}
						</Slider>
					</div>
				</div>
			</section>
			<section className='feature'>
				<div className='feature__background feature__background--pattern'>
					<img
						className='feature__pattern-bg'
						src='/images/landing-page-v2/landing-page-v2-feature-pattern.png'
						alt='Background Pattern Feature'
					/>
				</div>
				<div className='feature__background--mobile feature__background--pattern'>
					<img
						className='feature__pattern-bg'
						src='/images/landing-page-v2/mobile-landing-page-v2-feature-pattern.png'
						alt='Background Pattern Feature'
					/>
				</div>
				<div className='container'>
					<div className='feature__container'>
						<div className='feature__group'>
							<div
								className='feature__items feature__items--1'
								data-aos='zoom-in-up'
								data-aos-delay='100'
							>
								<div className='feature-items__img'>
									<img
										src='/images/icons/icon-portofolio-manager.svg'
										alt='Portfolio Manager'
									/>
								</div>
								<h5 className='feature-items__title'>SPOT TRADING</h5>
								<p className='fb-regular feature-items__desc'>
									Get instant access to the most relevant and liquid assets by
									trading the market in real time.
								</p>
							</div>
							<div
								className='feature__items feature__items--3'
								data-aos='zoom-in-up'
								data-aos-delay='200'
							>
								<div
									style={{
										padding: '25px',
										background: '#34384C',
										borderRadius: '50%',
									}}
								>
									<RiStockLine
										style={{
											height: '45px',
											width: '45px',
											color: '#F23E3E',
										}}
									/>
								</div>
								<h5 className='feature-items__title'>Futures trading</h5>
								<p className='fb-regular feature-items__desc'>
									Analyze and trade - all major classes of futures are
									available. Take advantage of the leverage service and increase
									your opportunities by expanding your investment portfolio
									without making large financial investments.
								</p>
							</div>
							<div
								className='feature__items feature__items--1'
								data-aos='zoom-in-up'
								data-aos-delay='100'
							>
								<div
									style={{
										padding: '25px',
										background: '#34384C',
										borderRadius: '50%',
									}}
								>
									<FaRobot
										style={{
											height: '45px',
											width: '45px',
											color: '#51E2F2',
										}}
									/>
								</div>
								<h5 className='feature-items__title'>Trading Bots</h5>
								<p className='fb-regular feature-items__desc'>
									Let the bots handle the trading, while you enjoy life
								</p>
							</div>
						</div>
						<div
							className='feature__content'
							data-aos='fade-up'
							data-aos-duration='500'
						>
							<h2 className='feature__title'>
								The most trusted trading platform.
							</h2>
							<p className='fb-regular feature__subtitle'>
								Apexfinane has a variety of features that make it the best place
								to start trading.
							</p>
							<Link
								to='/sign-in'
								className='btn btn-primary btn-pill feature__button'
							>
								Let’s Trade Now
							</Link>
						</div>
					</div>
				</div>
			</section>

			<section className='exchange'>
				<div className='exchange__background exchange__background--pattern'>
					<img
						className='exchange__pattern-bg'
						src='/images/landing-page-v2/landing-page-v2-exchange-pattern.png'
						alt='Background Pattern Exchange'
					/>
				</div>
				<div className='exchange__background--mobile exchange__background--pattern'>
					<img
						className='exchange__pattern-bg'
						src='/images/landing-page-v2/mobile-landing-page-v2-exchange-pattern.png'
						alt='Background Pattern Exchange'
					/>
				</div>
				<div className='container'>
					<div className='exchange__container'>
						<div className='exchange__content'>
							<h2 className='exchange__title' data-aos='fade-up'>
								One click, instant payout with credit or debit card and your
								crypto.
							</h2>
							<p
								className='fb-regular exchange__subtitle'
								data-aos='fade-up'
								data-aos-delay='100'
							>
								Become a crypto owner in minutes using your debit or credit card
								and quickly purchase top cryptocurrencies and stocks.
							</p>
							<div className='exchange__groups'>
								<div
									className='exchange__items exchange__items--1'
									data-aos='fade-right'
									data-aos-delay='300'
								>
									<div className='exchange-items__icons'>
										<img src='/images/icons/add-user.svg' alt='Add User' />
									</div>
									<div className='exchange-items__detail'>
										<h5>Create an account</h5>
									</div>
								</div>
								<div
									className='exchange__items exchange__items--2'
									data-aos='fade-right'
									data-aos-delay='400'
								>
									<div className='exchange-items__icons'>
										<img src='/images/icons/bank.svg' alt='Bank' />
									</div>
									<div className='exchange-items__detail'>
										<h5>Deposits USD or crypto actives</h5>
									</div>
								</div>
								<div
									className='exchange__items exchange__items--3'
									data-aos='fade-right'
									data-aos-delay='500'
								>
									<div className='exchange-items__icons'>
										<img src='/images/icons/wallet.svg' alt='Wallet' />
									</div>
									<div className='exchange-items__detail'>
										<h5>Start buying & selling</h5>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section className='why-choose-us why-choose-us--v2'>
				<div className='why-choose-us__background why-choose-us__background--pattern'>
					<img
						className='why-choose-us__pattern-bg'
						src='/images/landing-page-v2/landing-page-v2-why-choose-us-pattern.png'
						alt='Background Pattern why-choose-us'
					/>
				</div>
				<div className='why-choose-us__background--mobile why-choose-us__background--pattern'>
					<img
						className='why-choose-us__pattern-bg'
						src='/images/landing-page-v2/mobile-landing-page-v2-why-choose-us-pattern.png'
						alt='Background Pattern Why Choose Us'
					/>
				</div>
				<div className='container'>
					<div className='why-choose-us__container'>
						<img
							className='why-choose-us__illustration'
							data-aos='zoom-in-up'
							data-aos-delay='300'
							src='/images/landing-page-v2/landing-page-v2-why-choose-us-illustration.svg'
							alt=''
						/>
						<div className='why-choose-us__content'>
							<h2 className='why-choose-us__title' data-aos='fade-up'>
								We are the most trusted trading platform.
							</h2>
							<p
								className='fb-regular why-choose-us__subtitle'
								data-aos='fade-up'
								data-aos-delay='100'
							>
								We believe ApexFinance is here to stay — and that a future worth
								building is one which opens its doors and invites everyone in.
							</p>
							<div className='why-choose-us__groups'>
								<div
									className='why-choose-us__items'
									data-aos='fade-right'
									data-aos-delay='400'
								>
									<div className='why-choose-us-items__header'>
										<img
											className='why-choose-us-items__icon'
											src='/images/icons/eyes.svg'
											alt='Clarity'
										/>
									</div>
									<div className='why-choose-us-items__content'>
										<h5 className='why-choose-us-item__title'>
											A variety of markets
										</h5>
										<p className='fb-regular why-choose-us-item__desc'>
											A variety of asset markets - your path to financial
											success
										</p>
									</div>
								</div>
								<div
									className='why-choose-us__items'
									data-aos='fade-right'
									data-aos-delay='500'
								>
									<div className='why-choose-us-items__header'>
										<img
											className='why-choose-us-items__icon'
											src='/images/icons/shield-done.svg'
											alt='Confidence'
										/>
									</div>
									<div className='why-choose-us-items__content'>
										<h5 className='why-choose-us-item__title'>Self-storage</h5>
										<p className='fb-regular why-choose-us-item__desc'>
											You and only you keep your funds while trading
										</p>
									</div>
								</div>
								<div
									className='why-choose-us__items'
									data-aos='fade-right'
									data-aos-delay='600'
								>
									<div className='why-choose-us-items__header'>
										<img
											className='why-choose-us-items__icon'
											src='/images/icons/community.svg'
											alt='Community'
										/>
									</div>
									<div className='why-choose-us-items__content'>
										<h5 className='why-choose-us-item__title'>
											Low commissions
										</h5>
										<p className='fb-regular why-choose-us-item__desc'>
											Trade to the max with an attractive commission structure
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className='mobile-platform mobile-platform--v2'>
				<div className='mobile-platform__background mobile-platform__background--grid'>
					<img
						className='mobile-platform__grid-bg'
						src='/images/landing-page-v2/landing-page-v2-hero-grid-bg.png'
						alt='Background Grid Mobile Platform'
					/>
				</div>
				<div className='mobile-platform__background mobile-platform__background--pattern'>
					<img
						className='mobile-platform__pattern-bg'
						src='/images/landing-page-v2/landing-page-v2-mobile-apps-pattern.png'
						alt='Background Pattern Mobile Platform'
					/>
				</div>
				<div className='mobile-platform__background--mobile mobile-platform__background--grid'>
					<img
						className='mobile-platform__grid-bg'
						src='/images/landing-page-v2/mobile-landing-page-v2-hero-grid.png'
						alt='Background Grid Mobile Platform'
					/>
				</div>
				<div className='mobile-platform__background--mobile mobile-platform__background--pattern'>
					<img
						className='mobile-platform__pattern-bg'
						src='/images/landing-page-v2/landing-page-v2-mobile-apps-pattern.png'
						alt='Background Pattern Mobile Platform'
					/>
				</div>
				<div className='container'>
					<div className='mobile-platform__container'>
						<div
							className='mobile-platform__illustration'
							data-aos='zoom-in-up'
							data-aos-delay='200'
						>
							<img
								src='/images/landing-page-v2/landing-page-v2-mobile-apps-illustration.svg'
								alt='Illustration'
							/>
						</div>
						<div className='mobile-platform__content'>
							<h2 className='mobile-platform__title' data-aos='fade-up'>
								Build your crypto portfolio anywhere.
							</h2>
							<p
								className='fb-regular mobile-platform__subtitle'
								data-aos='fade-up'
								data-aos-delay='100'
							>
								A powerful cryptocurrency exchange in your pocket. Buy, sell and
								trade crypto on the go.
							</p>
						</div>
					</div>
				</div>
			</section>
			<Footer />
		</>
	)
}
