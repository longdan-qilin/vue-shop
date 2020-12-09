<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表数据展示 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="180px">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格"> </el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              class="el-icon-edit"
              size="mini"
              @click="showBox"
            ></el-button>
            <el-button
              type="success"
              class="el-icon-location-outline"
              size="mini"
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 7, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>

    <!-- 省市联动效果 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <!-- options 指定数据源 -->
          <!-- props  用来指定配置对象 -->
          <!--v-model 指定双向绑定的文件在哪里-->
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="cascaderProps"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%"
    >   
    <!-- 时间线组件  -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
// 按需导入城市文件
import cityData from './citydata'

export default {
  data() {
    return {
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      // 获取的订单数据列表
      ordersList: [],
      // 获取总的数据条数
      total: 0,
      // 省市联动效果对话框隐藏于显示
      addressDialogVisible: false,
      // 联动效果 表单数据对象
      addressForm: {
        address1: [],
        address2: '',
      },
      // 验证规则
      addressFormRules: {
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ],
      },
      // 各大城市数据
      cityData,
      // 级联选择器配置对象
      cascaderProps: {},
      //控制物流进度对话框的显示和隐藏
      progressVisible: false,
      //保存物流信息
      progressInfo: []
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    // 获取所有订单数据
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo,
      })
      // console.log(res);
      if (res.meta.status !== 200)
        return this.$message.error('获取订单数据失败！')
      // this.$message.success('获取订单数据成功')
      // console.log(res);
      // 总的数据信息
      this.ordersList = res.data.goods
      // 总的条数
      this.total = res.data.total
      console.log(this.ordersList)
      console.log(this.total)
    },
    // 监听pagesize每页多少条数据
    handleSizeChange(newsize) {
      // 把最新的值赋值 查询参数对象
      this.queryInfo.pagesize = newsize
      // 渲染 重新获取订单列表
      this.getOrdersList()
    },
    // 监听pagenum 显示当前第几页
    handleCurrentChange(newnum) {
      this.queryInfo.pagenum = newnum
      this.getOrdersList()
    },
    // 实现省市联动效果
    showBox() {
      // 对话框显示
      this.addressDialogVisible = true
    },
    // 重置表单数据
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    // 显示物流进度的对话框
    async showProgressBox() {
        //发送请求获取物流数据
        const { data: res } = await this.$http.get('/kuaidi/804909574412544580')

        if (res.meta.status !== 200) {
          return this.$message.error('获取物流进度失败!')
        }
        this.progressInfo = res.data
        //显示对话框
        this.progressVisible = true
      }
  },
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>