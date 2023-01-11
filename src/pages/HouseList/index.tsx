import React, { useEffect, useState, useRef } from 'react'
import NavHeader from '@/components/NavHeader'
import { CascaderView } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'

import styles from './index.module.scss'

import Loading from '@/components/Loading'
import { API, BASE_URL } from '@/utils/url.js'


import axios from 'axios'

export default function HouseList() {
    const navigate = useNavigate()
    const d: any = useRef()
    const { label } = JSON.parse(localStorage.getItem('cityname'))




    const [isLoading, setisLoading] = useState(false)
    const { value: id } = JSON.parse(localStorage.getItem('cityname'))
    const [housecondition, sethousecondition] = useState({ area: { children: [] } })
    const [houselist, sethouselist] = useState([])
    const [show, setshow] = useState(false)
    const [start, setstart] = useState(1)
    const [pages, setpages] = useState(1)
    const [area, setarea] = useState(id)
    const [areaname, setareaname] = useState(label)

    useEffect(() => {
        getSearchCondition()
        getRecInfo()
        window.addEventListener('scroll', handlescrool)

    }, [])

    useEffect(() => {
        // 切换筛选时重新获取数据
        (async function () {
            const res = await axios.get(`${BASE_URL}/houses?cityId=${area}&start=${start}&end=${start + 19}`)
            sethouselist(res.data.body.list)
        })()
    }, [area])

    // 我不理解这里 记得回来看看............................................
    function handlescrool() {
        if (document.documentElement.scrollTop >= 10 + 2020 * pages) {
            // console.log(document.documentElement.scrollTop, 100 + 2020 * pages);
            window.removeEventListener('scroll', handlescrool)

            d.current.click()

        }


        // getRecInfo()

    }


    //获取推荐房源信息
    async function getRecInfo() {
        setstart(start + 19)
        setpages(pages + 1)
        setisLoading(true)


        const res = await axios.get(`${BASE_URL}/houses?cityId=${area}&start=${start}&end=${start + 19}`)
        if (res.data.status === 200) {
            setisLoading(false)
            sethouselist([...houselist, ...res.data.body.list])
            // sethouselist(res.data.body.list)
            window.addEventListener('scroll', handlescrool)

        }

    }

    // 获取房屋查询条件
    async function getSearchCondition() {
        const res = await axios.get(`${BASE_URL}/houses/condition?id=${id}`)
        if (res.status === 200) {
            sethousecondition(res.data.body)
        }
    }


    // 渲染房屋列表
    function renderHouseList() {
        return (
            houselist.map((item: any, index) => {
                return (
                    <div className={styles.house} key={index} onClick={() => {
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
                )
            })
        )
    }

    // 筛选房屋
    async function choosehouse(id: string[], ext: any) {
        // 获取当前选择的地名
        const { items } = ext
        setareaname(items[items.length - 1].label)


        // 点击不限时不更新
        if (id[id.length - 1] !== "null") {
            setarea(id[id.length - 1])
        }


    }

    return (
        <div className={styles.box}>
            <Loading isLoading={isLoading} />

            <NavHeader color='#1677ff' title='房源信息' />

            <div className={[styles.CascaderView, show ? styles.show : ''].join(' ')}>
                <CascaderView
                    options={housecondition.area.children}
                    style={{ '--height': '300px' }}
                    onChange={(val, ext) => choosehouse(val, ext)}

                />
            </div>
            <div className={styles.navbar}>
                <div className={styles.left}>
                    <div ref={d} onClick={getRecInfo}>推荐</div>
                    <div onClick={() => {
                        navigate('/map', {
                            state: {
                                id: area,
                                areaname
                            }
                        })
                    }}>附近</div>
                    {/* <div>最新</div> */}
                </div>

                <div className={styles.right}>
                    <div onClick={() => { setshow(!show) }}>筛选</div>
                </div>
            </div>
            <div
                className={styles.houseList}
            >

                {/* 房屋结构 */}
                {renderHouseList()}

            </div>

        </div>
    )
}
