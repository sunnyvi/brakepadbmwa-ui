<template>
  <div class="app-container">
    <h2>Export Proforma Invoice</h2>
    <el-divider></el-divider>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Purchase Order #" prop="purchaseOrderNumber">
        <el-input
          v-model="queryParams.purchaseOrderNumber"
          placeholder="请输入Purchase Order #"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Requested Delivery Date">
        <el-date-picker
          v-model="daterangeRequestedDeliveryDate"
          style="width: auto"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="Order Date">
        <el-date-picker
          v-model="daterangeCreationDate"
          style="width: auto"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>


    <el-row>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <div class="exportPi">
      <el-table v-loading="loading" :data="exportPiList">
        <el-table-column label="Customer-Branch Code" align="center" prop="customerBranchCode" width="180"/>
        <el-table-column label="Purchase Order #" align="center" prop="purchaseOrderNumber" width="180"/>
        <el-table-column label="Requested Delivery Date" align="center" prop="requestedDeliveryDate" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.requestedDeliveryDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Quantity(Set)" align="center" prop="sumOrderedQuantity" width="180"></el-table-column>
        <el-table-column label="Amount" align="center" prop="amount" width="180"/>
        <el-table-column label="Export PI" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-download"
              @click="handleDownload(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listPiList, downloadPi } from '@/api/brakepadbmwa-po/purchaseorder'
import axios from 'axios'
import { getToken } from '@/utils/auth'

export default {
  name: 'exportPI',
  data() {
    return {
      exportPiList: [],
      loading: false,
      ids: [],
      showSearch: true,
      isShow: false,
      // 总条数
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        purchaseOrderNumber: null,
        requestedDeliveryDate: null,
        settlementCurrencyVal: null,
        isValid: null,
        creationDate: null
      },
      // 表单参数
      form: {},
      // Purchase Order No时间范围
      daterangeRequestedDeliveryDate: [],
      // Purchase Order No时间范围
      daterangeCreationDate: []

    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询PurchaseOrder Overview列表 */
    getList() {
      this.loading = true
      this.queryParams.params = {}
      if (null != this.daterangeRequestedDeliveryDate && '' != this.daterangeRequestedDeliveryDate) {
        this.queryParams.params['beginRequestedDeliveryDate'] = this.daterangeRequestedDeliveryDate[0]
        this.queryParams.params['endRequestedDeliveryDate'] = this.daterangeRequestedDeliveryDate[1]
      }
      if (null != this.daterangeCreationDate && '' != this.daterangeCreationDate) {
        this.queryParams.params['beginCreationDate'] = this.daterangeCreationDate[0]
        this.queryParams.params['endCreationDate'] = this.daterangeCreationDate[1]
      }
      listPiList(this.queryParams).then(response => {
        this.exportPiList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        puchOrdrHId: null,
        custBrchId: null,
        purchaseOrderNumber: null,
        requestedDeliveryDate: null,
        creationDate: null,
        createdBy: null
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.daterangeRequestedDeliveryDate = []
      this.daterangeCreationDate = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleDownload(row) {
      axios.get(process.env.VUE_APP_BASE_API + '/brakepadbmwa-po/purchaseorder/download-pi/' + row.custBrchId + '/' + row.purchaseOrderNumber, {
        responseType: 'blob',
        headers: { Authorization: 'Bearer ' + getToken() }
      }).then((res) => {
        const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
        const fileName = 'PI' + row.purchaseOrderNumber + '.xlsx'
        if ('download' in document.createElement('a')) { // 非IE下载
          const elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href) // 释放URL 对象
          document.body.removeChild(elink)
        } else { // IE10+下载
          navigator.msSaveBlob(blob, fileName)
        }
      })
    },
    getExportPiList() {
      this.$http.get('/api/ExportPI/GetExportPIList').then(res => {
        this.exportPiList = res.data
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>


</style>
