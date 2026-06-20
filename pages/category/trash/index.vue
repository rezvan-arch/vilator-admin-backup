<script>
import { categoryStore } from "~/store/admin/category/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | صفت ها ",
    });
    const store = categoryStore();

    store.actionId = "";
    store.categories = [];
    store.loading = true;
    store.pagination = [];

    return {
      store,
    };
  },
  data() {
    return {
      currentPage: 1,
      deleteConfirm: false,
      RestoreConfirm: false,
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
      await this.store.getTrashedCategories(this.currentPage).then(() => {
        if (this.store.pagination.last_page < this.currentPage) {
          this.$router.push({
            query: {
              page: undefined,
            },
          });
          this.currentPage = 1;
          this.store.getTrashedCategories(this.currentPage);
        }
      });
    },
    deleteCategoryConfirm(userId) {
      this.store.actionId = userId;
      this.deleteConfirm = true;
    },
    restoreCategoryConfirm(userId) {
      this.store.actionId = userId;
      this.RestoreConfirm = true;
    },
    RestoreCategory() {
      if (this.store.actionId != "") {
        this.RestoreConfirm = false;
        this.store
          .restoreCategory()
          .then((res) => {
            this.store.actionId = "";
            this.store.loading = true;
            this.getLatest();
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          })
          .catch((err) => {
            this.getLatest();
          });
      }
    },
    DeleteCategory() {
      if (this.store.actionId != "") {
        this.deleteConfirm = false;
        this.store
          .deleteCategory()
          .then((res) => {
            this.store.actionId = "";
            this.store.loading = true;
            this.getLatest();
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          })
          .catch((err) => {
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
  <div>
    <section class="properties__list">
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">لیست سطل زباله صفت ها</h4>
          <div class="heading__actions">
            <nuxt-link to="/category/new" class="btn btn-primary">
              <i class="fa-regular fa-plus"></i>
              صفت جدید
            </nuxt-link>
            <nuxt-link to="/category" class="btn btn-primary">
              <i class="fa-regular fa-list"></i>
              لیست
            </nuxt-link>
          </div>
        </div>
        <div class="card__body table">
          <div v-if="!store.loading">
            <div v-if="store.categories.length > 0">
              <table>
                <thead>
                  <tr>
                    <th>عنوان</th>
                    <th>اسلاگ</th>
                    <th>نوع تایپ</th>
                    <th>وضعیت</th>
                    <th style="text-align: left">تنظیمات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in store.categories" :key="index">
                    <td>{{ item.title }}</td>
                    <td>
                      {{ item.slug }}
                    </td>
                    <td>
                      <div v-if="item.type">{{ item.type.title }}</div>
                      <span v-else>-</span>
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
                          class="edit__action"
                          title="بازیابی کاربر"
                          @click="restoreCategoryConfirm(item.id)"
                        >
                          <i class="fa-solid fa-trash-arrow-up"></i>
                        </button>
                        <button
                          class="delete__action"
                          @click="deleteCategoryConfirm(item.id)"
                        >
                          <i class="fa-regular fa-trash"></i>
                        </button>
                      </div>
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

    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="deleteConfirm"
        msg="آیا از حذف همیشگی این صفت اطمینان دارید؟"
        @confirm="DeleteCategory()"
        @closeModal="deleteConfirm = false"
      />
    </transition>

    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="RestoreConfirm"
        msg="آیا از بازگردانی این صفت اطمینان دارید؟"
        @confirm="RestoreCategory()"
        @closeModal="RestoreConfirm = false"
      />
    </transition>
  </div>
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}
</style>
