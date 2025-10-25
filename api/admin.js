import {myRequest} from '@/utils/api'


export const filterReleaseWork = (params) => {
    return myRequest({
        url: '/adminapi/admin/release/work/filter',
        method: 'POST',
        data: params
    })
}

export const filterAuditRemark = (params) => {
    return myRequest({
        url: '/adminapi/admin/audit/remark/filter',
        method: 'POST',
        data: params
    })
}

export const auditReleaseWorkOk = (params) => {
    return myRequest({
        url: '/adminapi/admin/release/work/audit/ok',
        method: 'post',
        data: params
    })
}

export const auditReleaseWorkFail = (params) => {
    return myRequest({
        url: '/adminapi/admin/release/work/audit/fail',
        method: 'post',
        data: params
    })
}

export const filterWorkOrder = (params) => {
    return myRequest({
        url: '/adminapi/admin/work/order/filter',
        method: 'POST',
        data: params
    })
}

export const auditWorkOrderOk = (params) => {
    return myRequest({
        url: '/adminapi/admin/work/order/audit/ok',
        method: 'post',
        data: params
    })
}

export const auditWorkOrderFail = (params) => {
    return myRequest({
        url: '/adminapi/admin/work/order/audit/fail',
        method: 'post',
        data: params
    })
}

export const filterUserPerAuthInfo = (params) => {
    return myRequest({
        url: '/adminapi/admin/user/per/auth/info/filter',
        method: 'POST',
        data: params
    })
}

export const auditUserPerAuthInfoOk = (params) => {
    return myRequest({
        url: '/adminapi/admin/user/per/auth/info/auth/ok',
        method: 'POST',
        data: params
    })
}

export const auditUserPerAuthInfoFail = (params) => {
    return myRequest({
        url: '/adminapi/admin/user/per/auth/info/auth/fail',
        method: 'POST',
        data: params
    })
}

export const pictureSwapPersonal = (data) => {
  return myRequest({
    url: '/adminapi/admin/user/per/auth/info/picture/swap',
    method: 'post',
    data
  })
}

export const filterUserComAuthInfo = (params) => {
    return myRequest({
        url: '/adminapi/admin/user/com/auth/info/filter',
        method: 'POST',
        data: params
    })
}

export const auditUserComAuthInfoOk = (params) => {
    return myRequest({
        url: '/adminapi/admin/user/com/auth/info/auth/ok',
        method: 'POST',
        data: params
    })
}

export const auditUserComAuthInfoFail = (params) => {
    return myRequest({
        url: '/adminapi/admin/user/com/auth/info/auth/fail',
        method: 'POST',
        data: params
    })
}

export const filterCommodity = (params) => {
    return myRequest({
        url: '/adminapi/admin/commodity/filter',
        method: 'POST',
        data: params
    })
}

export const auditCommodity = (params) => {
    return myRequest({
        url: '/adminapi/admin/commodity/audit',
        method: 'post',
        data: params
    })
}
