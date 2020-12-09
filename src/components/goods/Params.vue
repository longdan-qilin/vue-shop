<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false"
      ></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            :options="catelist"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab标签 切换栏 -->
      <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
        
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisadbled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 然后再修改展开行中的代码，生成el-tag和文本框以及添加按钮-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环生成的el-tag -->
                <el-tag
                  :key="i"
                  v-for="(item, i) in scope.row.attr_vals"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 修改按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>

            <!-- 动态属性表格 -->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  class="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  class="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态参数面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisadbled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环生成的el-tag -->
                <el-tag
                  :key="i"
                  v-for="(item, i) in scope.row.attr_vals"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="scope.row(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 修改按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  class="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  class="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        label-width="80px"
        :rules="addFormRules"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        label-width="80px"
        :rules="editFormRules"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
export default {
  data() {
    return {
      // 获取商品分类的数据列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 级联选择框双向绑定的数组
      selectedCateKeys: [],
      // 被激活的页面名称
      activeName: 'many',
      //动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 添加对话框显示与隐藏
      addDialogVisible: false,
      // 定义添加参数表单的数据对象
      addForm: {
        attr_name: '',
      },
      // 定义添加参数表单的数据验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      },
      // 修改对话框显示与隐藏
      editDialogVisible: false,
      // 定义修改参数表单的数据对象
      editForm: {},
      // 定义修改参数表单的数据验证规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      },
    }
  },
  created() {
    this.getCatelist()
  },
  methods: {
    async getCatelist() {
      const { data: res } = await this.$http.get('categories')
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      // 获取商品分类成功
      this.catelist = res.data
    },
    // 级联选择框选中项变化会触发
    handleChange() {
      this.getParamsData()
    },
    // tab 点击页签的点击事件的处理函数
    handleTabClick() {
      this.getParamsData()
      console.log(this.activeName)
    },
    // 获取参数的 列表数据
    async getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        // 证明选中的不是 3 级分类 就清空且返回
        this.selectedCateKeys = []
        // 当选择其他分类时候 如果选择二级的话 上次的参数不会清空
        this.manyTableData =  []
        this.onlyTableData = []
        return false
      }
      // 选中的是 3 级分类的id
      // 确定了选中的是 3 级分类。根据所选分类的 ID，和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      )
      if (res.meta.status !== 200)
        return this.$message.error('获取分类参数失败！')

      // 因为获取参数的tag属性 且需要数组 因此打印出来且整个元素遍历 转为数组
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(' ') : []
        // 添加布尔值 控制按钮与文本框的切换显示
        //  在这里面写可以解决联动效果 其他输入框不会同时绑定
        item.inputVisible = false
        // 文本框输入的值
        item.inputValue = ''
      })
      console.log(res.data)

      // 判断是动态参数还是静态参数 区分 这个2个不同的面板可以挂载自已的数据
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 点击确认添加参数 判断数据符合 发送请求符合就参数提交服务器 更新
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 201) this.$message.error('添加参数失败！')
        // 添加成功的提示
        this.$message.success('添加参数信息成功！')
        // 更新渲染数据
        this.getParamsData()
        // 关闭对话框
        this.addDialogVisible = false
      })
    },
    // 添加参数后重置里面的参数
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮通过查询id得到参数
    async showEditDialog(attr_id) {
      const {
        data: res,
      } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        { params: { attr_sel: this.activeName } }
      )
      console.log(res.data)
      if (res.meta.status !== 200)
        return this.$message.error('获取参数信息失败！')
      // 成功的话  赋值给表单数据对象
      this.editForm = res.data
      // 显示对话框
      this.editDialogVisible = true
    },
    // 修改编辑功能
    editParams() {
      // 在确认之前 提交到服务器 预验证下 通过就发送请求
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 200)
          return this.$message.error('修改参数失败！')
        this.$message.success('修改参数成功！')
        // 更新渲染数据
        this.getParamsData()
        // 关闭对话框
        this.editDialogVisible = false
      })
    },

    // 修改参数后重置里面的参数
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    // 删除参数
    async removeParams(attr_id) {
      // 弹出消息提示框
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      // 如果取消删除返回字符串cancel 确认confirm
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      // 确认删除 发送delete请求
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
      this.$message.success('删除参数信息成功！')
      // 更新参数
      this.getParamsData()
    },
    // 点击按钮 展示输入框
    showInput(row) {
      row.inputVisible = true
      // 自动获取焦点 但是这时候dom还没渲染完成还是按钮 因此需要nextTick()方法
      // $nextTick被调用 页面重新渲染
      // 作用:就是让页面上的元素重新渲染才会指定回调函数中的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 失去焦点和发起enter回车键 触发事件
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputVasible = false
        row.inputValue = ''
        return
      }
      // 如果没有return 则证明输入的内容 需要做好后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrvals(row)
    },
    // 将对attr_vals 操作 保存这次操作
    async saveAttrvals(row) {
      // 需要发起请求 保存这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' '),
        }
      )
      if (res.meta.status !== 200)  return this.$message.error('修改参数项失败！')
      this.$message.success('修改参数项成功！')
    },
    // 删除参数的属性值
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrvals(row)
    },
  },
  computed: {
    // 点击按钮如果到了三级分类就开启 否则就禁用按钮
    isBtnDisadbled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中了三级分类的id
    cateId() {
      // 长度等于3说明选中三级分类
      if (this.selectedCateKeys.length === 3) {
        // 返回这个id
        console.log(this.selectedCateKeys[2])
        return this.selectedCateKeys[2]
      }
      // 否则 返回null
      return null
    },
    // 判断是动态参数还是静态属性
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
  },
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>