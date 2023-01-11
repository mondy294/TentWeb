import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { Swiper, Toast, SpinLoading, DotLoading } from 'antd-mobile'
import { StarOutline, MessageOutline } from 'antd-mobile-icons'
import { useNavigate } from 'react-router-dom'
import Loading from '@/components/Loading'

import styles from './index.module.scss'
import NavHeader from '@/components/NavHeader'
import { API, BASE_URL } from '@/utils/url.js'


export default function Details() {
    interface i {
        [index: number]: string
    }
    interface hdetails {
        houseImg: Array<string>
        title: string
        tags: string[]
        price: number
        houseCode: string
        roomType: string
        coord: { latitude: string, longitude: string }
        size: number
        community: string
        floor: string
        oriented: Array<string>

    }
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    const { state: { houseid } } = useLocation()
    const [housedetails, sethousedetails] = useState({ houseImg: [''], tags: [], oriented: [] } as hdetails)
    const totaltitle = housedetails.title + ' ' + housedetails.roomType + ' ' + housedetails.floor
    const [isLoading, setisLoading] = useState(false)
    const [show, setshow] = useState(true)
    const [isFavorite, setisFavorite] = useState(null)


    useEffect(() => {


        getHouseDetails()
        iscollect()

    }, [])



    // 获取房屋详细数据
    async function getHouseDetails() {
        setisLoading(true)
        const res = await axios.get(`${BASE_URL}/houses/${houseid}`)
        if (res.status === 200) {
            setisLoading(false)
            setshow(false)
            sethousedetails(res.data.body)


        }

    }

    // 收藏房屋
    async function collect() {

        const res = await axios.post(`${BASE_URL}/user/favorites/${houseid}`, {},
            {
                headers: {
                    authorization: token
                }
            })
        if (res.data.status === 200) {
            Toast.show({
                content: '收藏成功'
            })
            iscollect()
        }
    }

    // 是否已收藏
    async function iscollect() {
        const res = await axios.get(`${BASE_URL}/user/favorites/${houseid}`,
            {
                headers: {
                    authorization: token
                }
            })

        if (res.data.status === 200) {
            const { isFavorite } = res.data.body
            setisFavorite(isFavorite)
        }
    }


    return (
        <div className={styles.box} >
            <Loading isLoading={isLoading} />
            <NavHeader color='#1677ff' fontcolor='#fff' title='房屋详情' />
            <div className={show ? styles.show : ''}>

                <Swiper loop autoplay autoplayInterval={3000}>
                    {
                        housedetails.houseImg.map((item, index) => {
                            return <Swiper.Item key={index}>
                                <div className={styles.content}>
                                    <img src={`${BASE_URL}` + item} alt="" />

                                </div>

                            </Swiper.Item>
                        })}
                </Swiper>
                <div className={styles.detailsinfo}>
                    <div className={styles.baseinfo}>
                        <div className={styles.price}>
                            ￥<span>{housedetails.price}</span>/月
                        </div>
                        <div className={styles.area}>
                            <span>{housedetails.size}</span>/平
                        </div>
                    </div>
                    <div className={styles.detailsmain}>
                        <div className={styles.detailscontent}>
                            <div className={styles.detailstitle}>{totaltitle}</div>
                            <div className={[styles.icon, 'iconfont'].join(' ')}>&#xe8ad;</div>
                        </div>
                        <div className={styles.tips}>{
                            housedetails.tags.map((item, index) => {
                                return (
                                    <span key={index}>{item}</span>
                                )
                            })

                        }
                            <span>{housedetails.oriented[0]}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.imgs}>
                    {
                        housedetails.houseImg.map((item, index) => {
                            return (
                                <img src={`${BASE_URL}` + item} key={index} />
                            )
                        })
                    }
                </div>

                <div className={styles.bottom}>
                    <span onClick={() => { navigate('/home/news') }}>
                        <MessageOutline />
                        <span>咨询</span>
                    </span>
                    <span onClick={collect} style={{ display: isFavorite || !token ? 'none' : '' }}>
                        <StarOutline />
                        <span>收藏</span>
                    </span>
                    <span style={{ display: token ? 'none' : '' }} onClick={() => { navigate('/home/mine') }}>
                        <span>登陆后收藏</span>
                    </span>
                    <span style={{ display: isFavorite && token ? '' : 'none' }} onClick={() => { navigate('/starts') }}>
                        <span>已收藏</span>
                    </span>
                </div>
            </div>

        </div>
    )
}
