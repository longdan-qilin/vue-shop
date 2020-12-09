<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <!-- 展开行 ele.ui => expand
       -->
      <el-table :data="rolesList" border stripe  row-key="id">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdBottom', i1 === 0 ? 'bdTop' : '', 'vcenter']"
              :key="item1.id"
              v-for="(item1, i1) in scope.row.children"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 和 三级权限  -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdTop', 'vcenter']"
                  :key="item2.id"
                  v-for="(item2, i2) in item1.children"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      :class="[i3 === 0 ? '' : 'bdTop']"
                      :key="item3.id"
                      v-for="(item3, i3) in item2.children"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <pre>{{ scope.row }}</pre>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      title="添加角色"
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
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="EditDialogVisible"
      width="50%"
      @close="EditDialogClosed"
    >
      <el-form
        label-width="70px"
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
      >
        <!-- 角色名称 -->
        <el-form-item label="角色名称">
          <el-input v-model="editForm.roleName" disabled></el-input>
        </el-form-item>
        <!-- 名称描述 -->
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="EditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="SetRightdialogClosed"
    >
      <el-tree
        :data="rightsList"
        :props="treeprops"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defkeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有的权限数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeprops: {
        label: 'authName',
        children: 'children',
      },
      //设置树形控件中默认选中的内容
      defkeys: [],
      //是否显示添加用户弹出窗
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        roleName: '',
        roleDesc: '',
      },
      // 添加的验证规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名在3~10个字符之间',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名在3~10个字符之间',
            trigger: 'blur',
          },
        ],
      },
      // 查询到用户信息的对象
      editForm: {},
      //保存正在操作的角色id
      roleId: '',
      // 编辑验证
      editFormRules: {
        roleDesc: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名在3~10个字符之间',
            trigger: 'blur',
          },
        ],
      },
      // 对话框隐藏
      EditDialogVisible: false,
    }
  },

  created() {
    this.getRolesList()
  },

  methods: {
    // 获取所有的角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200)
        return this.$message.error('获取角色列表失败！')
      // 成功则把数据导入自定义的数组中
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 根据id删除对应的权限  role指定的行数据 rightId指定的权限id
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        console.log(confirmResult)
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
      // this.$message.success('删除权限成功！')
      //刷新数据 这样会发生完整渲染导致收起 this.getRolesList()
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200)
        return this.$message.error('获取权限列表失败！')
      this.rightsList = res.data
      console.log(this.rightsList)
      // 获取三级节点的id
      this.getLeafkeys(role, this.defkeys)
      this.setRightDialogVisible = true
      this.roleId = role.id
    },
    // 通过递归的形式 获取角色下列所有三级权限的id  并保存到 defkeys 数组中
    getLeafkeys(node, arr) {
      // 如果当前 node 节点不包含
      // children 属性 则是三级节点
      if (!node.children) return arr.push(node.id)
      node.children.forEach((item) => this.getLeafkeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    SetRightdialogClosed() {
      this.defkeys = []
    },
    //当用户在树形权限对话框中点击确定，将用户选择的
    //权限发送请求进行更新
    async allotRights() {
      // 获取所有选中和半选的内容 getHalfCheckedKeys返回目前半选中的节点所组成的数组
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      // 将这个数组变成字符串
      const idstr = keys.join(',')
      // 发送请求完成更新
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idstr }
      )
      console.log(idstr)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      this.$message.success('分配权限成功！')
      this.getRolesList()
      //关闭对话框
      this.setRightDialogVisible = false
    },
    // 添加 角色 关闭对话框
    addDialogClosed() {
      //对话框关闭之后，重置表达  通过ref引用调用resetFields 方法
      this.$refs.addFormRef.resetFields()
    },
    // 添加 角色
    addUser() {
      // 点击确认按钮添加角色 且对其表单预验证validate 如果不符合打回去
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请填写合法的角色信息')
        // 符合  就发送axios请求 因为validate返回promise 则可以用async代替
        // this.addForm提交的数据
        const { data: res } = await this.$http.post('/roles', this.addForm)
        if (res.meta.status !== 201)
          return this.$message.error('添加角色信息失败！')
        // 添加成功的提示
        this.$message.success('添加角色信息成功！')
        // 关闭对话框
        this.addDialogVisible = false
        // 渲染页面
        this.getRolesList()
      })
    },
    // 通过id 查询角色信息 编辑之前先查询角色信息
    async showEditDialog(id) {
      console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200)
        return this.$message.error('查询角色信息失败！')
      this.editForm = res.data
      //  通过请求到的信息赋值给表单 之后对话框弹开
      this.EditDialogVisible = true
    },
    // 监听修改用户的对话框关闭事件    this.$refs editFormRef组件的实例对象
    EditDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 表单在提交前还要请求一次预验证
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        // 发起修改用户信息数据请求
        console.log(this.editForm)
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          }
        )
        if (res.meta.status !== 200)
          return this.$message.error('更新用户信息失败！')
        // 关闭对话框
        this.EditDialogVisible = false
        // 刷新数据列表
        this.getRolesList()
        //  提示成功
        this.$message.success('更新用户信息成功！')
      })
    },
    // 通过id删除对应的角色信息
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 确认删除confirm 取消删除cancel
      console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200)
        return this.$message.error('删除角色信息失败！')
      // 跟新渲染
      this.getRolesList()
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdTop {
  border-top: 1px solid #eee;
}

.bdBottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style> 