<template>
  <div class="fly-panel">
    <div class="fly-panel-title">{{ $t('sidebar.memorialTitle') }}</div>
    <div class="fly-panel-main">
      <a
        href="http://layim.layui.com/?from=fly"
        target="_blank"
        class="fly-zanzhu"
        time-limit="2017.09.25-2099.01.01"
        style="background-color: #5fb878"
      >
        {{ $t('sidebar.memorialBtn') }}
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ads',
}
</script>

<style lang="scss" scoped></style>
