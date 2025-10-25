import Vue from 'vue'
import {
	myRequest
} from '@/utils/api'

Vue.prototype.$myRequest = myRequest

/**
 * 根据infoId,InfoType获取微信分享配置信息 wxShareConfig
 */
export const getHomePageShareConfig = () => {
	return myRequest({
		url: '/userapi/infoShareController/config/home/page',
		method: 'post',
		data: {},
		silent: 1
	})
}

export const getInfoPageShareConfigMini = (params) => {
	return myRequest({
		url: '/userapi/infoShareController/config/info/page/mini',
		method: 'post',
		data: params,
		silent: 1
	})
}

/**
 * 获取外发承接信息分享配置
 */
export const getWorkInfoShareContent = (param) => {
    return myRequest({
        url: '/userapi/infoShareController/config/info/page',
        method: 'POST',
        silent: 1,
        data: param
    })
}

