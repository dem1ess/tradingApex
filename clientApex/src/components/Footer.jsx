import { Link } from 'react-router-dom'

function Footer() {
	return (
		<footer className='footer'>
			<div className='container'>
				<div className='footer__content'>
					<div className='footer__item footer-item-main' data-aos='fade-up'>
						<img
							className='footer-item-main__logo'
							src='/images/logo-full.png'
							alt='Cryptolly'
						/>
						<p className='fb-lg footer-item-main__desc'>
							Your best investment partner.
						</p>
					</div>
					<div
						className='footer__item footer-item-quick-links'
						data-aos='fade-up'
						data-aos-delay='100'
					></div>
					<div
						className='footer__item footer-item-updates'
						data-aos='fade-up'
						data-aos-delay='200'
					>
						<h6 className='footer__item-title'>Submit for updates.</h6>
						<p className='fb-md footer-item-updates__desc'>
							Subscribe to get update and notify our exchange and products
						</p>
						<div className='mini-form-sm__box'>
							<form className='mini-form'>
								<input
									type='text'
									className='form-control form-control-sm mini-form__input'
									placeholder='Enter you email address'
									autoComplete='off'
								/>
								<input
									type='submit'
									className='btn btn-primary btn-sm mini-form__submit'
									value='Send'
								/>
							</form>
						</div>
					</div>
				</div>
				<div className='footer__foot' data-aos='fade-up' data-aos-delay='300'>
					<p className='fb-md footer-foot__copyright'>
						ApexFinance ©. All rights reserved.
					</p>
					<div className='footer-foot__tos-privacy'>
						{/* <a href='#' className='fb-md footer-foot__link'>
							Term of Service
						</a>
						<span className='separator'></span> */}
						<Link to='/privacy-policy' className='fb-md footer-foot__link'>
							Privacy Policy
						</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default Footer
