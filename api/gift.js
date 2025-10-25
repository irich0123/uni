import {myRequest} from '@/utils/api'


/**
 * 按条件获取礼品分页
 */
export const filterPagedGiftList = (param) => {
    return myRequest({
        url: '/giftapi/giftController/filterPagedGiftList',
        method: 'POST',
        data: param
    })
}

/**
 * 添加礼品到购物车
 */
export const addGiftsToCart = (param) => {
    return myRequest({
        url: '/giftapi/cartController/addGiftsToCart',
        method: 'POST',
        data: param
    })
}

/**
 * 获取礼品详情
 */
export const getGiftById = (param) => {
    return myRequest({
        url: '/giftapi/giftController/getGiftById',
        method: 'POST',
        data: param
    })
}

/**
 * 获取礼品详情
 */
export const getPagedMyCart = (param) => {
    return myRequest({
        url: '/giftapi/cartController/getCartResponseByUserId',
        method: 'POST',
        data: param
    })
}

/**
 * 更新购物车
 */
export const updateCartComplete = (param) => {
    return myRequest({
        url: '/giftapi/cartController/updateCartComplete',
        method: 'POST',
        data: param
    })
}

/**
 * 结算 （购物车转订单）
 */
export const createOrderFromCart = (param) => {
    return myRequest({
        url: '/giftapi/orderController/createOrderFromCart',
        method: 'POST',
        data: param
    })
}

/**
 * 更新单个商品
 */
export const updateCartItem = (param) => {
    return myRequest({
        url: '/giftapi/cartController/updateCartDetail',
        method: 'POST',
        silent: 1,
        data: param
    })
}

/**
 * 获取订单信息
 */
export const getOrderResponseById = (param) => {
    return myRequest({
        url: '/giftapi/orderController/getOrderResponseById',
        method: 'POST',
        data: param
    })
}

/**
 * 设置发货地址
 */
export const setShippingAddress = (param) => {
    return myRequest({
        url: '/giftapi/orderController/setShippingAddress',
        method: 'POST',
        data: param
    })
}

/**
 * 提交支付密码
 */
export const payOrderByGoldBean = (param) => {
    return myRequest({
        url: '/giftapi/orderController/payOrderByGoldBean',
        method: 'POST',
        data: param
    })
}

/**
 * 提交支付密码
 */
export const getPagedMyShopping = (param) => {
    return myRequest({
        url: '/giftapi/orderController/filterPagedOrderResponseList',
        method: 'POST',
        data: param
    })
}
