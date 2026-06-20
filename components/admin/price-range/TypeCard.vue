<script>
import { priceRangeStore } from "~/store/admin/price-range/index";
import { typesStore } from "~~/store/admin/types";
export default {
  props: ["type"],
  data() {
    return {
      items: [
        {
          id: 1,
          min: null,
          max: null,
          text: "",
        },
      ],
      deleteConfirm: false,
    };
  },
  setup() {
    const store = priceRangeStore();
    const typeStore = typesStore();

    return {
      store,
      typeStore,
    };
  },
  methods: {
    deleteType() {
      this.store.deleteType(this.type.id);
      this.deleteConfirm = false;
    },
  },
};
</script>
<template>
  <div class="card">
    <div class="card__header">
      <button class="close__btn" @click="deleteConfirm = true">
        <i class="fa-regular fa-xmark"></i>
      </button>
      <div class="controls w-1/4">
        <label for="type">نوع تایپ</label>
        <v-select
          v-model="type.type_id"
          id="type"
          label="title"
          :reduce="(option) => option.id"
          :options="typeStore.allTypes"
          autocomplete="off"
        ></v-select>
      </div>
      <button class="btn btn-primary" @click="store.addItem(type.id)">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>
    <div class="card__body">
      <AdminPriceRangeCardItem
        v-for="(item, index) in type.items"
        :key="index"
        :data="item"
        @deleteItem="store.deleteItem($event, type.id)"
      />
    </div>
  </div>

  <transition name="fade">
    <AdminModalsConfirmModal
      v-if="deleteConfirm"
      msg="آیا از حذف این تایپ اطمینان دارید؟"
      @confirm="deleteType"
      @closeModal="deleteConfirm = false"
    />
  </transition>
</template>
<style lang="scss" scoped>
.card__header {
  @apply relative;
}
.close__btn {
  @apply absolute right-2 top-2 h-6 w-6 border border-[#dde2ed] rounded-md px-2 flex items-center text-xs text-[#708097];
}
</style>
