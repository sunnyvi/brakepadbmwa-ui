import request from '@/utils/request'

// 查询Overview列表
export function listShippingorder(query) {
  return request({
    url: '/brakepadbmwa-so/shippingorder/list',
    method: 'get',
    params: query
  })
}

// 查询Overview详细
export function getShippingorder(shipOrdrHId) {
  return request({
    url: '/brakepadbmwa-so/shippingorder/' + shipOrdrHId,
    method: 'get'
  })
}

// 新增Overview
export function addShippingorder(data) {
  return request({
    url: '/brakepadbmwa-so/shippingorder',
    method: 'post',
    data: data
  })
}

// 修改Overview
export function updateShippingorder(data) {
  return request({
    url: '/brakepadbmwa-so/shippingorder',
    method: 'put',
    data: data
  })
}

// 删除Overview
export function delShippingorder(shipOrdrHId) {
  return request({
    url: '/brakepadbmwa-so/shippingorder/' + shipOrdrHId,
    method: 'delete'
  })
}
export function downloadShippingOrder() {
  return request({
    url: '/brakepadbmwa-so/shippingorder/getShippingDetail',
    method: 'get'
  })
}
