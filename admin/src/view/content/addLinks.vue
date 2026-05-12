<template>
  <div>
    <Modal
      v-model="showStatus"
      :title="isEdit ? '编辑标签' : '添加标签'"
      @on-ok="ok"
      @on-cancel="cancel"
    >
      <Form :model="localItem" :label-width="80">
        <FormItem label="名称">
          <Input v-model="localItem.title" placeholder="请输入标签标题"></Input>
        </FormItem>
        <FormItem label="类名">
          <Input v-model="localItem.link" placeholder="请输入链接网址"></Input>
        </FormItem>
        <FormItem label="请选择链接类型">
          <RadioGroup v-model="localItem.type">
            <Radio label="tip">温馨通道</Radio>
            <Radio label="link">友情链接</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="是否置顶">
          <RadioGroup v-model="localItem.isTop">
            <Radio label="0">未置顶</Radio>
            <Radio label="1">已置顶</Radio>
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
    isEdit: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    item(newval, oldval) {
      this.localItem = newval
    },
    isShow() {
      this.showStatus = this.isShow
    }
  },
  data() {
    return {
      showStatus: false,
      localItem: {
        title: '',
        linke: '',
        type: '',
        isTop: '0'
      }
    }
  },
  methods: {
    ok() {
      this.$emit('addEvent', this.localItem)
      this.$Message.info('操作成功！')
    },
    cancel() {
      this.$emit('changeEvent', false)
      this.$Message.info('取消操作！')
    }
  }
}
</script>
