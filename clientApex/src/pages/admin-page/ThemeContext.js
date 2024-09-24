// ThemeContext.js
import { createContext } from 'react'

const ThemeContext = createContext({
	theme: 'dark', // Default theme is 'dark'
	toggleTheme: () => {},
})

export default ThemeContext
