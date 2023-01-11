import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

import Home from '@/pages/Home'
import CityList from '@/pages/CityList'
import News from '@/pages/News'
import Index from '@/pages/Index'
import HouseList from '@/pages/HouseList'
import Mine from '@/pages/Mine'
import Map from '@/pages/Map'
import Details from '@/pages/Details'
import Starts from '@/pages/Starts'
import Publish from '@/pages/Publish'
import Issue from '@/pages/Issue'


// 开启路由懒加载
// const Home = lazy(() => import('@/pages/Home'))
// const CityList = lazy(() => import('@/pages/CityList'))


const routes = [
    {
        path: "/home",
        element: <Home />,
        children: [
            {
                path: "news",
                element: <News />
            },
            {
                path: "index",
                element: <Index />
            },
            {
                path: "houselist",
                element: <HouseList />
            },
            {
                path: "mine",
                element: <Mine />
            },
            {
                path: "/home",
                element: <Navigate to="/home/index" />
            }
        ],
    },
    {
        path: "/citylist",
        element: <CityList />
    },
    {
        path: '/map',
        element: <Map />
    },
    {
        path: '/details',
        element: <Details />
    },
    {
        path: '/starts',
        element: <Starts />
    },
    {
        path: '/publish',
        element: <Publish />
    },
    {
        path: '/issue',
        element: <Issue />
    },
    {
        path: "/",
        element: <Navigate to="/home/index" />
    }

]

export default routes