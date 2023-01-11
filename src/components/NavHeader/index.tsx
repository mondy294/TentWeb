import React from 'react'
import { NavBar, Toast } from 'antd-mobile'
import { useNavigate, useLocation } from 'react-router-dom'

import './index.scss'


interface goback {
    (): any;
}

interface props {
    color?: string
    size?: string
    fontcolor?: string
    title?: string
    fun?: goback
}
export default function NavHeader(props: props) {

    const navigate = useNavigate()
    const { color, size, fontcolor, title, fun } = props


    function back() {
        navigate(-1)
    }
    return (
        <div className='nav_content' style={{ backgroundColor: color, fontSize: size, color: fontcolor }}>
            <NavBar back='返回' onBack={fun || back} >
                <span className='nav_title' style={{ fontSize: size, color: fontcolor }}>
                    {title}
                </span>

            </NavBar>
        </div>

    )
}
