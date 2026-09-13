<script>
import { glossaryStore } from "~/store/admin/glossary/index";

// واژهنامه لینکدهی هوشمند — لیست + اسکنر پوشش + پیشنمایش زنده
// بک‌اند: /api/glossary/* (index با search/category/is_active + scan + preview)
export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | واژهنامه لینکدهی",
    });
    const store = glossaryStore();

    store.loading = true;
    store.meta = [];

    return {
      store,
    };
  },
  data() {
    return {
      currentPage: 1,
      deleteID: "",
      deleteConfirmDialog: false,
      filters: {
        search: "",
        category: "",
        is_active: "",
      },
      categories: [
        { value: "deed", label: "سند" },
        { value: "legal", label: "حقوقی" },
        { value: "rent", label: "اجاره" },
        { value: "price", label: "قیمت/بازار" },
        { value: "feature", label: "ویژگی" },
        { value: "city", label: "شهر" },
        { value: "property_type", label: "نوع ملک" },
        { value: "construction", label: "ساخت" },
        { value: "other", label: "سایر" },
      ],
      priorities: { 0: "عادی", 1: "متوسط", 2: "مهم", 3: "حیاتی" },
      previewForm: {
        text: "خرید ویلا در آمل برای سرمایهگذاری توصیه میشود. زمینهای ساختنی هم موجودند.",
        path: "",
      },
      previewOpen: false,
      scanOpen: false,
      gscOpen: false,
      gscDays: 90,
    };
  },
  created() {
    if (this.$route.query.page && !isNaN(this.$route.query.page)) {
      this.currentPage = Number(this.$route.query.page);
    }
    this.getLatest();
    this.loadClicks();
  },
  methods: {
    async loadClicks() {
      try {
        await this.store.getClickStats(30);
      } catch (err) {
        // آمار کلیک اختیاری است — خطا لیست را نمیشکند
      }
    },
    clicksOf(keyword) {
      return this.store.clickStats?.clicks?.[keyword] ?? 0;
    },
    categoryLabel(value) {
      const found = this.categories.find((c) => c.value === value);
      return found ? found.label : value || "—";
    },
    async getLatest() {
      await this.store
        .getAll(this.currentPage, this.filters)
        .then((res) => {
          if (res.status == "success") {
            this.store.data = res.data;
            this.store.meta = res.meta;
          }
          this.store.loading = false;
        })
        .catch(() => {
          this.store.loading = false;
        });
    },
    applyFilters() {
      this.currentPage = 1;
      this.store.loading = true;
      this.getLatest();
    },
    resetFilters() {
      this.filters = { search: "", category: "", is_active: "" };
      this.applyFilters();
    },
    async toggleActive(item) {
      try {
        const res = await this.store.update(item.id, {
          is_active: !item.is_active,
        });
        if (res.status == "success") {
          item.is_active = !item.is_active;
          this.$toast(
            item.is_active ? "واژه فعال شد." : "واژه غیرفعال شد.",
            "success",
            2000
          );
        } else {
          this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
        }
      } catch (err) {
        this.$toast(
          err?.response?.data?.message ?? "درخواست با خطا مواجه شد!",
          "error",
          2500
        );
      }
    },
    deleteConfirm(id) {
      this.deleteID = id;
      this.deleteConfirmDialog = true;
    },
    deleteItem() {
      if (this.deleteID != "") {
        this.deleteConfirmDialog = false;
        this.store.deleteSingle(this.deleteID).then((res) => {
          if (res.status == "success") {
            this.$toast("واژه حذف شد!", "success", 2000);
          } else {
            this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
          }
          this.deleteID = "";
          this.store.loading = true;
          this.getLatest();
        });
      }
    },
    pagination(page = 1) {
      if (this.currentPage != page) {
        this.$router.push({ query: { page } });
        this.store.loading = true;
        this.currentPage = page;
        this.getLatest();
      }
    },
    async runScan() {
      this.scanOpen = true;
      try {
        const res = await this.store.scan();
        if (res.status == "success" && this.store.scanResult) {
          const r = this.store.scanResult;
          this.$toast(
            `اسکن کامل شد — ${r.contents_scanned} محتوا بررسی شد، ${r.dead_terms.length} واژه مرده، ${r.orphan_targets.length} مقصد ناموجود`,
            r.dead_terms.length || r.orphan_targets.length ? "success" : "success",
            3000
          );
        }
      } catch (err) {
        this.$toast("اسکن با خطا مواجه شد!", "error", 2500);
      }
    },
    async runPreview() {
      if (!this.previewForm.text.trim()) {
        this.$toast("متنی برای پیشنمایش وارد کنید!", "error", 2000);
        return;
      }
      this.previewOpen = true;
      try {
        await this.store.preview(this.previewForm.text, this.previewForm.path);
      } catch (err) {
        this.$toast("پیشنمایش با خطا مواجه شد!", "error", 2500);
      }
    },
    async runGsc() {
      this.gscOpen = true;
      const res = await this.store.getGscSuggestions(this.gscDays);
      if (res && res.status == "success" && this.store.gscResult) {
        const r = this.store.gscResult;
        const total =
          (r.brand_city?.length || 0) +
          (r.mismatch?.length || 0) +
          (r.opportunity?.length || 0);
        this.$toast(
          `${total} پیشنهاد از ${r.queries_analyzed} کوئری واقعی گوگل`,
          "success",
          3000
        );
      } else if (this.store.gscError) {
        this.$toast(this.store.gscError, "error", 4000);
      }
    },
    gscRows() {
      const r = this.store.gscResult;
      if (!r) return [];
      const rows = [];
      for (const item of r.brand_city || []) rows.push({ ...item, type: "برند+شهر" });
      for (const item of r.mismatch || []) rows.push({ ...item, type: "مقصد غلط" });
      for (const item of r.opportunity || []) rows.push({ ...item, type: "فرصت صفحه ۲" });
      return rows;
    },
    addSuggestion(row) {
      const query = new URLSearchParams({
        keyword: row.keyword,
        ...(row.target_url ? { target_url: row.target_url } : {}),
      }).toString();
      this.$router.push(`/glossary/form/new?${query}`);
    },
  },
};
</script>
<template>
  <section class="glossary__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">واژهنامه لینکدهی هوشمند (Auto-Linker)</h4>
        <div class="flex items-center gap-2">
          <button
            class="btn btn-secondary"
            :disabled="store.scanning"
            @click="runScan()"
          >
            <i class="fa-regular fa-magnifying-glass-chart"></i>
            {{ store.scanning ? "درحال اسکن..." : "اسکن پوشش" }}
          </button>
          <nuxt-link to="/glossary/form/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            واژه جدید
          </nuxt-link>
        </div>
      </div>

      <!-- نتیجه اسکن -->
      <div
        v-if="scanOpen && store.scanResult"
        class="scan__panel"
      >
        <div class="scan__stats">
          <span>محتوای اسکنشده: <b>{{ store.scanResult.contents_scanned }}</b></span>
          <span>واژه فعال: <b>{{ store.scanResult.terms_total }}</b></span>
          <span>لینکشده: <b>{{ store.scanResult.terms_linked }}</b></span>
          <span>مجموع رخداد: <b>{{ store.scanResult.total_occurrences }}</b></span>
        </div>
        <div
          v-if="store.scanResult.dead_terms.length"
          class="scan__issues"
        >
          <b class="text-red-600">واژههای مرده (در هیچ محتوایی نیستند):</b>
          <span v-for="(d, i) in store.scanResult.dead_terms" :key="`d-${i}`" class="issue__chip">
            {{ d.keyword }}
          </span>
        </div>
        <div
          v-if="store.scanResult.orphan_targets.length"
          class="scan__issues"
        >
          <b class="text-red-600">مقصدهای ناموجود (صفحه مقصد پیدا نمیشود):</b>
          <span v-for="(o, i) in store.scanResult.orphan_targets" :key="`o-${i}`" class="issue__chip" dir="ltr">
            {{ o.target_url }}
          </span>
        </div>
        <div
          v-if="!store.scanResult.dead_terms.length && !store.scanResult.orphan_targets.length"
          class="text-green-600 text-sm"
        >
          همه واژهها در محتوا حضور دارند و همه مقصدها معتبرند ✓
        </div>
      </div>

      <div class="card__body table">
        <!-- فیلترها -->
        <div class="filters__row">
          <input
            v-model="filters.search"
            type="text"
            placeholder="جستجو در واژه/مقصد..."
            class="w-56"
            @keyup.enter="applyFilters()"
          />
          <select v-model="filters.category" class="w-44">
            <option value="">همه دستهها</option>
            <option v-for="c in categories" :key="c.value" :value="c.value">
              {{ c.label }}
            </option>
          </select>
          <select v-model="filters.is_active" class="w-36">
            <option value="">همه وضعیتها</option>
            <option :value="true">فعال</option>
            <option :value="false">غیرفعال</option>
          </select>
          <button class="btn btn-primary py-1 px-3 text-sm" @click="applyFilters()">
            اعمال
          </button>
          <button class="btn btn-secondary py-1 px-3 text-sm" @click="resetFilters()">
            حذف فیلترها
          </button>
        </div>

        <div v-if="!store.loading">
          <div v-if="store.data.length > 0">
            <table>
              <thead>
                <tr>
                  <th>واژه</th>
                  <th>مقصد</th>
                  <th>دسته</th>
                  <th>اولویت</th>
                  <th>کلیک ۳۰ روز</th>
                  <th>وضعیت</th>
                  <th style="text-align: left">تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in store.data" :key="index">
                  <td class="font-bold">{{ item.keyword }}</td>
                  <td class="font-mono text-xs" dir="ltr">
                    <nuxt-link :to="`/glossary/form/${item.id}`" class="text-blue-600">
                      {{ item.target_url }}
                    </nuxt-link>
                  </td>
                  <td>{{ categoryLabel(item.category) }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="item.priority >= 2 ? 'badge-warning' : 'badge-secondary'"
                    >
                      {{ priorities[item.priority] ?? "متوسط" }}
                    </span>
                  </td>
                  <td>
                    <span :class="clicksOf(item.keyword) > 0 ? 'font-bold text-green-600' : 'opacity-50'">
                      {{ clicksOf(item.keyword) }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="badge cursor-pointer"
                      :class="item.is_active ? 'badge-success' : 'badge-secondary'"
                      :title="item.is_active ? 'غیرفعال کن' : 'فعال کن'"
                      @click="toggleActive(item)"
                    >
                      {{ item.is_active ? "فعال" : "غیرفعال" }}
                    </button>
                  </td>
                  <td class="setting">
                    <div class="actions justify-end">
                      <nuxt-link
                        :to="`/glossary/form/${item.id}`"
                        class="edit__action"
                      >
                        <i class="fa-regular fa-pen-to-square"></i>
                      </nuxt-link>
                      <button
                        class="delete__action"
                        @click="deleteConfirm(item.id)"
                      >
                        <i class="fa-regular fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <AdminPagination
              v-if="store.meta && store.meta.last_page > 1"
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="store.meta.last_page"
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

    <!-- پیشنمایش زنده -->
    <div class="card mt-4">
      <div class="card__header cursor-pointer" @click="previewOpen = !previewOpen">
        <h4 class="heading__title">پیشنمایش لینکدهی</h4>
        <i
          class="fa-regular"
          :class="previewOpen ? 'fa-chevron-up' : 'fa-chevron-down'"
        ></i>
      </div>
      <div v-if="previewOpen" class="card__body">
        <div class="row gap-2 mb-3">
          <div class="controls flex-1">
            <label>متن آزمایشی (HTML هم قبول است)</label>
            <textarea
              v-model="previewForm.text"
              rows="3"
              class="w-full"
            ></textarea>
          </div>
          <div class="controls w-72">
            <label>مسیر صفحه جاری (برای گارد سلفلینک)</label>
            <input
              v-model="previewForm.path"
              type="text"
              dir="ltr"
              placeholder="/property/type-villa/location-amol"
              class="w-full"
            />
          </div>
        </div>
        <button
          class="btn btn-primary"
          :disabled="store.previewing"
          @click="runPreview()"
        >
          <i class="fa-regular fa-bolt"></i>
          {{ store.previewing ? "درحال اجرا..." : "پیشنمایش" }}
        </button>

        <div v-if="store.previewResult" class="preview__result">
          <label class="mb-1 block font-bold">نتیجه (HTML رندشده):</label>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="preview__html" v-html="store.previewResult.html"></div>

          <label class="my-2 block font-bold">گزارش لینکها:</label>
          <table v-if="(store.previewResult.debug || []).length" class="w-full text-sm">
            <thead>
              <tr>
                <th>واژه</th>
                <th>مقصد</th>
                <th>وضعیت</th>
                <th>دلیل</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, i) in store.previewResult.debug" :key="`dbg-${i}`">
                <td>{{ d.keyword ?? "—" }}</td>
                <td class="font-mono text-xs" dir="ltr">{{ d.target ?? "—" }}</td>
                <td>
                  <span
                    class="badge"
                    :class="d.status == 'linked' ? 'badge-success' : 'badge-secondary'"
                  >
                    {{ d.status == "linked" ? "لینک شد" : "رد شد" }}
                  </span>
                </td>
                <td class="opacity-80">{{ d.reason ?? (d.status == "linked" ? `انکر: ${d.anchor}` : "") }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-sm opacity-60">هیچ واژهای در این متن لینک نشد.</p>
        </div>
      </div>
    </div>

    <!-- پیشنهاد واژه از Google Search Console -->
    <div class="card mt-4">
      <div class="card__header cursor-pointer" @click="gscOpen = !gscOpen">
        <h4 class="heading__title">پیشنهاد واژه از گوگل (Search Console)</h4>
        <i
          class="fa-regular"
          :class="gscOpen ? 'fa-chevron-up' : 'fa-chevron-down'"
        ></i>
      </div>
      <div v-if="gscOpen" class="card__body">
        <p class="text-xs opacity-60 mb-3">
          سه سبد: «برند+شهر» (تقاضای شهر با نام برند) | «مقصد غلط» (کوئری شهر-دار که به صفحه بدون آن شهر میرسد) |
          «فرصت صفحه ۲» (position ۸ تا ۲۰ — با لینک داخلی ارزان به صفحه ۱ میآید). برای هر ردیف، «افزودن» شما را با
          واژه و مقصد پیشنهادی به فرم میبرد تا بازبینی و ثبت کنید.
        </p>
        <div class="filters__row">
          <select v-model="gscDays" class="w-40">
            <option :value="30">۳۰ روز اخیر</option>
            <option :value="90">۹۰ روز اخیر</option>
            <option :value="180">۶ ماه اخیر</option>
          </select>
          <button
            class="btn btn-primary"
            :disabled="store.gscLoading"
            @click="runGsc()"
          >
            <i class="fa-regular fa-magnifying-glass"></i>
            {{ store.gscLoading ? "درحال دریافت از گوگل..." : "دریافت پیشنهادها" }}
          </button>
        </div>

        <div
          v-if="store.gscError"
          class="gsc__notice"
        >
          <b>دسترسی به GSC برقرار نیست:</b>
          <span>{{ store.gscError }}</span>
        </div>

        <table v-if="gscRows().length" class="w-full text-sm">
          <thead>
            <tr>
              <th>واژه پیشنهادی</th>
              <th>نوع</th>
              <th>کوئری منبع</th>
              <th>کلیک</th>
              <th>نمایش</th>
              <th>position</th>
              <th>مقصد پیشنهادی</th>
              <th>عمل</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in gscRows()" :key="`gsc-${i}`">
              <td class="font-bold">{{ row.keyword }}</td>
              <td>
                <span
                  class="badge"
                  :class="row.type === 'برند+شهر' ? 'badge-success' : row.type === 'مقصد غلط' ? 'badge-warning' : 'badge-secondary'"
                >
                  {{ row.type }}
                </span>
              </td>
              <td class="opacity-70 text-xs">{{ row.source_query }}</td>
              <td>{{ row.clicks }}</td>
              <td>{{ row.impressions }}</td>
              <td dir="ltr">{{ row.position }}</td>
              <td class="font-mono text-xs" dir="ltr">
                {{ row.target_url || "— انتخاب با شما —" }}
              </td>
              <td>
                <nuxt-link
                  :to="`/glossary/form/new?${'keyword=' + encodeURIComponent(row.keyword) + (row.target_url ? '&target_url=' + encodeURIComponent(row.target_url) : '')}`"
                  class="btn btn-primary py-1 px-3 text-xs"
                >
                  افزودن
                </nuxt-link>
              </td>
            </tr>
          </tbody>
        </table>
        <p
          v-else-if="store.gscResult && !store.gscError"
          class="text-sm opacity-60"
        >
          پیشنهاد جدیدی یافت نشد — با افزایش بازه زمانی دوباره امتحان کنید (دیتای GSC هر ۶ ساعت کش میشود).
        </p>
      </div>
    </div>
  </section>

  <transition name="fade">
    <AdminModalsConfirmModal
      v-if="deleteConfirmDialog"
      msg="آیا از حذف این واژه اطمینان دارید؟ (لینکهای تولیدشده با آن در صفحات از بین میرود)"
      @confirm="deleteItem()"
      @closeModal="deleteConfirmDialog = false"
    />
  </transition>
</template>
<style lang="scss" scoped>
.card__header {
  @apply flex items-center justify-between;

  .btn {
    @apply flex items-center gap-2;
  }
}

.filters__row {
  @apply flex flex-wrap items-center gap-2 mb-4;
}

.badge {
  @apply px-3 py-1 rounded-full text-xs;

  &.badge-success {
    @apply bg-green-100 text-green-700;
  }

  &.badge-secondary {
    @apply bg-gray-100 text-gray-500;
  }

  // amber در @apply این پروژه در دسترس نیست — CSS خام
  &.badge-warning {
    background-color: #fef3c7;
    color: #92400e;
  }
}

.scan__panel {
  @apply px-4 py-3 space-y-2 text-sm;
  border-bottom: 1px solid #f3f4f6;

  .scan__stats {
    @apply flex flex-wrap gap-4;
  }

  .scan__issues {
    @apply flex flex-wrap items-center gap-2;

    .issue__chip {
      @apply px-2 py-0.5 rounded text-xs;
      background-color: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
  }
}

.preview__result {
  @apply mt-4;

  .preview__html {
    @apply p-3 rounded-lg leading-8;
    border: 1px solid #e5e7eb;

    :deep(.auto-link) {
      @apply text-blue-600 underline underline-offset-4;
      text-decoration-style: dotted;
    }
  }
}

.gsc__notice {
  @apply p-3 rounded-lg text-sm mb-3;
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}
</style>
