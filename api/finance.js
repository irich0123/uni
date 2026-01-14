import Vue from 'vue'
import {
	myRequest
} from '@/utils/api'

Vue.prototype.$myRequest = myRequest;


////////////////////财务信息///////////////////////

/**
 * 查看有没有银行卡
 */
export const getUserBankInfo = () => {
	return myRequest({
		url: '/commonapi/user/account/bank/view',
		method: 'POST',
		data: {}
	})
}


/**
 * 显示账户明细
 */
export const getAccountRecordList = (params) => {
	return myRequest({
		url: '/userapi/userAccountController/getAccountRecordList',
		method: 'POST',
		data: params
	})
}

/**
 * 银行卡分页列表
 */
export const filterAccountBank = (params) => {
	return myRequest({
		url: '/commonapi/user/account/bank/filter',
		method: 'POST',
		data: params
	})
}

/**
 * 银行卡 删除
 */
export const deleteAccountBank = (params) => {
	return myRequest({
		url: '/commonapi/user/account/bank/delete',
		method: 'POST',
		data: params
	})
}

/**
 * 银行卡 修改
 */
export const updateAccountBank = (params) => {
	return myRequest({
		url: '/commonapi/user/account/bank/update',
		method: 'POST',
		data: params
	})
}

/**
 * 银行卡 新建
 */
export const createAccountBank = (params) => {
	return myRequest({
		url: '/commonapi/user/account/bank/save',
		method: 'POST',
		data: params
	})
}

/**
 * 银行卡 详情
 */
export const getAccountBankById = (params) => {
	return myRequest({
		url: '/commonapi/user/account/bank/info',
		method: 'POST',
		data: params
	})
}

/**
 * 银行卡列表
 */
export const getAccountBankList = () => {
	return myRequest({
		url: '/commonapi/user/account/bank/list',
		method: 'POST',
		data: {}
	})
}

/**
 * 现金 提现到银行卡
 */
export const withDrawCash = (params) => {
	return myRequest({
		url: '/commonapi/user/account/cash',
		method: 'POST',
		data: params
	})
}



/**
 * 支付统一接口
 */
export const payAny = (param) => {
	return myRequest({
		url: '/orderapi/payController/pay',
		method: 'POST',
		data: param,
		catch: 1
	})
}

/**
 * 获取支付状态
 */
export const getPayOrderStatus = (param) => {
	return myRequest({
		url: '/orderapi/payController/getPayOrderStatus',
		method: 'POST',
		silent: 1, //测试时，为0，正式版改为1
		data: param
	})
}

/**
 * 苹果支付验证
 */
export const iapPayVerify = (param) => {
	return myRequest({
		url: '/orderapi/payController/applePayCallBack',
		method: 'POST',
		data: param
	})
}

/**
 * 获取最近支付订单
 */
export const queryPayOrder = (param) => {
	return myRequest({
		url: '/orderapi/payController/query',
		method: 'POST',
		silent: 0,
		data: param
	})
}

/**
 * 获取某人的金豆购买规则，每个人的权限不同
 */
export const getBeanPriceRule = () => {
	return myRequest({
		url: '/orderapi/beanCardController/price/rule',
		method: 'POST',
		silent: 1,
		data: {}
	})
}


/**
 * 获取尾货通卡售价列表
 */
export const getTailCardListAndroid = () => {
	return myRequest({
		url: '/orderapi/tailCardController/getOnShelfTailCardList',
		method: 'POST',
		data: {}
	})
}

/**
 * 获取金豆卡售价列表苹果端
 */
export const getTailCardListIos = () => {
	return myRequest({
		url: '/orderapi/tailCardController/getTailCardListIOS',
		method: 'POST',
		data: {}
	})
}

/**
 * 获取金豆卡售价列表
 */
export const getBeanCardListAndroid = () => {
	return myRequest({
		url: '/orderapi/beanCardController/getBeanCardList',
		method: 'POST',
		data: {}
	})
}

/**
 * 获取金豆和金豆卡售价列表
 */
export const getBeanGoodsListAndroid = () => {
	return myRequest({
		url: '/orderapi/beanCardController/goods/android',
		method: 'POST',
		data: {}
	})
}

/**
 * 获取金豆卡售价列表苹果端
 */
export const getBeanCardListIos = () => {
	return myRequest({
		url: '/orderapi/beanCardController/getBeanCardListIOS',
		method: 'POST',
		data: {}
	})
}

/**
 * 获取金豆卡售价列表苹果端
 */
export const getBeanGoodsListIos = () => {
	return myRequest({
		url: '/orderapi/beanCardController/goods/ios',
		method: 'POST',
		data: {}
	})
}


/**
 * 获取我的金豆卡列表
 */
export const getMyBeanCardList = (param) => {
	return myRequest({
		url: '/orderapi/beanCardController/user/bean/card/filter',
		method: 'POST',
		data: param
	})
}

/**
 * 获取我的券
 */
export const getMyStickCoupons = (param) => {
	return myRequest({
		url: '/orderapi/stickController/coupons/filter',
		method: 'POST',
		data: param
	})
}

/**
 * 获取我的尾货通卡列表
 */
export const getMyTailCardList = (param) => {
	return myRequest({
		url: '/orderapi/tailCardController/user/tail/card/filter',
		method: 'POST',
		data: param
	})
}

/**
 * 获取金豆卡详情
 */
export const getBeanCardById = (param) => {
	return myRequest({
		url: '/orderapi/beanCardController/userBeanCard/info',
		method: 'POST',
		data: param
	})
}

/**
 * 获取尾货通卡详情
 */
export const getTailCardById = (param) => {
	return myRequest({
		url: '/orderapi/tailCardController/userTailCard/info',
		method: 'POST',
		data: param
	})
}

/**
 * 激活金豆卡
 */
export const activeBeanCard = (param) => {
	return myRequest({
		url: '/orderapi/beanCardController/activeBeanCard',
		method: 'POST',
		data: param
	})
}

/**
 * 激活尾货通卡
 */
export const activeTailCard = (param) => {
	return myRequest({
		url: '/orderapi/tailCardController/activeTailCard',
		method: 'POST',
		data: param
	})
}


////////////////////置顶///////////////////////

/**
 * 取消置顶
 */
export const cancelStickApply = (param) => {
	return myRequest({
		url: '/orderapi/stickController/cancelStickApply',
		method: 'POST',
		data: param
	})
}