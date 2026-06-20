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
                    <th>نوع تایپ</th>
                    <th>لوکیشن</th>
                    <th>تعداد ملک</th>
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
</style>
