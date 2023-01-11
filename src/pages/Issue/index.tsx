import React, { useEffect, useState } from 'react'
import { Toast, TextArea, Cascader, Button, Collapse, CapsuleTabs, Checkbox, Stepper, Space, Radio, Input, Form, CascaderOption } from 'antd-mobile'
import { API, BASE_URL } from '@/utils/url.js'


import styles from './index.module.scss'
import { RadioValue } from 'antd-mobile/es/components/radio'
import { useNavigate } from 'react-router-dom'

import NavHeader from '@/components/NavHeader'
export default function Issue() {
    const navigate = useNavigate()

    const token = localStorage.getItem('token')
    const { label: name, value: id } = JSON.parse(localStorage.getItem('cityname'))

    const [supporting, setsupporting] = useState<string[]>([])

    const [PublishInfo, setPublishInfo] = useState({ floor: [], supporting: [], oriented: [], roomType: [] })
    const [floor, setfloor] = useState("FLOOR|1")
    const [housetitle, sethousetitle] = useState('')
    const [description, setdescription] = useState('')
    const [oriented, setoriented] = useState<RadioValue>(null)
    const [roomType, setroomType] = useState<RadioValue>(null)
    const [housesize, sethousesize] = useState<string>('')
    const [houseprice, sethouseprice] = useState<string>('')
    const [community, setcommunity] = useState<CascaderOption[]>([])

    const [visible, setVisible] = useState(false)
    const [value, setValue] = useState<string[]>([])

    const [show, setshow] = useState(1)


    let time = 2
    let timer

    useEffect(() => {
        getPublishInfo()
        getCommunity()
        if (!token) {
            setshow(0)
            Toast.show({
                content: `您还未登录3秒后跳往登录`,
                duration: 1050
            })

            timer = setInterval(() => {
                if (time == 0) {
                    clearInterval(timer)
                    navigate('/home/mine')

                }
                else {
                    Toast.show({
                        content: `您还未登录${time}秒后跳往登录`,
                        duration: 1000
                    })


                    time--
                }

            }, 1000)


        }
        // 组件被销毁时（倒计时期间点击返回）
        return () => {
            clearInterval(timer)
            // 手动清除提示
            Toast.clear()
        }
    }, [])



    // 获取房屋发布信息
    async function getPublishInfo() {
        const res = await API.get(`/houses/params`, {
            headers: {
                authorization: token
            }
        })
        if (res.data.status === 200) {
            setPublishInfo(res.data.body)
        }
    }
    // 发布房屋
    async function publish() {
        try {
            const res = await API.post('/user/houses', {
                title: housetitle,
                description,
                // 默认图片 图片上传接口还没写先这样
                houseImg: "img1.jpg|img2.jpg|img3.jpg",
                oriented,
                supporting: supporting.join('|'),
                floor,
                roomType,
                price: houseprice,
                size: housesize,
                community: value[0]
            }, {
                headers: {
                    authorization: token
                }
            })
            if (res.data.status === 200) {
                Toast.show({
                    content: '发布成功！去个人中心看看吧！'
                })
                navigate('/')

            }
            else {
                Toast.show({
                    content: '请按要求填写信息'
                })
            }
        } catch (error) {
            Toast.show({
                content: '请按要求填写信息'
            })
        }



    }

    // 获取小区关键词
    async function getCommunity() {
        const res = await API.get(`/area/community`, {
            params: {
                name,
                id,
            }
        })
        if (res.data.status === 200) {
            const data = res.data.body
            const arr = data.map((item) => {
                return { label: item.communityName, value: item.community }
            })
            setcommunity(arr)

        }


    }
    return (
        <div>
            <NavHeader title='发布房源' />
            <div style={{ display: show ? 'block' : 'none' }}>
                <Form>
                    <Form.Item
                        name='housename'
                        label='房屋名称'
                        rules={[{ required: true, message: '姓名不能为空' }]}
                    >
                        <Input onChange={(value) => { sethousetitle(value) }} placeholder='请输入房屋名称' clearable />
                    </Form.Item>
                    <Form.Item name='address' label='描述' help='请输入对房屋的具体描述'>
                        <TextArea
                            onChange={(value) => {
                                setdescription(value)
                            }}
                            placeholder='请输入对房屋的描述'
                            maxLength={100}
                            rows={2}
                            showCount
                        />
                    </Form.Item>
                    <Form.Item
                        name='houseprice'
                        label='租价 ￥/月'
                        rules={[{ required: true, message: '价格不能为空' }]}
                    >
                        <Input onChange={(value) => { sethouseprice(value) }} placeholder='请输入房屋租价' clearable />
                    </Form.Item>
                    <Form.Item
                        name='amount'
                        label='面积'
                        rules={[{ required: true, message: '面积不能为空' }]}
                        childElementPosition='right'>
                        <Stepper onChange={(value) => { sethousesize(value) }} />
                    </Form.Item>
                </Form>
                <Space align='center'>
                    <Button
                        onClick={() => {
                            setVisible(true)
                        }}
                    >
                        选择小区名称
                    </Button>
                    <Cascader
                        options={community}
                        visible={visible}
                        onClose={() => {
                            setVisible(false)
                        }}
                        value={value}
                        onConfirm={setValue}
                        onSelect={(val, extend) => {
                            console.log('onSelect', val, extend.items)
                        }}
                    >
                        {items => {
                            if (items.every(item => item === null)) {
                                return '未选择'
                            } else {
                                return items.map(item => item?.label ?? '未选择').join('-')
                            }
                        }}
                    </Cascader>
                </Space>
                <Collapse>
                    <Collapse.Panel key='1' title='楼层类型'>
                        <CapsuleTabs onChange={(key: string) => {
                            setfloor(key);
                        }}>
                            {
                                PublishInfo.floor.map((item) => {
                                    return <CapsuleTabs.Tab title={item.label} key={item.value} />
                                })
                            }


                        </CapsuleTabs>
                    </Collapse.Panel>
                    <Collapse.Panel key='2' title='基础设施'>
                        <Checkbox.Group
                            value={supporting}
                            onChange={val => {
                                setsupporting(val as string[])
                            }}
                        >
                            <Space direction='vertical'>
                                {
                                    PublishInfo.supporting.map((item) => {
                                        return <Checkbox key={item.label} value={item.label}>{item.label}</Checkbox>
                                    })
                                }


                            </Space>
                        </Checkbox.Group>
                    </Collapse.Panel>
                    <Collapse.Panel key='3' title='房屋朝向'>
                        <Radio.Group onChange={(e) => {
                            setoriented(e);
                        }}>
                            <Space direction='vertical'>{
                                PublishInfo.oriented.map((item) => {
                                    return <Radio key={item.label} value={item.value}>{item.label}</Radio>
                                })
                            }


                            </Space>
                        </Radio.Group>
                    </Collapse.Panel>
                    <Collapse.Panel key='4' title='房屋类型'>
                        <Radio.Group onChange={(e) => {
                            setroomType(e);
                        }}>
                            <Space direction='vertical'>{
                                PublishInfo.roomType.map((item) => {
                                    return <Radio key={item.label} value={item.value}>{item.label}</Radio>
                                })
                            }
                            </Space>
                        </Radio.Group>
                    </Collapse.Panel>
                </Collapse>

                <div className={styles.btn}>
                    <Button block type='submit' color='primary' size='large' onClick={publish}>
                        发布
                    </Button>
                </div>

            </div>
        </div>

    )
}
