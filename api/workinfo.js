import {myRequest} from '@/utils/api'

/**
 * 获取最新活信息和承接信息
 */
export const getRecommendList = (params) => {
    return myRequest({
        url: '/workinfoapi/workInfoController/getRecommendList',
        method: 'POST',
        data: params
    })
}




/**
 * 获取外发信息电话号码
 */
export const contactReleaseWork = (params) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/contact/new',
        method: 'POST',
        data: params,
        silent: 1,
        catch: 1
    })
}

/**
 * 我收藏的外发
 */
export const getMarkedList0 = (params) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/marked/filter',
        method: 'POST',
        data: params
    })
}

/**
 * 我收藏的承接
 */
export const getMarkedList1 = (params) => {
    return myRequest({
        url: '/workinfoapi/workOrderController/marked/filter',
        method: 'POST',
        data: params
    })
}

/**
 * 获取承接信息电话号码
 */
export const contactWorkOrder = (params) => {
    return myRequest({
        url: '/workinfoapi/workOrderController/contact/new',
        method: 'POST',
        data: params
    })
}

/**
 * 按条件获取外发活信息
 */
export const filterReleaseWork = (param) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/filter',
        method: 'POST',
        data: param
    })
}

/**
 * 外发活详情
 */
export const createCheckReleaseWork = (param) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/check/new',
        method: 'POST',
        data: param
    })
}

/**
 * 发布或编辑活详情
 */
export const postReleaseWork = (param,) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/releaseWork',
        method: 'POST',
        catch: 1,
        data: param
    })
}

/**
 * 发布或编辑承接信息
 */
export const postWorkOrder = (param) => {
    return myRequest({
        url: '/workinfoapi/workOrderController/releaseWorkOrder',
        method: 'POST',
        catch: 1,
        data: param
    })
}

/**
 * 承接详情
 */
export const createCheckWorkOrder = (param) => {
    return myRequest({
        url: '/workinfoapi/workOrderController/check/new',
        method: 'POST',
        data: param,
    })
}

/**
 * 外发活详情
 */
export const filterContactReleaseWork = (param) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/contact/filter',
        method: 'POST',
        data: param
    })
}


/**
 * 承接信息被联系列表
 */
export const filterContactWorkOrder = (param) => {
    return myRequest({
        url: '/workinfoapi/workOrderController/contact/filter',
        method: 'POST',
        data: param
    })
}

/**
 * 外发活详情,匿名获取
 */
export const getReleaseWorkDetailsByIdAnon = (param) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/getReleaseWorkDetailsByIdAnon',
        method: 'POST',
        data: param
    })
}


/**
 * 承接详情,匿名获取
 */
export const getWorkOrderDetailsByIdAnon = (param) => {
    return myRequest({
        url: '/workinfoapi/workOrderController/getWorkOrderDetailsByIdAnon',
        method: 'POST',
        data: param
    })
}

/**
 * 收藏活信息
 */
export const addMarkReleaseWork = (param) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/addMark',
        method: 'POST',
        catch: 1,
        data: param
    })
}

/**
 * 取消收藏活信息
 */
export const cancelMarkReleaseWork = (param) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/cancelMarked',
        method: 'POST',
        catch: 1,
        data: param
    })
}

/**
 * 分页获取外发活查看List
 */
export const filterCheckReleaseWork = (param) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/check/filter',
        method: 'POST',
        data: param
    })
}


/**
 * 分页获取承接查看List
 */
export const filterCheckWorkOrder = (param) => {
    return myRequest({
        url: '/workinfoapi/workOrderController/check/filter',
        method: 'POST',
        data: param
    })
}

/**
 * 收藏承接信息
 */
export const addMarkWorkOrder = (param) => {
    return myRequest({
        url: '/workinfoapi/workOrderController/addMark',
        method: 'POST',
        data: param
    })
}

/**
 * 取消收藏承接信息
 */
export const cancelMarkWorkOrder = (param) => {
    return myRequest({
        url: '/workinfoapi/workOrderController/cancelMarked',
        method: 'POST',
        data: param
    })
}



/**
 * 外发活信息下架
 */
export const offReleaseWork = (param) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/off',
        method: 'POST',
        data: param
    })
}

/**
 * 外发活信息上架
 */
export const onReleaseWork = (param) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/on',
        method: 'POST',
        data: param
    })
}

/**
 * 收藏活信息
 */
export const confirmTaskWork = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/confirmTaskWork',
        method: 'POST',
        data: param,
    })
}

/**
 * 外发活信息审核失败原因
 */
export const getFailureReasonReleaseWork = (param) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/getFailureReason',
        method: 'POST',
        data: param
    })
}

/**
 * 承接信息审核失败原因
 */
export const getFailureReasonWorkOrder = (param) => {
    return myRequest({
        url: '/workinfoapi/workOrderController/getFailureReason',
        method: 'POST',
        data: param
    })
}


/**
 * 活信息 猜你喜欢
 */
export const guessULikeReleaseWork = (param) => {
    return myRequest({
        url: '/workinfoapi/releaseWorkController/guessULike',
        method: 'POST',
        silent: 1,
        catch: 1,
        data: param
    })
}

/**
 * 承接信息 猜你喜欢
 */
export const guessULikeWorkOrder = (param) => {
    return myRequest({
        url: '/workinfoapi/workOrderController/guessULike',
        method: 'POST',
        silent: 1,
        data: param
    })
}

/**
 * 按条件获取承接信息
 */
export const filterWorkOrder = (param) => {
    return myRequest({
        url: '/workinfoapi/workOrderController/filter',
        method: 'POST',
        data: param
    })
}

/**
 * 按条件获取外发报价信息
 */
export const filterWorkInfoOffer = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoOfferController/filter',
        method: 'POST',
        data: param
    })
}

/**
 * 外发报价详情
 */
export const getWorkInfoOfferById = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoOfferController/info',
        method: 'POST',
        data: param
    })
}

/**
 * 添加和修改外发报价
 */
export const createWorkInfoOffer = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoOfferController/submitWorkInfoOffer',
        method: 'POST',
        data: param
    })
}



/**
 * 获取我的加工交易签约
 */
export const filterMyContract = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/filter',
        method: 'POST',
        data: param
    })
}

/**
 * 获取我的加工交易签约
 */
export const deleteContract = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/deleteContract',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 确认
 */
export const confirmContract = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/confirm',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易取消申请
 */
export const cancelContractApply = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/uploadCancelContractApply',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易撤销确认
 */
export const operateCancelContractApply = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/operateCancelContractApply',
        method: 'POST',
        data: param
    })
}


/**
 * 加工交易各种催促
 */
export const doUrgeAnything = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/doUrge',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 发样品
 */
export const deliverSample = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/sendSimpleDemo',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 发货
 */
export const deliverMaterial = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/sendMaterial',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 发货
 */
export const deliverProduct = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/sendProduct',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 样品验收
 */
export const confirmSample = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/confirmReceiveSimpleDemo',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 成品验收
 */
export const confirmGoods = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/confirmReceiveProduct',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 付款凭证上传
 */
export const uploadPayVoucher = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/uploadPayVoucher',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 收货
 */
export const acceptProduct = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/acceptProduct',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 生产完成
 */
export const completedProduct = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/completedProduct',
        method: 'POST',
        data: param
    })
}



/**
 * 加工交易 详情
 */
export const getContractRecord = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/getContractRecord',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 支付保证金
 */
export const payDeposit = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/payDeposit',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 确认收到材料
 */
export const confirmReceiveMaterial = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/confirmReceiveMaterial',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 延期申请提交
 */
export const uploadDelayApply = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/uploadDelayApply',
        method: 'POST',
        data: param
    })
}

/**
 * 初始化加工交易
 */
export const initContract = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/initContract',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 延期申请检查，根据交易编号查
 */
export const checkDelayApply = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/checkDelayApply',
        method: 'POST',
		silent: 1,
		catch: 1,
        data: param
    })
}

/**
 * 加工交易 延期申请 处理
 */
export const operateDelayApply = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/operateDelayApply',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 提交仲裁
 */
export const applyArbitration = (param) => {
    return myRequest({
        url: '/workinfoapi/contractArbitrationController/applyArbitration',
        method: 'POST',
        data: param
    })
}

/**
 * 加工交易 评价对方
 */
export const doEvaluate = (param) => {
    return myRequest({
        url: '/workinfoapi/workInfoContractController/doEvaluate',
        method: 'POST',
        data: param
    })
}

