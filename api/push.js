import {myRequest} from '@/utils/api'

/**
 * 消息列表
 */
export const filterPushBean = (param) => {
    return myRequest({
        url: '/pushapi/push/bean/filter',
        method: 'POST',
        data: param
    })
}

/**
 * Code换取openId
 */
export const getOpenIdByCode = (params) => {
    return myRequest({
        url: '/pushapi/tokenController/getOpenIdByCode',
        method: 'GET',
        silent: 1,
        data: params
    })
}

/**
 * 是否关注公众号
 */
export const wxMPSubscribeInfoCheck = (params) => {
    return myRequest({
        url: '/pushapi/tokenController/getWxSubscribeInfo',
        method: 'POST',
        silent: 1,
        data: params,
    })
}

/**
 * 微信公众号定位配置
 */
export const getWxLocationConfig = (params) => {
    return myRequest({
        url: '/pushapi/tokenController/getWxLocationConfig',
        method: 'GET',
        silent: 1,
        data: params
    })
}

