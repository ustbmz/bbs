<template>
  <div class="fly-panel" style="margin-bottom: 0">
    <ul class="fly-list">
      <li v-for="(item, index) in items" :key="'listitems' + index">
        <a class="fly-avatar">
          <img
            :src="avatarUrl(item.uid && item.uid.pic)"
            :alt="(item.uid && item.uid.name) || 'user'"
            @error="onAvatarImgError"
          />
        </a>
        <h2>
          <a class="layui-badge">{{ item.catalogDisplay }}</a>
          <router-link :to="{ name: 'detail', params: { tid: item._id } }">{{
            item.title
          }}</router-link>
        </h2>
        <div class="fly-list-info">
          <router-link :to="{name:'home',params:{uid:item.uid._id}}">
            <cite>{{ item.uid.name }}</cite>
            <!-- <i class="iconfont icon-renzheng" title="认证信息：XXX"></i> -->
            <i class="layui-badge fly-badge-vip" v-if="item.uid.isVip == '1'">
              VIP{{item.uid.isVip}}
            </i>
          </router-link>
          <span>{{ item.created | moment }}</span>

          <span class="fly-list-kiss layui-hide-xs" :title="$t('list.kissTitle')">
            <i class="iconfont icon-kiss"></i>
            {{ item.fav }}
          </span>
          <span v-show="item.status !== '0'" class="layui-badge fly-badge-accept layui-hide-xs">
            {{ $t('list.closedBadge') }}
          </span>
          <span class="fly-list-nums">
            <i class="iconfont icon-pinglun1" title="回答"></i>
            {{ item.answer }}
          </span>
        </div>
        <div class="fly-list-badge" v-show="item.tags.length > 0 && item.tags[0].name !== ''">
          <span
            class="layui-badge"
            v-for="(tag, index) in item.tags"
            :key="'tag' + index"
            :class="tag.class"
          >
            {{ tag.name }}
          </span>
        </div>
      </li>
    </ul>
    <div style="text-align: center" v-show="isShow">
      <div class="laypage-main" v-if="!isEnd">
        <a href="jie/index.html" class="laypage-next" @click="more()">
          {{ $t('list.loadMore') }}
        </a>
      </div>
      <div class="nomore gray" v-else>{{ $t('list.noMore') }}</div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { resolveAvatarUrl, onAvatarImgError } from '@/utils/avatar'

export default {
  name: 'listitem',
  props: {
    lists: {
      default: () => [],
      type: Array,
    },
    isShow: {
      default: false,
      type: Boolean,
    },
    isEnd: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    items() {
      return _.map(this.lists, (item) => {
        const code = item.catalog
        let catalogDisplay = this.$t('catalog.unknown')
        switch (code) {
          case 'ask':
            catalogDisplay = this.$t('catalog.ask')
            break
          case 'share':
            catalogDisplay = this.$t('catalog.share')
            break
          case 'discuss':
            catalogDisplay = this.$t('catalog.discuss')
            break
          case 'advise':
            catalogDisplay = this.$t('catalog.advise')
            break
          case 'notice':
            catalogDisplay = this.$t('catalog.notice')
            break
          default:
            break
        }
        return { ...item, catalogDisplay }
      })
    },
  },
  methods: {
    avatarUrl(pic) {
      return resolveAvatarUrl(pic)
    },
    onAvatarImgError,
    more() {
      this.$emit('nextpage')
    },
  },
}
</script>

<style lang="scss" scoped>
.nomore {
  margin: 10px;
  padding: 20px 0;
}
.fly-avatar img {
  object-fit: cover;
}
</style>
