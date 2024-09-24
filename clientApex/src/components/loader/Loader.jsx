import './Loader.scss' // Импортируем файл стилей для кастомной анимации

const Loader = () => {
	return (
		<div className='loader-container'>
			<div className='loader'>
				<div className='loader-inner'></div>
			</div>
		</div>
	)
}

export default Loader
