<script>
import useStore from "~~/mixins/store";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | صفحه فرود ",
    });
    const { landingPage } = useStore();

    landingPage.actionId = "";
    landingPage.loading = true;
    landingPage.pagination = [];

    return {
      landingPage,
    };
  },
  data() {
    return {
      currentPage: 1,
      deleteConfirm: false,
      deleteLoading: false,
      candidatesModal: false,
      formulaModal: false,
      bulkLoading: false,
      generateLoading: "",
    };
  },
  created() {
    if (this.$route.query.page && !isNaN(this.$route.query.page)) {
      this.currentPage = Number(this.$route.query.page);
    }

    this.getLatest();
  },
  methods: {
    async getLatest() {
      await this.landingPage.getSearches(this.currentPage).then(() => {
        if (this.landingPage.pagination.last_page < this.currentPage) {
          this.$router.push({
            query: {
              page: undefined,
            },
          });
          this.currentPage = 1;
          this.landingPage.getSearches(this.currentPage);
        }
      });
    },
    deleteSearchConfirm(id) {
      this.landingPage.actionId = id;
      this.deleteConfirm = true;
    },
    deleteSearch() {
      if (this.landingPage.actionId != "") {
        this.deleteConfirm = false;
        this.deleteLoading = this.landingPage.actionId;
        this.landingPage
          .deleteSearch()
          .then((res) => {
            this.landingPage.searches = this.landingPage.searches.filter(
              (item) => item.id != this.landingPage.actionId
            );
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
            this.deleteLoading = null;
            this.landingPage.actionId = "";
          })
          .catch((err) => {
            this.deleteLoading = null;
          });
      }
    },
    pagination(page = 1) {
      if (this.currentPage != page) {
        this.$router.push({
          query: {
            page,
          },
        });
        this.landingPage.loading = true;
        this.currentPage = page;
        this.getLatest();
      }
    },
    getLocation(data) {
      const locSlugList = [
        "country",
        "direction",
        "province",
        "township",
        "district",
        "city",
        "rural_district",
        "downtown",
        "suburbs",
        "municipal_zoning",
        "highway",
        "village",
        "neighbourhood",
        "avenue",
        "alley",
        "suburb",
        "complex",
      ];
      const join = (arr) =>
        arr.map((item) => item.replaceAll("-", " ")).join(",");
      let result = [];
      locSlugList.forEach((item) => {
        if (
          data[item] != undefined &&
          data[item] != null &&
          data[item].length
        ) {
          result.push(join(data[item]));
        }
      });

      return result.join(",");
    },
    copy(data) {
      navigator.clipboard.writeText(data).then(() => {
        this.$toast("لینک با موفقیت کپی شد.", "success", 5000);
      });
    },
    openCandidates() {
      this.candidatesModal = true;
      this.landingPage.getCandidates().catch(() => {
        this.$toast("دریافت کاندیدها با خطا مواجه شد!", "error", 2000);
      });
    },
    openFormula() {
      this.formulaModal = true;
      this.landingPage.getFormula().catch(() => {
        this.$toast("دریافت فرمولها با خطا مواجه شد!", "error", 2000);
      });
    },
    // پیشپر کردن فرم ساخت صفحه فرود با ترکیب کاندید (لینک + نوع تایپ)
    generateSingle(candidate) {
      this.generateLoading = candidate.path;
      this.landingPage.prefill = { ...candidate };
      this.candidatesModal = false;
      this.generateLoading = "";
      this.$router.push("/landing-page/new");
    },
    // ایجاد دستهجمعی همه کاندیدها با فرمول پیشفرض
    generateAll() {
      if (this.bulkLoading) return;
      this.bulkLoading = true;
      this.landingPage
        .bulkGenerate()
        .then((res) => {
          if (res.status == "success") {
            this.$toast(
              `${res.data.created} صفحه فرود ساخته شد، ${res.data.skipped} مورد از قبل وجود داشت.`,
              "success",
              4000
            );
            this.candidatesModal = false;
            this.getLatest();
          }
          this.bulkLoading = false;
        })
        .catch(() => {
          this.bulkLoading = false;
          this.$toast("ایجاد دستهجمعی با خطا مواجه شد!", "error", 2500);
        });
    },
    saveFormula() {
      this.landingPage
        .updateFormula({ ...this.landingPage.formula })
        .then((res) => {
          if (res.status == "success") {
            this.$toast("فرمولها ذخیره شد!", "success", 2000);
            this.formulaModal = false;
          }
        })
        .catch(() => {
          this.$toast("ذخیره فرمولها با خطا مواجه شد!", "error", 2500);
        });
    },
    contentSummary(item) {
      const intro = (item.intro || []).length;
      const faqs = (item.faqs || []).length;
      return `${intro} پاراگراف · ${faqs} پرسش`;
    },
  },
};
</script>
<template>
  <div>
    <section class="properties__list">
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">لیست صفحه فرود</h4>
          <div class="heading__actions">
            <button
              class="btn btn-primary"
              @click="openCandidates"
              :disabled="landingPage.candidatesLoading"
            >
              <i class="fa-regular fa-lightbulb"></i>
              کاندیدها
            </button>
            <button class="btn btn-primary" @click="openFormula">
              <i class="fa-regular fa-sliders"></i>
              فرمولها
            </button>
            <nuxt-link to="/landing-page/new" class="btn btn-primary">
              <i class="fa-regular fa-plus"></i>
              جستجوی جدید
            </nuxt-link>
          </div>
        </div>
        <div class="card__body table">
          <div v-if="!landingPage.loading">
            <div v-if="landingPage.searches.length > 0">
              <table>
                <thead>
                  <tr>
                    <th>عنوان</th>
                    <th>مسیر</th>
                    <th>نوع تایپ</th>
                    <th>لوکیشن</th>
                    <th>تعداد ملک</th>
                    <th>محتوا</th>
                    <th>منبع</th>
                    <th>ایندکس</th>
                    <th>وضعیت</th>
                    <th style="text-align: left">تنظیمات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in landingPage.searches"
                    :key="index"
                  >
                    <td>
                      <template v-if="item.title">
                        {{ item.title }}
                      </template>
                      <template v-else> - </template>
                    </td>
                    <td class="c_ellipsis">
                      <div class="flex items-center gap-1">
                        <span
                          v-if="item.path"
                          class="font-mono text-xs"
                          dir="ltr"
                          :title="item.path"
                        >
                          {{ item.path }}
                        </span>
                        <template v-else> - </template>
                        <button
                          v-if="item.path"
                          class="text-cyan-500"
                          title="کپی مسیر"
                          @click="copy(item.path)"
                        >
                          <i class="fa-regular fa-copy"></i>
                        </button>
                      </div>
                    </td>
                    <td>
                      <template
                        v-if="item.query.type && item.query.type.length > 0"
                      >
                        {{ item.query.type.join(",") }}
                      </template>
                      <template v-else> - </template>
                    </td>
                    <td class="c_ellipsis">
                      <template
                        v-if="item.query && getLocation(item.query).length > 0"
                      >
                        {{ getLocation(item.query) }}
                      </template>
                      <template v-else> - </template>
                    </td>
                    <!-- <td>
                      <template
                        v-if="
                          item.query.category && item.query.category.length > 0
                        "
                      >
                        {{ item.query.category.join(",") }}
                      </template>
                      <template v-else> - </template>
                    </td> -->
                    <td>
                      <template v-if="item.property_count">
                        {{ item.property_count }}
                      </template>
                      <template v-else> - </template>
                    </td>
                    <td class="whitespace-nowrap text-xs">
                      {{ contentSummary(item) }}
                    </td>
                    <td>
                      <span
                        v-if="item.source == 'manual'"
                        class="badge badge-pill badge-success"
                      >
                        دستی
                      </span>
                      <span v-else class="badge badge-pill badge-primary">
                        خودکار
                      </span>
                    </td>
                    <td>
                      <span
                        v-if="item.is_indexable"
                        class="badge badge-pill badge-success"
                      >
                        ایندکسشده
                      </span>
                      <span v-else class="badge badge-pill badge-warning">
                        بدون ایندکس
                      </span>
                    </td>
                    <td>
                      <div class="flex gap-1">
                        <span
                          v-if="item.status == 'active'"
                          class="badge badge-pill badge-success"
                        >
                          فعال
                        </span>
                        <span v-else class="badge badge-pill badge-primary">
                          غیر فعال
                        </span>
                      </div>
                    </td>
                    <td class="setting">
                      <div class="actions justify-end">
                        <button
                          class="text-cyan-500"
                          @click="copy(item.query_url)"
                        >
                          <i class="fa-regular fa-copy"></i>
                        </button>
                        <nuxt-link
                          :to="`/landing-page/edit/${item.id}`"
                          class="edit__action"
                        >
                          <i class="fa-regular fa-pen-to-square"></i>
                        </nuxt-link>
                        <button
                          class="delete__action"
                          @click="deleteSearchConfirm(item.id)"
                          :disabled="deleteLoading == item.id"
                        >
                          <template v-if="deleteLoading == item.id">
                            <i
                              class="fa-solid fa-spinner text-xl animate-spin"
                            ></i>
                          </template>
                          <template v-else>
                            <i class="fa-regular fa-trash"></i
                          ></template>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <AdminPagination
                v-if="
                  landingPage.pagination && landingPage.pagination.last_page > 1
                "
                @onChange="pagination"
                :currentPage="currentPage"
                :lastPage="landingPage.pagination.last_page"
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

    <!-- مودال کاندیدهای صفحه فرود -->
    <transition name="fade">
      <div v-if="candidatesModal" class="fp_popup_overlay">
        <div class="popup_base popup_wide">
          <div class="popup_heading">
            <h5 class="font-bold mb-1">کاندیدهای صفحه فرود</h5>
            <p class="text-xs opacity-70">
              ترکیبهای «نوع + مکان» با بیشترین تعداد ملک — مسیر بر اساس URL
              استاندارد سایت ساخته میشود.
            </p>
          </div>
          <div class="popup_body popup_body_block">
            <div v-if="!landingPage.candidatesLoading" class="table">
              <div v-if="landingPage.candidates.length > 0">
                <table>
                  <thead>
                    <tr>
                      <th>نوع</th>
                      <th>مکان</th>
                      <th>تعداد ملک</th>
                      <th>مسیر</th>
                      <th style="text-align: left">تنظیمات</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(candidate, index) in landingPage.candidates"
                      :key="index"
                    >
                      <td>
                        <template v-if="candidate.type_title">
                          {{ candidate.type_title }}
                        </template>
                        <template v-else> - </template>
                      </td>
                      <td class="c_ellipsis">
                        <template v-if="candidate.city_title">
                          {{ candidate.city_title }}
                        </template>
                        <template v-else> - </template>
                      </td>
                      <td>{{ candidate.property_count }}</td>
                      <td class="c_ellipsis">
                        <span
                          class="font-mono text-xs"
                          dir="ltr"
                          :title="candidate.path"
                        >
                          {{ candidate.path }}
                        </span>
                      </td>
                      <td class="setting">
                        <div class="actions justify-end">
                          <button
                            class="btn btn-primary py-1 px-3 text-sm"
                            :disabled="generateLoading == candidate.path"
                            @click="generateSingle(candidate)"
                          >
                            <template v-if="generateLoading == candidate.path">
                              <i
                                class="fa-solid fa-spinner text-white text-xl animate-spin"
                              ></i>
                            </template>
                            <template v-else> ایجاد </template>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="empty__list">
                <p>کاندیدی برای ایجاد وجود ندارد</p>
              </div>
            </div>
            <div v-else class="empty__list">
              <p>درحال بارگذاری اطلاعات...</p>
            </div>
          </div>
          <div class="popup_footer">
            <button
              class="btn btn-success ml-2"
              :disabled="bulkLoading || landingPage.candidates.length == 0"
              @click="generateAll"
            >
              <template v-if="bulkLoading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else>
                ایجاد همه ({{ landingPage.candidates.length }})
              </template>
            </button>
            <button class="btn btn-elevated" @click="candidatesModal = false">
              بستن
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- مودال فرمولهای صفحه فرود -->
    <transition name="fade">
      <div v-if="formulaModal" class="fp_popup_overlay">
        <div class="popup_base">
          <div class="popup_heading">
            <h5 class="font-bold">فرمولهای صفحه فرود</h5>
          </div>
          <div class="popup_body popup_body_block">
            <div
              class="bg-blue-50 border-t-4 border-blue-500 rounded-b text-blue-900 px-4 py-3 shadow-md mb-4 text-sm"
              role="alert"
            >
              <p class="font-semibold mb-1">راهنما:</p>
              <p class="mb-1">
                متغیرهای مجاز:
                <span class="font-mono" dir="ltr"
                  >{type} {place} {city} {count} {brand}</span
                >
              </p>
              <p>
                فقط فیلدهای خالی لندینگ با فرمول پر میشوند؛ مقادیر ثبتشده
                دستنخورده میمانند.
              </p>
            </div>
            <div class="controls mb-3">
              <label for="formula_h1">فرمول تیتر (H1)</label>
              <input
                v-model="landingPage.formula.h1"
                type="text"
                id="formula_h1"
                class="form-control"
                placeholder="مثال: خرید {type} در {city} — {count} فایل فعال"
              />
            </div>
            <div class="controls mb-3">
              <label for="formula_seo_title">فرمول عنوان سئو</label>
              <input
                v-model="landingPage.formula.seo_title"
                type="text"
                id="formula_seo_title"
                class="form-control"
                placeholder="مثال: خرید و اجاره {type} در {place} | {brand}"
              />
            </div>
            <div class="controls mb-3">
              <label for="formula_meta_desc">فرمول توضیحات متا</label>
              <textarea
                v-model="landingPage.formula.meta_desc"
                id="formula_meta_desc"
                class="form-control form-textarea"
                rows="3"
                maxlength="250"
                placeholder="مثال: {count} {type} فعال در {city} — مشاهده قیمت، عکس و مشخصات و تماس مستقیم با مالک"
              ></textarea>
            </div>
            <div class="controls mb-3">
              <label for="formula_intro">فرمول پاراگراف معرفی (intro)</label>
              <textarea
                v-model="landingPage.formula.intro"
                id="formula_intro"
                class="form-control form-textarea"
                rows="4"
                placeholder="مثال: در این صفحه {count} {type} در {place} برای شما گردآوری شده است..."
              ></textarea>
            </div>
          </div>
          <div class="popup_footer">
            <button
              class="btn btn-success ml-2"
              :disabled="landingPage.formulaSaving"
              @click="saveFormula"
            >
              <template v-if="landingPage.formulaSaving">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else> ذخیره </template>
            </button>
            <button class="btn btn-elevated" @click="formulaModal = false">
              انصراف
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="deleteConfirm"
        msg="آیا از انتقال این صفت به سطل زباله اطمینان دارید؟"
        @confirm="deleteSearch()"
        @closeModal="deleteConfirm = false"
      />
    </transition>
  </div>
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}

.fp_popup_overlay {
  @apply fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center z-[100];
  background-color: rgba(0, 0, 0, 0.7);

  .popup_base {
    @apply p-6 rounded-md bg-white;
    box-shadow: 0 2px 18px 1px rgb(49 53 72 / 10%);
    width: 500px;
    max-height: 85vh;
    overflow-y: auto;

    &.popup_wide {
      width: 860px;
      max-width: 92vw;
    }

    .popup_heading {
      @apply border-b pb-4 mb-4;
      border-color: rgb(227 235 243 / 0.7);
    }

    .popup_body {
      @apply flex justify-end;

      &.popup_body_block {
        @apply block;
      }
    }

    .popup_footer {
      @apply flex justify-end pt-4;
    }
  }
}

.controls label {
  @apply text-sm text-[#2B335E] mb-2 block;
}
</style>
