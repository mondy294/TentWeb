import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import '@/index.css'
// 设置基础样式
import 'reset-css'
import 'react-virtualized/styles.css'




import { HashRouter } from 'react-router-dom'


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

  // <React.StrictMode>
  <HashRouter>
    <App />
  </HashRouter>
  // </React.StrictMode>
)
