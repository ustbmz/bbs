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
            <Icon type="md-person-add" />&nbsp;&nbsp;{{ $t('userForm.addUser') }}
          </Button>
        </template>
      </tables>
      <Row type="flex" justify="space-between" align="middle">
        <Col class="ctrls">
          <Button @click="handleDeleteBatch()">{{ $t('userForm.batchDelete') }}</Button>
          <Button @click="handleSetBatch()">{{ $t('userForm.batchSet') }}</Button>
          <Button style="margin: 10px 0" type="primary" @click="exportExcel">
            <Icon type="md-download"></Icon>{{ $t('common.exportCsv') }}
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
    <Card class="user-insights" dis-hover :bordered="false" style="margin-top: 16px">
      <p slot="title">{{ $t('userForm.insightTitle') }}</p>
      <Row :gutter="16">
        <Col :xs="24" :sm="8">
          <div class="insight-cell">
            <span class="insight-label">{{ $t('userForm.insightTotal') }}</span>
            <span class="insight-value">{{ displayTotal }}</span>
          </div>
        </Col>
        <Col :xs="24" :sm="8">
          <div class="insight-cell">
            <span class="insight-label">{{ $t('userForm.insightVipPage') }}</span>
            <span class="insight-value">{{ vipCountOnPage }}</span>
          </div>
        </Col>
        <Col :xs="24" :sm="8">
          <div class="insight-cell">
            <span class="insight-label">{{ $t('userForm.insightDisabledPage') }}</span>
            <span class="insight-value">{{ disabledCountOnPage }}</span>
          </div>
        </Col>
      </Row>
      <p class="insight-hint">{{ $t('userForm.insightHint') }}</p>
    </Card>
    <EditModel
      :isShow="showEdit"
      :item="currentItem"
      :roles="roles"
      @editEvent="handleItemEdit"
      @changeEvent="handleChangeEvent"
    ></EditModel>
    <AddModel
      :isShow="showAdd"
      :roles="roles"
      @editEvent="handleItemAdd"
      @changeEvent="handleAddChangeEvent"
    ></AddModel>
    <BatchSet
      :isShow="showSet"
      :roles="roles"
      @editEvent="handleItemSet"
      @changeEvent="handleSetChangeEvent"
    ></BatchSet>
  </div>
</template>

<script>
import { userDispatch, roleDispatch } from '@/api/admin'
import Tables from '_c/tables'
import EditModel from './edit'
import AddModel from './add'
import BatchSet from './batchSet'
import dayjs from 'dayjs'
export default {
  name: 'menu_management', // => 等价于notCache
  components: {
    Tables,
    EditModel,
    AddModel,
    BatchSet,
  },
  data() {
    return {
      page: 1,
      limit: 10,
      total: 0,
      option: {},
      roles: [],
      showEdit: false,
      showAdd: false,
      showSet: false,
      currentIndex: 0,
      currentItem: {},
      pageArr: [10, 20, 30, 50, 100],
      tableData: [],
      selection: [],
    }
  },
  computed: {
    columns() {
      const t = (k) => this.$t('userForm.' + k)
      const c = (k) => this.$t('common.' + k)
      return [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          hidden: true
        },
        {
          title: t('colNickname'),
          key: 'name',
          minWidth: 140,
          search: { type: 'input' }
        },
        {
          title: t('colLogin'),
          key: 'username',
          minWidth: 160,
          search: { type: 'input' }
        },
        {
          title: t('colRoles'),
          key: 'roles',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            const roleNames = params.row.roles
              .map((o) => this.roleNames[o])
              .join(',')
            return h('div', [h('span', roleNames)])
          },
          search: {
            type: 'select',
            options: [
              { key: c('roleSuper'), value: 'super_admin' },
              { key: c('roleAdmin'), value: 'admin' },
              { key: c('roleUser'), value: 'user' }
            ]
          }
        },
        {
          title: t('colFavs'),
          key: 'favs',
          align: 'center',
          hidden: true,
          minWidth: 80
        },
        {
          title: t('colDisabled'),
          key: 'status',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return h('div', [
              h(
                'span',
                params.row.status === '0' ? c('no') : c('yes')
              )
            ])
          },
          search: {
            type: 'radio',
            options: [
              { key: c('all'), value: '' },
              { key: c('no'), value: '0' },
              { key: c('yes'), value: '1' }
            ]
          }
        },
        {
          title: t('colVip'),
          key: 'isVip',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [
              h('span', params.row.isVip === '0' ? c('no') : c('yes'))
            ])
          },
          search: {
            type: 'radio',
            options: [
              { key: c('all'), value: '' },
              { key: c('no'), value: '0' },
              { key: c('yes'), value: '1' }
            ]
          }
        },
        {
          title: t('colCreated'),
          key: 'created',
          align: 'center',
          minWidth: 180,
          render: (h, params) => {
            return h('div', [
              h(
                'span',
                dayjs(params.row.created).format('YYYY-MM-DD HH:mm:ss')
              )
            ])
          },
          search: { type: 'date' }
        },
        {
          title: c('settings'),
          key: 'settings',
          slot: 'action',
          hidden: true,
          fixed: 'right',
          width: 100,
          align: 'center'
        }
      ]
    },
    roleNames() {
      const tmp = {}
      this.roles.forEach((item) => {
        tmp[item.role] = item.name
      })
      return tmp
    },
    displayTotal() {
      const n = Number(this.total)
      return Number.isFinite(n) && n >= 0 ? n : this.tableData.length
    },
    vipCountOnPage() {
      return this.tableData.filter((r) => r.isVip === '1').length
    },
    disabledCountOnPage() {
      return this.tableData.filter((r) => r.status === '1').length
    }
  },
  mounted() {
    this._getList()
    this._getRoleNames()
  },
  methods: {
    handleDeleteBatch() {
      // 批量进行删除
      if (this.selection.length === 0) {
        this.$Message.info(this.$t('common.selectToDelete'))
        return
      }
      const msg = this.selection.map((o) => o.username).join(',')
      this.$Modal.confirm({
        title: this.$t('userForm.deleteUserTitle'),
        content: this.$t('userForm.deleteUserContent', { names: msg }),
        onOk: () => {
          const arr = this.selection.map((o) => o._id)
          userDispatch.use('delete', { ids: arr }).then((res) => {
            // this.tableData.splice(index, 1)
            this.tableData.filter((item) => !arr.includes(item._id))
            this.$Message.success(this.$t('common.deleteOk'))
            //  this._getList()
          })
        },
        onCancel: () => {
          this.$Message.info(this.$t('common.cancelOp'))
        },
      })
    },
    handleSetBatch() {
      // 批量进行删除
      if (this.selection.length === 0) {
        this.$Message.info(this.$t('common.selectToSet'))
        return
      }
      // 批量进行设置 -> vip, 禁言, 角色
      this.showSet = true
    },
    handleSelect(selection) {
      this.selection = selection
    },
    handleAddUser() {
      this.showAdd = true
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
    // 添加模态框
    handleItemAdd(item) {
      userDispatch.use('add', item).then((res) => {
        if (res.code === 200) {
          // this.tableData[this.currentIndex] = item
          this.tableData.splice(0, 0, res.data)
        }
      })
    },
    // 编辑模态框
    handleItemEdit(item) {
      userDispatch.use('update', item).then((res) => {
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
    handleItemSet(settings) {
      const msg = this.selection.map((o) => o.username).join(',')
      this.$Modal.confirm({
        title: this.$t('userForm.updateUserTitle'),
        content: this.$t('userForm.updateUserContent', { names: msg }),
        onOk: () => {
          const arr = this.selection.map((o) => o._id)
          userDispatch.use('batch', { ids: arr, settings }).then((res) => {
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
        },
      })
    },
    handleRowEdit(row, index) {
      this.showEdit = true
      this.currentIndex = index
      this.currentItem = { ...row }
    },
    handleRowRemove(row, index) {
      this.$Modal.confirm({
        title: this.$t('userForm.deleteOneTitle'),
        content: this.$t('userForm.deleteOneContent', { name: row.name }),
        onOk: () => {
          userDispatch.use('delete', { ids: [row._id] }).then((res) => {
            this.tableData.splice(index, 1)
            this.$Message.success(this.$t('common.deleteOk'))
          })
        },
        onCancel: () => {
          this.$Message.info(this.$t('common.cancelOp'))
        },
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
        filename: `table-${new Date().valueOf()}.csv`,
      })
    },
    _getList() {
      userDispatch
        .use('get', {
          page: this.page - 1,
          limit: this.limit,
          option: this.option,
        })
        .then((res) => {
          this.tableData = res.data || []
          const t = res.total
          this.total =
            typeof t === 'number' && !Number.isNaN(t)
              ? t
              : Array.isArray(res.data)
                ? res.data.length
                : 0
        })
    },
    _getRoleNames() {
      roleDispatch.use('roles').then((res) => {
        if (res.code === 200) {
          this.roles = res.data
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.ctrls {
  button {
    margin-right: 10px;
  }
}
.user-insights {
  .insight-cell {
    padding: 8px 0;
  }
  .insight-label {
    display: block;
    font-size: 12px;
    color: #808695;
    margin-bottom: 6px;
  }
  .insight-value {
    font-size: 22px;
    font-weight: 600;
    color: #17233d;
    letter-spacing: 0.02em;
  }
  .insight-hint {
    margin: 12px 0 0;
    font-size: 12px;
    color: #c5c8ce;
  }
}
</style>
