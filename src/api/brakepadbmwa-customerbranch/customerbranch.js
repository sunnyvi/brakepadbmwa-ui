import request from '@/utils/request'

// 查询CustBranch Overview列表
export function listCustomerbranch(query) {
  return request({
    url: '/brakepadbmwa-customerbranch/customerbranch/list',
    method: 'get',
    params: query
  })
}

// 查询CustBranchCode url:/brakepadbmwa-customerbranch/customerbranch/selectCustBrchCode
export function selectCustBrchCode(query) {
  return request({
    url: '/brakepadbmwa-customerbranch/customerbranch/selectCustBrchCode',
    method: 'get',
  })
}

// 查询CustBranch Overview详细
export function getCustomerbranch(custBrchId) {
  return request({
    url: '/brakepadbmwa-customerbranch/customerbranch/' + custBrchId,
    method: 'get'
  })
}

// 新增CustBranch Overview
export function addCustomerbranch(data) {
  return request({
    url: '/brakepadbmwa-customerbranch/customerbranch',
    method: 'post',
    data: data
  })
}

// 修改CustBranch Overview
export function updateCustomerbranch(data) {
  return request({
    url: '/brakepadbmwa-customerbranch/customerbranch',
    method: 'put',
    data: data
  })
}

// 删除CustBranch Overview
export function delCustomerbranch(custBrchId) {
  return request({
    url: '/brakepadbmwa-customerbranch/customerbranch/' + custBrchId,
    method: 'delete'
  })
}
