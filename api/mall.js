import {myRequest} from '@/utils/api'


/**
 * 商品审核失败原因
 */
export const getFailureReasonCommodity = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/getAuditFailureReason',
        method: 'POST',
        data: param
    })
}


/**
 * 商品删除
 */
export const deleteCommodity = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/deleteCommodity',
        method: 'POST',
        data: param
    })
}

/**
 * 商品上架 下架
 */
export const onOffCommodity = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/commodityPullOffOrPutOnShelves',
        method: 'POST',
        data: param
    })
}

/**
 * 商品取消审核
 */
export const cancelCommodity = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/commodityCancelAudit',
        method: 'POST',
        data: param
    })
}

/**
 * 商品取消审核
 */
export const commodityPostRefund = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/commodityPostRefund',
        method: 'POST',
        data: param
    })
}

/**
 * 商品收藏
 */
export const setCommodityMarkedOn = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/setCommodityMarkedOn',
        method: 'POST',
        data: param
    })
}


/**
 * 按条件获取商品信息
 */
export const filterCommodity = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/getPagedCommodityList',
        method: 'POST',
        data: param
    })
}

/**
 * 获取商品详情
 */
export const getCommodityById = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/getCommodityById',
        method: 'POST',
        data: param
    })
}

/**
 * 商品发布
 */
export const postCommodity = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/addCommodity',
        method: 'POST',
        catch: 1,
        data: param
    })
}

/**
 * 商品修改
 */
export const updateCommodity = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/editCommodity',
        method: 'POST',
        catch: 1,
        data: param
    })
}


/**
 * 商品取消收藏
 */
export const setCommodityMarkedOff = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/setCommodityMarkedOff',
        method: 'POST',
        data: param
    })
}

/**
 * 商品取消收藏
 */
export const getPaymentForCommodityPost = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/getPaymentForCommodityPost',
        method: 'POST',
        data: param
    })
}

/**
 * 商品取消收藏
 */
export const getCommodityExtendShowTimeCost = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/getCommodityExtendShowTimeCost',
        method: 'POST',
        data: param
    })
}

/**
 * 我收藏的尾货
 */
export const getMarkedList2 = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/filerPagedCommodityMarked',
        method: 'POST',
        data: param
    })
}

/**
 * 我的商品交易列表
 */
export const getPagedClusterTransactionList = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/getPagedClusterTransactionList',
        method: 'POST',
        data: param
    })
}

/**
 * 买家提醒卖家确认收到退货
 */
export const promptConfirmDeliveryTransaction = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/promptConfirmDeliveryTransaction',
        method: 'POST',
        data: param
    })
}

/**
 * 提交发货信息
 */
export const deliveryGoodsTransaction = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/deliveryGoodsTransaction',
        method: 'POST',
        data: param
    })
}

/**
 * 商品购买权限
 */
export const getPrivilegeInfo = (param) => {
    return myRequest({
        url: '/mallapi/PrivilegeController/getPrivilegeInfo',
        method: 'POST',
        data: param
    })
}


/**
 * 商品交易下单
 */
export const createTransaction = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/createTransaction',
        method: 'POST',
        data: param
    })
}

/**
 * 商品交易下单
 */
export const getTransactionById = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/getTransactionById',
        method: 'POST',
        data: param
    })
}

/**
 * 商品交易刷新
 */
export const refreshTransaction = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/refreshTransactionById',
        method: 'POST',
        data: param
    })
}

/**
 * 买家是否同意赔偿协议
 */
export const reparationConfirmTransaction = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/reparationConfirmTransaction',
        method: 'POST',
        data: param
    })
}

/**
 * 获取订单取消协议（赔偿信息）
 */
export const getReparationByTransactionId = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/getReparationByTransactionId',
        method: 'POST',
		silent: 1,
        data: param
    })
}

/**
 * 卖家催买家付款提醒
 */
export const promptPaymentTransaction = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/promptPaymentTransaction',
        method: 'POST',
        data: param
    })
}

/**
 * 卖家同意价格修改
 */
export const confirmTransactionBySeller = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/confirmTransactionBySeller',
        method: 'POST',
        data: param
    })
}

/**
 * 卖家修改价格条款
 */
export const amendTransactionCondition = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/amendTransactionCondition',
        method: 'POST',
        data: param
    })
}

/**
 * 发起者关闭争议
 */
export const closeDisputeByInitiator = (param) => {
    return myRequest({
        url: '/mallapi/disputeController/closeDisputeByInitiator',
        method: 'POST',
        data: param
    })
}

/**
 * 根据交易id获取争议信息
 */
export const getDisputeByTransactionId = (param) => {
    return myRequest({
        url: '/mallapi/disputeController/getDispute',
        method: 'POST',
        silent: 1,
        catch: 1,
        data: param
    })
}

/**
 * 根据交易id获取争议信息
 */
export const getPagedDisputeLogList = (param) => {
    return myRequest({
        url: '/mallapi/disputeController/getPagedDisputeLogList',
        method: 'POST',
        data: param
    })
}

/**
 * 争议提交
 */
export const addDispute = (param) => {
    return myRequest({
        url: '/mallapi/disputeController/addDispute',
        method: 'POST',
        data: param,
    })
}

/**
 * 获取承运商列表
 */
export const getCarrierList = () => {
    return myRequest({
        url: '/mallapi/carrierController/getCarrierList',
        method: 'GET',
        data: {}
    })
}

/**
 * 获取仲裁信息
 */
export const getArbitrationByTransactionId = (param) => {
    return myRequest({
        url: '/mallapi/arbitrationController/getArbitrationByTransactionId',
        method: 'POST',
        data: param
    })
}

/**
 * 获取仲裁信息
 */
export const receiveGoodsConfirmTransaction = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/receiveGoodsConfirmTransaction',
        method: 'POST',
        data: param
    })
}

/**
 * 延迟收货
 */
export const extendReceiveGoodsConfirmationTransaction = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/extendReceiveGoodsConfirmationTransaction',
        method: 'POST',
        data: param
    })
}

/**
 * 获取物流信息
 */
export const getMappedDeliveryByTransactionId = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/getMappedDeliveryByTransactionId',
        method: 'POST',
        data: param
    })
}

/**
 * 获取物流信息
 */
export const promptDeliveryTransaction = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/promptDeliveryTransaction',
        method: 'POST',
        data: param
    })
}

/**
 * 获取物流信息
 */
export const deleteTransaction = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/deleteTransaction',
        method: 'POST',
        data: param
    })
}

/**
 * 给卖家发确单提醒
 */
export const orderConfirmPush = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/orderConfirmPush',
        method: 'POST',
        data: param
    })
}

/**
 * 去结算按钮
 */
export const checkStockTransaction = (param) => {
    return myRequest({
        url: "/mallapi/transactionController/checkStockTransaction",
        method: 'POST',
        data: param
    })
}

/**
 * 取消交易
 */
export const cancelTransaction = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/cancelTransaction',
        method: 'POST',
        data: param
    })
}

/**
 * 确认提交取消订单赔偿
 */
export const reparationClaimTransaction = (param) => {
    return myRequest({
        url: '/mallapi/transactionController/reparationClaimTransaction',
        method: 'POST',
        catch: 1,
        data: param
    })
}


/**
 * 获取商品信息分享配置
 */
export const getCommodityShareContent = (param) => {
    return myRequest({
        url: '/mallapi/commodityController/getShareContent',
        method: 'POST',
        silent: 1,
        data: param
    })
}


///////////////通知//////////////////////////

/**
 * 获取商品信息分享配置
 */
export const getNotifyConfigByCode = (param) => {
    return myRequest({
        url: '/mallapi/notify/config/info/code',
        method: 'POST',
        silent: 1,
        data: param
    })
}
