import {myRequest} from '@/utils/api'

/**
 * 性别
 */
export const getAllGenderEnum = (params) => {
    return myRequest({
        url: '/userapi/basicController/getAllGenderEnum',
        method: 'GET',
        silent: 1,
        data: params
    })
}

/**
 * 用户认证级别
 */
export const getAllUserVerifyStatus = (params) => {
    return myRequest({
        url: '/userapi/basicController/getAllUserVerifyStatus',
        method: 'GET',
        silent: 1,
        data: params
    })
}


/**
 * 获取用户认证审核枚举值
 */
export const getUserAuditStatusEnum = () => {
    return myRequest({
        url: '/userapi/basicController/getAllUserAuditStatusEnum',
        method: 'GET',
        data: {}
    })
}


/**
 * 获取外发信息类型
 */
export const getAllReleaseWorkType = () => {
    return myRequest({
        url: '/workinfoapi/basicController/getAllReleaseWorkType',
        method: 'GET',
		silent: 1,
        data: {}
    })
}

/**
 * 获取承接信息状态类型
 */
export const getWorkOrderStatusEnum = () => {
    return myRequest({
        url: '/workinfoapi/basicController/getAllWorkOrderStatusEnum',
        method: 'GET',
        data: {}
    })
}

/**
 * 获取外发信息状态类型
 */
export const getReleaseWorkStatusEnum = () => {
    return myRequest({
        url: '/workinfoapi/basicController/getAllReleaseWorkStatusEnum',
        method: 'GET',
        data: {}
    })
}

/**
 * 获取置顶信息状态类型
 */
export const getStickApplyStatusEnum = () => {
    return myRequest({
        url: '/orderapi/basicController/getAllStickApplyStatusEnum',
        method: 'GET',
        data: {}
    })
}


/**
 * 获取商品分类类型
 */
export const getCommodityClassEnum = () => {
    return myRequest({
        url: '/mallapi/basicController/getCommodityClasses',
        method: 'GET',
        data: {}
    })
}


/**
 * 获取商品分类类型
 */
export const getCommodityTypeEnum = () => {
    return myRequest({
        url: '/mallapi/basicController/getCommodityTypes',
        method: 'GET',
        data: null,
        header: {}
    })
}

/**
 * 获取商品分类类型
 */
export const getCommoditySaleTypeEnum = () => {
    return myRequest({
        url: '/mallapi/basicController/getCommoditySaleTypeList',
        method: 'GET',
        data: null,
        header: {}
    })
}

/**
 * 获取投诉状态类型
 */
export const getComplaintStatus = () => {
    return myRequest({
        url: '/commonapi/basicController/getAllComplaintStatus',
        method: 'GET',
        data: null,
        header: {}
    })
}


/**
 * 获取意见反馈选项
 */
export const getAdviceOptionEnum = () => {
    return myRequest({
        url: '/commonapi/basicController/getAllAdviceOptionEnum',
        method: 'GET',
        data: {}
    })
}

/**
 * 获取客服渠道类型
 */
export const getCustomerServiceTypeEnum = () => {
    return myRequest({
        url: '/commonapi/basicController/getAllCustomerServiceTypeEnum',
        method: 'GET',
        data: {}
    })
}

/**
 * 获取第三方登录的类型
 */
export const getThirdPartyLoginType = () => {
    return myRequest({
        url: '/userapi/basicController/getAllThirdPartyLoginType',
        method: 'GET',
        data: {}
    })
}

/**
 * 获取企业人数设置参数
 */
export const getCompanyStaffCntEnum = () => {
    return myRequest({
        url: '/userapi/userEnterpriseInfoController/getCompanyStaffCntAll',
        method: 'GET',
        data: {}
    })
}

/**
 * 获取企业类型设置参数
 */
export const getCompanyTypeEnum = () => {
    return myRequest({
        url: '/userapi/userEnterpriseInfoController/getCompanyTypeAll',
        method: 'GET',
        data: {}
    })
}



/**
 * 获取加工交易状态类型
 */
export const getContractStatusEnum = () => {
    return myRequest({
        url: '/workinfoapi/basicController/getContractStatusEnum',
        method: 'GET',
        data: {}
    })
}


/**
 * 获取商品状态类型
 */
export const getCommodityStatusEnum = () => {
    return myRequest({
        url: '/mallapi/basicController/getCommodityStatusList',
        method: 'GET',
        data: {}
    })
}

