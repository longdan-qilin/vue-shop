<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视区 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            clearable
            v-model="queryInfo.query"
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="95px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          width="70px"
          prop="goods_weight"
        ></el-table-column>
        <el-table-column label="创建时间" width="140px" prop="add_time">
          <template slot-scope="scope">
            {{ scope.row.add_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button
              class="el-icon-edit"
              type="primary"
              size="mini"
            ></el-button>
            <el-button
              class="el-icon-delete"
              type="danger"
              size="mini"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区 :page-sizes每页显示多少条 background默认背景-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1, //当前页
        pagesize: 10, //一页多少条
      },
      // 获取所有的商品数据
      goodsList: [],
      // 商品总条数
      total: 0,
    }
  },
  created() {
    // 获取所有的商品数据
    this.getGoodsList()
  },
  methods: {
    // 通过请求获取商品数据
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品数据失败！')
      // 获取成功 将数据传给定义的数组
      this.goodsList = res.data.goods
      // 把总条数赋值
      this.total = res.data.total
      console.log(this.goodsList)
      console.log(this.total)
    },
    // 监听一页多少条的变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听每页的变化
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 通过id删除对应的参数
    async removeById(goods_id) {
      const resultConfirm = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if(resultConfirm !== 'confirm') {
        return this.$message.info('已取消删除！')
      }

      const {data:res} = await this.$http.delete(`goods/${goods_id}`)
      if(res.meta.status !== 200) return this.$message.error('删除商品失败！')
      this.$message.success('删除商品成功！')
      // 如果当前页只有一条数据或者不是第一页的时候删除数据 则当前页跳转前一页
      if(this.goodsList.length === 1 && this.queryInfo.pagenum !==1)   --this.queryInfo.pagenum
      this.getGoodsList()
    },
    // 添加商品功能
    goAddpage(){
      this.$router.push('/goods/add')
    }
  },
}
</script>

<style lang="less" scoped>
.el-table /deep/ th {
  text-align: center;
}
</style>