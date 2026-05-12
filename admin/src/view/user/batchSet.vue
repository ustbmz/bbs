<template>
  <div>
    <Modal
      v-model="showStatus"
      :title="$t('userForm.modalBatchTitle')"
      @on-ok="ok"
      @on-cancel="cancel"
    >
      <Form :model="localItem" :label-width="100" ref="table">
        <FormItem :label="$t('userForm.labelRoles')">
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
            <Radio label="">{{ $t('common.notSet') }}</Radio>
            <Radio label="0">{{ $t('common.no') }}</Radio>
            <Radio label="1">{{ $t('common.yes') }}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem :label="$t('userForm.labelVip')">
          <RadioGroup v-model="localItem.isVip">
            <Radio label="">{{ $t('common.notSet') }}</Radio>
            <Radio label="0">{{ $t('common.no') }}</Radio>
            <Radio label="1">{{ $t('common.yes') }}</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<script>
export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    roles: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    isShow() {
      this.showStatus = this.isShow
    }
  },
  data() {
    return {
      showStatus: false,
      localItem: {
        status: '',
        isVip: '',
        roles: ['user']
      }
    }
  },
  methods: {
    ok() {
      this.$emit('changeEvent', false)
      const result = {}
      for (var key of Object.keys(this.localItem)) {
        if (this.localItem[key] !== '') {
          result[key] = this.localItem[key]
        }
      }
      this.$emit('editEvent', result)
      this.$Message.info(this.$t('userForm.setOk'))
    },
    cancel() {
      this.$refs.table.resetFields()
      this.$emit('changeEvent', false)
      this.$Message.info(this.$t('userForm.setCancel'))
    }
  }
}
</script>
