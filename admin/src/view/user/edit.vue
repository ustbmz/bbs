<template>
  <div>
    <Modal
      v-model="showStatus"
      :title="$t('userForm.modalEditTitle')"
      @on-ok="ok"
      @on-cancel="cancel"
      :loading="loading"
    >
      <Form
        :model="localItem"
        :label-width="100"
        :rules="ruleValidate"
        ref="table"
      >
        <FormItem :label="$t('userForm.labelName')" prop="name">
          <i-input
            v-model="localItem.name"
            :placeholder="$t('userForm.phName')"
          ></i-input>
        </FormItem>
        <FormItem :label="$t('userForm.labelUsername')" prop="username">
          <i-input
            v-model="localItem.username"
            :placeholder="$t('userForm.phUsername')"
          ></i-input>
        </FormItem>
        <FormItem :label="$t('userForm.labelPassword')" prop="password">
          <i-input
            type="password"
            v-model="localItem.password"
            :placeholder="$t('userForm.phPassword')"
          ></i-input>
        </FormItem>
        <FormItem :label="$t('userForm.labelRoles')" prop="roles">
          <Select v-model="localItem.roles" multiple>
            <Option
              v-for="(item, index) in roles"
              :value="item.role"
              :key="'roles-' + index"
              >{{ item.name }}</Option
            >
          </Select>
        </FormItem>
        <FormItem :label="$t('userForm.labelDisabled')">
          <RadioGroup v-model="localItem.status">
            <Radio label="0">{{ $t('common.no') }}</Radio>
            <Radio label="1">{{ $t('common.yes') }}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem :label="$t('userForm.labelVip')">
          <RadioGroup v-model="localItem.isVip">
            <Radio label="0">{{ $t('common.no') }}</Radio>
            <Radio label="1">{{ $t('common.yes') }}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem :label="$t('userForm.labelFavs')" prop="favs">
          <i-input v-model="localItem.favs" style="width: 120px;"></i-input>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<script>
import { userDispatch } from '@/api/admin'
export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: () => {}
    },
    roles: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    item(newval) {
      this.localItem = { ...newval }
    },
    isShow() {
      this.showStatus = this.isShow
    }
  },
  data() {
    return {
      loading: true,
      showStatus: false,
      tagsList: [],
      oldName: '',
      localItem: {
        _id: '',
        name: '',
        username: '',
        password: '',
        roles: [],
        status: '0',
        favs: 100,
        isVip: '0'
      }
    }
  },
  computed: {
    ruleValidate() {
      return {
        name: [
          { required: true, message: this.$t('userForm.vNameRequired'), trigger: 'blur' },
          {
            type: 'string',
            min: 4,
            message: this.$t('userForm.vNameMin'),
            trigger: 'change'
          },
          {
            type: 'string',
            max: 16,
            message: this.$t('userForm.vNameMax'),
            trigger: 'change'
          }
        ],
        username: [
          { required: true, message: this.$t('userForm.vUserRequired'), trigger: 'blur' },
          { type: 'email', message: this.$t('userForm.vEmail'), trigger: 'blur' },
          {
            validator: this.userNameValidator,
            trigger: 'blur'
          }
        ],
        roles: [{ validator: this.rolesValidator, trigger: 'blur' }],
        password: [
          {
            type: 'string',
            min: 6,
            message: this.$t('userForm.vPwdMin'),
            trigger: 'change'
          },
          {
            type: 'string',
            max: 20,
            message: this.$t('userForm.vPwdMax'),
            trigger: 'change'
          }
        ],
        favs: [{ validator: this.favValidator, trigger: 'change' }]
      }
    }
  },
  methods: {
    favValidator(rule, value, callback) {
      if (!value) {
        return callback(new Error(this.$t('userForm.errFavsRequired')))
      }
      if (!/^[1-9]\d*$/.test(value)) {
        callback(new Error(this.$t('userForm.errFavsNumber')))
        return
      }
      const result = parseInt(value)
      if (result % 10 === 0) {
        callback()
      } else {
        callback(new Error(this.$t('userForm.errFavsDiv10')))
      }
    },
    userNameValidator(rule, value, callback) {
      if (this.item.username === this.localItem.username) {
        callback()
        return
      }
      userDispatch.use('check', { username: value }).then((res) => {
        if (res.code === 200) {
          const data = res.data
          if (data === 1) {
            callback()
          } else if (data === 0) {
            callback(new Error(this.$t('userForm.errUsernameTaken')))
          }
        }
      })
    },
    rolesValidator(rule, value, callback) {
      if (!value || value.length === 0) {
        callback(new Error(this.$t('userForm.errRoles')))
      } else {
        callback()
      }
    },
    ok() {
      this.$refs.table.validate((valid) => {
        if (valid) {
          this.loading = false
          this.$emit('changeEvent', false)
          this.$emit('editEvent', this.localItem)
          this.$Message.info(this.$t('userForm.editOk'))
        } else {
          this.loading = false
          this.$nextTick(() => (this.loading = true))
          this.$Message.error(this.$t('userForm.editCheck'))
        }
      })
    },
    cancel() {
      this.$refs.table.resetFields()
      this.$emit('changeEvent', false)
      this.$Message.info(this.$t('userForm.editCancel'))
    }
  }
}
</script>
