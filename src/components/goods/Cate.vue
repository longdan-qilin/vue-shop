<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        style="margin-top: 15px"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否生效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 编辑-->
       <template v-slot:opt>
            <el-button type="primary" size="mini" class="el-icon-edit">编辑</el-button>
            <el-button type="danger" size="mini" class="el-icon-delete">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 7, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :rules="addCateFormRules"
        ref="addCateFormRef"
        :model="addCateForm"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options 指定数据源 -->
          <!-- props  用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="ParentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 获取商品分类的数据列表
      catelist: [],
      // 数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          // 表示当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的名称
          template: 'isok',
        },
        {
          label: '排序',
          // 表示当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的名称
          template: 'order',
        },
        {
          label: '编辑',
          // 表示当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的名称
          template: 'opt',
        },
      ],
      // 添加对话框 显示隐藏
      addCateDialogVisible: false,
      // 添加表单自定义
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父极分类id 添加1级分类，则父分类Id应该设置为  0
        cat_pid: 0,
        // 分类层级	 0表示一级分类；1表示二级分类；2表示三级分类
        cat_level: 0,
      },
      // 添加表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
      },
      // 父级列表数据
      ParentCateList: [],
      // 配置的数据对象
      cascaderProps: {
        // checkStrictly	是否严格的遵守父子节点不互相关联
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true,
      },
      // 选择项父级分类的id数组
      selectedKeys: [],
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类的数据
    async getCateList() {
      const { data: res } = await this.$http.get('/categories', {
        params: this.querInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类数据失败！')
      console.log(res.data)
      // 把数据列表赋值给catelist
      this.catelist = res.data.result
      // 把总数据条数赋值
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange(newsize) {
      this.querInfo.pageszie = newsize
      // 更新渲染
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange(newsize) {
      this.querInfo.pagenum = newsize
      // 更新渲染
      this.getCateList()
    },
    // 添加角色
    showAddCateDialog() {
      // 调用父级分类数据列表函数
      this.getParentCateList()
      // 对话框显示
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('/categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) return this.$message.error('获取数据失败！')
      console.log(res.data)
      this.ParentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChange() {
      // 如果 selectedKeys 数组的 length 大于 0，证明选中了父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的 ID
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮 添加新的分类
    addCate() {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return false
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
      // this.addCateDialogVisible = false
    },
    // 监听关闭对话框关闭事件 重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      // 选择到的父分类 ID
      this.selectedKeys = []
      // 准备提交到后台的分类等级和分类 ID
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
  },
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>