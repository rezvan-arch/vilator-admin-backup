<script>
import { priceRangeStore } from "~/store/admin/price-range/index";
import { typesStore } from "~/store/admin/types";
export default {
  data() {
    return {};
  },
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | بازه قیمتی ",
    });
    const store = priceRangeStore();
    const typeStore = typesStore();

    return {
      typeStore,
      store,
    };
  },
  async created() {
    await this.typeStore.getAllType();
    await this.store.getData();
  },
};
</script>
<template>
  <div v-if="!store.loading">
    <div class="card">
      <div class="card__header">
        <h3>بازه قیمتی</h3>
        <div class="flex gap-1">
          <button class="btn btn-success" @click="store.submit()">ذخیره</button>
          <button
            class="btn btn-primary"
            @click="store.addType()"
            title="اضافه کردن"
          >
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
    <AdminPriceRangeTypeCard
      v-for="(item, index) in store.types"
      :key="index"
      :type="item"
    />
  </div>
  <div v-else>
    <div class="card">
      <div class="card__header">
        <h3>درحال دریافت اطلاعات...</h3>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.card__container {
  @apply bg-transparent shadow-none;
}
</style>
