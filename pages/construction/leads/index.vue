<script setup>
import useStore from "~/mixins/store";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | لیدهای ساخت",
});

const { constructionStore } = useStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const { $toast } = useNuxtApp();

const statusLabels = {
  new: "جدید",
  contacted: "تماس گرفته شد",
  converted: "تبدیل شد",
  rejected: "رد شده",
};

const statusBadges = {
  new: "badge-primary",
  contacted: "badge-warning",
  converted: "badge-success",
  rejected: "badge-secondary",
};

const statusFilterOptions = [
  { label: "همه", value: "" },
  { label: "جدید", value: "new" },
  { label: "تماس گرفته شد", value: "contacted" },
  { label: "تبدیل شد", value: "converted" },
  { label: "رد شده", value: "rejected" },
];

const filters = reactive({
  status: "",
  source: "",
});

if (route.query.page) {
  currentPage.value = route.query.page;
}

constructionStore.getAllLeads(currentPage.value, activeFilters());

function activeFilters() {
  let result = {};
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== "" && filters[key] !== null) {
      result[key] = filters[key];
    }
  });
  return result;
}

function applyFilters() {
  currentPage.value = 1;
  constructionStore.getAllLeads(1, activeFilters());
}

function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    constructionStore.getAllLeads(page, activeFilters());
  }
}

function changeStatus(lead) {
  constructionStore
    .updateLead(lead.id, { status: lead.status })
    .then((res) => {
      if (res.status == "success") {
        $toast("وضعیت لید به‌روزرسانی شد", "success", 2000);
      }
    });
}

function formatPrice(value) {
  if (!value) return "-";
  return Number(value).toLocaleString("fa-IR");
}
</script>
<template>
  <section class="properties__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیدهای ماشین‌حساب و مشاوره</h4>
      </div>
      <div class="card__body table">
        <div class="filter__box flex gap-2 mb-4">
          <v-select
            v-model="filters.status"
            placeholder="وضعیت"
            :options="statusFilterOptions"
            :reduce="(option) => option.value"
            :clearable="false"
            autocomplete="off"
            class="w-[180px]"
            @option:selected="applyFilters"
          />
        </div>
        <div v-if="!constructionStore.loading">
          <div v-if="constructionStore.leads.length > 0">
            <table>
              <thead>
                <tr>
                  <th>نام</th>
                  <th>موبایل</th>
                  <th>نوع پروژه</th>
                  <th>متراژ</th>
                  <th>طبقات</th>
                  <th>متریال</th>
                  <th>برآورد هزینه (تومان)</th>
                  <th>منبع</th>
                  <th>وضعیت پیگیری</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in constructionStore.leads"
                  :key="index"
                >
                  <td class="font-bold">{{ item.name ?? "-" }}</td>
                  <td dir="ltr">{{ item.mobile ?? "-" }}</td>
                  <td>{{ item.project_type ?? "-" }}</td>
                  <td>{{ item.estimated_area ? item.estimated_area + " متر" : "-" }}</td>
                  <td>{{ item.floors ?? "-" }}</td>
                  <td>{{ item.material_quality ?? "-" }}</td>
                  <td>
                    <template v-if="item.estimated_cost_min">
                      {{ formatPrice(item.estimated_cost_min) }} تا
                      {{ formatPrice(item.estimated_cost_max) }}
                    </template>
                    <template v-else>-</template>
                  </td>
                  <td>
                    <span class="badge badge-pill badge-light">
                      {{ item.source == "contact" ? "مشاوره" : "ماشین‌حساب" }}
                    </span>
                  </td>
                  <td>
                    <v-select
                      v-model="item.status"
                      :options="[
                        { label: 'جدید', value: 'new' },
                        { label: 'تماس گرفته شد', value: 'contacted' },
                        { label: 'تبدیل شد', value: 'converted' },
                        { label: 'رد شده', value: 'rejected' },
                      ]"
                      :reduce="(option) => option.value"
                      :clearable="false"
                      autocomplete="off"
                      @option:selected="changeStatus(item)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <AdminPagination
              v-if="constructionStore.meta && constructionStore.meta.last_page > 1"
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="constructionStore.meta.last_page"
            />
          </div>
          <div v-else class="empty__list">
            <p>لیدی ثبت نشده است</p>
          </div>
        </div>
        <div v-else class="empty__list">
          <p>درحال بارگذاری اطلاعات...</p>
        </div>
      </div>
    </div>
  </section>
</template>
