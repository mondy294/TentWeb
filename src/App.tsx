import React from 'react'
import { NavLink, useRoutes } from 'react-router-dom'
import routes from '@/router'




function App() {
  // 根据路由表 生成对印度个路由规则
  const element = useRoutes(routes)

  return (
    <div className='App'>
      {element}
    </div>
  )
}

export default App
