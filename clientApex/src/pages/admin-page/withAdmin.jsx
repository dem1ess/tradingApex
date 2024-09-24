/* eslint-disable react/display-name */
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { getTokenFromLocalStorage } from '../../helpers/localstorage.helper'

const withAdmin = WrappedComponent => {
	return props => {
		const token = getTokenFromLocalStorage()
		const user = useSelector(state => state.auth.data)
		const isLoading = useSelector(state => state.auth.status)

		console.log(user)

		if (isLoading === 'loading') {
			return <p>Loading...</p> // Или другой индикатор загрузки
		}

		if (!token || !user || user.role !== 'admin') {
			return <Navigate to='/dashboard' />
		}

		return <WrappedComponent {...props} />
	}
}

export default withAdmin
