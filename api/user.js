import Vue from 'vue'
import {myRequest} from '@/utils/api'

Vue.prototype.$myRequest = myRequest;


////////////////基本信息////////////////////////////


/**
 * 匿名获取用户信息
 */
export const getUserInfoByUserId = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/getUserInfoByUserId',
        method: 'POST',
        data: param
    })
}


/**
 * 获取用户信息
 */
export const getPerDetailsInfo = () => {
    return myRequest({
        url: '/userapi/userInfoController/getPerDetailsInfo',
        method: 'POST',
        data: {}
    })
}

////////////////用户登录登出////////////////////////////
/**
 * 用户登录
 */
export const userLogin = (params) => {
    return myRequest({
        url: '/userapi/userInfoController/userLogin',
        method: 'POST',
        data: params
    })
}

/**
 * 用户登出
 */
export const userLogout = () => {
    return myRequest({
        url: '/userapi/userInfoController/userLogout',
        method: 'POST',
        data: {}
    })
}


/**
 * 用户是否申请注销
 */
export const userCancelCheck = () => {
    return myRequest({
        url: '/userapi/userInfoController/checkCancellation',
        method: 'POST',
        data: {}
    })
}


/**
 * 用户注销
 */
export const userLogoff = () => {
    return myRequest({
        url: '/userapi/userInfoController/doCancellation',
        method: 'POST',
        data: {}
    })
}



////////////////用户相册////////////////////////////
/**
 * 获取相册分页列表
 */
export const filterPagedAlbumList = (params) => {
    return Vue.prototype.$myRequest({
        url: '/userapi/album/filter',
        method: 'POST',
        data: params
    })
}

/**
 * 获取所有相册类型
 */
export const getAlbumTypeAllValid = () => {
    return Vue.prototype.$myRequest({
        url: '/userapi/album/type/list',
        method: 'POST',
        data: null,
        header: {}
    })
}


/**
 * 获取相册详情
 */
export const getAlbumResponseById = (params) => {
    return Vue.prototype.$myRequest({
        url: '/userapi/album/info',
        method: 'POST',
        data: params
    })
}

/**
 * 相册数量
 */
export const countAlbums = (params) => {
    return Vue.prototype.$myRequest({
        url: '/userapi/album/count',
        method: 'POST',
        data: params
    })
}

/**
 * 添加相册
 */
export const createAlbum = (params) => {
    return Vue.prototype.$myRequest({
        url: '/userapi/album/create',
        method: 'POST',
        data: params
    })
}

/**
 * 更新相册
 */
export const updateAlbum = (params) => {
    return Vue.prototype.$myRequest({
        url: '/userapi/album/update',
        method: 'POST',
        data: params
    })
}

/**
 * 删除相册
 */
export const deleteAlbum = (params) => {
    return Vue.prototype.$myRequest({
        url: '/userapi/album/delete',
        method: 'POST',
        data: params
    })
}


/**
 * 获取相片分页列表
 */
export const filterPagedAlbumItemList = (params) => {
    return Vue.prototype.$myRequest({
        url: '/userapi/album/item/filter',
        method: 'POST',
        data: params
    })
}

/**
 * 添加相片
 */
export const createAlbumItem = (params) => {
    return Vue.prototype.$myRequest({
        url: '/userapi/album/item/create',
        method: 'POST',
        data: params
    })
}

/**
 * 删除相片
 */
export const deleteAlbumItem = (params) => {
    return Vue.prototype.$myRequest({
        url: '/userapi/album/item/delete',
        method: 'POST',
        data: params
    })
}

/////////////////////用户地址/////////////////////

/**
 * 获取用户地址列表
 */
export const filterAddress = (params) => {
    return myRequest({
        url: '/commonapi/user/address/filter',
        method: 'POST',
        data: params,
		catch: 1,
    })
}

export const queryAddress = (params) => {
    return myRequest({
        url: '/commonapi/user/address/query',
        method: 'POST',
        data: params,
    })
}

/**
 * 删除用户地址详情
 */
export const deleteAddress = (params) => {
    return myRequest({
        url: '/commonapi/user/address/delete',
        method: 'POST',
        data: params
    })
}

/**
 * 添加用户地址详情
 */
export const createAddress = (params) => {
    return myRequest({
        url: '/commonapi/user/address/add',
        method: 'POST',
        data: params
    })
}

/**
 * 更新用户地址详情
 */
export const updateAddress = (params) => {
    return myRequest({
        url: '/commonapi/user/address/edit',
        method: 'POST',
        data: params
    })
}

/**
 * 获取用户地址详情
 */
export const getAddressDetailById = (params) => {
    return myRequest({
        url: '/commonapi/user/address/info',
        method: 'POST',
        data: params
    })
}


/**
 * 获取用户的一个首选地址
 */
export const getPrimaryAddressByUserId = (params) => {
    return myRequest({
        url: '/commonapi/user/by/userId',
        method: 'POST',
        silent: true,
        data: params
    })
}


////////////////////用户密码///////////////////////

/**
 * 是否有设置支付密码
 */
export const hasPassword = () => {
    return myRequest({
        url: '/userapi/userAccountController/hasPassword',
        method: 'POST',
        data: {}
    })
}

/**
 * 校验支付密码
 */
export const verUserPassword = (params) => {
    return myRequest({
        url: '/userapi/userAccountController/verUserPassword',
        method: 'POST',
        data: params
    })
}

/**
 * 设置支付密码 (用验证码设置的，也调用这个接口)
 */
export const setPassword = (params) => {
    return myRequest({
        url: '/userapi/userAccountController/setPassword',
        method: 'POST',
        data: params
    })
}

////////////////////认证///////////////////////

/**
 * 获取个人认证信息
 */
export const getPerAuthInfo = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/getPerAuthInfo',
        method: 'POST',
        data: param,
		silent: 1,
    })
}

/**
 * 个人认证长传
 */
export const uploadPerAuthInfo = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/uploadPerAuthInfo',
        method: 'POST',
        catch: 1,
        data: param
    })
}



/**
 * 获取企业认证信息
 */
export const getComAuthInfo = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/getComAuthInfo',
        method: 'POST',
        data: param,
		silent: 1,
    })
}


/**
 * 企业认证长传
 */
export const uploadComAuthInfo = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/uploadComAuthInfo',
        method: 'POST',
        data: param,
        catch: 1
    })
}


////////////////////领金豆任务///////////////////////

/**
 * 获取任务列表
 */
export const getTasksList = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/getTasksList',
        method: 'POST',
        data: param
    })
}

/**
 * 领取任务
 */
export const pickupTask = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/receiveTask',
        method: 'POST',
        data: param
    })
}

/**
 * 获取分享信息
 */
export const queryShareTemplate = (param) => {
    return myRequest({
        url: '/userapi/share/template/query',
        method: 'POST',
        data: param
    })
}

/**
 * 获取分享信息
 */
export const recordShareTasknonH5 = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/recordShareTask/nonH5',
        method: 'POST',
        data: param
    })
}

/**
 * 金豆码换金豆
 */
export const beanCouponExchange = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/beanExchange',
        method: 'POST',
		catch:1,
        data: param
    })
}

////////////////////企业展台///////////////////////

/**
 * 开关是否展示企业信息给他人
 */
export const updateEnterpriseInfo = (param) => {
    return myRequest({
        url: '/userapi/userEnterpriseInfoController/updateEnterpriseInfo',
        method: 'POST',
        data: param
    })
}


/**
 * 企业展台（非自己的）
 */
export const getEnterpriseInfoByUserId = (param) => {
    return myRequest({
        url: '/userapi/userEnterpriseInfoController/getEnterpriseInfoByUserId',
        method: 'POST',
        data: param
    })
}

/**
 * 企业展台（自己的）
 */
export const getPerEnterpriseInfo = () => {
    return myRequest({
        url: '/userapi/userEnterpriseInfoController/getPerEnterpriseInfo',
        method: 'POST',
        data: {}
    })
}

/**
 * 企业展台分页列表
 */
export const filterEnterprise = (param) => {
    return myRequest({
        url: '/userapi/userEnterpriseInfoController/filterPagedEnterpriseInfoList',
        method: 'POST',
        data: param
    })
}

/**
 * 匿名获取企业展台信息
 */
export const getTemporaryEnterpriseInfoById = (param) => {
    return myRequest({
        url: '/userapi/userEnterpriseInfoController/getTemporaryEnterpriseInfoById',
        method: 'POST',
        data: param
    })
}

////////////////////第三方登录///////////////////////

/**
 * 我的有效的第三方登录信息
 */
export const getMyValidThirdPartyBindInfo = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/getMyValidThirdPartyBindInfo',
        method: 'POST',
        data: param,
		silent: 1,
    })
}

/**
 * 登录
 */
export const thirdPartyLogin = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/userThirdPartyLogin',
        method: 'POST',
        data: param
    })
}

/**
 * 苹果登录
 */
export const iosUserVerify = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/iosUserVerify',
        method: 'POST',
        data: param
    })
}

/**
 * 绑定
 */
export const thirdPartyBind = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/userThirdPartyBinding',
        method: 'POST',
        data: param
    })
}

/**
 * 解绑
 */
export const thirdPartyUnBind = (param) => {
    return myRequest({
        url: '/userapi/userInfoController/userThirdPartyUnBinding',
        method: 'POST',
        data: param
    })
}


////////////////////账户信息///////////////////////

/**
 * 资金账户情况
 */
export const getUserAccountInfoByUserId = (param) => {
    return myRequest({
        url: '/userapi/userAccountController/info/userId',
        method: 'POST',
        data: param
    })
}


////////////////////订阅消息///////////////////////

export const briefSubscribeTemplate = (param) => {
    return myRequest({
        url: '/userapi/subscribe/template/brief',
        method: 'POST',
        data: param
    })
}


export const updateSubscribeTemplate = (param) => {
    return myRequest({
        url: '/userapi/subscribe/template/update',
        method: 'POST',
        data: param
    })
}


////////////////////信息分享///////////////////////

/**
 * InfoShare详情
 */
export const infoInfoShare = (param) => {
    return myRequest({
        url: '/userapi/infoShareController/info',
        method: 'POST',
        data: param
    })
}

/**
 * 按条件获取承接信息
 */
export const createInfoShareRecord = (param) => {
    return myRequest({
        url: '/userapi/infoShareController/info/share/record/new',
        method: 'POST',
        silent: 1,
        data: param
    })
}



/**
 * 获取分享奖励规则
 */
export const getInfoShareRuleList = () => {
    return myRequest({
        url: '/userapi/infoShareController/getInfoShareRuleList',
        method: 'POST',
        data: {}
    })
}

/**
 * 分享成功回调
 */
export const createInfoShare = (param) => {
    return myRequest({
        url: '/userapi/infoShareController/createInfoShare',
        method: 'POST',
        silent: 1,
        data: param
    })
}

export const adminLogin = (data) => {
    return myRequest({
        url: '/adminapi/admin/user/info/login',
        method: 'post',
		silent: 1,
        data
    })
}
