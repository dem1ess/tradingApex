import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'

import App from './App.jsx'
import './assets/scss/_init.scss'
import './assets/scss/styles.scss'
import { store } from './store/index.js'
const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
	<Provider store={store}>
		<App />
	</Provider>
)
