import {myRequest} from '@/utils/api'

/////////////////////基本信息///////////////////////////////
/**
 * 金豆商城是否开通
 */
export const getModuleConfig = () => {
    return myRequest({
        url: '/commonapi/configController/getModuleConfig',
        method: 'POST',
        data: {}
    })
}


/**
 * 获取公告
 */
export const getNoticeList = (params) => {
    return myRequest({
        url: '/commonapi/user/notice',
        method: 'GET',
        data: params
    })
}

/**
 * 获取公告
 */
export const getActiveSplash = (params) => {
    return myRequest({
        url: '/commonapi/splash/info',
        method: 'POST',
        data: params
    })
}


/**
 * 获取轮播图的数据
 */
export function getBannerList(params){
    return myRequest({
        url: '/commonapi/user/banner',
        method: 'POST',
        data: params
    })
}

///////////////////统一投诉接口/////////////////////////////////////

/**
 *  投诉详情
 */
export const getComplaint = (param) => {
    return myRequest({
        url: '/commonapi/complaint/info',
        method: 'POST',
        data: param
    })
}

/**
 *  创建投诉
 */
export const createComplaint = (param) => {
    return myRequest({
        url: '/commonapi/complaint/new',
        method: 'POST',
        data: param
    })
}

/**
 *  更新投诉
 */
export const updateComplaint = (param) => {
    return myRequest({
        url: '/commonapi/complaint/update',
        method: 'POST',
        data: param
    })
}

/**
 *  撤销投诉
 */
export const cancelComplaint = (param) => {
    return myRequest({
        url: '/commonapi/complaint/cancel',
        method: 'POST',
        data: param
    })
}



/**
 * 投诉筛选
 */
export const filterComplaint = (param) => {
    return myRequest({
        url: '/commonapi/complaint/filter',
        method: 'POST',
        data: param
    })
}

/**
 * 投诉日志
 */
export const listComplaintLog = (param) => {
    return myRequest({
        url: '/commonapi/complaint/log/list',
        method: 'POST',
        data: param
    })
}


/**
 * 获取我已经联系或保价过的外发信息
 */
export const getAllComplaintConfig = () => {
    return myRequest({
        url: '/commonapi/complaint/config/query',
        method: 'POST',
        data: {}
    })
}


///////////////////帮助////////////////////////////////

/**
 * 帮助类型列表(热门或非热门)
 */
export const getHotOrNotHelpTypeList = (param) => {
    return myRequest({
        url: '/commonapi/help/type/list/hot',
        method: 'POST',
        data: param
    })
}

export const filterHelpType = (param) => {
    return myRequest({
        url: '/commonapi/help/type/filter',
        method: 'POST',
        data: param
    })
}

/**
 * 分页获取某个类型的问题列表
 */
export const filterPagedHelpInfoList = (param) => {
    return myRequest({
        url: '/commonapi/help/info/filter',
        method: 'POST',
        data: param
    })
}


//////////////////财务//////////////////////////////

/**
 * 现金购买金豆比例
 */
export const getRateBuyGoldBean = () => {
    return myRequest({
        url: '/commonapi/ratioManagerController/getBalanceConvertOtayoniiRatio',
        method: 'POST',
        data: {}
    })
}


////////////////其他参数/////////////////////////////

/**
 * 获取金豆消耗规则
 */
export const queryActionConsume = () => {
    return myRequest({
        url: '/commonapi/action/consume/query',
        method: 'POST',
        data: {}
    })
}

/**
 * 获取默认图片信息
 */
export const getDefaultResource = () => {
    return myRequest({
        url: '/commonapi/default/resource',
        method: 'GET',
        data: {}
    })
}


/**
 * 热门城市列表
 */
export const getHotCityList = () => {
    return myRequest({
        url: '/commonapi/market/address/info/list',
        method: 'POST',
        data: {}
    })
}

/**
 * 获取信息排序类型
 */
export const getSortTypeEnum = () => {
    return myRequest({
        url: '/commonapi/user/sort/type',
        method: 'GET',
        data: {}
    })
}

/**
 * 加工交易 获取取消原因列表
 */
export const getCancelContractReasonList = (param) => {
    return myRequest({
        url: '/commonapi/fetch/break/reason',
        method: 'POST',
        data: param
    })
}

//////////////////商机订阅//////////////////////////


/**
 * 关键词列表
 */
export const filterSubscribeKeyword = (param) => {
    return myRequest({
        url: '/commonapi/subscribe/filter',
        method: 'POST',
        data: param
    })
}

/**
 * 添加关键词
 */
export const createSubscribeKeyword = (param) => {
    return myRequest({
        url: '/commonapi/subscribe/new',
        method: 'POST',
        data: param
    })
}


/**
 * 删除关键词
 */
export const deleteSubscribeKeyword = (param) => {
    return myRequest({
        url: '/commonapi/subscribe/delete',
        method: 'POST',
        data: param
    })
}

/////////////////促销活动///////////////////////////////


/**
 * 筛选
 */
export const filterActiveInfo = (param) => {
    return myRequest({
        url: '/commonapi/active/filter',
        method: 'POST',
        data: param
    })
}


/////////////////意见反馈///////////////////////////////

/**
 * 创建反馈
 */
export const createAdvice = (param) => {
    return myRequest({
        url: '/commonapi/advice/new',
        method: 'POST',
        data: param
    })
}


/////////////////客服///////////////////////////////

/**
 * 客服及工作时间配置
 */
export const queryServiceConfig = (param) => {
    return myRequest({
        url: '/commonapi/service/config/query',
        method: 'POST',
        data: param
    })
}




/////////////////签到///////////////////////////////

/**
 * 近日签到
 */
export const getRecentSign = (param) => {
    return myRequest({
        url: '/commonapi/sign/recent',
        method: 'POST',
		silent: 1,
        data: param
    })
}


/**
 * 签到
 */
export const createSign = (param) => {
    return myRequest({
        url: '/commonapi/user/sign',
        method: 'POST',
		catch: 1,
        data: param
    })
}


/**
 * 获取广告版本号
 */
export const getAdvertVersionCode = (params) => {
    return myRequest({
        url: '/commonapi/adver/info/getAdverVersionCode',
        method: 'POST',
        data: params,
        silent: 1
    })
}

/**
 * 获取广告列表
 */
export const queryAdverInfo = (params) => {
    return myRequest({
        url: '/commonapi/adver/info/query',
        method: 'POST',
        data: params
    })
}



