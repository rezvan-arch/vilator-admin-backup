<script>
import { propertyPriceStore } from "~/store/admin/price-history/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | تاریخچه قیمت ",
    });
    const store = propertyPriceStore();

    store.loading = true;
    store.actionId = "";
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
      await this.store
        .getAll(this.currentPage)
        .then((res) => {
          if (res.status == "success") {
            this.store.data = res.data;
            this.store.meta = res.meta;
            if (this.store.meta.last_page < this.currentPage) {
              this.$router.push({
                query: {
                  page: undefined,
                },
              });
              this.currentPage = 1;
              this.store.getAll(this.currentPage).then((resTwo) => {
                if (resTwo.status == "success") {
                  this.store.data = resTwo.data;
                  this.store.meta = resTwo.meta;
                  this.store.loading = false;
                }
              });
            } else {
              this.store.loading = false;
            }
          } else {
            this.store.loading = false;
          }
        })
        .catch((err) => {
          this.store.loading = false;
        });
    },
    deleteConfirm(id) {
      this.deleteID = id;
      this.deleteConfirmDialog = true;
    },
    deletePriceHistory() {
      if (this.deleteID != "") {
        this.deleteConfirmDialog = false;
        this.store.deleteSingle(this.deleteID).then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
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
  },
};
</script>
<template>
  <section class="chart__price__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست تاریخچه قیمت</h4>
      </div>
      <div class="card__body table">
        <div v-if="!store.loading">
          <div v-if="store.data.length > 0">
            <table>
              <thead>
                <tr>
                  <th>نام ملک</th>
                  <th>کد ملک</th>
                  <th>قیمت ملک</th>
                  <th style="text-align: left">تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in store.data" :key="index">
                  <td>
                    <nuxt-link
                      :to="`/property/${item.property.slug}`"
                      v-if="item.property"
                    >
                      {{ item.property.title }}
                    </nuxt-link>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <div v-if="item.property">
                      {{ item.property.property_code }}
                    </div>
                    <div v-else>-</div>
                  </td>
                  <td>
                    <div v-if="item.property && item.property.price">
                      {{ separateNumber(item.property.price) }}
                    </div>
                    <div v-else>-</div>
                  </td>
                  <td class="setting">
                    <div class="actions justify-end">
                      <nuxt-link
                        :to="`/price-history/${item.id}`"
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
  </section>

  <transition name="fade">
    <AdminModalsConfirmModal
      v-if="deleteConfirmDialog"
      msg="آیا از حذف این تاریخچه اطمینان دارید؟"
      @confirm="deletePriceHistory()"
      @closeModal="deleteConfirmDialog = false"
    />
  </transition>
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}
</style>
