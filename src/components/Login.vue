<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <!-- :model="loginForm"  这是属性绑定   ref 的值表单引用对象-->
      <el-form
        label-width="0"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
          >
          </el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            type="password"
          >
          </el-input>
        </el-form-item>
        <!-- 密码区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录按钮</el-button>
          <el-button type="info" @click="resetloginForm">重置按钮</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456",
      },
      // 定义验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: "请输入登录名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    resetloginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      // 点击登录的时候先调用 validate 方法验证表单内容是否有误
      this.$refs.loginFormRef.validate(async valid => {
        //如果valid参数为true则验证通过
        if (!valid) return;
        //发送请求进行登录
        const {data : res} = await this.$http.post('login', this.loginForm)
        if(res.meta.status !== 200) {
          return this.$message.error('登录失败！' + res.meta.msg)
        }
        this.$message.success('登陆成功！')
        // 保存token
        window.sessionStorage.setItem('token',res.data.token)
        // 跳转页面home
        this.$router.push('/home')
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
}

.login_box {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  transform: translate(-50%, -50%);

  .avatar_box {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    border: 1px solid #eee;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    padding: 10px;
    background-color: #fff;
    left: 50%;
    transform: translate(-50%, -50%);

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

  .login_form {
    position: absolute;
    padding: 0 20px;
    width: 100%;
    bottom: 0;
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>