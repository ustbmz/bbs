<template>
  <div class="fly-panel fly-column">
    <div class="layui-container">
      <ul class="layui-clear">
        <router-link tag="li" to="/index" class="layui-hide-xs">
          <a>{{ $t('panel.home') }}</a>
        </router-link>
        <router-link tag="li" v-for="(item, index) in List" :key="'panel' + index" :to="item.path">
          <a>
            {{ $t(item.nameKey) }}
            <span class="layui-badge-dot" v-if="item.isNew"></span>
          </a>
        </router-link>

        <li class="layui-hide-xs layui-hide-sm layui-show-md-inline-block">
          <span class="fly-mid"></span>
        </li>

        <!-- 用户登入后显示 -->
        <li class="layui-hide-xs layui-hide-sm layui-show-md-inline-block">
          <router-link :to="{name:'userpost'}">{{ $t('panel.myPosts') }}</router-link>
        </li>
        <li class="layui-hide-xs layui-hide-sm layui-show-md-inline-block">
          <router-link :to="{name:'usercollection'}">{{ $t('panel.myFavs') }}</router-link>
        </li>
      </ul>

      <div class="fly-column-right layui-hide-xs">
        <span class="fly-search"><i class="layui-icon"></i></span>
        <router-link :to="{ name: 'add' }" class="layui-btn">{{ $t('panel.newPost') }}</router-link>
      </div>
      <div
        class="layui-hide-sm layui-show-xs-block"
        style="margin-top: -10px; padding-bottom: 10px; text-align: center"
      >
        <a href="jie/add.html" class="layui-btn">{{ $t('panel.newPost') }}</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      List: [
        {
          nameKey: 'panel.ask',
          path: '/index/ask',
          isNew: false,
        },
        {
          nameKey: 'panel.share',
          path: '/index/share',
          isNew: true,
        },
        {
          nameKey: 'panel.discuss',
          path: '/index/discuss',
          isNew: false,
        },
        {
          nameKey: 'panel.advise',
          path: '/index/advise',
          isNew: false,
        },
        {
          nameKey: 'panel.notice',
          path: '/index/notice',
          isNew: false,
        },
        {
          nameKey: 'panel.logs',
          path: '/index/logs',
          isNew: false,
        },
      ],
    }
  },
}
</script>

<style lang="scss" scoped></style>
