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
      />
      <Row type="flex" justify="space-between" align="middle">
        <Col class="ctrls">
          <Button @click="handleDeleteBatch()">{{ $t('userForm.batchDelete') }}</Button>
          <Button @click="handleSetBatch()">{{ $t('userForm.batchSet') }}</Button>
          <Button style="margin: 10px 0;" type="primary" @click="exportExcel">
            <Icon type="md-download"></Icon>{{ $t('common.exportCsv') }}
          </Button>
        </Col>
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
      </Row>
    </Card>
    <EditModel
      :isShow="showEdit"
      :item="currentItem"
      @editEvent="handleItemEdit"
      @changeEvent="handleChangeEvent"
    ></EditModel>
    <BatchSet
      :isShow="showSet"
      @editEvent="handleItemSet"
      @changeEvent="handleSetChangeEvent"
    ></BatchSet>
  </div>
</template>

<script>
import Tables from '_c/tables'
import EditModel from './index/edit'
import BatchSet from './index/batchSet'
import {
  getList,
  deletePostById,
  updatePostById,
  updatePostBatchById
} from '@/api/content'
import dayjs from 'dayjs'
export default {
  name: 'content_management',
  components: {
    Tables,
    EditModel,
    BatchSet
  },
  data() {
    return {
      page: 1,
      limit: 10,
      total: 0,
      option: {},
      showEdit: false,
      showSet: false,
      currentIndex: 0,
      currentItem: {},
      selection: [],
      pageArr: [10, 20, 30, 50, 100],
      tableData: []
    }
  },
  computed: {
    columns() {
      const t = (k) => this.$t('content.' + k)
      const c = (k) => this.$t('common.' + k)
      return [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          hidden: true
        },
        {
          title: t('colTitle'),
          key: 'title',
          minWidth: 400,
          ellipsis: true,
          tooltip: true,
          search: { type: 'input' }
        },
        {
          title: t('colCreated'),
          key: 'created',
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('span', dayjs(params.row.created).format('YYYY-MM-DD HH:mm:ss'))
            ])
          },
          search: { type: 'date' }
        },
        {
          title: t('colAuthor'),
          key: 'user',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('div', [h('span', params.row.uid.name)])
          },
          search: { type: 'input' }
        },
        {
          title: t('colCatalog'),
          key: 'catalog',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('span', this.getCatalogLabel(params.row.catalog))
            ])
          },
          search: {
            type: 'select',
            options: [
              { key: this.$t('content.catAsk'), value: 'ask' },
              { key: this.$t('content.catAdvise'), value: 'advise' },
              { key: this.$t('content.catDiscuss'), value: 'discuss' },
              { key: this.$t('content.catShare'), value: 'share' },
              { key: this.$t('content.catNotice'), value: 'notice' }
            ]
          }
        },
        {
          title: t('colFavs'),
          key: 'fav',
          width: 100,
          align: 'center',
          hidden: true
        },
        {
          title: t('colTags'),
          key: 'tags',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('span', params.row.tags.map((o) => o.name).join(',') || '')
            ])
          },
          search: { type: 'input' }
        },
        {
          title: t('colEnd'),
          key: 'isEnd',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('span', params.row.isEnd === '0' ? c('no') : c('yes'))
            ])
          },
          search: { type: 'radio' }
        },
        {
          title: t('colReads'),
          key: 'reads',
          width: 100,
          align: 'center',
          hidden: true
        },
        {
          title: t('colAnswers'),
          key: 'answer',
          width: 100,
          align: 'center',
          hidden: true
        },
        {
          title: t('colStatus'),
          key: 'status',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Tag', {
                class: 'test',
                props: {
                  color: params.row.status === '0' ? 'success' : 'error'
                },
                domProps: {
                  innerHTML:
                    params.row.status === '0' ? c('on') : c('off')
                }
              })
            ])
          },
          search: { type: 'radio' }
        },
        {
          title: t('colTop'),
          key: 'isTop',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Icon', {
                props: {
                  color: '#19be6b',
                  type: params.row.isTop === '1' ? 'md-checkmark' : '',
                  size: 20
                }
              })
            ])
          },
          search: { type: 'radio' }
        },
        {
          title: c('settings'),
          key: 'settings',
          slot: 'action',
          fixed: 'right',
          width: 160,
          align: 'center',
          hidden: true
        }
      ]
    }
  },
  methods: {
    getCatalogLabel(catalog) {
      const map = {
        ask: 'catAsk',
        advise: 'catAdvise',
        discuss: 'catDiscuss',
        share: 'catShare',
        logs: 'catLogs',
        notice: 'catNotice'
      }
      const k = map[catalog] || 'catAll'
      return this.$t('content.' + k)
    },
    handleDeleteBatch() {
      // 批量进行删除
      if (this.selection.length === 0) {
        this.$Message.info(this.$t('content.selectDelete'))
        return
      }
      const msg = this.selection.map((o) => o.title).join(',')
      this.$Modal.confirm({
        title: this.$t('content.deleteTitle'),
        content: this.$t('content.deleteContent', { names: msg }),
        onOk: () => {
          const arr = this.selection.map((o) => o._id)
          deletePostById(arr).then((res) => {
            // this.tableData.splice(index, 1)
            this.tableData = this.tableData.filter(
              (item) => !arr.includes(item._id)
            )
            this.$Message.success(this.$t('common.deleteOk'))
            //  this._getList()
          })
        },
        onCancel: () => {
          this.$Message.info(this.$t('common.cancelOp'))
        }
      })
    },
    handleSetBatch() {
      // 批量进行删除
      if (this.selection.length === 0) {
        this.$Message.info(this.$t('content.selectDelete'))
        return
      }
      // 批量进行设置 -> vip, 禁言, 角色
      this.showSet = true
    },
    handleSelect(selection) {
      this.selection = selection
    },
    handleChangeEvent(value) {
      this.showEdit = value
    },
    handleSetChangeEvent(value) {
      this.showSet = value
    },
    handleItemEdit(item) {
      updatePostById(item).then((res) => {
        if (res.code === 200) {
          console.log('更新成功')
          // 直接更改数组内的子数据，dom不会更新
          // this.tableData[this.currentIndex] = item
          // 删除一个数据，插入修改后的数据
          this.tableData.splice(this.currentIndex, 1, item)
        }
      })
      this.showEdit = false
    },
    // 批量设置模态框
    handleItemSet(settings) {
      const msg = this.selection.map((o) => o.title).join(',')
      this.$Modal.confirm({
        title: this.$t('content.updateTitle'),
        content: this.$t('content.updateContent', { names: msg }),
        onOk: () => {
          const arr = this.selection.map((o) => o._id)
          updatePostBatchById({ ids: arr, settings }).then((res) => {
            // this.tableData.splice(index, 1)
            this.tableData.map((item) => {
              if (arr.includes(item._id)) {
                for (var keys of Object.keys(settings)) {
                  item[keys] = settings[keys]
                }
              }
            })
            this.$Message.success(this.$t('common.batchOk'))
            //  this._getList()
          })
        },
        onCancel: () => {
          this.$Message.info(this.$t('common.cancelOp'))
        }
      })
    },
    handleRowEdit(row, index) {
      this.showEdit = true
      this.currentIndex = index
      this.currentItem = { ...row }
    },
    handleRowRemove(row, index) {
      this.$Modal.confirm({
        title: this.$t('content.deleteRowTitle'),
        content: this.$t('content.deleteRowContent', {
          index: index + 1,
          title: row.title
        }),
        onOk: () => {
          deletePostById(row._id)
            .then((res) => {
              if (res.code === 200) {
                this.$Message.info(this.$t('content.deleteOkMsg'))
                this.tableData = this.tableData.filter(
                  (item) => item._id !== row._id
                )
              }
            })
            .catch((err) => {
              this.$Message.info(
                this.$t('content.deleteFail', { msg: String(err) })
              )
            })
        },
        onCancel: () => {
          this.$Message.info(this.$t('common.cancelOp'))
        }
      })
    },
    handleSearch(value) {
      // 判断是否有新的查询内容的传递，把分页数据归0
      this.option = {}
      this.page = 1
      // if (
      //   (typeof this.option.search !== 'undefined' &&
      //     value.search !== this.option.search) ||
      //   this.option === {}
      // ) {
      //   this.page = 1 // 从1开始
      // }
      if (value.item === 'tags') {
        value.item = 'tag'
      }
      this.option[value.item] = value.search
      this._getList()
    },
    exportExcel() {
      this.$refs.tables.exportCsv({
        filename: `table-${new Date().valueOf()}.csv`
      })
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
      getList({
        page: this.page - 1,
        limit: this.limit,
        catalog: '',
        tag: '',
        status: '',
        isTop: 0,
        ...this.option
      }).then((res) => {
        // 方法一： -> 修改getList接口
        // const data = res.data
        // data.forEach((item) => {
        //   if (item.status === 0) {
        //     item.status = '打开回复'
        //   } else {
        //     item.status = '禁止回复'
        //   }
        // })
        this.tableData = res.data
        this.total = res.total
      })
    }
  },
  mounted() {
    this._getList()
  }
}
</script>

<style lang="scss" scoped>
.ctrls {
  button {
    margin-right: 10px;
  }
}
</style>
