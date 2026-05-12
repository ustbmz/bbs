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
      >
        <template v-slot:table-header>
          <Button @click="handleAddUser" class="search-btn" type="primary">
            <Icon type="md-person-add" />&nbsp;&nbsp;新增文章
          </Button>
        </template>
      </tables>
      <Row type="flex" justify="space-between" align="middle">
        <Col class="ctrls">
          <Button style="margin: 10px 0" type="primary" @click="exportExcel">
            <Icon type="md-download"></Icon>导出表格
          </Button>
        </Col>
        <Col>
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
        </Col>
      </Row>
    </Card>
    <EditModel
      :isShow="showEdit"
      :item="currentItem"
      :types="types"
      @editEvent="handleItemEdit"
      @changeEvent="handleChangeEvent"
    ></EditModel>
    <!-- <BatchSet
      :isShow="showSet"
      :types="types"
      @editEvent="handleItemSet"
      @changeEvent="handleSetChangeEvent"
    ></BatchSet> -->
  </div>
</template>

<script>
import { blogDispatch } from '@/api/blog'
import Tables from '_c/tables'
import EditModel from './edit'
import dayjs from 'dayjs'
export default {
  name: 'menu_management', // => 等价于notCache
  components: {
    Tables,
    EditModel
  },
  data() {
    return {
      page: 1,
      limit: 10,
      total: 0,
      option: {},
      type: '',
      types: ['C++', 'Swift', 'JavaScript', 'LeetCode', 'Other'],
      showEdit: false,
      showAdd: false,
      showSet: false,
      currentIndex: 0,
      currentItem: {},
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          hidden: true
        },
        {
          title: '作者昵称',
          key: 'author',
          minWidth: 140,
          search: {
            type: 'input'
          }
        },
        {
          title: '文章标题',
          key: 'title',
          minWidth: 160,
          search: {
            type: 'input'
          }
        },
        {
          title: '文章分类',
          key: 'type',
          align: 'center',
          hidden: true,
          minWidth: 80
        },
        {
          title: '创建时间',
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
          title: '设置',
          key: 'settings',
          slot: 'action',
          hidden: true,
          fixed: 'right',
          width: 100,
          align: 'center'
        }
      ],
      pageArr: [10, 20, 30, 50, 100],
      tableData: [],
      selection: []
    }
  },
  mounted() {
    this._getList()
  },
  methods: {
    handleSelect(selection) {
      this.selection = selection
    },
    handleAddUser() {
      this.$router.push('/blog/add')
    },
    handleChangeEvent(value) {
      this.showEdit = value
    },
    handleAddChangeEvent(value) {
      this.showAdd = value
    },
    handleSetChangeEvent(value) {
      this.showSet = value
    },

    // 编辑模态框
    handleItemEdit(item) {
      blogDispatch.use('update', item).then((res) => {
        if (res.code === 200) {
          // this.tableData[this.currentIndex] = item
          this.tableData.splice(this.currentIndex, 1, item)
        } else {
          this.$Message.error(res.msg)
        }
      })
      this.showEdit = false
    },
    // 批量设置模态框
    // handleItemSet(settings) {
    //   const msg = this.selection.map((o) => o.username).join(',')
    //   this.$Modal.confirm({
    //     title: '确定修改用户吗？',
    //     content: `修改${msg}的用户`,
    //     onOk: () => {
    //       const arr = this.selection.map((o) => o._id)
    //       userDispatch.use('batch', { ids: arr, settings }).then((res) => {
    //         // this.tableData.splice(index, 1)
    //         this.tableData.map((item) => {
    //           if (arr.includes(item._id)) {
    //             for (var keys of Object.keys(settings)) {
    //               item[keys] = settings[keys]
    //             }
    //           }
    //         })
    //         this.$Message.success('批量设置成功！')
    //         //  this._getList()
    //       })
    //     },
    //     onCancel: () => {
    //       this.$Message.info('取消操作！')
    //     }
    //   })
    // },
    handleRowEdit(row, index) {
      this.showEdit = true
      this.currentIndex = index
      this.currentItem = { ...row }
    },
    handleRowRemove(row, index) {
      this.$Modal.confirm({
        title: '请确认是否进行删除操作',
        content: `删除${row.title}吗?`,
        onOk: () => {
          blogDispatch.use('delete', { id: row._id }).then((res) => {
            this.tableData.splice(index, 1)
            this.$Message.success('删除成功！')
          })
        },
        onCancel: () => {
          this.$Message.info('取消操作！')
        }
      })
    },
    handleSearch(value) {
      // 判断是否有新的查询内容的传递，把分页数据归0
      if (
        (typeof this.option.search !== 'undefined' &&
          value.search !== this.option.search) ||
        this.option === {}
      ) {
        this.page = 1 // 从1开始
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
    exportExcel() {
      this.$refs.tables.exportCsv({
        filename: `table-${new Date().valueOf()}.csv`
      })
    },
    _getList() {
      blogDispatch
        .use('get', {
          page: this.page - 1,
          limit: this.limit,
          type: this.type
        })
        .then((res) => {
          this.tableData = res.data
          this.total = res.total
        })
    }
    // _getRoleNames() {
    //   roleDispatch.use('types').then((res) => {
    //     if (res.code === 200) {
    //       this.types = res.data
    //     }
    //   })
    // }
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
