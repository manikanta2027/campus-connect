// Import React and ReactDOM
import React from 'react'
import ReactDOM from 'react-dom/client'
// Import main App component
import App from './App.jsx'
// Import Tailwind CSS styles
import './index.css'

// Render React app into the root element
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
