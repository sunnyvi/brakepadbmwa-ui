import request from '@/utils/request'

// 查询PurchaseOrder Overview列表
export function listPurchaseorder(query) {
  return request({
    url: '/brakepadbmwa-po/purchaseorder/list',
    method: 'get',
    params: query
  })
}

export function listPiList(query) {
  return request({
    url: '/brakepadbmwa-po/purchaseorder/exportpilist',
    method: 'get',
    params: query
  })
}

// 查询PurchaseOrder Overview详细
export function getPurchaseorder(puchOrdrHId) {
  return request({
    url: '/brakepadbmwa-po/purchaseorder/' + puchOrdrHId,
    method: 'get'
  })
}

// 新增PurchaseOrder Overview
export function addPurchaseorder(data) {
  return request({
    url: '/brakepadbmwa-po/purchaseorder',
    method: 'post',
    data: data
  })
}

// 修改PurchaseOrder Overview
export function updatePurchaseorder(data) {
  return request({
    url: '/brakepadbmwa-po/purchaseorder',
    method: 'put',
    data: data
  })
}

// 删除PurchaseOrder Overview
export function delPurchaseorder(puchOrdrHId, salesOrderNumber) {
  return request({
    url: '/brakepadbmwa-po/purchaseorder/' + puchOrdrHId + '/' + salesOrderNumber,
    method: 'delete'
  })
}
/**
 * Submit PO data
 * @param batchNumber Batch number
 * @return R<List<String>>
 */
///create-po/
export function createPo(custBrchId,batchNumber) {
  return request({
    url: '/brakepadbmwa-po/purchaseorder/create-po/',
    method: 'post',
    params: {custBrchId:custBrchId,batchNumber:batchNumber}
  })
}
// /download-pi/{custBrchId}/{purchaseOrderNumber}
export function downloadPi(custBrchId,purchaseOrderNumber) {
  return request({
    url: '/brakepadbmwa-po/purchaseorder/download-pi/'+custBrchId+'/'+purchaseOrderNumber,
    method: 'get',
    responseType: 'blob'
  })
}
