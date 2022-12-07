<template>
  <div class="app-container">
    <div class="headerTable">
      <h3>SO Header Table</h3>
    </div>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Shipping Order #" prop="shippingOrderNumber">
        <el-input
          v-model="queryParams.shippingOrderNumber"
          placeholder="请输入Shipping Order #"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Customer Branch Code" prop="custBrchId">
        <el-input
          v-model="queryParams.custBrchId"
          placeholder="请输入Customer Branch Code"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="CreateDate">
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
          <el-tooltip class="item" effect="dark" content="新增" placement="top">
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              @click="handleAdd"
              circle
              v-hasPermi="['brakepadbmwa-so:shippingorder:add']"
            >
            </el-button>
          </el-tooltip>
        </el-col>
        <el-col :span="1.5">
          <el-tooltip class="item" effect="dark" content="编辑" placement="top">
            <el-button
              type="success"
              plain
              icon="el-icon-edit"
              :disabled="single"
              @click="handleEdit"
              circle
              v-hasPermi="['brakepadbmwa-so:shippingorder:edit']"
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
              circle
              v-hasPermi="['brakepadbmwa-so:shippingorder:remove']"
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
              circle
              v-hasPermi="['brakepadbmwa-so:shippingorder:export']"
            >
            </el-button>
          </el-tooltip>
        </el-col>
        <el-col :span="1.5">
          <el-tooltip class="item" effect="dark" content="导入发货单" placement="top">
            <el-button
              type="success"
              plain
              icon="el-icon-s-promotion"
              @click="downloadShippingOrder"
              circle
            >
            </el-button>
          </el-tooltip>
        </el-col>
      </div>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <div class="soHeader">
      <el-table v-loading="loading" :data="shippingorderList" @selection-change="handleSelectionChange"
                @row-dblclick="dialogLines" highlight-current-row
      >
        <el-table-column type="selection" width="55" align="center"/>
        <el-table-column label="Customer Branch" align="center" prop="customerBranchCode"/>
        <el-table-column label="Shipping Order #" align="center" prop="shippingOrderNumber"/>
        <el-table-column label="CreateDate" align="center" prop="creationDate" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.creationDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Quantity(Set)" align="center" prop="sumShippedQuantity"/>
        <el-table-column label="Pallet Quantity(Pce)" align="center" prop="sumPalletQuantity"/>
        <el-table-column label="Gross Weight(Kg)" align="center" prop="sumPalletGrossWeight"/>
        <el-table-column label="Net Weight(Kg)" align="center" prop="sumPalletNetWeight">
          <template slot-scope="scope">
            <!--          如果sumPalletNetWeight为null则显示sumPalletGrossWeight-30*sumPalletQuantity-->
            <span>{{
                scope.row.sumPalletNetWeight ? scope.row.sumPalletNetWeight : scope.row.sumPalletGrossWeight - 30 * scope.row.sumPalletQuantity
              }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Volume(Cbm)" align="center" prop="sumPalletQuantity">
          <template slot-scope="scope">
            <!--          如果palletSize为null则显示sumPalletQuantity-->
            <span>{{ scope.row.palletSize ? scope.row.palletSize : scope.row.sumPalletQuantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Amount on Customs Invoice" align="center" prop="customsClearanceRatio">
          <template slot-scope="scope">
            <!--          customsClearanceRatio * commercialInvoiceAmount-->
            <span>{{ scope.row.customsClearanceRatio * scope.row.commercialInvoiceAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Amount on Commercial Invoice" align="center" prop="commercialInvoiceAmount"/>
        <el-table-column label="Bind Invoice Object" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
              v-hasPermi="['brakepadbmwa-so:shippingorder:edit']"
            >修改
            </el-button>
            <!--          <el-button-->
            <!--            size="mini"-->
            <!--            type="text"-->
            <!--            icon="el-icon-delete"-->
            <!--            @click="handleDelete(scope.row)"-->
            <!--            v-hasPermi="['brakepadbmwa-so:shippingorder:remove']"-->
            <!--          >删除-->
            <!--          </el-button>-->
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

    <!-- 添加或修改Overview对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Container Name" prop="containerName">
          <el-input v-model="form.containerName" placeholder="请输入Container Name"/>
        </el-form-item>
        <el-form-item label="Seal #" prop="sealNumber">
          <el-input v-model="form.sealNumber" placeholder="请输入Seal #"/>
        </el-form-item>
        <el-form-item label="Tare Weight" prop="tareWeight">
          <el-input v-model="form.tareWeight" placeholder="请输入Tare Weight"/>
        </el-form-item>
        <el-form-item label="Surcharge Item1 Name" prop="surchargeItem1Name">
          <el-input v-model="form.surchargeItem1Name" placeholder="请输入Surcharge Item1 Name"/>
        </el-form-item>
        <el-form-item label="Surcharge Item1 Amount" prop="surchargeItem1Amount">
          <el-input v-model="form.surchargeItem1Amount" placeholder="请输入Surcharge Item1 Amount"/>
        </el-form-item>
        <el-form-item label="Surcharge Item2 Name" prop="surchargeItem2Name">
          <el-input v-model="form.surchargeItem2Name" placeholder="请输入Surcharge Item2 Name"/>
        </el-form-item>
        <el-form-item label="Surcharge Item2 Amount" prop="surchargeItem2Amount">
          <el-input v-model="form.surchargeItem2Amount" placeholder="请输入Surcharge Item2 Amount"/>
        </el-form-item>
        <el-form-item label="Discount Item1 Name" prop="discountItem1Name">
          <el-input v-model="form.discountItem1Name" placeholder="请输入Discount Item1 Name"/>
        </el-form-item>
        <el-form-item label="Discount Item1 Amount" prop="discountItem1Amount">
          <el-input v-model="form.discountItem1Amount" placeholder="请输入Discount Item1 Amount"/>
        </el-form-item>
        <el-form-item label="Discount Item2 Name" prop="discountItem2Name">
          <el-input v-model="form.discountItem2Name" placeholder="请输入Discount Item2 Name"/>
        </el-form-item>
        <el-form-item label="Discount Item2 Amount" prop="discountItem2Amount">
          <el-input v-model="form.discountItem2Amount" placeholder="请输入Discount Item2 Amount"/>
        </el-form-item>
        <el-form-item label="Open Master BOL #" prop="bolId">
          <el-input v-model="form.bolId" placeholder="请输入Open Master BOL #"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <div class="poLines">
      <el-dialog :title="title" :visible.sync="openLines" width="80%" class="dialogLines"
                 append-to-body
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-table :data="shippingOrderLineList" :row-class-name="rowShippingOrderLineIndex"
                    @selection-change="handleShippingOrderLineSelectionChange" ref="shippingOrderLine"
                    max-height="450px" width="100%" border highlight-current-row
          >
            <el-table-column label="Shipping Date" align="center" prop="shippingDate" width="240">
            </el-table-column>
            <el-table-column label="Sales Order Number" align="center" prop="salesOrderNumber" width="240" >
            </el-table-column>
            <el-table-column label="Purchase Order Number" align="center" prop="purchaseOrderNumber" width="240" >
            </el-table-column>
            <el-table-column label="Customer P/N" align="center" prop="customerPartNumber" width="240">
            </el-table-column>
            <el-table-column label="LUDA P/N" align="center" prop="ludaPartNumber" width="240">
            </el-table-column>
            <el-table-column label="Winhere P/N" align="center" prop="winherePartNumber" width="240">
            </el-table-column>
            <el-table-column label="Ordered Quantity (Set)" align="center" prop="orderedQuantity" width="240">
            </el-table-column>
            <el-table-column label="Shipped Quantity (Set)" align="center" prop="shippedQuantity" width="150">
            </el-table-column>
            <el-table-column label="Pallet #" align="center" prop="palletNumber" width="150">
            </el-table-column>
            <el-table-column label="Formula Code" align="center" prop="formulaCode" width="150">
            </el-table-column>
            <el-table-column label="Box Type" align="center" prop="boxType" width="150"/>
            <el-table-column label="Remark" align="center" prop="subremark" width="150"/>
            <el-table-column label="Requested Delivery Date" align="center" prop="requestedDeliveryDate" width="150">
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.requestedDeliveryDate, '{y}-{m}-{d}') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Quantity per Carton (Set)" align="center" prop="quantityPerCarton" width="150">
            </el-table-column>
            <el-table-column label="Carton Quantity (Pce)" align="center" prop="cartonQuantity" width="150">
            </el-table-column>
            <el-table-column label="Box Sequence" align="center" prop="boxSequence" width="150">
            </el-table-column>
            <el-table-column label="Pallet Gross Weight (Kg)" align="center" prop="palletGrossWeight" width="150">
            </el-table-column>
            <el-table-column label="Container #" align="center" prop="containerNumber" width="150">
            </el-table-column>
            <el-table-column label="Pallet Size" align="center" prop="palletSize" width="150">
            </el-table-column>
            <el-table-column label="Pallet Net Weight (Kg)" align="center" prop="palletNetWeight" width="150">
            </el-table-column>
            <!--            <el-table-column label="attribute1" prop="attribute1" width="150">-->
            <!--            </el-table-column>-->
            <!--            <el-table-column label="attribute2" prop="attribute2" width="150">-->
            <!--            </el-table-column>-->
            <!--            <el-table-column label="attribute3" prop="attribute3" width="150">-->
            <!--            </el-table-column>-->
          </el-table>
        </el-form>

      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  addShippingorder,
  delShippingorder, downloadShippingOrder,
  getShippingorder,
  listShippingorder,
  updateShippingorder
} from '@/api/brakepadbmwa-so/shippingorder'

export default {
  name: 'Shippingorder',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedShippingOrderLine: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // Overview表格数据
      shippingorderList: [],
      // overview表格数据
      shippingOrderLineList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,

      openLines: false,
      // $comment时间范围
      daterangeCreationDate: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        shippingOrderNumber: null,
        custBrchId: null,
        creationDate: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        shippingOrderNumber: [
          { required: true, message: 'Shipping Order #不能为空', trigger: 'blur' }
        ],
        custBrchId: [
          { required: true, message: 'Customer-Branch Code不能为空', trigger: 'blur' }
        ],
        creationDate: [
          { required: true, message: 'CreateDate不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    downloadShippingOrder() {
      downloadShippingOrder().then(response => {
        if (response.code === 200) {
          this.$message({
            message: response.data,
            type: 'success'
          })
        } else {
          this.$message({
            message: response.msg,
            type: 'error'
          })
        }
      })
      this.resetQuery()
    },
    dialogLines(row) {
      this.reset()
      const shipOrdrHId = row.shipOrdrHId || this.ids
      getShippingorder(shipOrdrHId).then(response => {
        this.form = response.data
        this.shippingOrderLineList = response.data.shippingOrderLineList
        this.title = '修改Overview'
      })
      // this.rowRecord = row
      this.openLines = true
    },
    /** 查询Overview列表 */
    getList() {
      this.loading = true
      this.queryParams.params = {}
      if (null != this.daterangeCreationDate && '' != this.daterangeCreationDate) {
        this.queryParams.params['beginCreationDate'] = this.daterangeCreationDate[0]
        this.queryParams.params['endCreationDate'] = this.daterangeCreationDate[1]
      }
      listShippingorder(this.queryParams).then(response => {
        this.shippingorderList = response.rows
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
        shipOrdrHId: null,
        shippingOrderNumber: null,
        custBrchId: null,
        containerName: null,
        sealNumber: null,
        tareWeight: null,
        surchargeItem1Name: null,
        surchargeItem1Amount: null,
        surchargeItem2Name: null,
        surchargeItem2Amount: null,
        discountItem1Name: null,
        discountItem1Amount: null,
        discountItem2Name: null,
        discountItem2Amount: null,
        bolId: null,
        isRegistered: null,
        isValid: null,
        creationDate: null,
        createdBy: null,
        lastUpdatedDate: null,
        lastUpdatedBy: null,
        attribute1: null,
        attribute2: null,
        attribute3: null,
        attribute4: null,
        attribute5: null
      }
      this.shippingOrderLineList = []
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.daterangeCreationDate = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.shipOrdrHId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加Overview'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const shipOrdrHId = row.shipOrdrHId || this.ids
      getShippingorder(shipOrdrHId).then(response => {
        this.form = response.data
        this.shippingOrderLineList = response.data.shippingOrderLineList
        this.open = true
        this.title = '修改Overview'
      })
    },
    handleEdit(row) {
      this.reset()
      const shipOrdrHId = row.shipOrdrHId || this.ids
      getShippingorder(shipOrdrHId).then(response => {
        this.form = response.data
        // this.shippingOrderLineList = response.data.shippingOrderLineList
        this.open = true
        this.title = '修改Overview'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.shippingOrderLineList = this.shippingOrderLineList
          if (this.form.shipOrdrHId != null) {
            updateShippingorder(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addShippingorder(this.form).then(response => {
              this.$modal.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const shipOrdrHIds = row.shipOrdrHId || this.ids
      this.$modal.confirm('是否确认删除Overview编号为"' + shipOrdrHIds + '"的数据项？').then(function() {
        return delShippingorder(shipOrdrHIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    },
    /** overview序号 */
    rowShippingOrderLineIndex({ row, rowIndex }) {
      row.index = rowIndex + 1
    },
    /** overview添加按钮操作 */
    handleAddShippingOrderLine() {
      let obj = {}
      obj.shippingDate = ''
      obj.shippedQuantity = ''
      obj.pallets = ''
      obj.palletNumber = ''
      obj.quantityPerCarton = ''
      obj.cartonQuantity = ''
      obj.boxSequence = ''
      obj.palletGrossWeight = ''
      obj.containerNumber = ''
      obj.palletSize = ''
      obj.palletNetWeight = ''
      obj.attribute1 = ''
      obj.attribute2 = ''
      obj.attribute3 = ''
      this.shippingOrderLineList.push(obj)
    },
    /** overview删除按钮操作 */
    handleDeleteShippingOrderLine() {
      if (this.checkedShippingOrderLine.length == 0) {
        this.$modal.msgError('请先选择要删除的overview数据')
      } else {
        const shippingOrderLineList = this.shippingOrderLineList
        const checkedShippingOrderLine = this.checkedShippingOrderLine
        this.shippingOrderLineList = shippingOrderLineList.filter(function(item) {
          return checkedShippingOrderLine.indexOf(item.index) == -1
        })
      }
    },
    /** 复选框选中数据 */
    handleShippingOrderLineSelectionChange(selection) {
      this.checkedShippingOrderLine = selection.map(item => item.index)
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('brakepadbmwa-so/shippingorder/export', {
        ...this.queryParams
      }, `shippingorder_${new Date().getTime()}.xlsx`)
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
