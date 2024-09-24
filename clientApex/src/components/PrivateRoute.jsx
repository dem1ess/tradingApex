/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Loader from './loader/Loader' // Или любой другой индикатор загрузки

const PrivateRoute = ({ children }) => {
	const { isAuth, isCheckingAuth } = useSelector(state => state.auth) // Получаем isAuth и isCheckingAuth из слайса

	// Если идёт проверка токена, отображаем Loader (либо ничего не рендерим)
	if (isCheckingAuth) {
		return <Loader /> // Показываем индикатор загрузки, пока идёт проверка токена
	}

	// Если пользователь не авторизован, перенаправляем на страницу входа
	if (!isAuth) {
		return <Navigate to='/sign-in' replace />
	}

	// Если авторизация успешна, рендерим children (контент защищённого маршрута)
	return children
}

export default PrivateRoute
