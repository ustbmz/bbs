<template>
  <div class="wrapper">
    <template v-if="item.type === 'radio'">
      <RadioGroup @on-change="handleChange" :value="inputValue">
        <Radio
          :label="obj.value"
          v-for="(obj, index) in finalRadio"
          :key="'search-radio-' + index"
        >
          <span>{{ obj.key }}</span>
        </Radio>
      </RadioGroup>
    </template>
    <template v-else-if="item.type === 'date'">
      <DatePicker
        type="daterange"
        placement="bottom-end"
        :placeholder="$t('common.selectDateRange')"
        style="width: 200px"
        @on-change="handleChange"
      ></DatePicker>
    </template>
    <template v-else-if="item.type === 'select'">
      <Select
        v-model="selection"
        multiple
        style="width:260px"
        @on-change="handleChange"
        :value="inputValue"
      >
        <Option
          v-for="obj in item.options"
          :value="obj.value"
          :key="obj.value"
          >{{ obj.key }}</Option
        >
      </Select>
    </template>
    <template v-else>
      <Input
        @on-change="handleChange"
        :value="inputValue"
        clearable
        :placeholder="$t('common.searchPlaceholder')"
        class="search-input"
      />
    </template>
    <!-- 后面还可以去添加类型 -->
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    value: {
      type: [String, Array, Number],
      default: ''
    }
  },
  data() {
    return {
      selection: []
    }
  },
  computed: {
    radioOptionsDefault() {
      return [
        { key: this.$t('common.all'), value: '' },
        { key: this.$t('common.no'), value: '0' },
        { key: this.$t('common.yes'), value: '1' }
      ]
    },
    finalRadio() {
      let result = {}
      if (this.item.type === 'radio') {
        if (this.item.options) {
          result = this.item.options
        } else {
          result = this.radioOptionsDefault
        }
      }
      return result
    },
    inputValue() {
      return this.value
    }
  },
  methods: {
    handleChange(value) {
      this.$emit('changeEvent', value)
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: inline-block;
  margin: 0 10px;
}
</style>
