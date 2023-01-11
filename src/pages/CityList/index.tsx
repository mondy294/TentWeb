import React, { useEffect, useState, useRef } from 'react'
import { Toast } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'

import { List, AutoSizer } from 'react-virtualized'

import NavHeader from '@/components/NavHeader'

import styles from './index.module.scss'
import { API } from '@/utils/url.js'






export default function CityList() {
    console.log();




    const HOUSE_CITY = ['北京', '上海', '广州', '深圳']


    const navigate = useNavigate()
    // 接收路由传递的state参数
    const cityinfo = JSON.parse(localStorage.getItem('cityname'))


    const [cityList, setcityList] = useState(null)
    const [cityIndex, setcityIndex] = useState([])
    const [activeindex, setactiveindex] = useState<number>(0)

    const list = useRef(null)

    interface cityInfo {
        label: string
        value: string
    }
    function changecity(item: cityInfo) {
        const { label, value } = item

        localStorage.setItem('cityname', JSON.stringify(item))
        navigate(-1)



    }

    function rowRenderer({
        key, // Unique key within array of rows key值，唯一值
        index, // Index of row within collection 索引
        isScrolling, // The List is currently being scrolled 当前项是否在滚动中
        isVisible, // This row is visible within the List (eg it is not an overscanned row) 当前项是list中是否可见
        style, // 重点属性，一定要给每一行数据添加样式，作用，指定每一行位置。
        // Style object to be applied to row (to position it)
    }: { key: any, index: number, isScrolling: boolean, isVisible: boolean, style: object }) {
        return (
            <div key={key} style={style} className={styles.city}>
                {/* 渲染索引 */}
                <div className={styles.title}>{cityIndex[index].toUpperCase()}</div>
                {/* 渲染索引对应的城市列表 */}
                <div className={styles.name}>{
                    cityList.get(cityIndex[index]).map((item: any, index: number) => {
                        return (
                            <div onClick={() => changecity(item)} key={index}>{item.label}</div>
                        )
                    })
                }</div>
            </div>
        );
    }



    useEffect(() => {
        (async function fn() {
            await getCityList()
            // 调用measureAllRows提前计算每一行的高度 防止跳转时精度偏差 实现scrollToRow精确跳转
            // 需等待getCityList执行完拿到数据后在执行 否则报错
            // list.current.measureAllRows()
        })()
    }, [])

    // 获取城市列表数据
    async function getCityList() {
        const res = await API.get('/area/city?level=1')
        if (res.status === 200) {
            const { cityList, cityIndex } = formatCityData(res.data.body)


            // 获取热门城市数据 并添加到上面的哈希表和列表中
            const hotRes = await API.get('/area/hot')
            if (hotRes.status === 200) {
                // 添加热门和定位
                cityIndex.unshift('热门城市')
                cityIndex.unshift('当前定位')
                cityList.set('热门城市', hotRes.data.body)
                cityList.set('当前定位', [cityinfo])
            }
            setcityIndex(cityIndex)
            setcityList(cityList)


        }
    }
    // 算出每一行的高度
    function getRowHeight({ index }: { index: number }) {
        // 计算当前索引下的城市数量
        const len = cityList.get(cityIndex[index]).length
        // 算出高度为 title高度+城市数量*name的高度
        return 34 + len * 50

    }

    // 数据格式化方法
    function formatCityData(list: any) {
        // 创建哈希表
        const cityList = new Map()
        let cityIndex: string[] = []

        list.forEach((item: { short: string }) => {
            const first = item.short.substring(0, 1)
            // 如果有该分类
            if (cityList.has(first)) {
                cityList.get(first).push(item)
            }
            // 没有该分类
            else {
                cityList.set(first, [item])
                cityIndex.push(first)
            }
        })

        cityIndex = cityIndex.sort()

        return {
            cityList,
            cityIndex
        }

    }

    function back() {
        navigate(-1)
    }
    function renderditem(item: string) {
        return item === '当前定位' ? '#' : item === '热门城市' ? '热' : item.toUpperCase()
    }
    // 获取list组件中渲染行的信息 页面滚动时索引列表高亮也随之变化
    function onRowsRendered({ startIndex }: { startIndex: number }) {
        if (startIndex !== activeindex) {
            setactiveindex(startIndex)
        }


    }

    return (
        <div className={styles.citylist}>
            <div className={styles.navbar}>
                <NavHeader color='#eee' title='城市选择' />
            </div>


            <AutoSizer>
                {
                    ({ height, width }: { height: number, width: number }) => (
                        <List
                            ref={list}
                            width={width} //宽
                            height={height} // 高
                            rowCount={cityIndex.length} // 多少行
                            rowHeight={getRowHeight} // 行高
                            rowRenderer={rowRenderer} // 每一行内容
                            onRowsRendered={onRowsRendered}
                            // scrollToRow跳转后页面的位置
                            scrollToAlignment="start"
                        />
                    )
                }
            </AutoSizer>
            <ul className={styles.city_index}>
                {
                    cityIndex.map((item, index) => {
                        return (
                            <li key={index} className={styles.city_index_item}>
                                {/* 点击索引页面跳转到对应位置 */}
                                <span onClick={() => { list.current.scrollToRow(index) }}
                                    className={activeindex === index ? styles.index_active : ''}>{
                                        renderditem(item)
                                    }</span>
                            </li>
                        )
                    })
                }

            </ul>





        </div>
    )
}
