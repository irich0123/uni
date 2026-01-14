import Vue from 'vue'
import {
	myRequest
} from '@/utils/api'

Vue.prototype.$myRequest = myRequest

/**
 * 公众号分享首页到公众号
 */
export const getHomePageShareConfig = () => {
	return myRequest({
		url: '/userapi/infoShareController/config/home/page',
		method: 'post',
		data: {},
		silent: 1
	})
}


//小程序分享详情页到公众号
export const getInfoPageShareConfigMini = (params) => {
	return myRequest({
		url: '/userapi/infoShareController/config/info/page/mini',
		method: 'post',
		data: params,
		silent: 1
	})
}

//APP分享详情页到小程序
export const getInfoPageShareConfigApp = (params) => {
	return myRequest({
		url: '/userapi/infoShareController/config/info/page/app',
		method: 'post',
		data: params,
		silent: 1
	})
}

/**
 * 公众号分享详情页到公众号
 */
export const getWorkInfoShareContent = (param) => {
    return myRequest({
        url: '/userapi/infoShareController/config/info/page',
        method: 'POST',
        silent: 1,
        data: param
    })
}

