<template>
  <div class="layui-container">
    <panle></panle>
    <div class="layui-row layui-col-space15">
      <div class="layui-col-md8 content detail">
        <div class="fly-panel detail-box">
          <h1>{{ page.title }}</h1>
          <div class="fly-detail-info">
            <!-- <span class="layui-badge">审核中</span> -->
            <span class="layui-badge layui-bg-green fly-detail-column">{{
              page.catalog | trasnCatalog
            }}</span>

            <span class="layui-badge" style="background-color: #999;" v-if="page.isEnd === '0'">
              {{ $t('list.open') }}
            </span>
            <span class="layui-badge" style="background-color: #5FB878;" v-else>{{ $t('list.closedBadge') }}</span>

            <template v-if="page.tags !== []">
              <span
                class="layui-badge layui-bg-black"
                v-for="(temp, index) in page.tags"
                :key="'tag' + index"
                >{{ tagLabel(temp.name) }}
              </span>
            </template>
            <!-- method1: vuex -> userInfo -> roles -> includes admin -->
            <!-- method2: 组件级权限控制 richtext -->
            <div v-hasRole="'admin'">
              <div class="fly-admin-box" data-id="123">
                <span
                  v-hasRole="['get', 'delete']"
                  class="layui-btn layui-btn-xs jie-admin"
                  type="del"
                >
                  {{ $t('detail.delete') }}
                </span>

                <span
                  class="layui-btn layui-btn-xs jie-admin"
                  type="set"
                  field="stick"
                  rank="1"
                  v-if="page.isTop === '0'"
                >
                  {{ $t('detail.pin') }}
                </span>
                <span
                  class="layui-btn layui-btn-xs jie-admin"
                  type="set"
                  field="stick"
                  rank="0"
                  style="background-color:#ccc;"
                  v-else
                >
                  {{ $t('detail.unpin') }}
                </span>

                <!-- <span class="layui-btn layui-btn-xs jie-admin" type="set" field="status" rank="1">加精</span>
                <span
                  class="layui-btn layui-btn-xs jie-admin"
                  type="set"
                  field="status"
                  rank="0"
                  style="background-color:#ccc;"
                >取消加精</span>-->
              </div>
            </div>

            <span class="fly-list-nums">
              <a><i class="iconfont" :title="$t('detail.answerIcon')">&#xe60c;</i> {{ page.answer }}</a>
              <i class="iconfont" :title="$t('detail.viewsIcon')">&#xe60b;</i> {{ page.reads }}
            </span>
          </div>

          <div class="detail-about">
            <a class="fly-avatar">
              <img
                class="userpic"
                :src="avatarUrl(page.user && page.user.pic)"
                :alt="(page.user && page.user.name) || ''"
                @error="onAvatarImgError"
              />
            </a>
            <div class="fly-detail-user">
              <a href="" class="fly-link">
                <cite>{{ page.user ? page.user.name : '' }}</cite>
                <i class="layui-badge fly-badge-vip ml1">
                  VIP{{ page.user ? page.user.isVip : '0' }}
                </i>
              </a>
              <span>{{ page.created | moment }}</span>
            </div>
            <div class="detail-hits" id="LAY_jieAdmin" data-id="123">
              <span style="padding-right: 10px; color: #FF7200">{{ $t('detail.reward', { points: page.fav }) }}</span>
            </div>
          </div>
          <div class="layui-btn-container fly-detail-admin pt1">
            <router-link
              :to="{ name: 'edit', params: { tid: tid, page: page } }"
              class="layui-btn layui-btn-sm jie-admin"
              v-show="page.isEnd === '0'"
              >{{ $t('detail.edit') }}</router-link
            >
            <a
              href=""
              :class="{ 'layui-disabled': page.isFav }"
              class="layui-btn layui-btn-sm jie-admin"
              @click.prevent="addCollect()"
              >{{ page.isFav ? $t('detail.removeBookmark') : $t('detail.bookmark') }}</a
            >
          </div>

          <div class="detail-body photos" v-html="escapeHtmlStr"></div>
        </div>

        <div class="fly-panel detail-box" id="flyReply">
          <fieldset class="layui-elem-field layui-field-title" style="text-align: center;">
            <legend>{{ $t('detail.repliesTitle') }}</legend>
          </fieldset>

          <ul class="jieda" id="jieda">
            <li
              data-id="111"
              class="jieda-daan"
              v-for="(item, index) in comments"
              :key="'comment' + index"
            >
              <a name="item-1111111111"></a>
              <div class="detail-about detail-about-reply">
                <a class="fly-avatar" href="">
                  <img
                    :src="avatarUrl(item.cuid && item.cuid.pic)"
                    :alt="(item.cuid && item.cuid.name) || ''"
                    @error="onAvatarImgError"
                  />
                </a>
                <div class="fly-detail-user">
                  <router-link
                    :to="{ name: 'home', params: { uid: item.cuid._id } }"
                    class="fly-link"
                  >
                    <cite>{{ item.cuid.name }}</cite>
                    <i class="layui-badge fly-badge-vip" v-if="item.cuid.isVip !== '0'">
                      VIP{{ item.cuid.isVip }}</i
                    >
                  </router-link>

                  <span v-if="index === 0">{{ $t('detail.op') }}</span>
                  <!--
                <span style="color:#5FB878">(管理员)</span>
                <span style="color:#FF9E3F">（社区之光）</span>
                <span style="color:#999">（该号已被封）</span>
                --></div>

                <div class="detail-hits">
                  <span>{{ item.created | moment }}</span>
                </div>

                <i class="iconfont icon-caina" :title="$t('detail.bestAnswer')" v-if="item.isBest === '1'"></i>
              </div>
              <div class="detail-body jieda-body photos" v-richtext="item.content"></div>
              <div class="jieda-reply">
                <span
                  class="jieda-zan"
                  :class="{ zanok: item.ishand === 1 }"
                  type="zan"
                  @click="clickZan(item)"
                >
                  <i class="iconfont icon-zan"></i>
                  <em>{{ item.hands }}</em>
                </span>
                <span type="reply">
                  <i class="iconfont icon-svgmoban53"></i>
                  {{ $t('detail.reply') }}
                </span>
                <div class="jieda-admin">
                  <span
                    type="edit"
                    v-show="user._id === item.cuid._id && page.isEnd !== '1'"
                    @click="editComment(item)"
                    >{{ $t('detail.editShort') }}</span
                  >
                  <!-- <span type="del">删除</span> -->
                  <span
                    type="accept"
                    v-show="user._id === page.user._id && page.isEnd !== '1'"
                    @click="confirmBest(item)"
                    class="jieda-accept"
                    >{{ $t('detail.accept') }}</span
                  >
                </div>
              </div>
            </li>

            <!-- 无数据时 -->
            <li class="fly-none" v-if="comments.length === 0">{{ $t('detail.noRepliesYet') }}</li>
          </ul>
          <div class="layui-form layui-form-pane" v-show="page.isEnd === '0'">
            <editor @changeContent="addCommentContent" :lastContent="this.cominfo.content"></editor>
            <div class="layui-form-item pt2">
              <div class="layui-row">
                <label for="L_vercode" class="layui-form-label">
                  {{ $t('detail.captcha') }}
                </label>
                <div class="layui-input-inline">
                  <input
                    type="text"
                    name="code"
                    v-model="code"
                    :placeholder="$t('detail.captchaPh')"
                    autocomplete="off"
                    class="layui-input"
                  />
                </div>
                <div class>
                  <span class="svg" style="color: #c00" @click="_getCode()" v-html="svg"></span>
                </div>
              </div>
            </div>
            <div class="layui-form-item btnpd">
              <button type="button" class="layui-btn" @click="submit()">
                {{ $t('detail.submitReply') }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="layui-col-md4">
        <hot-list></hot-list>
        <ads></ads>
        <links></links>
      </div>
    </div>
  </div>
</template>

<script>
import { getPostDetail } from '@/api/content'
import { getComments, addComments, editComment, bestComment, addHand } from '@/api/comments'
import { userCollect, removeCollect } from '@/api/user'
import Panle from '@/components/Panle.vue'
import Editor from '@/components/modules/editor'
import HotList from '@/components/sidebar/HotList.vue'
import Links from '@/components/sidebar/Links.vue'
import Ads from '@/components/sidebar/Ads.vue'
import CodeMix from '@/mixin/code'
import escapeHtml from '@/utils/escapeHtml'
import { ScrollToElem } from '@/utils/common'
import { resolveAvatarUrl, onAvatarImgError } from '@/utils/avatar'

export default {
  name: 'detail',
  mixins: [CodeMix],
  data() {
    return {
      page: {},
      comments: '',
      cominfo: {
        cid: '',
        sid: '',
        content: '',
        tid: '',
        code: '',
      },
    }
  },
  components: {
    Panle,
    HotList,
    Links,
    Ads,
    Editor,
  },
  mounted() {
    // window.vue = ScrollToElem
    this._getPostDetail()
    this._getComments()
  },
  methods: {
    avatarUrl(pic) {
      return resolveAvatarUrl(pic)
    },
    onAvatarImgError,
    tagLabel(name) {
      if (!name) return ''
      const key = 'tags.' + name
      return this.$te(key) ? this.$t(key) : name
    },
    clickZan(item) {
      console.log('🚀 ~ file: Detail.vue ~ line 210 ~ clickZan ~ item', item)
      addHand({
        uid: item.cuid._id,
        cid: item._id,
      }).then(res => {
        if (res.code === 200) {
          this.$pop('', this.$t('detail.likeOk'))
          item.ishand = 1
          item.hands += 1
        } else {
          this.$pop('shake', res.msg)
        }
      })
    },
    editComment(item) {
      this.cominfo.content = item.content
      // 修改评论内容
      ScrollToElem('.layui-input-block', 1000, -65)
      document.getElementById('edit').focus()
      this.cominfo.cid = item._id
      this.cominfo.item = item
    },
    confirmBest(item) {
      this.$confirm(
        this.$t('detail.acceptConfirm'),
        () => {
          // 修改评论isBest为1
          bestComment({
            sid: this.$store.state.sid,
            cid: item._id,
            pid: this.page._id,
          }).then(res => {
            if (res.code === 200) {
              this.$pop('', this.$t('detail.acceptOk'))
              this.page.isEnd = '1'
              item.isBest = '1'
            }
          })
        },
        () => {}
      )
    },
    submit() {
      const isLogin = this.$store.state.isLogin
      if (!isLogin) {
        this.$pop('shake', this.$t('detail.loginFirst'))
        return
      }
      this.cominfo.sid = this.$store.state.sid
      this.cominfo.tid = this.tid
      this.cominfo.code = this.code

      if (this.cominfo.cid !== 'undefined' && this.cominfo.cid !== '') {
        editComment({
          sid: this.$store.state.sid,
          code: this.code,
          cid: this.cominfo.cid,
          content: this.cominfo.content,
        }).then(res => {
          if (res.code === 200) {
            const temp = this.cominfo.item
            temp.content = this.cominfo.content
            this.$pop('', this.$t('detail.commentUpdated'))
            this.cominfo.content = ' '
            this.code = ''
            this.comments.splice(this.comments.indexOf(this.cominfo.item), 1, temp)
            // ScrollToElem('.jieda', 1000, -65)
          }
        })
        return
      }

      addComments(this.cominfo).then(res => {
        if (res.code === 200) {
          this.$pop('', this.$t('detail.commentOk'))
          this.cominfo.content = ' '
          this.code = ''
          const user = this.$store.state.userInfo
          res.data.cuid = {
            _id: user._id,
            name: user.name,
            pic: user.pic,
            isVip: user.isVip,
          }
          this.comments.push(res.data)
          this._getCode()
        } else {
          this.$alert(res.msg)
        }
      })
    },
    addCommentContent(val) {
      this.cominfo.content = val
    },
    _getPostDetail() {
      getPostDetail(this.tid).then(res => {
        if (res.code === 200) {
          this.page = res.data
        }
      })
    },
    _getComments() {
      getComments(this.tid).then(res => {
        if (res.code === 200) {
          this.comments = res.data
        }
      })
    },
    addCollect() {
      if (this.page.isFav) {
        removeCollect({
          tid: this.page._id,
          uid: this.$store.state.userInfo._id,
          title: this.page.title,
        }).then(res => {
          if (res.code === 200) {
            this.$pop('', this.$t('detail.unfavOk'))
            this.page.isFav = false
          } else {
            this.$pop('shake', res.msg)
          }
        })
      } else {
        userCollect({
          tid: this.page._id,
          uid: this.$store.state.userInfo._id,
          title: this.page.title,
        }).then(res => {
          if (res.code === 200) {
            this.$pop('', this.$t('detail.favOk'))
            this.page.isFav = true
          } else {
            this.$pop('shake', res.msg)
          }
        })
      }
    },
  },
  watch: {
    tid() {
      this._getPostDetail()
      this._getComments()
    },
  },
  computed: {
    tid() {
      return this.$route.params.tid
    },
    user() {
      return this.$store.state.userInfo
    },
    escapeHtmlStr() {
      if (this.page.content === '') {
        return ''
      }
      return escapeHtml(this.page.content)
    },
  },
}
</script>

<style lang="scss" scoped>
.fly-detail-admin {
  text-align: right;
  background: #f8f8f8;
  border-top: 1px dotted #eeeeee;
}
.fly-detail-info {
  span {
    margin-right: 5px;
  }
}
.fly-admin-box {
  margin-top: 15px;
  margin-left: 0;
}
.btnpd {
  margin-top: -14px;
}
.userpic {
  width: 40px;
  height: 40px;
  object-fit: cover;
}
</style>
