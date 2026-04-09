// import React from 'react'
// import { createRoot } from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'
// import App from './App'
// import './index.css'

// createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>
// )

import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '24px'
    }}>
      Loading...
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LoadingScreen />
  </React.StrictMode>
)
