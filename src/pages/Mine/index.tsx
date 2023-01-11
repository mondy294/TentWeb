import React, { useEffect, useRef, useState } from 'react'

import styles from './index.module.scss'
import NavHeader from '@/components/NavHeader'
import { RightOutline } from 'antd-mobile-icons'
import { Popup, Toast, Form, Input, Space, Radio, ImageUploader, ImageUploadItem, Button } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import { API, BASE_URL } from '@/utils/url.js'

import axios from 'axios'
import { RadioValue } from 'antd-mobile/es/components/radio'
export default function Mine() {
    interface userinfo {
        avatar?: string
        gender?: string
        id?: number
        nickname: string
    }
    // 预备数据
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const startcount = localStorage.getItem('starts') || 0
    const publishcount = localStorage.getItem('publish') || 0
    const userinfo = JSON.parse(localStorage.getItem('userinfo') || JSON.stringify({ nickname: '匿名用户' }))

    const currentcity = localStorage.getItem('currentcity')
    const { lng, lat } = JSON.parse(localStorage.getItem('currentaddress'))
    // 常规数据
    const [showlogin, setshowlogin] = useState(false)
    const [showregister, setshowregister] = useState(false)
    const [startsCount, setstartsCount] = useState(startcount)
    const [publishCount, setpublishCount] = useState(publishcount)
    const [userInfo, setuserInfo] = useState(userinfo as userinfo)
    const [updatauserinfo, setupdatauserinfo] = useState<boolean>(false)

    const [nickname, setnickname] = useState<string>()
    const [gender, setgender] = useState<RadioValue>()
    const [phone, setphone] = useState<string>()
    const [] = useState()

    // 获取表单内容
    const acc = useRef(null)
    const pwd = useRef(null)
    const regaccount = useRef(null)
    const regpassword = useRef(null)
    const repassword = useRef(null)


    // 最大图片上传数量
    const maxCount = 1
    // 头像地址
    const [fileList, setFileList] = useState<ImageUploadItem[]>([])



    useEffect(() => {
        if (localStorage.getItem('token')) {
            setuserInfo(JSON.parse(localStorage.getItem('userinfo')))
        }
        // getFavorite()


        // getUserInfo()

    }, [])
    useEffect(() => {
        getFavorite()
        getpublish()
    }, [token])

    // 上传头像的处理函数
    async function mockUpload(file: File): Promise<any> {
        // 在这里面进行头像裁剪的逻辑

        return {
            url: URL.createObjectURL(file),
        }
    }


    // 获取收藏数量
    async function getFavorite() {


        const res = await axios.get(`${BASE_URL}/user/favorites`, {
            headers: {
                authorization: token
            }
        })
        if (res.data.status === 200) {
            // setstartscount(res.data.body.length)
            localStorage.setItem('starts', res.data.body.length)
            setstartsCount(res.data.body.length)
        }

    }
    // 获取发布数量
    async function getpublish() {


        const res = await axios.get(`${BASE_URL}/user/houses`, {
            headers: {
                authorization: token
            }
        })
        if (res.data.status === 200) {
            // setstartscount(res.data.body.length)
            localStorage.setItem('publish', res.data.body.length)
            setpublishCount(res.data.body.length)
        }

    }
    // 展示位置信息
    function showaddress() {
        Toast.show({
            content: `现在位于${currentcity}
            东经：${lng}
            北纬：${lat}`,
            duration: 2000
        })
    }
    // 展示弹窗
    function showsomething(value: number) {
        switch (value) {
            case 1:
                setshowlogin(true)
                break
            case 3:
                showaddress()
                break
            case 4:
                logout()
                break

        }
    }
    // 更新用户信息
    async function updateinfo() {
        const res = await API.patch(`/user`, {
            avatar: '',
            // 性别只能为1/2
            gender,
            nickname,
            phone
        }, {
            headers: {
                authorization: token
            }
        })
        if (res.data.status == 200) {
            Toast.show({
                content: '修改信息成功！'
            })
            setupdatauserinfo(false)
            getUserInfo()
        }

    }
    // 注册
    async function register() {
        const account = regaccount.current.value
        const password = regpassword.current.value
        const password2 = repassword.current.value


        if (!account) {
            Toast.show({
                content: '账号不能为空！！'
            })
            return
        }
        else if (password.length == 0) {
            Toast.show({
                content: '密码不能为空！！'
            })
            return
        }
        else if (!password2) {
            Toast.show({
                content: '请确认密码'
            })
            return
        }
        else if (password === password2) {
            const res = await axios.post(`${BASE_URL}/user/registered`, {
                username: account,
                password,
            })
            Toast.show({
                content: res.data.description
            })
        }
        else {
            Toast.show({
                content: '两次输入的密码不相同'
            })
        }


    }

    // 登录
    async function login() {
        const username = acc.current.value
        const password = pwd.current.value


        const res = await axios.post(`${BASE_URL}/user/login`, {
            username,
            password,
        })
        if (res.data.status === 200) {
            setshowlogin(false)
            Toast.show({
                content: '登陆成功！'
            })
            localStorage.setItem('token', res.data.body.token)
            getUserInfo()


        }

    }
    // 获取用户信息
    async function getUserInfo() {
        const res = await axios.get(`${BASE_URL}/user`, {
            headers: {
                authorization: localStorage.getItem('token')
            }
        })

        if (res.data.status === 200) {

            setuserInfo(res.data.body)
            localStorage.setItem('userinfo', JSON.stringify(res.data.body))
        }
    }

    // 退出登录
    async function logout() {

        // post请求有三个参数 请求头在第三个里面设置
        const res = await axios.post(`${BASE_URL}/user/logout`, {},
            {
                headers: {
                    authorization: token
                }
            })

        if (res.data.status === 200) {
            Toast.show({
                content: res.data.description
            })
            localStorage.setItem('token', '')
            localStorage.setItem('userinfo', '')
            localStorage.setItem('starts', '')
            setuserInfo({ nickname: '匿名用户' } as userinfo)
            setstartsCount(0)
            setpublishCount(0)

        }

    }

    const options = [
        {
            name: '登录/注册',
            value: 1
        },
        {
            name: '浏览记录',
            value: 2
        },
        {
            name: '位置信息',
            value: 3
        },
        {
            name: '退出登录',
            value: 4
        },
    ]
    return (
        <div className={styles.main}>
            <NavHeader title='我的' color='#1677ff' fontcolor='#fff' />
            <div className={styles.mainarea} onClick={() => { setupdatauserinfo(true) }}>
                <div className={styles.black}></div>
                <div className={styles.mask} style={{ backgroundImage: "url(" + '/images/avatar.jpg' + ")" }}></div>
                <div className={styles.avatar}>
                    <img src='/images/avatar.jpg' />
                </div>
                <div className={styles.username}>{userInfo.nickname}</div>
                <div className={styles.address}>{currentcity}</div>
            </div>

            <div className={styles.options}>
                <div onClick={() => { navigate('/starts') }}>
                    <span className={styles.count}>{startsCount}</span>
                    <span className={styles.icon}>我的收藏</span>
                </div>
                <div onClick={() => { navigate('/publish') }}>
                    <span className={styles.count}>{publishCount}</span>
                    <span className={styles.icon}>我发布的</span>
                </div>
                <div>
                    <span className={styles.count}>未开放</span>
                    <span className={styles.icon}>功能</span>
                </div>
            </div>

            <div className={styles.bottombar}>
                {
                    options.map((item, index) => {
                        return (
                            <div className={styles.baritem} key={index} onClick={() => { showsomething(item.value) }}
                                style={{ display: (token && item.value == 1) || (!token && item.value == 4) ? 'none' : '', }}
                            >
                                <div className={styles.barleft}>
                                    <img src="" alt="" />
                                    <span className={styles.bartitle}>{item.name}</span>
                                </div>
                                <div className={styles.barright}><RightOutline /></div>
                            </div>
                        )
                    })
                }

            </div>

            <div className={styles.setting}>
                <div className={styles.barleft}>
                    <img src="" alt="" />
                    <span className={styles.bartitle}>设置</span>
                </div>
                <div className={styles.barright}><RightOutline /></div>
            </div>

            <Popup
                visible={showlogin}
                onMaskClick={() => {
                    setshowlogin(false)
                }}
                bodyStyle={{
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    minHeight: '40vh',
                }}
            >
                <div className={styles.login}>
                    <h1>登录</h1>
                    <div className={styles.account}>
                        <span>账号</span>
                        <input type="text" placeholder='请输入账号' ref={acc} />
                    </div>
                    <div className={styles.password} >
                        <span>密码</span>
                        <input type="text" placeholder='请输入密码' ref={pwd} />
                    </div>


                    <div className={styles.foot}>
                        <a onClick={login}>登录</a>
                        <a onClick={() => { setshowlogin(false), setshowregister(true) }}>还没注册？前往注册</a>
                    </div>
                </div>
            </Popup>
            <Popup
                visible={showregister}
                onMaskClick={() => {
                    setshowregister(false)
                }}
                bodyStyle={{
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    minHeight: '40vh',
                }}
            >
                <div className={styles.login}>
                    <h1>注册</h1>
                    <div className={styles.account}>
                        <span>账号</span>
                        <input type="text" placeholder='请输入账号' ref={regaccount} />
                    </div>
                    <div className={styles.password}>
                        <span>密码</span>
                        <input type="text" placeholder='请输入密码' ref={regpassword} />
                    </div>
                    <div className={styles.repassword}>
                        <span>确认密码</span>
                        <input type="text" placeholder='请再次输入密码' ref={repassword} />
                    </div>
                    <div className={styles.foot}>
                        <a onClick={register}>注册</a>
                        <a onClick={() => { setshowlogin(true), setshowregister(false) }}>注册成功？前往登录</a>
                    </div>
                </div>
            </Popup>

            <Popup
                visible={updatauserinfo}
                onMaskClick={() => {
                    setupdatauserinfo(false)
                }}
                bodyStyle={{ height: '40vh' }}
            >
                <div className={styles.update}>
                    <Form layout='horizontal' mode='card'>
                        <Form.Header>更改个人信息</Form.Header>
                        <Form.Item label='昵称' name='昵称'>
                            <Input placeholder='请输入' onChange={(value) => { setnickname(value) }} />
                        </Form.Item>
                        <Form.Item label='手机号' name='phonenumber'>
                            <Input placeholder='请输入' onChange={(value) => { setphone(value) }} />
                        </Form.Item>
                        <Form.Item label='姓名' name='性别'>
                            <Radio.Group onChange={(value) => { setgender(value) }}>
                                <Space>
                                    <Radio value='1'>男</Radio>
                                    <Radio value='2'>女</Radio>
                                </Space>

                            </Radio.Group>
                        </Form.Item>
                        <Form.Item label='用户头像（此功能尚未完善，无法更新头像）'>

                        </Form.Item>
                        <ImageUploader
                            value={fileList}
                            onChange={setFileList}
                            upload={mockUpload}
                            multiple
                            maxCount={1}
                            showUpload={fileList.length < maxCount}
                            onCountExceed={exceed => {
                                Toast.show(`最多选择 ${maxCount} 张图片，你多选了 ${exceed} 张`)
                            }}
                        />
                        <Form.Header />
                    </Form>
                    <div className={styles.btn}>
                        <Button block color='primary' size='large' onClick={updateinfo}>
                            上传
                        </Button>
                    </div>
                </div>

            </Popup>

        </div>
    )
}
