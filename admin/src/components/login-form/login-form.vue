<template>
  <Form
    ref="loginForm"
    :model="form"
    :rules="rules"
    @keydown.enter.native="handleSubmit"
  >
    <FormItem prop="username">
      <Input v-model="form.username" :placeholder="$t('loginForm.phUser')">
        <span slot="prepend">
          <Icon :size="16" type="ios-person"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="password">
      <Input
        type="password"
        v-model="form.password"
        :placeholder="$t('loginForm.phPwd')"
      >
        <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="code">
      <Input
        class="imooc-input"
        type="text"
        v-model="form.code"
        :placeholder="$t('loginForm.phCode')"
      >
        <span slot="prepend">
          <Icon :size="14" type="md-image"></Icon>
        </span>
        <span
          class="imooc-code"
          slot="append"
          v-html="svg"
          @click="_getCode()"
        ></span>
      </Input>
    </FormItem>
    <FormItem>
      <Button :loading="loading" @click="handleSubmit" type="primary" long>{{
        $t('loginForm.btn')
      }}</Button>
    </FormItem>
  </Form>
</template>
<script>
// import axios from '@/libs/request'
import { getCode } from '@/api/login'
import uuid from 'uuid/v4'
export default {
  name: 'LoginForm',
  props: {
    userNameRules: {
      type: Array,
      default: null
    },
    passwordRules: {
      type: Array,
      default: null
    },
    codeRules: {
      type: Array,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      svg: '',
      form: {
        username: '',
        password: '',
        code: '',
        sid: ''
      }
    }
  },
  computed: {
    rules() {
      const userRules = this.userNameRules || [
        { required: true, message: this.$t('loginForm.vUser'), trigger: 'blur' }
      ]
      const pwdRules = this.passwordRules || [
        { required: true, message: this.$t('loginForm.vPwd'), trigger: 'blur' },
        {
          type: 'string',
          min: 6,
          message: this.$t('loginForm.vPwdLen'),
          trigger: 'change'
        }
      ]
      const codeRules = this.codeRules || [
        { required: true, message: this.$t('loginForm.vCode'), trigger: 'blur' },
        {
          type: 'string',
          len: 4,
          message: this.$t('loginForm.vCodeLen'),
          trigger: 'change'
        }
      ]
      return {
        username: userRules,
        password: pwdRules,
        code: codeRules
      }
    }
  },
  mounted() {
    let sid = ''
    if (localStorage.getItem('sid')) {
      sid = localStorage.getItem('sid')
    } else {
      sid = uuid()
      localStorage.setItem('sid', sid)
    }
    this.$store.commit('setSid', sid)
    this.form.sid = sid
    this._getCode()
  },
  methods: {
    handleSubmit() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.$emit('on-success-valid', { ...this.form })
        }
      })
    },
    _getCode() {
      getCode(this.$store.state.sid).then((res) => {
        if (res.code === 200) {
          this.svg = res.data
        }
      })
    }
  }
}
</script>
<style lang="scss">
.imooc-input {
  .ivu-input-group-append {
    padding: 0;
  }
  .ivu-input-group-prepend {
    width: 32px;
  }
}

.imooc-code {
  display: inline-block;
  padding: 0;
  height: 28px;
  overflow: hidden;
  svg {
    width: 120px;
    position: relative;
    top: -12px;
  }
}
</style>
