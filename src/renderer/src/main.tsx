import './assets/main.css'
import { NextUIProvider } from '@nextui-org/system'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <NextUIProvider>
    <App />
  </NextUIProvider>
)
