<template>
  <div class="app-container">
    <div class="headerTable">
      <h3>PO Header Table</h3>
    </div>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Customer Branch Code" prop="custBrchId">
<!--        <el-input-->
<!--          v-model="queryParams.custBrchId"-->
<!--          placeholder="请输入Customer-Branch Code"-->
<!--          clearable-->
<!--          @keyup.enter.native="handleQuery"-->
<!--        />-->
        <el-select v-model="queryParams.custBrchId" placeholder="请选择Customer Branch Code" @change="selectCustBrch" filterable >
          <el-option
            v-for="custBrchCode in custBrchCode"
            :key="custBrchCode.custBrchId"
            :label="custBrchCode.customerBranchCode"
            :value="custBrchCode.custBrchId"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Sales Order #" prop="salesOrderNumber">
        <el-input
          v-model="queryParams.salesOrderNumber"
          placeholder="请输入Sales Order #"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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
    <el-row :gutter="10" class="mb8">
      <div class="opButton">
        <el-col :span="1.5">
          <el-tooltip class="item" effect="dark" content="修改" placement="top">
            <el-button
              type="primary"
              plain
              icon="el-icon-edit"
              :disabled="single"
              @click="handleEdit"
              v-hasPermi="['brakepadbmwa-po:purchaseorder:edit']"
              circle
            >
            </el-button>
          </el-tooltip>
        </el-col>
        <el-col :span="1.5">
          <el-tooltip class="item" effect="dark" content="删除" placement="top">
            <el-button
              type="danger"
              plain
              icon="el-icon-delete"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['brakepadbmwa-po:purchaseorder:remove']"
              circle
            >
            </el-button>
          </el-tooltip>
        </el-col>
        <el-col :span="1.5">
          <el-tooltip class="item" effect="dark" content="导出" placement="top">
            <el-button
              type="warning"
              plain
              icon="el-icon-download"
              @click="handleExport"
              v-hasPermi="['brakepadbmwa-po:purchaseorder:export']"
              circle
            >
            </el-button>
          </el-tooltip>
        </el-col>
<!--        推送按钮-->
        <el-col :span="1.5">
          <el-tooltip class="item" effect="dark" content="推送" placement="top">
            <el-button
              type="success"
              plain
              :disabled="multiple"
              icon="el-icon-upload"
              @click="pushOrder"
              circle
            >
            </el-button>
          </el-tooltip>
        </el-col>
      </div>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <div class="poHeader">

      <el-table v-loading="loading" :data="purchaseorderList" @selection-change="handleSelectionChange"
                @row-dblclick="dialogLines" highlight-current-row>
      >
        <el-table-column type="selection" width="45" align="center"></el-table-column>
        <el-table-column label="State" align="center" prop="readFlag" width="80">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.readFlag === 0">New</el-tag>
            <el-tag v-else-if="scope.row.readFlag === 1" type="info"> Pushed</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="CustomerBranch Code" align="center" prop="customerBranchCode" width="auto" />
        <af-table-column label="Sales Order #" align="center" prop="salesOrderNumber" />
        <el-table-column label="Purchase Order #" align="center" prop="purchaseOrderNumber" width="180px"/>
        <el-table-column label="Requested Delivery Date" align="center" prop="requestedDeliveryDate" width="auto" >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.requestedDeliveryDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Quantity(Set)" align="center" prop="sumOrderedQuantity" width="auto" ></el-table-column>
        <el-table-column label="Amount" align="center" prop="amount" width="160px" />
        <el-table-column label="Order Date" align="center" prop="creationDate" width="auto" >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.creationDate, '{y}-{m}-{d}') }}</span>
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
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Sales Order #" prop="salesOrderNumber">
          <el-input v-model="form.salesOrderNumber" placeholder="请输入Sales Order #"/>
        </el-form-item>
        <el-form-item label="Purchase Order #" prop="purchaseOrderNumber">
          <el-input v-model="form.purchaseOrderNumber" placeholder="请输入Purchase Order #"/>
        </el-form-item>
        <el-form-item label="Requested Delivery Date" prop="requestedDeliveryDate">
          <el-date-picker clearable
                          :disabled="form.readFlag === 1"
                          v-model="form.requestedDeliveryDate"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="请选择Requested Delivery Date"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Settlement Currency Code" prop="settlementCurrencyVal">
          <el-select :disabled="form.readFlag === 1" v-model="form.settlementCurrencyVal" filterable
                     placeholder="请选择Settlement Currency Code"
          >
            <el-option
              v-for="dict in dict.type.vs_currency"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-divider></el-divider>


    <el-dialog :title="title" :visible.sync="openLines" :before-close="cancelLines" width="80%" class="dialogLines"
               append-to-body
    >
      <div class="poLines">
        <div slot="footer" class="dialog-footer">
          <div v-show="showUpdate" style="margin-bottom: 20px">
            <el-button type="primary" @click="editLines">修改</el-button>
          </div>
          <div class="operatorLines" v-show="showOperator" style="margin-bottom: 20px">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancelLines">取 消</el-button>
          </div>
        </div>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-table :data="purchaseOrderLineList" :row-class-name="rowPurchaseOrderLineIndex"
                    @selection-change="handlePurchaseOrderLineSelectionChange" ref="purchaseOrderLine"
                    max-height="450px" width="100%" border highlight-current-row
          >
            >
            <!--      <el-table-column label="序号" align="center" prop="index" width="50"/>-->
            <el-table-column label="Customer P/N" prop="customerPartNumber" width="150" fixed column-key="customerPartNumber" :filters="filterData" :filter-method="filterHandler">
              <template slot-scope="scope">
                <el-input v-if="linesInput" v-model="scope.row.customerPartNumber" placeholder="请输入Customer P/N"/>
                <span v-else>{{ scope.row.customerPartNumber }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Purchase Order No" prop="purchaseOrderNumber" width="150">
            </el-table-column>
            <el-table-column label="WINHERE P/N" prop="winherePartNumber" width="150">
              <template slot-scope="scope">
                <el-input v-if="linesInput" v-model="scope.row.winherePartNumber" placeholder="请输入WINHERE P/N"/>
                <span v-else>{{ scope.row.winherePartNumber }}</span>
              </template>
            </el-table-column>
            <el-table-column label="LUDA P/N" prop="ludaPartNumber" width="150">
              <template slot-scope="scope">
                <el-input v-if="linesInput" v-model="scope.row.ludaPartNumber" placeholder="请输入LUDA P/N"/>
                <span v-else>{{ scope.row.ludaPartNumber }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Unit Price(set)" prop="unitPrice" width="150" sortable>
              <template slot-scope="scope">
                <el-input v-if="linesInput" v-model="scope.row.unitPrice" placeholder="请输入Unit Price(set)"/>
                <span v-else>{{ scope.row.unitPrice }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Additional Fee" prop="additionalFee" width="150" sortable>
              <template slot-scope="scope">
                <el-input v-if="linesInput" v-model="scope.row.additionalFee" placeholder="请输入Additional Fee"/>
                <span v-else>{{ scope.row.additionalFee }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Calc.Unit Price(set)" prop="calcUnitPrice" width="150" sortable>
            </el-table-column>
            <el-table-column label="Quantity(set)" prop="orderedQuantity" width="150" sortable>
              <template slot-scope="scope">
                <el-input v-if="linesInput" v-model="scope.row.orderedQuantity" placeholder="请输入Quantity(set)"/>
                <span v-else>{{ scope.row.orderedQuantity }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Box Per Carton" prop="boxPerCarton" width="150">
            </el-table-column>
            <el-table-column label="Cartons" prop="cartons" width="150">
            </el-table-column>
            <el-table-column label="Formula Code" prop="formulaCode" width="150">
              <template slot-scope="scope">
                <el-input v-if="linesInput" v-model="scope.row.formulaCode" placeholder="请输入Formula Code"/>
                <span v-else>{{ scope.row.formulaCode }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Box Type" prop="boxType" width="150">
            </el-table-column>
            <el-table-column label="Trade Mark" prop="trademark" width="150">
            </el-table-column>
            <el-table-column label="Remark" prop="remark" width="150">
              <template slot-scope="scope">
                <el-input v-if="linesInput" v-model="scope.row.remark" placeholder="请输入Remark"/>
                <span v-else>{{ scope.row.remark }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Emark #" prop="emarkNumber" width="150">
            </el-table-column>
            <el-table-column label="WVA #" prop="wvaNumber" width="150">
            </el-table-column>
            <el-table-column label="OE #" prop="oeNumber" width="150">
            </el-table-column>
            <el-table-column label="F/R" prop="frontRear" width="150">
            </el-table-column>
            <el-table-column label="Box Barcode" prop="boxBarcode" width="150">
            </el-table-column>
            <el-table-column label="Carton Barcode" prop="cartonBarcode" width="150">
            </el-table-column>
            <el-table-column label="Vehicle Application" prop="vehicleApplication" width="150">
            </el-table-column>
            <el-table-column label="Back Plate Printed Code" prop="backPlatePrintedCode" width="150">
            </el-table-column>
            <el-table-column label="LUDA P/N on R90 Cert" prop="r90CertLudaPartNumber" width="150">
            </el-table-column>
            <el-table-column label="Formula Code on R90 Cert" prop="r90CertFormulaCode" width="150">
            </el-table-column>
            <el-table-column label="Attribute1" prop="attribute1" width="150">
              <template slot-scope="scope">
                <el-input v-if="linesInput" v-model="scope.row.attribute1" placeholder="请输入Attribute1"/>
                <span v-else>{{ scope.row.attribute1 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Attribute2" prop="attribute2" width="150">
              <template slot-scope="scope">
                <el-input v-if="linesInput" v-model="scope.row.attribute2" placeholder="请输入Attribute2"/>
                <span v-else>{{ scope.row.attribute2 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Attribute3" prop="attribute3" width="150">
              <template slot-scope="scope">
                <el-input v-if="linesInput" v-model="scope.row.attribute3" placeholder="请输入Attribute3"/>
                <span v-else>{{ scope.row.attribute3 }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listPurchaseorder,
  getPurchaseorder,
  delPurchaseorder,
  addPurchaseorder,
  updatePurchaseorder
} from '@/api/brakepadbmwa-po/purchaseorder'
import axios from 'axios'
import { selectCustBrchCode } from '@/api/brakepadbmwa-customerbranch/customerbranch'

export default {
  name: 'Purchaseorder',
  dicts: ['vs_currency'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],

      deleteSalesNo: [],
      // 子表选中数据
      checkedPurchaseOrderLine: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,

      linesInput: false,

      showOperator: false,

      rowRecord: {},

      showUpdate: true,
      // 总条数
      total: 0,
      // PurchaseOrder Overview表格数据
      purchaseorderList: [],
      // purchaseorder表格数据
      purchaseOrderLineList: [],

      custBrchCode: [],
      CustBrchCodeValue: '',
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,

      openLines: false,

      // Purchase Order No时间范围
      daterangeRequestedDeliveryDate: [],
      // Purchase Order No时间范围
      daterangeCreationDate: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        custBrchId: null,
        salesOrderNumber: null,
        purchaseOrderNumber: null,
        requestedDeliveryDate: null,
        creationDate: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        custBrchId: [
          { required: true, message: 'Customer-Branch Code不能为空', trigger: 'blur' }
        ],
        salesOrderNumber: [
          { required: true, message: 'Sales Order #不能为空', trigger: 'blur' }
        ],
        purchaseOrderNumber: [
          { required: true, message: 'Purchase Order #不能为空', trigger: 'blur' }
        ],
        requestedDeliveryDate: [
          { required: true, message: 'Requested Delivery Date不能为空', trigger: 'blur' }
        ],
        creationDate: [
          { required: true, message: 'Order Date不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {

    filterData() {
      const arr = []
      this.purchaseOrderLineList.forEach(item => {
        arr.push({
          text: item.customerPartNumber,
          value: item.customerPartNumber
        })
      })
      return arr

    }
  },
  created() {
    this.getList()
    this.getCustBrchCode()
  },
  methods: {
    selectCustBrch(custBrchId) {
      let obj = this.custBrchCode.find(item => item.custBrchId === custBrchId)
      this.CustBrchCodeValue = obj.customerBranchCode
      // this.settlementCurrencyValue = obj.settlementCurrencyVal
    },
    getCustBrchCode() {
      selectCustBrchCode().then(response => {
        this.custBrchCode = response.data
        this.custBrchCode = JSON.parse(JSON.stringify(this.custBrchCode))
      })
    },
    // 推送定单到工厂
    pushOrder(row) {
      const puchOrdrHIds = row.puchOrdrHId || this.ids
      axios.get('http://192.168.10.115:8090/po/'+ puchOrdrHIds + '/' + this.$store.state.user.userId).then(res => {
        this.$message({
          message: res.data.message,
          type: 'success'
        })
        this.resetQuery()
      })
    },

    filterHandler(value, row, column) {
      const property = column['property'];
      return row[property] === value;
    },
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
      listPurchaseorder(this.queryParams).then(response => {
        this.purchaseorderList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    cancelLines() {
      this.linesInput = false
      this.showOperator = false
      this.showUpdate = true
      this.openLines = false
    },
    // 表单重置
    reset() {
      this.form = {
        puchOrdrHId: null,
        custBrchId: null,
        salesOrderNumber: null,
        purchaseOrderNumber: null,
        requestedDeliveryDate: null,
        settlementCurrencyVal: null,
        isValid: null,
        readFlag: null,
        creationDate: null,
        createdBy: null,
        deptId: null,
        lastUpdatedDate: null,
        lastUpdatedBy: null,
        attribute1: null,
        attribute2: null,
        attribute3: null,
        attribute4: null,
        attribute5: null
      }
      this.purchaseOrderLineList = []
      this.resetForm('form')
    },
    editLines() {
      this.showUpdate = false
      this.linesInput = true
      this.showOperator = true
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.puchOrdrHId)
      this.deleteSalesNo = selection.map(item => item.salesOrderNumber)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    // handleAdd() {
    //   this.reset()
    //   this.open = true
    //   this.title = '添加PurchaseOrder Overview'
    // },
    handleEdit(row) {
      this.reset()
      const puchOrdrHId = row.puchOrdrHId || this.ids
      getPurchaseorder(puchOrdrHId).then(response => {
        this.form = response.data
        this.purchaseOrderLineList = response.data.purchaseOrderLineList
        this.open = true
        this.title = 'Update PurchaseOrder Header'
      })
    },

    dialogLines(row) {
      this.handleUpdate(row)
      this.rowRecord = row
      this.openLines = true
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const puchOrdrHId = row.puchOrdrHId || this.ids
      getPurchaseorder(puchOrdrHId).then(response => {
        this.form = response.data
        this.purchaseOrderLineList = response.data.purchaseOrderLineList
        this.title = 'PO Line(s) Table'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.purchaseOrderLineList = this.purchaseOrderLineList
          if (this.form.puchOrdrHId != null) {
            updatePurchaseorder(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
              if (this.openLines) {
                this.handleUpdate(this.rowRecord)
              }
            })
          } else {
            addPurchaseorder(this.form).then(response => {
              this.$modal.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
      if (this.showOperator) {
        this.linesInput = false
        this.showOperator = false
        this.showUpdate = true
      }

    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const puchOrdrHIds = row.puchOrdrHId || this.ids
      const SalesOrderNumbers = row.salesOrderNumber || this.deleteSalesNo
      this.$modal.confirm('是否确认删除定单编号为"' + SalesOrderNumbers + '"的数据项？').then(function() {
        return delPurchaseorder(puchOrdrHIds, SalesOrderNumbers)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    },
    /** purchaseorder序号 */
    rowPurchaseOrderLineIndex({ row, rowIndex }) {
      row.index = rowIndex + 1
    },
    /** purchaseorder添加按钮操作 */
    handleAddPurchaseOrderLine() {
      let obj = {}
      obj.customerPartNumber = ''
      obj.ludaPartNumber = ''
      obj.winherePartNumber = ''
      obj.unitPrice = ''
      obj.calcUnitPrice = ''
      obj.orderedQuantity = ''
      obj.formulaCode = ''
      obj.boxType = ''
      obj.remark = ''
      obj.emarkNumber = ''
      obj.wvaNumber = ''
      obj.oeNumber = ''
      obj.frontRear = ''
      obj.boxBarcode = ''
      obj.cartonBarcode = ''
      obj.vehicleApplication = ''
      obj.backPlatePrintedCode = ''
      obj.r90CertLudaPartNumber = ''
      obj.r90CertFormulaCode = ''
      obj.trademark = ''
      obj.additionalFee = ''
      obj.attribute1 = ''
      obj.attribute2 = ''
      obj.attribute3 = ''
      obj.boxPerCarton = ''
      obj.cartons = ''
      obj.purchaseOrderNumber = ''
      this.purchaseOrderLineList.push(obj)
    },
    /** purchaseorder删除按钮操作 */
    handleDeletePurchaseOrderLine() {
      if (this.checkedPurchaseOrderLine.length == 0) {
        this.$modal.msgError('请先选择要删除的purchaseorder数据')
      } else {
        const purchaseOrderLineList = this.purchaseOrderLineList
        const checkedPurchaseOrderLine = this.checkedPurchaseOrderLine
        this.purchaseOrderLineList = purchaseOrderLineList.filter(function(item) {
          return checkedPurchaseOrderLine.indexOf(item.index) == -1
        })
      }
    },
    /** 复选框选中数据 */
    handlePurchaseOrderLineSelectionChange(selection) {
      this.checkedPurchaseOrderLine = selection.map(item => item.index)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('brakepadbmwa-po/purchaseorder/export', {
        ...this.queryParams
      }, `PurchaseOrder_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-tag {
  margin-right: 5px;
  margin-bottom: 5px;
  width: 65px;
  border-radius: 20px;
  // 文字居中 不显示省略号
  display: inline-block;
  text-align: center;
}

.opButton .el-button {
  size: 20px;
  // 按钮设置圆形
}

// 设置headerTable的样式
.dialogLines {
  // 设置对话框高度
  height: 100%;
  width: 100%;
  // 设置对话框内部内容高度
  .el-dialog__body {
    height: 50%;
    width: 100%;
    // 设置对话框内部内容滚动条
    overflow: auto;
  }
}
</style>
