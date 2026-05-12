<template>
  <div>
    <Card>
      <tables
        ref="tables"
        searchable
        search-place="top"
        v-model="tableData"
        :columns="columns"
        @on-row-edit="handleRowEdit"
        @on-row-remove="handleRowRemove"
        @on-selection-change="handleSelect"
        @searchEvent="handleSearch"
      ></tables>
      <Row type="flex" justify="space-between" align="middle">
        <i-col class="ctrls">
          <Button @click="handleDeleteBatch()">{{ $t('comments.batchDelete') }}</Button>
          <Button @click="handleSetBatch()">{{ $t('comments.batchSet') }}</Button>
        </i-col>
        <i-col>
          <Page
            :total="total"
            :current="page"
            :page-size="limit"
            :page-size-opts="pageArr"
            show-elevator
            show-sizer
            show-total
            @on-change="onPageChange"
            @on-page-size-change="onPageSizeChange"
          />
        </i-col>
      </Row>
    </Card>
    <BatchSet
      :isShow="showSet"
      :users="users"
      @editEvent="handleItemSet"
      @changeEvent="handleSetChangeEvent"
    ></BatchSet>
  </div>
</template>

<script>
import { commentsDispatch, userDispatch } from '@/api/admin'
import Tables from '_c/tables'
import BatchSet from './batchSet'
import Expand from './expand.vue'
import More from './more.vue'
import dayjs from 'dayjs'
export default {
  name: 'menu_management', // => 等价于notCache
  components: {
    Tables,
    BatchSet
  },
  data() {
    return {
      page: 1,
      limit: 10,
      total: 0,
      option: {},
      showSet: false,
      currentIndex: 0,
      currentItem: {},
      pageArr: [10, 20, 30, 50, 100],
      tableData: [],
      selection: []
    }
  },
  computed: {
    users() {
      const arr = this.selection.reduce((obj, item) => {
        return {
          ...obj,
          [item.cuid._id]: item.cuid.name
        }
      }, {})
      return arr
    },
    columns() {
      const t = (k, vals) => this.$t(k, vals)
      const radioTri = () => [
        { key: t('common.all'), value: '' },
        { key: t('common.no'), value: '0' },
        { key: t('common.yes'), value: '1' }
      ]
      return [
        {
          type: 'expand',
          key: 'stack',
          width: 50,
          render: (h, params) => {
            return h(Expand, {
              props: {
                row: params.row
              }
            })
          },
          hidden: true
        },
        {
          type: 'selection',
          width: 60,
          align: 'center',
          hidden: true
        },
        {
          title: t('comments.colPostTitle'),
          key: 'tid',
          minWidth: 160,
          search: {
            type: 'input'
          },
          render: (h, params) => {
            const name = params.row.tid
              ? params.row.tid.title
              : t('comments.noTitle')
            return h('div', name)
          }
        },
        {
          title: t('comments.colPostAuthor'),
          key: 'uid',
          align: 'center',
          minWidth: 120,
          search: {
            type: 'input'
          },
          render: (h, params) => {
            const name = params.row.uid
              ? params.row.uid.name
              : t('comments.noAuthor')
            return h('div', name)
          }
        },
        {
          title: t('comments.colCommentUser'),
          key: 'cuid',
          align: 'center',
          minWidth: 120,
          search: {
            type: 'input'
          },
          render: (h, params) => {
            const name = params.row.cuid
              ? params.row.cuid.name
              : t('comments.noCommenter')
            return h('div', name)
          }
        },
        {
          title: t('comments.colContent'),
          key: 'content',
          minWidth: 240,
          search: {
            type: 'input'
          },
          render: (h, params) => {
            return h(More, {
              props: {
                row: params.row
              }
            })
          }
        },
        {
          title: t('comments.colVisible'),
          key: 'status',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return h('div', [
              h('Icon', {
                props: {
                  color: params.row.status === '1' ? '#19be6b' : '#ed4014',
                  type: params.row.status === '1' ? 'md-checkmark' : 'md-close',
                  size: 20
                }
              })
            ])
          },
          search: {
            type: 'radio',
            options: radioTri()
          }
        },
        {
          title: t('comments.colAccepted'),
          key: 'isBest',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return h('div', [
              h('Icon', {
                props: {
                  color: '#19be6b',
                  type: params.row.isBest === '1' ? 'md-checkmark' : '',
                  size: 20
                }
              })
            ])
          },
          search: {
            type: 'radio',
            options: radioTri()
          }
        },
        {
          title: t('comments.colCreated'),
          key: 'created',
          align: 'center',
          minWidth: 180,
          render: (h, params) => {
            return h('div', [
              h('span', dayjs(params.row.created).format('YYYY-MM-DD HH:mm:ss'))
            ])
          },
          search: {
            type: 'date'
          }
        },
        {
          title: t('common.settings'),
          key: 'settings',
          slot: 'action',
          hidden: true,
          fixed: 'right',
          width: 100,
          align: 'center',
          options: ['delete']
        }
      ]
    }
  },
  mounted() {
    this.option = { item: 'status', search: '1' }
    this._getList()
  },
  methods: {
    handleDeleteBatch() {
      if (this.selection.length === 0) {
        this.$Message.info(this.$t('common.selectToDelete'))
        return
      }
      const msg = this.selection.map((o) => o.content).join(',')
      const preview = msg.length > 240 ? `${msg.slice(0, 240)}…` : msg
      this.$Modal.confirm({
        title: this.$t('comments.deleteTitle'),
        content: this.$t('comments.deleteContent', { preview }),
        onOk: () => {
          const arr = this.selection.map((o) => o._id)
          commentsDispatch.use('delete', { ids: arr }).then(() => {
            this.tableData = this.tableData.filter(
              (item) => !arr.includes(item._id)
            )
            this.$Message.success(this.$t('common.deleteOk'))
          })
        },
        onCancel: () => {
          this.$Message.info(this.$t('common.cancelOp'))
        }
      })
    },
    handleSetBatch() {
      if (this.selection.length === 0) {
        this.$Message.info(this.$t('common.selectToSet'))
        return
      }
      this.showSet = true
    },
    handleSelect(selection) {
      this.selection = selection
    },
    handleSetChangeEvent(value) {
      this.showSet = value
    },
    handleItemSet(settings) {
      const num = this.selection.length
      let msg = this.$t('comments.setContent', { count: num })
      if (settings.forbit === '1' && settings.users.length > 0) {
        const users = []
        settings.users.forEach((item) => {
          users.push(this.users[item])
        })
        msg = this.$t('comments.setForbidContent', { users: users.join(', ') })
      }
      this.$Modal.confirm({
        title: this.$t('comments.setTitle'),
        content: msg,
        onOk: () => {
          const arr = this.selection.map((o) => o._id)
          if (settings.forbit !== '1') {
            delete settings.users
            commentsDispatch
              .use('batch', { ids: arr, settings })
              .then(() => {
                this.tableData.map((item) => {
                  if (arr.includes(item._id)) {
                    for (var keys of Object.keys(settings)) {
                      item[keys] = settings[keys]
                    }
                  }
                })
                this.$Message.success(this.$t('common.batchOk'))
              })
          } else {
            userDispatch
              .use('batch', { ids: arr, settings: { status: '1' } })
              .then(() => {
                this.tableData = this.tableData.map((item) => {
                  if (arr.includes(item._id)) {
                    for (var keys of Object.keys(settings)) {
                      item[keys] = settings[keys]
                    }
                  }
                  return item
                })
                this.$Message.success(this.$t('common.batchOk'))
              })
          }
        },
        onCancel: () => {
          this.$Message.info(this.$t('common.cancelOp'))
        }
      })
    },
    handleRowEdit(row, index) {
      this.currentIndex = index
      this.currentItem = { ...row }
    },
    handleRowRemove(row, index) {
      this.$Modal.confirm({
        title: this.$t('comments.wrongDeleteUserTitle'),
        content: this.$t('comments.wrongDeleteUserContent', {
          name: row.name
        }),
        onOk: () => {
          userDispatch.use('delete', row._id).then(() => {
            this.tableData.splice(index, 1)
            this.$Message.success(this.$t('common.deleteOk'))
          })
        },
        onCancel: () => {
          this.$Message.info(this.$t('common.cancelOp'))
        }
      })
    },
    handleSearch(value) {
      if (
        (typeof this.option.search !== 'undefined' &&
          value.search !== this.option.search) ||
        this.option === {}
      ) {
        this.page = 1
      }
      this.option = value
      this._getList()
    },
    onPageChange(page) {
      this.page = page
      this._getList()
    },
    onPageSizeChange(size) {
      this.limit = size
      this._getList()
    },
    _getList() {
      commentsDispatch
        .use('get', {
          page: this.page - 1,
          limit: this.limit,
          options: this.option
        })
        .then((res) => {
          this.tableData = res.data
          this.total = res.total
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.ctrls {
  button {
    margin-top: 10px;
    margin-right: 10px;
  }
}
</style>
