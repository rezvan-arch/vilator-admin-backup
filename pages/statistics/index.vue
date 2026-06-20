<script setup>
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
import { statisticsStore } from "~~/store/admin/statistics";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | آمار",
});

// variables
const store = statisticsStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const trashConfirm = ref(false);
const showFilter = ref(false);
const filterBody = ref(null);
const statusOption = [
  {
    label: "فعال",
    value: "active",
  },
  {
    label: "غیر فعال",
    value: "de_active",
  },
];
const filter = reactive({
  title: "",
  slug: "",
  status: "",
});
const filterLoading = ref(false);

if (route.query.page) {
  currentPage.value = route.query.page;
}

store.getStatistics(currentPage.value);

// methods
function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    store.getStatistics(page, filter);
  }
}

function showQuery(slug) {
  const newSlug = slug.map((item) => item.replaceAll(",", "-"));

  return newSlug.join(",");
}
</script>
<template>
  <section class="types__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست آمار</h4>
      </div>
      <div class="card__body table">
        <div v-if="!store.loading">
          <div v-if="store.statistics.length > 0">
            <table>
              <thead>
                <tr>
                  <th>آی پی کاربر</th>
                  <th>کوئری</th>
                  <th>به صفحه</th>
                  <th>تاریخ</th>
                  <th>نوع تایپ</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in store.statistics" :key="index">
                  <td class="c_ellipsis">{{ item.user_ip }}</td>
                  <td class="c_ellipsis">
                    <template v-if="item.slug_query">
                      {{ showQuery(item.slug_query) }}
                    </template>
                    <template v-else>-</template>
                  </td>
                  <td class="c_ellipsis">
                    <template v-if="item.current_url">
                      {{ item.current_url }}
                    </template>
                    <template v-else>-</template>
                  </td>
                  <td class="c_ellipsis" style="direction: ltr">
                    {{ convertDate(item.created_at, true) }}
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <span
                        v-if="item.type == 'page'"
                        class="badge badge-pill badge-success"
                      >
                        صفحه
                      </span>
                      <span
                        v-else-if="item.type == 'search'"
                        class="badge badge-pill badge-primary"
                      >
                        جستجو
                      </span>
                    </div>
                  </td>
                  <td class="setting">
                    <nuxt-link
                      :to="`/statistics/${item.id}`"
                      title="نمایش ملک"
                      class="see__action"
                    >
                      <i class="fa-regular fa-eye"></i>
                    </nuxt-link>
                  </td>
                </tr>
              </tbody>
            </table>
            <AdminPagination
              v-if="store.pagination && store.pagination.last_page > 1"
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="store.pagination.last_page"
            />
          </div>
          <div v-else class="empty__list">
            <p>موردی برای نمایش وجود ندارد</p>
          </div>
        </div>
        <div v-else class="empty__list">
          <p>درحال بارگذاری اطلاعات...</p>
        </div>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.filter__box {
  @apply pb-0;
  .collapse__header {
    @apply cursor-pointer;
    .collapse__icon {
      @apply transition-transform duration-700;

      &.rotate {
        @apply rotate-180;
      }
    }
  }
  .collapse__body {
    padding: 0 1.5rem !important;
    @apply max-h-0 overflow-hidden transition-all duration-700 opacity-0;

    &.showFilter {
      padding: 1rem 1.5rem !important;
    }
  }
}
</style>
