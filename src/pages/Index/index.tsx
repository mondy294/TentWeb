import React, { useState, useEffect } from 'react'
import { Swiper, Toast } from 'antd-mobile'
import { DownOutline, SearchOutline } from 'antd-mobile-icons'
import styles from './index.module.scss'
import { useNavigate } from 'react-router-dom'
import { API, BASE_URL } from '@/utils/url.js'


export default function index() {


    const navgiate = useNavigate()
    const [swipers, setswipers] = useState<Array<{ alt: string; id: number; imgSrc: string }>>([{ alt: "", id: 1, imgSrc: "/img/swiper/1.png" }])
    const [groups, setgroups] = useState([])
    const [news, setnews] = useState([])
    // 当前城市位置信息
    const cityinfo = JSON.parse(localStorage.getItem('cityname')) || { "label": "武汉", "value": "AREA|27e414ce-a7e1-fd99" }


    const navs = [
        {
            id: 1,
            img: <div className='iconfont'>&#xe603;</div>,
            title: '整租',
            path: '/home/houselist'
        },
        {
            id: 2,
            img: <div className='iconfont'>&#xe604;</div>,
            title: '合租',
            path: '/home/houselist'
        },
        {
            id: 3,
            img: <div className='iconfont'>&#xe8ad;</div>,
            title: '地图找房',
            path: '/map'
        },
        {
            id: 4,
            img: <div className='iconfont'>&#xe66a;</div>,
            title: '去出租',
            path: '/issue'
        }
    ]

    // 这样写只是防止eslint报错BMapGL的手段
    const win: any = window
    const BMapGL = win.BMapGL

    useEffect(() => {

        getSwipers()
        getDroups()
        getNews()
        getCityName()

        // // 获取地理位置信息
        // navigator.geolocation.getCurrentPosition(position => {
        //     console.log(position);
        // })
    }, [])


    // 通过IP定位获取当前城市名称
    async function getCityName() {
        const myCity = new BMapGL.LocalCity();
        myCity.get(async (res: any) => {


            const result = await API.get(`/area/info?name=${res.name}`)
            if (result.data.status === 200) {
                if (!localStorage.getItem('cityname')) {
                    localStorage.setItem('cityname', JSON.stringify(result.data.body))
                    localStorage.setItem('currentcity', res.name)
                    // 当前经纬度

                }
                if (!localStorage.getItem('currentaddress')) {
                    localStorage.setItem('currentaddress', JSON.stringify({ lng: res.center.lng, lat: res.center.lat }))
                }

                // console.log(result.data.body);


            }

        })
    }

    // 获取轮播图数据的方法
    async function getSwipers() {
        const res = await API.get('/home/swiper')
        if (res.data.status === 200) {
            setswipers(res.data.body)

        }
    }
    // 获取租房小组数据
    async function getDroups() {
        const res = await API.get('/home/groups', {
            params: {
                area: 'area=AREA%7C88cff55c-aaa4-e2e0'
            }
        })
        if (res.data.status === 200) {

            setgroups(res.data.body)

        }
    }
    // 获取最新资讯
    async function getNews() {
        const res = await API.get('/home/news', {
            params: {
                area: 'area=AREA%7C88cff55c-aaa4-e2e0'
            }
        })
        if (res.data.status === 200) {

            setnews(res.data.body)

        }
    }
    // 路由跳转
    const toTabBar = (path: any): void => {
        navgiate(path)
    }

    return (
        <div className={styles.swiper}>
            {/* 搜索框 */}
            <div className={styles.search}>
                <div className={styles.search_content}>
                    <div className={styles.location} onClick={() => navgiate('/citylist', {
                    })}>
                        <span>{cityinfo.label}</span>
                        <DownOutline />
                    </div>
                    <div className={styles.form} onClick={() => { }}>
                        <SearchOutline />
                        <span>请输入小区或地址</span>
                    </div>
                </div>
                <div className={styles.icon} onClick={() => navgiate('/map')}>
                    <span className="iconfont">&#xe8ad;</span>
                </div>
            </div>
            <Swiper loop autoplay autoplayInterval={3000}>

                {
                    swipers.map((item) => {
                        return <Swiper.Item key={item.id}>
                            <div className={styles.content}>
                                <img src={'http://59.110.225.206:8889' + item.imgSrc} alt="" />
                            </div>

                        </Swiper.Item>
                    })}
            </Swiper>
            {/* 导航菜单 */}
            <div className={styles.flexbox}>
                {
                    navs.map((nav) => {
                        return (
                            <div key={nav.id} onClick={() => toTabBar(nav.path)}>
                                {nav.img}
                                <span className={styles.title}>{nav.title}</span>
                            </div>
                        )
                    })
                }
            </div>
            {/* 租房小组 */}
            <div className={styles.group}>
                <h3 className={styles.title}>
                    租房小组<span className={styles.more}>更多</span>
                </h3>
                <div className={styles.group_content}>
                    {
                        groups.map((group) => {
                            return (
                                <div key={group.id} className={styles.group_item}>
                                    <div className={styles.group_content_left}>
                                        <div>{group.title}</div>
                                        <span>{group.desc}</span>

                                    </div>

                                    <img className={styles.group_img} src={'http://59.110.225.206:8889' + group.imgSrc}></img>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            {/* 最新资讯 */}
            <div className={styles.news}>
                <h1 className={styles.title}>最新资讯</h1>
                {
                    news.map((item) => {
                        return (
                            <div key={item.id} className={styles.news_item}>
                                <img src={'http://59.110.225.206:8889' + item.imgSrc} alt="" className={styles.news_img} />
                                <div className={styles.news_info}>
                                    <h1 className={styles.info_title}>{item.title}</h1>
                                    <div className={styles.info_bottom}>
                                        <span className={styles.from}>{item.from}</span>
                                        <span className={styles.date}>{item.date}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div >

    )
}
