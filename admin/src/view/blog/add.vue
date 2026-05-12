<template>
  <div>
    <Card>
      <Form
        :model="localItem"
        :label-width="80"
        :rules="ruleValidate"
        ref="table"
      >
        <FormItem label="作者昵称" prop="author">
          <Input
            prefix="md-mail"
            v-model="localItem.author"
            placeholder="请输入作者昵称或邮箱地址"
          ></Input>
        </FormItem>
        <FormItem label="文章标题" prop="title">
          <Input
            prefix="md-lock"
            v-model="localItem.title"
            placeholder="请输入文章标题"
          ></Input>
        </FormItem>
        <FormItem label="文章分类" prop="type">
          <Select v-model="localItem.type">
            <Option
              v-for="(item, index) in types"
              :value="item.name"
              :key="'types-' + index"
              >{{ item.name }}</Option
            >
          </Select>
        </FormItem>
        <FormItem label="是否禁用">
          <RadioGroup v-model="localItem.status">
            <Radio label="0">否</Radio>
            <Radio label="1">是</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="文章内容">
          <MarkdownEditor v-model="localItem.content"></MarkdownEditor>
        </FormItem>
        <FormItem class="btn-item">
          <Button
            type="primary"
            size="large"
            @click="cancel"
            :loading="this.loading"
          >
            取消返回
          </Button>
          <Button
            type="primary"
            size="large"
            @click="confirm"
            :loading="this.loading"
          >
            确认添加
          </Button>
        </FormItem>
      </Form>
    </Card>
  </div>
</template>
<script>
import MarkdownEditor from '@/components/markdown/index'
import { blogDispatch } from '@/api/blog'

const typesCheck = (rule, value, callback) => {
  if (value.length === 0) {
    callback(new Error('请选择用户文章类型!'))
  } else {
    callback()
  }
}

export default {
  components: {
    MarkdownEditor
  },
  data() {
    return {
      loading: false,
      showStatus: false,
      tagsList: [],
      types: [
        { name: 'C++' },
        { name: 'Swift' },
        { name: 'JavaScript' },
        { name: 'LeetCode' },
        { name: 'Other' }
      ],
      localItem: {
        author: '',
        title: '',
        type: '',
        status: '0',
        content: '请输入文章内容~'
      },
      ruleValidate: {
        author: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          {
            type: 'string',
            min: 4,
            message: '昵称长度至少为4位',
            trigger: 'change'
          },
          {
            type: 'string',
            max: 16,
            message: '昵称长度不能超过16位',
            trigger: 'change'
          }
        ],
        type: [{ validator: typesCheck, trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.localItem = {
      author: '',
      title: '',
      type: '',
      status: '0',
      content: '请输入文章内容~'
    }
  },
  methods: {
    confirm() {
      this.loading = true
      this.$refs.table.validate((valid) => {
        if (valid) {
          // 添加模态框
          blogDispatch.use('add', { ...this.localItem }).then((res) => {
            if (res.code === 200) {
              // this.tableData[this.currentIndex] = item
              this.$Message.info('添加成功！')
              this.$router.push('/blog/index')
            }
          })
          this.loading = false
          setTimeout(() => {
            this.$refs.table.resetFields()
            this.localItem = {}
          }, 0)
          // this.$router.push('/blog/index')
        } else {
          this.loading = false
          this.$Message.error('请检查输入数据')
        }
      })
    },
    cancel() {
      this.$router.push('/blog/index')
    }
  }
}
</script>

<style lang="scss" scrope>
.btn-item {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  * {
    margin: 0 20px;
  }
}
</style>
