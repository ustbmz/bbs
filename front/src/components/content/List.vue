<template>
  <div class="fly-panel">
    <div class="fly-panel-title fly-filter">
      <a
        @click.prevent="search()"
        :class="{ 'layui-this': status === '' && tag == '' }"
      >
        {{ $t('list.all') }}
      </a>
      <span class="fly-mid"></span>
      <a @click.prevent="search(0)" :class="{ 'layui-this': status === '0' }">
        {{ $t('list.open') }}
      </a>
      <span class="fly-mid"></span>
      <a @click.prevent="search(1)" :class="{ 'layui-this': status === '1' }">
        {{ $t('list.closed') }}
      </a>
      <span class="fly-mid"></span>
      <a
        @click.prevent="search(2)"
        :class="{ 'layui-this': status === '' && tag == 'Featured' }"
      >
        {{ $t('list.featured') }}
      </a>
      <span class="fly-filter-right layui-hide-xs">
        <a
          @click.prevent="search(3)"
          :class="{ 'layui-this': sort === 'created' }"
        >
          {{ $t('list.byNew') }}
        </a>
        <span class="fly-mid"></span>
        <a
          @click.prevent="search(4)"
          :class="{ 'layui-this': sort === 'answer' }"
        >
          {{ $t('list.byHot') }}
        </a>
      </span>
    </div>
    <list-item
      :lists="lists"
      @nextpage="nextPage()"
      :isShow="isShow"
      :isEnd="isEnd"
    ></list-item>
  </div>
</template>

<script>
import { getList } from "@/api/content";
import ListItem from "./Listitem.vue";
export default {
  name: "list",
  components: {
    ListItem,
  },
  data() {
    return {
      catalog: "",
      isEnd: false,
      isShow: true,
      current: "",
      status: "",
      tag: "",
      sort: "",
      page: 0,
      limit: 20,
      lists: [],
    };
  },
  watch: {
    current(newval, oldval) {
      console.log("current : " + oldval + "," + newval);
      this.init();
    },
    $route(newval, oldval) {
      console.log("🚀 ~ file: List.vue ~ line 131 ~ $router ~ oldval", oldval);
      console.log("🚀 ~ file: List.vue ~ line 131 ~ $router ~ newval", newval);
      let catalog = this.$route.params["catalog"];
      if (typeof catalog !== "undefined" && catalog !== "") {
        this.catalog = catalog;
      }
      this.init();
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.lists = [];
      this.isEnd = false;
      this._getList();
    },
    _getList() {
      let options = {
        catalog: this.catalog,
        isTop: 0,
        page: this.page,
        limit: this.limit,
        sort: this.sort,
        tag: this.tag,
        status: this.status,
      };
      getList(options)
        .then((res) => {
          if (res.code === 200) {
            if (res.data.length < 20) {
              this.isEnd = true;
            }
            if (this.lists.length == 0) {
              this.lists = res.data;
            } else {
              this.lists = this.lists.concat(res.data);
            }
          }
        })
        .catch((err) => {
          this.$alert(err.message);
        });
    },
    nextPage() {
      this.page++;
      this._getList();
    },
    search(val) {
      if (typeof val === "undefined" && this.current === "") return;
      else {
        this.current = val;
      }
      console.log("search:" + val);
      switch (val) {
        case 0:
          (this.status = "0"), (this.tag = "");
          break;
        case 1:
          (this.status = "1"), (this.tag = "");
          break;
        case 2:
          (this.status = ""), (this.tag = "Featured");
          break;
        case 3:
          this.sort = "created";
          break;
        case 4:
          this.sort = "answer";
          break;
        default:
          (this.status = ""),
            (this.tag = ""),
            (this.sort = "created"),
            (this.current = "");
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>