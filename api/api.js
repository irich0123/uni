import {myRequest} from '@/utils/api'

/**
 * 获取当前用户所在Region, 根据IP地址获取
 */
export const parseRegionSimple = (params) => {
    return myRequest({
        url: '/baseapi/locationController/parse/region/simple/on/ip',
        method: 'POST',
        silent: 1,
		catch: 1,
        data: params
    })
}

/**
 * 使用城市名称换取城市编码
 */
export const parseRegionByShortAddress = (params) => {
    return myRequest({
        url: '/baseapi/divisionsController/parseRegionByShortAddress',
        method: 'POST',
        silent: 1,
        data: params
    })
}

/**
 * 使用全地址查找地址编码 fullAddress="上海,市辖,浦东"
 */
export const parseRegionByFullAddress = (params) => {
    return myRequest({
        url: '/baseapi/divisionsController/parseRegionByFullAddress',
        method: 'POST',
        silent: 1,
        data: params
    })
}

/**
 * 获取登录验证码
 */
export const getSmsCode = (params) => {
    return myRequest({
        url: '/smsapi/smsController/getSmsCode',
        method: 'POST',
        data: params
    })
}



/**
 * 获取所有行业
 */
export const getIndustryAll = () => {
    return myRequest({
        url: '/baseapi/industry/query',
        method: 'POST',
        data: {}
    })
}
