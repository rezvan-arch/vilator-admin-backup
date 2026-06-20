<script>
export default {
  props: {
    data: {
      type: Array,
    },
    multiSelect: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showSelect: false,
      selectInput: "",
      selectedItem: [],
    };
  },
  computed: {
    selectedItemValues() {
      return this.selectedItem.length > 1
        ? this.selectedItem.map((item) => item.title).join(",")
        : this.selectedItem[0].title;
    },
  },
  methods: {
    filteredSelectItem(item) {
      const filteredItems = item.filter((item) =>
        item.title.includes(this.selectInput)
      );

      return filteredItems;
    },
    checkItemSelected(val) {
      return this.selectedItem.filter((item) => {
        return item.id == val.id;
      }).length > 0
        ? true
        : false;
    },
    choseSelect(item) {
      if (!this.multiSelect) {
        this.selectedItem = [];
        this.showSelect = false;

        if (!this.checkItemSelected(item)) {
          this.data.tags.forEach((sItem) => {
            sItem.checked = false;
          });
        }
      }

      if (!this.checkItemSelected(item)) {
        this.selectedItem.push(item);
        this.data.tags.forEach((sItem) => {
          if (sItem.title == item.title) sItem.checked = true;
        });
      } else {
        this.data.tags.forEach((sItem) => {
          if (sItem.title == item.title) sItem.checked = false;
        });
        this.selectedItem = this.selectedItem.filter(
          (tag) => tag.id != item.id
        );
      }

      this.$emit("selected", this.selectedItem);
    },
    clickOutSide() {
      this.showSelect = false;
    },
  },
};
</script>
<template>
  <div class="admin__select" v-click-outside="clickOutSide">
    <button type="button" class="select__btn" @click="showSelect = !showSelect">
      <span v-if="selectedItem.length < 1">{{ data.title }}</span>
      <span v-else>{{ selectedItemValues }}</span>
      <i class="fa-regular fa-angle-down" :class="{ rotate: showSelect }"></i>
    </button>
    <div class="select__options" :class="{ active: showSelect }">
      <div v-if="data.tags.length > 10" class="search">
        <div class="search__control">
          <input type="text" placeholder="جستجو ..." v-model="selectInput" />
          <i class="fa-regular fa-magnifying-glass"></i>
        </div>
      </div>

      <ul>
        <li
          v-for="(item, index) in filteredSelectItem(data.tags)"
          :key="index"
          :class="{ active: checkItemSelected(item) }"
          @click="choseSelect(item)"
        >
          <span>{{ item.title }}</span>
        </li>

        <p
          v-if="filteredSelectItem(data.tags).length == 0"
          class="error__no__item"
        >
          گزینه مورد نظر یافت نشد
        </p>
      </ul>
    </div>
  </div>
</template>
<style lang="scss">
.admin__select {
  @apply relative;

  .select__btn {
    @apply outline-none h-12 w-full bg-white flex items-center justify-between px-2 border border-[#dde2ed] rounded-md text-[#687389] text-sm lg:text-base;

    &.active {
      i {
        @apply rotate-180;
      }
    }

    span {
      @apply whitespace-nowrap text-ellipsis overflow-hidden;
    }

    i {
      @apply transition-all duration-300 ease-in-out;

      &.rotate {
        @apply rotate-180;
      }
    }
  }

  .select__options {
    @apply scale-0 opacity-0 origin-top transition-all duration-300 ease-in-out  shadow-md overflow-hidden absolute top-[calc(100%+9px)] left-0 z-30 w-full rounded-md border border-[#dde2ed]  bg-white;

    .search {
      @apply p-3 pb-1 w-full;

      .search__control {
        @apply h-10 relative overflow-hidden border border-[#dde2ed]  rounded-md flex items-center;

        input {
          @apply w-full h-full pr-10 outline-none text-sm bg-transparent;
        }

        i {
          @apply absolute right-3 text-baseBlue-500;
        }
      }
    }

    ul {
      @apply flex flex-col gap-0  overflow-auto max-h-[200px];

      li {
        @apply w-full min-h-[42px] text-sm px-6 border-b last:border-b-0 border-[#dde2ed]  flex items-center cursor-pointer transition-colors duration-300 ease-in-out;

        span {
          @apply whitespace-nowrap text-ellipsis overflow-hidden;
        }

        &.active {
          @apply bg-baseBlue-500 bg-opacity-60 text-white;
        }
      }

      .error__no__item {
        @apply p-2 min-h-[42px] text-sm text-center;
      }

      &::-webkit-scrollbar {
        width: 5px;
      }

      /* Handle */
      &::-webkit-scrollbar-thumb {
        border-radius: 10px;
        @apply bg-baseBlue-500;
      }
    }

    &.active {
      @apply opacity-100 scale-100;
    }
  }
}
</style>
