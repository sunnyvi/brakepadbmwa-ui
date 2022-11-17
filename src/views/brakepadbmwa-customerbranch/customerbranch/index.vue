<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Customer Code" prop="customerCode">
        <el-input
          v-model="queryParams.customerCode"
          placeholder="请输入Customer Code"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Customer Name" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入Customer Name"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Market" prop="marketVal">
        <el-select v-model="queryParams.marketVal" filterable placeholder="请选择Market Val" clearable>
          <el-option
            v-for="dict in dict.type.vs_market"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Branch Code" prop="branchCode">
        <el-input
          v-model="queryParams.branchCode"
          placeholder="请输入Branch Code"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Branch Country" prop="branchCountryVal">
        <el-select v-model="queryParams.branchCountryVal" filterable placeholder="请选择Branch Country" clearable>
          <el-option
            v-for="dict in dict.type.vs_country"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
              v-hasPermi="['brakepadbmwa-customerbranch:customerbranch:add']"
              circle
            ></el-button>
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
              v-hasPermi="['brakepadbmwa-customerbranch:customerbranch:edit']"
              circle
            ></el-button>
          </el-tooltip>
        </el-col>
        <!--      <el-col :span="1.5">-->
        <!--        <el-button-->
        <!--          type="danger"-->
        <!--          plain-->
        <!--          icon="el-icon-delete"-->
        <!--          size="mini"-->
        <!--          :disabled="multiple"-->
        <!--          @click="handleDelete"-->
        <!--          v-hasPermi="['brakepadbmwa-customerbranch:customerbranch:remove']"-->
        <!--        >删除</el-button>-->
        <!--      </el-col>-->
<!--        <el-col :span="1.5">-->
<!--          <el-tooltip class="item" effect="dark" content="导出" placement="top">-->
<!--            <el-button-->
<!--              type="warning"-->
<!--              plain-->
<!--              icon="el-icon-download"-->
<!--              @click="handleExport"-->
<!--              v-hasPermi="['brakepadbmwa-customerbranch:customerbranch:export']"-->
<!--              circle-->
<!--            ></el-button>-->
<!--          </el-tooltip>-->
<!--        </el-col>-->
      </div>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="customerbranchList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <!--      <el-table-column label="CustBrchId" align="center" prop="custBrchId" />-->
      <el-table-column label="Customer Code" align="center" prop="customerCode"/>
      <el-table-column label="Customer Name" align="center" prop="customerName"/>
      <el-table-column label="Market" align="center" prop="marketVal">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.vs_market" :value="scope.row.marketVal"/>
        </template>
      </el-table-column>
      <el-table-column label="Branch Code" align="center" prop="branchCode"/>
      <el-table-column label="Branch Country" align="center" prop="branchCountryVal">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.vs_country" :value="scope.row.branchCountryVal"/>
        </template>
      </el-table-column>
      <el-table-column label="Open Archive" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-folder-opened"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['brakepadbmwa-customerbranch:customerbranch:edit']"
          ></el-button>
          <!--          <el-button-->
          <!--            size="mini"-->
          <!--            type="text"-->
          <!--            icon="el-icon-delete"-->
          <!--            @click="handleDelete(scope.row)"-->
          <!--            v-hasPermi="['brakepadbmwa-customerbranch:customerbranch:remove']"-->
          <!--          >删除</el-button>-->
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加CustBranch Overview对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="Customer Code" prop="customerCode">
          <el-input v-model="form.customerCode" placeholder="请输入Customer Code"/>
        </el-form-item>
        <el-form-item label="Customer Name" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入Customer Name"/>
        </el-form-item>
        <el-form-item label="Market" prop="marketVal">
          <el-select v-model="form.marketVal" filterable placeholder="请选择Market Val">
            <el-option
              v-for="dict in dict.type.vs_market"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Branch Code" prop="branchCode">
          <el-input v-model="form.branchCode" placeholder="请输入Branch Code"/>
        </el-form-item>
        <el-form-item label="Branch Country" prop="branchCountryVal">
          <el-select v-model="form.branchCountryVal" filterable placeholder="请选择Branch Country">
            <el-option
              v-for="dict in dict.type.vs_country"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Transferred from Luda?" prop="isTransferredFromLuda">
          <el-select v-model="form.isTransferredFromLuda" placeholder="请选择Transferred from Luda">
            <el-option
              v-for="dict in dict.type.vs_yes_no"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Domestic Trade?" prop="isDomesticTrade">
          <el-select v-model="form.isDomesticTrade" placeholder="请选择Domestic Trade">
            <el-option
              v-for="dict in dict.type.vs_yes_no"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Settlement Currency Code" prop="settlementCurrencyVal">
          <el-select v-model="form.settlementCurrencyVal" placeholder="请选择Settlement Currency Code" clearable
                     filterable
          >
            <el-option
              v-for="dict in dict.type.vs_currency"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Payment Term" prop="paymentTerm">
          <el-select v-model="form.paymentTerm" placeholder="请选择Payment Term" clearable filterable>
            <el-option
              v-for="dict in dict.type.vs_pay_term"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!--        <el-form-item label="Attribute1" prop="attribute1">-->
        <!--          <el-input v-model="form.attribute1" placeholder="请输入Attribute1" />-->
        <!--        </el-form-item>-->
        <!--        <el-form-item label="Attribute2" prop="attribute2">-->
        <!--          <el-input v-model="form.attribute2" placeholder="请输入Attribute2" />-->
        <!--        </el-form-item>-->
        <!--        <el-form-item label="Attribute3" prop="attribute3">-->
        <!--          <el-input v-model="form.attribute3" placeholder="请输入Attribute3" />-->
        <!--        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 修改CustBranch Overview对话框 按选项卡分类-->
    <el-dialog :title="title" :visible.sync="dialogVisible" width="600px" append-to-body>
      <el-tabs v-model="activeName">
        <el-tab-pane label="Po" name="first">
          <el-form ref="form" :model="form" label-width="150px">
            <el-form-item label="PO Discount Ratio" prop="poDiscountRatio1">
              <el-input v-model="form.poDiscountRatio1" placeholder="请输入PO Discount Ratio"/>
            </el-form-item>
            <el-form-item label="PO Discount Ratio " prop="poDiscountRatio2">
              <el-input v-model="form.poDiscountRatio2" placeholder="请输入PO Discount Ratio "/>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="Doc" name="second">
          <el-form ref="form" :model="form" :rules="rules" label-width="150px">
            <el-form-item label="Port of Loading (POL)" prop="portOfLoading">
              <el-input v-model="form.portOfLoading" placeholder="请输入Port of Loading (POL)"/>
            </el-form-item>
            <el-form-item label="Port of Discharge" prop="portOfDischarge">
              <el-input v-model="form.portOfDischarge" placeholder="请输入Port of Discharge"/>
            </el-form-item>
            <el-form-item label="Port of Destination (POD)" prop="portOfDestination">
              <el-input v-model="form.portOfDestination" placeholder="请输入Port of Destination (POD)"/>
            </el-form-item>
            <el-form-item label="Enterprise Code Type of Consignee Party" prop="ecTypeConsignee">
              <el-input v-model="form.ecTypeConsignee" placeholder="请输入Enterprise Code Type of Consignee Party"/>
            </el-form-item>
            <el-form-item label="Enterprise Code of Consignee Party" prop="ecConsignee">
              <el-input v-model="form.ecConsignee" placeholder="请输入Enterprise Code of Consignee Party"/>
            </el-form-item>
            <el-form-item label="Enterprise Code Type of Notify Party" prop="ecTypeNotify">
              <el-input v-model="form.ecTypeNotify" placeholder="请输入Enterprise Code Type of Notify Party"/>
            </el-form-item>
            <el-form-item label="Enterprise Code of Notify Party" prop="ecNotify">
              <el-input v-model="form.ecNotify" placeholder="请输入Enterprise Code of Notify Party"/>
            </el-form-item>
            <el-form-item label="BOL Type" prop="bolTypeVal">
              <el-select v-model="form.bolTypeVal" filterable placeholder="请选择BOL Type">
                <el-option
                  v-for="dict in dict.type.vs_bol_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Shipper Party Info on BOL" prop="bolShipperInfo">
              <el-input v-model="form.bolShipperInfo" type="textarea" placeholder="请输入内容"/>
            </el-form-item>
            <el-form-item label="Consignee Party Info on BOL" prop="bolConsigneeInfo">
              <el-input v-model="form.bolConsigneeInfo" type="textarea" placeholder="请输入内容"/>
            </el-form-item>
            <el-form-item label="Notify Party Info on BOL" prop="bolNotifyInfo">
              <el-input v-model="form.bolNotifyInfo" type="textarea" placeholder="请输入内容"/>
            </el-form-item>
            <el-form-item label="Freight Term" prop="freightTerm">
              <el-input v-model="form.freightTerm" placeholder="请输入Freight Term"/>
            </el-form-item>
            <el-form-item label="Door Address on BOL" prop="bolDoorAddress">
              <el-input v-model="form.bolDoorAddress" type="textarea" placeholder="请输入内容"/>
            </el-form-item>
            <el-form-item label="Shipping Mark" prop="shippingMark">
              <el-input v-model="form.shippingMark" type="textarea" placeholder="请输入内容"/>
            </el-form-item>
            <el-form-item label="Commercial Invoice Ship To" prop="ciShipTo">
              <el-input v-model="form.ciShipTo" type="textarea" placeholder="请输入内容"/>
            </el-form-item>
            <el-form-item label="Packing List Ship To" prop="plShipTo">
              <el-input v-model="form.plShipTo" type="textarea" placeholder="请输入内容"/>
            </el-form-item>
            <el-form-item label="Customs Clearance Price Term" prop="customsClearancePriceTerm">
              <el-input v-model="form.customsClearancePriceTerm" placeholder="请输入Customs Clearance Price Term"/>
            </el-form-item>
            <el-form-item label="Receipt Price Term" prop="receiptPriceTerm">
              <el-input v-model="form.receiptPriceTerm" placeholder="请输入Receipt Price Term"/>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="Control" name="third">
          <el-form ref="form" :model="form" :rules="rules" label-width="150px">
            <el-form-item label="Customs Clearance Ratio (Ⅰ)" prop="customsClearanceRatio1">
              <el-input v-model="form.customsClearanceRatio1" placeholder="请输入Customs Clearance Ratio (Ⅰ)"/>
            </el-form-item>
            <el-form-item label="Customs Clearance Ratio (Ⅱ)" prop="customsClearanceRatio2">
              <el-input v-model="form.customsClearanceRatio2" placeholder="请输入Customs Clearance Ratio (Ⅱ)"/>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="Finance" name="fourth">
          <el-form ref="form" :model="form" :rules="rules" label-width="150px">
            <el-form-item label="Settlement Currency Code" prop="settlementCurrencyVal">
              <el-select v-model="form.settlementCurrencyVal" filterable placeholder="请选择Settlement Currency Code">
                <el-option
                  v-for="dict in dict.type.vs_currency"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Payment Term" prop="paymentTerm">
              <el-select v-model="form.paymentTerm" placeholder="请选择Payment Term" clearable filterable allow-create>
                <el-option
                  v-for="dict in dict.type.vs_pay_term"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="Domestic Trade" name="fifth">
          <el-form ref="form" :model="form" :rules="rules" label-width="150px">
            <el-form-item label="Buyer Name" prop="viBuyerName">
              <el-input v-model="form.viBuyerName" placeholder="请输入Buyer Name"/>
            </el-form-item>
            <el-form-item label="Tax Id" prop="viTaxId">
              <el-input v-model="form.viTaxId" placeholder="请输入Tax Id"/>
            </el-form-item>
            <el-form-item label="Address & Tel #" prop="viAddressAndTelNumber">
              <el-input v-model="form.viAddressAndTelNumber" placeholder="请输入Address & Tel #"/>
            </el-form-item>
            <el-form-item label="Bank Name & Account #" prop="viBankNameAndAccountNumber">
              <el-input v-model="form.viBankNameAndAccountNumber" placeholder="请输入Bank Name & Account #"/>
            </el-form-item>
            <el-form-item label="Receiver Name" prop="viReceiverName">
              <el-input v-model="form.viReceiverName" placeholder="请输入Receiver Name"/>
            </el-form-item>
            <el-form-item label="Receiver Tel #" prop="viReceiverTelNumber">
              <el-input v-model="form.viReceiverTelNumber" placeholder="请输入Receiver Tel #"/>
            </el-form-item>
            <el-form-item label="Receiver Address" prop="viReceiverAddress">
              <el-input v-model="form.viReceiverAddress" placeholder="请输入Receiver Address"/>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import {
  listCustomerbranch,
  getCustomerbranch,
  delCustomerbranch,
  addCustomerbranch,
  updateCustomerbranch
} from '@/api/brakepadbmwa-customerbranch/customerbranch'

export default {
  name: 'Customerbranch',
  dicts: ['vs_pay_term', 'vs_bol_type', 'vs_market', 'vs_yes_no', 'vs_currency', 'vs_country'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: false,
      // 总条数
      total: 0,
      // CustBranch Overview表格数据
      customerbranchList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,

      dialogVisible: false,

      activeName: 'first',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        customerCode: null,
        customerName: null,
        marketVal: null,
        branchCode: null,
        branchCountryVal: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        customerCode: [
          { required: true, message: 'Customer Code不能为空', trigger: 'blur' }
        ],
        customerName: [
          { required: true, message: 'Customer Name不能为空', trigger: 'blur' }
        ],
        marketVal: [
          { required: true, message: 'Market Val不能为空', trigger: 'change' }
        ],
        branchCode: [
          { required: true, message: 'Branch Code不能为空', trigger: 'blur' }
        ],
        branchCountryVal: [
          { required: true, message: 'Branch Country不能为空', trigger: 'change' }
        ],
        isTransferredFromLuda: [
          { required: true, message: 'Transferred from Luda不能为空', trigger: 'change' }
        ],
        isDomesticTrade: [
          { required: true, message: 'Domestic Trade不能为空', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询CustBranch Overview列表 */
    getList() {
      this.loading = true
      listCustomerbranch(this.queryParams).then(response => {
        this.customerbranchList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.dialogVisible = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        custBrchId: null,
        customerCode: null,
        customerName: null,
        marketVal: null,
        branchCode: null,
        branchCountryVal: null,
        poDiscountRatio1: null,
        poDiscountRatio2: null,
        portOfLoading: null,
        portOfDischarge: null,
        portOfDestination: null,
        ecTypeConsignee: null,
        ecConsignee: null,
        ecTypeNotify: null,
        ecNotify: null,
        bolTypeVal: null,
        bolShipperInfo: null,
        bolConsigneeInfo: null,
        bolNotifyInfo: null,
        freightTerm: null,
        bolDoorAddress: null,
        shippingMark: null,
        ciShipTo: null,
        plShipTo: null,
        customsClearancePriceTerm: null,
        receiptPriceTerm: null,
        customsClearanceRatio1: null,
        customsClearanceRatio2: null,
        settlementCurrencyVal: null,
        paymentTerm: null,
        trademark: null,
        codeFlag: null,
        isTransferredFromLuda: null,
        isDomesticTrade: null,
        viBuyerName: null,
        viTaxId: null,
        viAddressAndTelNumber: null,
        viBankNameAndAccountNumber: null,
        viReceiverName: null,
        viReceiverTelNumber: null,
        viReceiverAddress: null,
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
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.custBrchId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = 'Create a Customer Branch'
    },
    handleEdit(row) {
      this.reset()
      const custBrchId = row.custBrchId || this.ids
      getCustomerbranch(custBrchId).then(response => {
        this.form = response.data
        this.open = true
        this.title = 'Edit CustBranch'
      })

    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const custBrchId = row.custBrchId || this.ids
      getCustomerbranch(custBrchId).then(response => {
        this.form = response.data
        this.dialogVisible = true
        this.title = 'CustBranch Overview'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.custBrchId != null) {
            updateCustomerbranch(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.dialogVisible = false
              this.getList()
            })
          } else {
            addCustomerbranch(this.form).then(response => {
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
      const custBrchIds = row.custBrchId || this.ids
      this.$modal.confirm('是否确认删除CustBranch Overview编号为"' + custBrchIds + '"的数据项？').then(function() {
        return delCustomerbranch(custBrchIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('brakepadbmwa-customerbranch/customerbranch/export', {
        ...this.queryParams
      }, `customerbranch_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style lang="scss" scoped>
.opButton .el-button {
  size: 20px;
  // 按钮设置圆形
}
</style>
