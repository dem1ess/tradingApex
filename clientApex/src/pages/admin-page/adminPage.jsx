// AdminPanel.js
/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminTransactions from './components/AdminTransactions'
import CreateRobot from './components/CreateRobot'
import NavbarAdmin from './components/NavbarAdmin'
import PriceAdjustmentPage from './components/PriceAdjustmentPage'
import RobotList from './components/RobotList'
import Users from './components/Users'
import ThemeContext from './ThemeContext'
import withAdmin from './withAdmin'

const AdminPanel = () => {
	const [theme, setTheme] = useState('dark') // Default to 'dark' theme

	const toggleTheme = () => {
		setTheme(theme === 'dark' ? 'light' : 'dark')
	}

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			<div
				style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
			>
				<NavbarAdmin />
				<Routes>
					<Route path='/' element={<Users />} />
					<Route path='/users' element={<Users />} />
					<Route path='/transactions' element={<AdminTransactions />} />
					<Route path='/robots' element={<RobotList />} />
					<Route path='/create-robot' element={<CreateRobot />} />
					<Route path='/price-adjustment' element={<PriceAdjustmentPage />} />
				</Routes>
			</div>
		</ThemeContext.Provider>
	)
}

export default withAdmin(AdminPanel)
