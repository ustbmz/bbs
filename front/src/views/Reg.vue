<template>
  <div class="layui-container fly-marginTop">
    <div class="fly-panel fly-panel-user" pad20>
      <div class="layui-tab layui-tab-brief" lay-filter="user">
        <ul class="layui-tab-title">
          <li>
            <router-link :to="{ name: 'login' }">登入</router-link>
          </li>
          <li class="layui-this">注册</li>
        </ul>
        <div
          class="layui-form layui-tab-content"
          id="LAY_ucm"
          style="padding: 20px 0"
        >
          <div class="layui-tab-item layui-show">
            <div class="layui-form layui-form-pane">
              <form method="post">
                <div class="layui-form-item">
                  <div class="layui-row">
                    <label for="L_email" class="layui-form-label">用户名</label>
                    <div class="layui-input-inline">
                      <input
                        type="text"
                        name="username"
                        v-model="username"
                        placeholder="请输入用户名"
                        autocomplete="off"
                        class="layui-input"
                      />
                    </div>
                    <div class="layui-form-mid layui-word-aux">
                      将会成为您唯一的登入名
                    </div>
                  </div>
                </div>
                <div class="layui-form-item">
                  <label for="L_username" class="layui-form-label">昵称</label>
                  <div class="layui-input-inline">
                    <input
                      type="text"
                      name="name"
                      v-model="name"
                      placeholder="请输入昵称"
                      autocomplete="off"
                      class="layui-input"
                    />
                  </div>
                </div>
                <div class="layui-form-item">
                  <div class="layui-row">
                    <label for="L_pass" class="layui-form-label">密码</label>
                    <div class="layui-input-inline">
                      <input
                        type="password"
                        name="password"
                        v-model="password"
                        ref="password"
                        placeholder="请输入密码"
                        autocomplete="off"
                        class="layui-input"
                      />
                    </div>
                    <div class="layui-form-mid layui-word-aux">6到16个字符</div>
                  </div>
                </div>
                <div class="layui-form-item">
                  <div class="layui-row">
                    <label for="L_repass" class="layui-form-label">
                      确认密码
                    </label>
                    <div class="layui-input-inline">
                      <input
                        type="password"
                        name="repassword"
                        v-model="repassword"
                        placeholder="请输入密码"
                        autocomplete="off"
                        class="layui-input"
                      />
                    </div>
                  </div>
                </div>
                <div class="layui-form-item">
                  <div class="layui-row">
                    <label for="L_vercode" class="layui-form-label">
                      验证码
                    </label>
                    <div class="layui-input-inline">
                      <input
                        type="text"
                        name="code"
                        v-model="code"
                        placeholder="请输入验证码"
                        autocomplete="off"
                        class="layui-input"
                      />
                    </div>
                    <div class>
                      <span
                        class="svg"
                        style="color: #c00"
                        @click="_getCode()"
                        v-html="svg"
                      ></span>
                    </div>
                  </div>
                </div>
                <div class="layui-form-item">
                  <button
                    class="layui-btn"
                    lay-filter="*"
                    lay-submit
                    type="button"
                    @click="submit()"
                  >
                    立即注册
                  </button>
                </div>
                <div class="layui-form-item fly-form-app">
                  <span>或者直接使用社交账号快捷注册</span>
                  <a
                    href
                    onclick="layer.msg('正在通过QQ登入', {icon:16, shade: 0.1, time:0})"
                    class="iconfont icon-qq"
                    title="QQ登入"
                  ></a>
                  <a
                    href
                    onclick="layer.msg('正在通过微博登入', {icon:16, shade: 0.1, time:0})"
                    class="iconfont icon-weibo"
                    title="微博登入"
                  ></a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCode } from '@/api/login'
import { reg } from '@/api/login'
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'reg',
  data() {
    return {
      username: '',
      name: '',
      password: '',
      repassword: '',
      code: '',
      svg: ''
    }
  },
  mounted() {
    // 与登录页一致：保证 localStorage 与 Vuex 中的 sid 同步，否则刷新后 store 清空会导致提交 sid 为空、验证码永远校验失败
    let sid = localStorage.getItem('sid')
    if (!sid) {
      sid = uuidv4()
      localStorage.setItem('sid', sid)
    }
    this.$store.commit('setSid', sid)
    this._getCode()
  },
  methods: {
    _getCode() {
      let sid = localStorage.getItem('sid')
      getCode(sid).then((res) => {
        console.log(res)
        if (res.code === 200) {
          this.svg = res.data
        }
      })
    },
    submit() {
      const u = (this.username || '').trim()
      const n = (this.name || '').trim()
      if (!u || !n) {
        this.$alert('请填写用户名和昵称')
        return
      }
      if (!this.password || this.password.length < 6 || this.password.length > 16) {
        this.$alert('密码长度为 6～16 个字符')
        return
      }
      if (this.password !== this.repassword) {
        this.$alert('两次输入的密码不一致')
        return
      }
      if (!this.code) {
        this.$alert('请输入验证码')
        return
      }
      const sid = localStorage.getItem('sid') || this.$store.state.sid
      reg({
        username: u,
        name: n,
        password: this.password,
        code: this.code,
        sid
      })
        .then((res) => {
          if (res.code === 200) {
            this.$alert('已注册成功')
            this.$router.push('/login')
          } else if (res.code === 400) {
            this.$alert(res.msg)
          } else if (res.code === 401) {
            this.$alert('图片验证码错误,请输入正确的验证码')
          } else if (res.code === 503) {
            this.$alert(res.msg || '数据库不可用，请检查 MongoDB 是否已启动')
          } else {
            this.$alert(res.msg || '注册失败')
          }
        })
        .catch((err) => {
          const d = err.response && err.response.data
          const msg =
            (d && (d.msg || d.message)) ||
            (err.message === 'Network Error'
              ? '无法连接后端（请确认 api 已在 3000 端口启动）'
              : err.message)
          this.$alert(msg || '请求失败')
        })
    }
  }
}
</script>
<style lang="scss" scoped>
// 公用样式可以放在App.vue中
</style>
