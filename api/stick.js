import {myRequest} from '@/utils/api'

/**
 * 置顶状态
 */
export const getStickApplyStatusEnum = () => {
    return myRequest({
        url: '/orderapi/basicController/enum/stick/apply/status',
        method: 'GET',
        silent: 1
    })
}

/**
 * 置顶类型
 */
export const getStickApplyTypeEnum = () => {
    return myRequest({
        url: '/orderapi/basicController/enum/stick/apply/type',
        method: 'GET',
        silent: 1,
    })
}


/**
 * 置顶申请详情
 */
export const infoStickAppy = (param) => {
    return myRequest({
        url: '/orderapi/stickController/info',
        method: 'POST',
        data: param
    })
}


/**
 * 置顶申请新建
 */
export const createStickAppy = (param) => {
    return myRequest({
        url: '/orderapi/stickController/new',
        method: 'POST',
        data: param
    })
}


/**
 * 置顶申请更新
 */
export const updateStickAppy = (param) => {
    return myRequest({
        url: '/orderapi/stickController/update',
        method: 'POST',
        data: param
    })
}

/**
 * 置顶申请新建
 */
export const deleteStickAppy = (param) => {
    return myRequest({
        url: '/orderapi/stickController/delete',
        method: 'POST',
        data: param
    })
}


/**
 * 获取置顶单价
 */
export const getStickUnitPrice = (param) => {
    return myRequest({
        url: '/commonapi/user/stick/price',
        method: 'POST',
        data: param
    })
}

/**
 * 置顶申请筛选
 */
export const filterStickApply = (param) => {
    return myRequest({
        url: '/orderapi/stickController/filter',
        method: 'POST',
        data: param
    })
}
