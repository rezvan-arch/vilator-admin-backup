<script setup>
import useStore from "~/mixins/store";
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | مقالات مجله",
});

const { articleStore } = useStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const trashConfirmModal = ref(false);
const loading = ref(null);
const { $toast } = useNuxtApp();

const filters = reactive({
  search: "",
  type: "",
  hub: "",
  status: "",
});

const typeLabels = {
  pillar: "پیلار",
  cluster: "کلاستر",
  location_hub: "هاب منطقه",
  market_report: "گزارش بازار",
};

const hubLabels = {
  location: "مناطق و مقاصد",
  buying_guide: "راهنمای خرید",
  rental_guide: "راهنمای اجاره",
  investment: "سرمایه‌گذاری",
  legal: "حقوقی و ثبتی",
  appraisal: "ارزش‌گذاری و قیمت",
  construction_guide: "راهنمای ساخت",
  transaction: "معاملات و مذاکره",
};

const statusLabels = {
  draft: "پیش‌نویس",
  published: "منتشر شده",
  archived: "آرشیو",
};

const statusBadges = {
  draft: "badge-primary",
  published: "badge-success",
  archived: "badge-secondary",
};

if (route.query.page) {
  currentPage.value = route.query.page;
}

articleStore.getAll(currentPage.value);

function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    articleStore.getAll(page, activeFilters());
  }
}

function activeFilters() {
  let result = {};
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== "" && filters[key] !== null) {
      result[key] = filters[key];
    }
  });
  return result;
}

function search() {
  currentPage.value = 1;
  router.push({ query: {} });
  articleStore.getAll(1, activeFilters());
}

function trashConfirm(id) {
  articleStore.actionId = id;
  trashConfirmModal.value = true;
}

function deleteArticle() {
  if (articleStore.actionId != "") {
    trashConfirmModal.value = false;
    loading.value = articleStore.actionId;
    articleStore.deleteArticle().then(() => {
      $toast("مقاله با موفقیت حذف شد", "success", 2000);
      articleStore.data = articleStore.data.filter(
        (item) => item.id != articleStore.actionId
      );
      articleStore.actionId = "";
      loading.value = null;
    });
  }
}
</script>
<template>
  <section class="properties__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">مقالات مجله</h4>
        <div class="heading__actions">
          <nuxt-link to="/article/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            مقاله جدید
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div class="filter__box flex gap-2 mb-4 flex-wrap">
          <input
            v-model="filters.search"
            type="text"
            placeholder="جستجو در عنوان..."
            class="form-control w-[220px]"
            @keyup.enter="search"
          />
          <v-select
            v-model="filters.type"
            placeholder="نوع مقاله"
            :options="[
              { label: 'پیلار', value: 'pillar' },
              { label: 'کلاستر', value: 'cluster' },
              { label: 'هاب منطقه', value: 'location_hub' },
              { label: 'گزارش بازار', value: 'market_report' },
            ]"
            :reduce="(option) => option.value"
            :clearable="true"
            autocomplete="off"
            class="w-[170px]"
          />
          <v-select
            v-model="filters.status"
            placeholder="وضعیت"
            :options="[
              { label: 'پیش‌نویس', value: 'draft' },
              { label: 'منتشر شده', value: 'published' },
              { label: 'آرشیو', value: 'archived' },
            ]"
            :reduce="(option) => option.value"
            :clearable="true"
            autocomplete="off"
            class="w-[150px]"
          />
          <button class="btn btn-primary h-[46px]" @click="search">
            <i class="fa-regular fa-magnifying-glass"></i>
            جستجو
          </button>
        </div>
        <div v-if="!articleStore.loading">
          <div v-if="articleStore.data.length > 0">
            <table>
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>نوع</th>
                  <th>هاب</th>
                  <th>وضعیت</th>
                  <th>بازدید</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in articleStore.data"
                  :key="index"
                >
                  <td class="font-bold">{{ item.title }}</td>
                  <td>{{ typeLabels[item.type] || item.type }}</td>
                  <td>{{ hubLabels[item.hub] || item.hub }}</td>
                  <td>
                    <span
                      class="badge badge-pill"
                      :class="statusBadges[item.status] || 'badge-primary'"
                    >
                      {{ statusLabels[item.status] || item.status }}
                    </span>
                  </td>
                  <td>{{ item.view_count ?? 0 }}</td>
                  <td class="setting">
                    <div class="actions">
                      <nuxt-link
                        :to="`/article/edit/${item.id}`"
                        class="edit__action"
                      >
                        <i class="fa-regular fa-pen-to-square"></i>
                      </nuxt-link>
                      <button
                        class="delete__action"
                        @click="trashConfirm(item.id)"
                        :disabled="loading == item.id"
                      >
                        <template v-if="loading == item.id">
                          <i
                            class="fa-solid fa-spinner text-xl animate-spin"
                          ></i>
                        </template>
                        <template v-else>
                          <i class="fa-regular fa-trash"></i>
                        </template>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <AdminPagination
              v-if="articleStore.meta && articleStore.meta.last_page > 1"
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="articleStore.meta.last_page"
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

  <ConfirmModal
    v-if="trashConfirmModal"
    msg="آیا از حذف این مقاله اطمینان دارید؟"
    @confirm="deleteArticle"
    @closeModal="trashConfirmModal = false"
  />
</template>
