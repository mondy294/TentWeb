import React, { useEffect, useState } from 'react'


import NavHeader from '@/components/NavHeader'
import { SwipeAction, Toast } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'

import styles from './index.module.scss'
import axios from 'axios'
import { API, BASE_URL } from '@/utils/url.js'
export default function Publish() {

    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    const [startlist, setstartlist] = useState([])


    useEffect(() => {
        getFavorite()
    }, [])

    // 下架房屋
    async function deletestart(id: string) {
        const res = await axios.patch(`${BASE_URL}/user/houses/${id}`, { shelf: true }, {
            headers: {
                authorization: token
            }
        })

        if (res.data.status === 200) {
            Toast.show({
                content: '房屋下架成功'
            })
            getFavorite()
        }

    }

    // 渲染发布列表
    function renderStartList() {
        return (
            startlist.map((item: any, index) => {
                return (
                    <SwipeAction
                        key={index}
                        rightActions={[
                            {
                                key: 'delete',
                                text: '下架房屋',
                                color: 'danger',
                                onClick: () => {
                                    deletestart(item.houseCode)

                                }
                            },
                        ]}
                    >
                        <div className={styles.house} onClick={() => {
                            navigate('/details', {
                                state: {
                                    houseid: item.houseCode
                                }
                            })
                        }}>
                            <div className={styles.imgWrap}>
                                <img className={styles.img} src={`${BASE_URL}${item.houseImg} `} alt="" />
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.title}>{item.title}</h3>
                                <div className={styles.desc}>{item.desc}</div>
                                <div>
                                    {
                                        item.tags.map((tag: string, index: number) => {
                                            const tagClass = 'tag' + (index + 1)
                                            return (
                                                <span
                                                    key={index}
                                                    className={[styles.tag, styles[tagClass]].join(' ')}
                                                >
                                                    {tag}
                                                </span>
                                            )
                                        })
                                    }
                                </div>
                                <div className={styles.price}>
                                    <span className={styles.priceNum}>{item.price}</span> 元/月
                                </div>
                            </div>
                        </div>
                    </SwipeAction>

                )
            })
        )
    }
    // 获取发布列表
    async function getFavorite() {
        const res = await axios.get(`${BASE_URL}/user/houses`, {
            headers: {
                authorization: token
            }
        })
        if (res.data.status === 200) {
            setstartlist(res.data.body)
        }

    }
    return (
        <div>
            <NavHeader title='我的房源' color='#eee' />
            <div className={styles.startlist}>
                {
                    renderStartList()
                }
            </div>
        </div>
    )
}
