<template>
  <div class="lang-switch-wrap">
    <div
      class="lang-switch"
      role="group"
      :aria-label="$t('langLabel')"
    >
      <button
        type="button"
        class="lang-switch__btn"
        :class="{ 'lang-switch__btn--active': lang === 'en-US' }"
        @click="setLang('en-US')"
      >
        EN
      </button>
      <button
        type="button"
        class="lang-switch__btn"
        :class="{ 'lang-switch__btn--active': lang === 'zh-CN' }"
        @click="setLang('zh-CN')"
      >
        中文
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Language',
  props: {
    lang: String
  },
  watch: {
    lang(lang) {
      this.$i18n.locale = lang
    }
  },
  methods: {
    setLang(code) {
      if (code === this.lang) return
      this.$emit('on-lang-change', code)
    }
  }
}
</script>

<style lang="less" scoped>
.lang-switch-wrap {
  display: inline-flex;
  align-items: center;
  height: 64px;
}

.lang-switch {
  display: inline-flex;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.lang-switch__btn {
  border: none;
  margin: 0;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.5;
  color: #515a6e;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  border-right: 1px solid #e8eaec;

  &:last-child {
    border-right: none;
  }

  &:hover:not(.lang-switch__btn--active) {
    background: #f8f8f9;
    color: #2d8cf0;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    position: relative;
    z-index: 1;
    box-shadow: inset 0 0 0 2px rgba(45, 140, 240, 0.45);
  }

  &--active {
    background: #2d8cf0;
    color: #fff;

    &:hover {
      background: #2d8cf0;
      color: #fff;
    }
  }
}
</style>
