import React from 'react'
import { SpinLoading, DotLoading } from 'antd-mobile'
import styles from './index.module.scss'


interface props {
    isLoading: boolean
    title?: string
}
export default function Loading(props: props) {

    const { isLoading, title } = props

    return (
        <div>
            {/* 加载圈 */}
            <div className={[styles.loading, isLoading ? '' : styles.finishLoading].join(' ')} >
                <SpinLoading color='#fff' />
                <div style={{ color: '#fff' }}>
                    <DotLoading color='currentColor' />
                    <span>{title || '加载中'}</span>
                </div>
            </div>
        </div>
    )
}
