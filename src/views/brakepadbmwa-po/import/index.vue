<template>
  <!--  写入4个步骤条-->
  <div class="step">
    <el-steps :active="active" finish-status="success" align-center>
      <el-step title="选择客户分支"></el-step>
      <el-step title="导入数据"></el-step>
      <el-step title="确认数据"></el-step>
    </el-steps>
    <div class="importPo">
      <div v-if="active === 0" class="custBrch">
        <el-form :model="form" ref="form" label-width="auto">
          <el-form-item prop="custbrushcode">
            <el-select v-model="selectCustBrchId" placeholder="请选择客户分支" @change="selectCustBrch" filterable clearable>
              <el-option
                v-for="custBrchCode in custBrchCode"
                :key="custBrchCode.custBrchId"
                :label="custBrchCode.customerBranchCode"
                :value="custBrchCode.custBrchId"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!--    第二步文件上传-->
      <div v-if="active === 1" class="upload">
        <el-upload
          class="upload"
          ref="upload"
          drag
          :data="uploadData"
          action="#"
          :headers="upload.headers"
          :http-request="uploadFile"
          :file-list="upload.fileList"
          :on-progress="handleFileUploadProgress"
          :on-success="handleFileSuccess"
          :on-error="handleFileError"
          :auto-upload="false"
          accept=".xls,.xlsx"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
<!--        确认上传按钮-->
        <el-button type="primary" @click="submitUpload">确认上传</el-button>
      </div>
<!--      第三步确认结果 接受后端返回的结果集到Table-->
      <div v-if="active===2" class="confirmData">
        <el-table v-loading="loading" :data="purchaseorderInputList" >
          <el-table-column prop="customerBranchCode" align="center" label="Customer-Branch Code" width="180">
            <template slot-scope="scope">
              <span>{{CustBrchCodeValue}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="salesOrderNumber" align="center" label="Sales Order #" width="180" ></el-table-column>
          <el-table-column prop="purchaseOrderNumber" align="center" label="Purchase Order #" width="180"></el-table-column>
          <el-table-column label="Requested Delivery Date" align="center" prop="requestedDeliveryDate" width="180">
<!--            <template slot-scope="scope">-->
<!--              <span>{{ parseTime(scope.row.requestedDeliveryDate, '{y}-{m}-{d}') }}</span>-->
<!--            </template>-->
          </el-table-column>
          <el-table-column prop="sumOrderedQuantity" align="center" label="Quantity (Set)" width="180"></el-table-column>
          <el-table-column prop="amount" align="center" label="Amount" width="180">
            <template slot-scope="scope">
              <span>{{settlementCurrencyValue}}{{scope.row.amount}} </span>
            </template>
          </el-table-column>

        </el-table>

      </div>
    </div>
    <!--    上一步-->
    <div class="step-btn">
      <el-button v-if="active > 0"  type="primary" @click="prev">上一步</el-button>

      <el-button v-if="active ===0 && selectCustBrchId!=='' " style="margin-top: 12px;" @click="next">下一步</el-button>
            <!--    第四步时按钮变成-->
      <el-button v-else-if="active === 2" style="margin-top: 12px;" type="success" @click="finish">确认</el-button>
    </div>



  </div>
</template>

<script>
import { selectCustBrchCode } from '@/api/brakepadbmwa-customerbranch/customerbranch'
import { getToken } from "@/utils/auth";
import { createPo } from '@/api/brakepadbmwa-po/purchaseorder'
import axios from 'axios'
export default {
  name: 'importPo',
  created() {
    this.getCustBrchCode()
  },
  data() {
    return {
      loading: true,
      purchaseorderInputList: [],
      form: {},
      active: 0,
      setp1 : false,
      step2 : false,
      step3 : false,
      selectCustBrchId: '',
      CustBrchCodeValue: '',
      settlementCurrencyValue: '',
      custBrchCode: [],
      options: [],
      batchNumber : '',
      uploadData: {
        custBrchId: ''
      },
      upload: {
        // 是否禁用上传
        isUploading: false,
        // 设置上传的请求头部
        // headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/brakepadbmwa-po/purchaseorder/read-po",
        // 上传的文件列表
        fileList: []
      },
    }
  },

  methods: {
    // 选择客户分支
    selectCustBrch(custBrchId) {
      let obj = this.custBrchCode.find(item => item.custBrchId === custBrchId)
      this.CustBrchCodeValue = obj.customerBranchCode
      this.settlementCurrencyValue = obj.settlementCurrencyVal
    },
    uploadFile(params) {
      var formData = new FormData();
      formData.append("file", params.file);
      formData.append("custBrchId", this.selectCustBrchId);
      // 发送axios请求 到this.upload.url
      axios.post(this.upload.url,formData, {
        headers: { Authorization: "Bearer " + getToken() },
        }
      ).then(response => {
        if (response.data.code === 200) {
          this.purchaseorderInputList = response.data.data
          this.$message.success('上传成功')
          this.active = 2
          this.batchNumber = response.headers.batchnumber
          this.loading = false
        }else {
          this.$message.error(response.data.msg)
        }
      })

    },
    // 文件提交处理
    submitUpload() {
      // 将selectCustBrchId赋值给uploadData
      // this.uploadData.custBrchId = this.selectCustBrchId
      this.$refs.upload.submit();
    },
// 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
// 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      // this.upload.isUploading = false;
      // this.form.filePath = response.url;
      // this.purchaseorderInputList = response.data
      // this.loading = false;
      // this.$modal.notifySuccess(response.msg);
    },
    // 文件上传失败处理
    handleFileError(err, file, fileList) {
      this.upload.isUploading = false;
      this.$modal.msgError(err);
    },
    // 获取custbrchcode数组 并转换为JSON
    getCustBrchCode() {
      selectCustBrchCode().then(response => {
        this.custBrchCode = response.data
        this.custBrchCode = JSON.parse(JSON.stringify(this.custBrchCode))
      })
    },
    // 获取custBrchCode的值
    next() {
      if (this.active++ > 2) this.active = 0
    },
    prev() {
      if (this.active-- < 0) this.active = 4
    },
    finish() {

      createPo(this.selectCustBrchId, this.batchNumber).then(response => {
        if (response.code === 200) {
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          });
        }else {
          this.$message.error(response.data.msg)
        }
      })
      this.$router.push({ path: '/purchase-order/overview' })
    }
  }
}
</script>

<style scoped>
.step {
  width: 100%;
  margin: 0 auto;
  text-align: center;
  margin-top: 50px;
}

.step-btn {
  margin-top: 12px;
}

.custBrch {
  margin-top: 30px;
  margin-left: auto;
}

.upload {
  margin-top: 30px;
  margin-left: auto;
}

.upload ::v-deep .el-upload-list__item {
  margin-top: 20px;
  width: auto;
  margin-left: 300px;
  margin-right: 300px;
  height: 30px;

}

.upload ::v-deep .el-icon-close {
  font-size: 20px;

}

.upload ::v-deep .el-upload-dragger {
  width: 400px;
  height: 200px;
  margin-left: auto;
  margin-right: auto;
}

.importPo {
  margin-top: 2px;
  margin-left: auto;
  border: 0px solid #ebeef5;
  height: 300px;
}
.step-btn {
  margin-bottom: 20px;
}
.confirmData {
  margin-top: 30px;
  margin-left: 40px;
}


</style>
