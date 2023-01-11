import React, { useEffect, useState } from 'react'
import NavHeader from '@/components/NavHeader'
import axios from 'axios'
import { Link, useNavigate, useLocation } from 'react-router-dom'
// 这里用模块化他引入会导致百度地图报错.

import './index.scss'
import styles from './index2.module.scss'
import Loading from '@/components/Loading'
import { API, BASE_URL } from '@/utils/url.js'







export default function Map() {

  const navigate = useNavigate()
  // 每个房源的信息
  interface everyHouseInfo {
    coord: { longitude: any, latitude: any }
    label: string
    count: number
    value: string
  }
  // 渲染房源覆盖物时的对象参数
  interface overLaysInfo {
    areaPoint: object
    areaName: string
    count: number
    value: string
    zoom: number

  }


  const { state } = useLocation()




  // 这样写只是防止eslint报错BMapGL的手段
  const win: any = window
  const BMapGL = win.BMapGL
  var map: any

  const [houseList, sethouseList] = useState([] as object[])
  const [isShowList, setisShowList] = useState(false)
  const [isLoading, setisLoading] = useState(false)
  const [mapscale, setmapscale] = useState(null)
  const [newinfo, setnewinfo] = useState(null)


  useEffect(() => {
    initMap()
  }, [])



  // 初始化地图
  function initMap() {
    setisShowList(false)
    // 获取当前定位城市
    let { label: cityname, value } = JSON.parse(localStorage.getItem('cityname'))
    let scale = 11
    if (state) {
      value = state.id
      scale = 14
      cityname = state.areaname
    }
    map = new BMapGL.Map("container");
    // 使用百度地图地址解析器降低至转化为坐标

    // 创建解析器实例
    const myGeo = new BMapGL.Geocoder()
    myGeo.getPoint(cityname, async (point: object) => {
      // point为cityname对应城市的经纬坐标
      if (point) {
        // 初始化地图
        map.centerAndZoom(point, scale)
        setmapscale(scale)
        // 标记坐标点
        // map.addOverlay(new BMapGL.Marker(point))

        // 给地图添加常用的个控件
        // 比例尺
        map.addControl(new BMapGL.ScaleControl())

        // 缩放按钮
        const zoomCtrl = new BMapGL.ZoomControl()
        map.addControl(zoomCtrl)




        renderOverlays(value)

        //#region 
        // ********************添加房源覆盖物*********************************************************

        // 获取房源信息
        // const res = await axios.get(`${BASE_URL}/area/map?id=${value}`)
        // res.data.body.forEach((item: any) => {
        //     // 为每一条数据创建覆盖物
        //     // 获取每条数据的坐标
        //     const { coord: { longitude, latitude }, label: areaName, count, value } = item
        //     // 创建文本覆盖物
        //     const areaPoint = new BMapGL.Point(longitude, latitude)
        //     const opts = {
        //         // 覆盖物出现坐标
        //         position: areaPoint,
        //         // 文本偏移量
        //         offset: new BMapGL.Size(-35, -35)
        //     }

        //     // 设置setContent后 第一个参数所设置的文本内容就失效了 省略即可
        //     const label = new BMapGL.Label('', opts)


        //     // 给每个label对象添加唯一的标识
        //     label.id = value

        //     label.setContent(`<div class=nav-bubble>
        //                     <p class="nav-name">${areaName}</p>
        //                     <p>${count}套</p>
        //                   <div/>`)

        //     // 自定义文本标注样式
        //     label.setStyle({
        //         cursor: 'pointer',
        //         border: '0px solid rgb(255,0,0)',
        //         padding: '0px',
        //         whiteSpace: 'nowrap',
        //         fontSize: '12px',
        //         color: '#fff',
        //         textAlign: 'center'
        //     });
        //     map.addOverlay(label);
        //     // 添加单击事件
        //     label.addEventListener('click', () => {
        //         // 以当前点击的覆盖物为中心放大地图
        //         map.centerAndZoom(areaPoint, 13)
        //         // 清除当前层级覆盖物信息
        //         map.clearOverlays()


        //     })
        // })
        //#endregion
      }

    }, cityname)

    // 给地图绑定移动事件
    map.addEventListener('movestart', () => {


      // 移动地图时隐藏房源信息

      setisShowList(false)


    })
  }

  // 渲染覆盖物入口
  // 1 接收id参数 获取该区域下的房源数据
  // 2 获取房源类型以及下级地图缩放级别
  // 注意这是一个递归函数
  async function renderOverlays(id: string) {
    // 开启Loading
    setisLoading(true)
    const res = await axios.get(`${BASE_URL}/area/map?id=${id}`)
    if (res.data.status === 200) {
      // 关闭loading
      setisLoading(false)
      const data = res.data.body as object[]


      // 调用getTypeAndZoom 获取级别和类型
      const { nextZoom, type } = getTypeAndZoom()
      data.forEach((item) => {
        // 创建念覆盖物
        createOverlays(item as everyHouseInfo, nextZoom, type)
      })
    }


  }
  // 创建覆盖物

  function createOverlays(item: everyHouseInfo, zoom: number, type: string) {
    // 为每一条数据创建覆盖物
    // 获取每条数据的坐标
    const { coord: { longitude, latitude }, label: areaName, count, value } = item
    // 创建覆盖物坐标
    const areaPoint = new BMapGL.Point(longitude, latitude)
    const obj = {
      areaPoint,
      areaName,
      count,
      value,
      zoom
    }
    // console.log(zoom, type);

    if (type === 'circle') {
      // 区、镇
      createCircle(obj as overLaysInfo)
    }
    else {
      //小区
      createRect(obj as overLaysInfo)
    }
  }

  // 获取地图缩放级别和覆盖物类别
  function getTypeAndZoom() {
    // 获取地图缩放级别
    const zoom = map.getZoom()

    let nextZoom: number, type: string
    // console.log(zoom);
    if (zoom >= 10 && zoom < 12) {
      // 区
      // 下一缩放级别
      nextZoom = 13
      // 覆盖物形状
      type = 'circle'
    }
    else if (zoom >= 12 && zoom < 14) {
      //镇
      nextZoom = 15
      type = 'circle'
    }
    else if (zoom >= 14 && zoom < 16) {
      //小区 无需再放大
      type = 'rect'
    }
    return {
      nextZoom,
      type
    }


  }

  // 创建 区和镇 覆盖物
  function createCircle(overlaysinfo: overLaysInfo) {
    const { areaPoint, areaName, count, value, zoom } = overlaysinfo
    // console.log(areaPoint, areaName, count, value, zoom);


    const opts = {
      // 覆盖物出现坐标
      position: areaPoint,
      // 文本偏移量
      offset: new BMapGL.Size(-35, -35)
    }

    // 设置setContent后 第一个参数所设置的文本内容就失效了 省略即可
    const label = new BMapGL.Label('', opts)


    // 给每个label对象添加唯一的标识
    label.id = value

    label.setContent(`<div class=nav-bubble>
                                    <p class="nav-name">${areaName}</p>
                                    <p>${count}套</p>
                                  <div/>`)

    // 自定义文本标注样式
    label.setStyle({
      cursor: 'pointer',
      border: '0px solid rgb(255,0,0)',
      padding: '0px',
      whiteSpace: 'nowrap',
      fontSize: '12px',
      color: '#fff',
      textAlign: 'center'
    });
    map.addOverlay(label);
    // 添加单击事件
    label.addEventListener('click', () => {
      // 调用renderOverlays获取该区域下的房源数据
      renderOverlays(value)
      // 以当前点击的覆盖物为中心放大地图


      map.centerAndZoom(areaPoint, zoom)
      setmapscale(zoom)

      // 清除当前层级覆盖物信息
      map.clearOverlays()


    })

  }

  //创建 小区 覆盖物
  function createRect(overlaysinfo: overLaysInfo) {
    const { areaPoint, areaName, count, value, zoom } = overlaysinfo
    // console.log(areaPoint, areaName, count, value, zoom);


    const opts = {
      // 覆盖物出现坐标
      position: areaPoint,
      // 文本偏移量
      offset: new BMapGL.Size(-50, -28)
    }

    // 设置setContent后 第一个参数所设置的文本内容就失效了 省略即可
    const label = new BMapGL.Label('', opts)


    // 给每个label对象添加唯一的标识
    label.id = value

    label.setContent(`<div class="map-rect">
                            <span class="map-housename">${areaName}</span>
                            <span class="map-housenum">${count}套</span>
                            <i class="map-arrow"></i>
                          </div>`)

    // 自定义文本标注样式
    label.setStyle({
      cursor: 'pointer',
      border: '0px solid rgb(255,0,0)',
      padding: '0px',
      whiteSpace: 'nowrap',
      fontSize: '12px',
      color: '#fff',
      textAlign: 'center'
    });
    map.addOverlay(label);
    // 添加单击事件
    label.addEventListener('click', (e: any) => {
      // console.log(e);
      // console.log(label);


      // 获取房源信息并展示
      getHouseList(value)
      const areaPoint = e.currentTarget.latLng

      // 以当前点击的覆盖物为中心
      map.centerAndZoom(areaPoint, 15)

      const y = -(window.innerHeight - 330) / 2
      map.panBy(0, y)




    })
  }

  // 获取小区房源数据
  async function getHouseList(id: string) {
    setisLoading(true)
    const res = await axios.get(`${BASE_URL}/houses?cityId=${id}`)
    if (res.data.status === 200) {
      setisLoading(false)
      sethouseList(res.data.body.list)
      setisShowList(true)
    }

  }

  // 渲染房屋列表
  function renderHouseList() {
    return (
      houseList.map((item: any, index: number) => {
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





  return (
    <div className='map'>

      <Loading isLoading={isLoading} />


      <div className='map-nav'>
        <NavHeader color='#eee' title='地图找房' />


      </div>
      <div id='container'></div>


      <div
        className={[styles.houseList, isShowList ? styles.show : ''].join(' ')}
      >
        <div className={styles.titleWrap}>
          <h1 className={styles.listTitle}>房屋列表</h1>
          <Link className={styles.titleMore} to="/home/houselist">
            更多房源
          </Link>
        </div>

        <div className={styles.houseItems}>
          {/* 房屋结构 */}
          {renderHouseList()}
        </div>
      </div>

    </div>
  )
}
