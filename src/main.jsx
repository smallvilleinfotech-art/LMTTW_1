import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// HashRouter is used so GitHub Pages works without a custom 404.html.
// URLs look like: https://user.github.io/lead-me-to-the-waters/#/host
// Everything still works identically in local dev.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
