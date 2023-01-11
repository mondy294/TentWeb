import { Badge, TabBar } from 'antd-mobile'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
    AppOutline,
    MessageOutline,
    MessageFill,
    UnorderedListOutline,
    UserOutline,
} from 'antd-mobile-icons'
import styles from './index.module.scss'

export default function Home() {
    const navigate = useNavigate()
    const location = useLocation()
    const { pathname } = location

    const setRouteActive = (value: string) => {
        // value
        navigate(value, {
            replace: false,
        })

    }

    const tabs = [
        {
            key: '/home/index',
            title: '首页',
            icon: <AppOutline />,
            badge: Badge.dot,
        },
        {
            key: '/home/houselist',
            title: '找房',
            icon: <UnorderedListOutline />,
            badge: '5',
        },
        // {
        //     key: '/home/news',
        //     title: '咨询',
        //     icon: (active: boolean) =>
        //         active ? <MessageFill /> : <MessageOutline />,
        //     badge: '99+',
        // },
        {
            key: '/home/mine',
            title: '我的',
            icon: <UserOutline />,
        },
    ]

    return (
        <div className={styles.box}>

            <Outlet />
            <div className={styles.bot}>
                <TabBar activeKey={pathname} onChange={value => setRouteActive(value)}>
                    {tabs.map(item => (
                        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
                    ))}
                </TabBar>
            </div>

        </div>
    )
}
