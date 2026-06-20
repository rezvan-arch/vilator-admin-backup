<script>
import { statisticsStore } from "~/store/admin/statistics";
import moment from "jalali-moment";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | آمار",
    });
    const momenT = moment();
    const store = statisticsStore();
    const route = useRoute();

    store.getSingleStatistic(route.params.id);

    return {
      momenT,
      store,
    };
  },
  data() {
    return {};
  },
  methods: {},
};
</script>
<template>
  <section class="visit__edit">
    <div class="card">
      <div class="card__header">
        <h4 v-if="store.loading" class="heading__title">
          درحال بارگزاری اطلاعات...
        </h4>
        <h4 v-else class="heading__title">نمایش آمار</h4>
        <div class="heading__actions">
          <nuxt-link to="/statistics" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div
        v-if="!store.loading"
        class="card__body border border-b border-t-0 border-l-0 border-r-0 border-[#0000001a]"
      >
        <div class="row">
          <div class="controls w-1/4">
            <label for="user_name">آی پی کاربر</label>
            <span v-if="store.statistics.user_ip">
              {{ store.statistics.user_ip }}
            </span>
            <span v-else>-</span>
          </div>
          <div class="controls w-1/4">
            <label for="property_name">به صفحه</label>
            <span v-if="store.statistics.current_url">
              {{ store.statistics.current_url }}
            </span>
            <span v-else>-</span>
          </div>
          <div class="controls w-1/4">
            <label for="notific">تاریخ</label>
            <span v-if="store.statistics.created_at">
              {{ convertDate(store.statistics.created_at, true) }}
            </span>
            <span v-else>-</span>
          </div>
          <div class="controls w-1/4">
            <label for="suggested_date">نوع تایپ</label>
            <span
              v-if="store.statistics.type == 'page'"
              class="badge badge-pill badge-success"
            >
              صفحه
            </span>
            <span
              v-else-if="store.statistics.type == 'search'"
              class="badge badge-pill badge-primary"
            >
              جستجو
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.controls label {
  @apply text-sm text-[#2B335E] mb-2 block;
}

select {
  @apply bg-white w-full rounded-[4px];
}

.controls input[type="checkbox"] {
  @apply w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 focus:ring-offset-1;
}
</style>
