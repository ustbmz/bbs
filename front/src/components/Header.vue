<template>
  <div class="fly-header fly-header-bar">
    <div class="layui-container">
      <ul class="layui-nav layui-hide-xs">
        <li class="layui-nav-item layui-this">
          <router-link :to="{ name: 'index' }">
            <i class="iconfont icon-jiaoliu"></i>
            {{ $t('nav.home') }}
          </router-link>
        </li>
        <li class="layui-nav-item">
          <a href="https://www.ustbmz.com" target="_blank">
            <i class="iconfont icon-ui"></i>
            {{ $t('nav.blog') }}
          </a>
        </li>
      </ul>

      <ul class="layui-nav fly-nav-user">
        <!-- 未登入的状态 -->
        <template v-if="!isShow">
          <li class="layui-nav-item">
            <router-link
              class="iconfont icon-touxiang layui-hide-xs"
              :to="{ name: 'login' }"
            ></router-link>
          </li>
          <li class="layui-nav-item">
            <router-link :to="{ name: 'login' }"><a>{{ $t('nav.login') }}</a></router-link>
          </li>
          <li class="layui-nav-item">
            <router-link :to="{ name: 'reg' }"><a>{{ $t('nav.register') }}</a></router-link>
          </li>
          <li class="layui-nav-item layui-hide-xs">
            <router-link
              to="/goQQ"
              onclick="layer.msg('正在通过QQ登入', {icon:16, shade: 0.1, time:0})"
              :title="$t('nav.qqLogin')"
              class="iconfont icon-qq"
            ></router-link>
          </li>
          <li class="layui-nav-item layui-hide-xs">
            <router-link
              to="/goWb"
              onclick="layer.msg('正在通过微博登入', {icon:16, shade: 0.1, time:0})"
              :title="$t('nav.wbLogin')"
              class="iconfont icon-weibo"
            ></router-link>
          </li>
        </template>
        <template v-else>
          <li class="layui-nav-item" @mouseover="show()" @mouseleave="hide()">
            <router-link class="fly-nav-avatar" :to="{ name: 'home', params: { uid: user._id } }">
              <cite class="layui-hide-xs">{{ user.name }}</cite>
              <i class="layui-badge fly-badge-vip layui-hide-xs" v-if="user.isVip !== '0'">
                {{ user.isVip }}
              </i>
              <img
                class="header-user-avatar"
                :src="headerAvatarSrc"
                :alt="user.name"
                @error="onAvatarImgError"
              />
            </router-link>
            <dl
              class="layui-nav-child layui-anim layui-anim-downbit"
              :class="{ 'layui-show': isHover }"
            >
              <dd>
                <router-link :to="{ name: 'center' }">
                  <i class="layui-icon">&#xe620;</i>
                  {{ $t('nav.settings') }}
                </router-link>
              </dd>
              <dd>
                <router-link :to="{ name: 'msg' }">
                  <i class="iconfont icon-tongzhi" style="top: 4px"></i>
                  {{ $t('nav.messages') }}
                </router-link>
              </dd>
              <dd>
                <router-link :to="{ name: 'home', params: { uid: user._id } }">
                  <i class="layui-icon" style="margin-left: 2px; font-size: 22px">
                    &#xe68e;
                  </i>
                  {{ $t('nav.profile') }}
                </router-link>
              </dd>
              <hr style="margin: 5px 0" />
              <dd>
                <a href="javascript:void(0)" @click="quit()" style="text-align: center">
                  {{ $t('nav.logout') }}
                </a>
              </dd>
            </dl>
          </li>
          <div class="fly-nav-msg">
            <router-link :to="{ name: 'msg'}">{{ num }}</router-link>
          </div>
          <div class="layui-layer-tips" v-show="hasMsg">
            <div class="layui-layer-content">
              {{ $t('nav.unreadTip', { count: num }) }}
              <i class="layui-layer-TipsG layui-layer-TipsB"></i>
            </div>
          </div>
        </template>
        <li class="layui-nav-item lang-switch-cell">
          <div class="lang-switch-pill" role="group" :aria-label="$t('lang.switchAria')">
            <a
              href="javascript:;"
              @click.prevent="setLocale('zh')"
              :class="{ 'lang-active': $i18n.locale === 'zh' }"
            >{{ $t('lang.zh') }}</a>
            <a
              href="javascript:;"
              @click.prevent="setLocale('en')"
              :class="{ 'lang-active': $i18n.locale === 'en' }"
            >{{ $t('lang.enShort') }}</a>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import { mapState } from 'vuex'
import { syncDocumentLang } from '@/i18n'
import { resolveAvatarUrl, onAvatarImgError } from '@/utils/avatar'

export default {
  name: 'Header',
  data() {
    return {
      isHover: false,
      hoverContral: '',
      hasMsg: false,
    }
  },
  watch: {
    num(newval, oldval) {
      if (newval !== oldval) {
        this.hasMsg = true
        setTimeout(() => {
          this.hasMsg = false
        }, 5000)
      }
    },
  },
  computed: {
    ...mapState({
      num: state => state.num,
    }),
    isShow: function() {
      return this.$store.state.isLogin
    },
    user: function() {
      return this.$store.state.userInfo
    },
    headerAvatarSrc() {
      return resolveAvatarUrl(this.user && this.user.pic)
    },
  },
  methods: {
    onAvatarImgError,
    setLocale(loc) {
      this.$i18n.locale = loc
      localStorage.setItem('app_locale', loc)
      syncDocumentLang(loc)
      dayjs.locale(loc === 'zh' ? 'zh-cn' : 'en')
    },
    show() {
      clearTimeout(this.hoverContral)
      this.hoverContral = setTimeout(() => {
        this.isHover = true
      }, 200)
    },
    hide() {
      clearTimeout(this.hoverContral)
      this.hoverContral = setTimeout(() => {
        this.isHover = false
      }, 300)
    },
    quit() {
      this.$confirm(
        this.$t('user.quitConfirm'),
        () => {
          // confirm 执行
          const loc = localStorage.getItem('app_locale')
          localStorage.clear()
          if (loc) localStorage.setItem('app_locale', loc)
          this.$store.commit('setUserInfo', '')
          this.$store.commit('setIsLogin', false)
          this.$store.commit('setToken', '')
          // 忽略重复路由
          this.$router.push('/', () => {})
        },
        () => {
          // cancel 执行
        }
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.fly-logo {
  left: -15px;
  top: -10px;
  margin-left: 15px;
}
.pdl20 {
  top: 0px;
  padding-left: 20px;
}
.layui-layer-tips {
  position: fixed;
  right: 0;
  white-space: nowrap;
  z-index: 3000;
}
.lang-switch-cell {
  margin-left: 6px;
}
.lang-switch-pill {
  display: inline-flex;
  align-items: stretch;
  height: 30px;
  margin: 15px 0;
  padding: 2px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  box-sizing: border-box;
  white-space: nowrap;
}
.lang-switch-pill a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  padding: 0 10px;
  font-size: 13px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.55);
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}
.lang-switch-pill a:hover {
  color: #fff;
}
.lang-switch-pill a.lang-active {
  background: rgba(95, 184, 120, 0.22);
  color: #7fe09a;
  font-weight: 600;
}
.header-user-avatar {
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.35);
}
</style>
