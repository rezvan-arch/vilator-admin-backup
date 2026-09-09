<script>
import { bannerStore } from "~/store/admin/banner/index";

// لیست بنرهای «کارت بومی» صفحات فرود — بین کارت آگهیها رندر میشوند
export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | بنر صفحات فرود",
    });
    const store = bannerStore();

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
          }
          this.store.loading = false;
        })
        .catch(() => {
          this.store.loading = false;
        });
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
            this.$toast("بنر حذف شد!", "success", 2000);
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
  <section class="banner__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">بنرهای صفحات فرود (کارت بین آگهیها)</h4>
        <nuxt-link to="/banner/form/new" class="btn btn-primary">
          <i class="fa-regular fa-plus"></i>
          بنر جدید
        </nuxt-link>
      </div>
      <div class="card__body table">
        <div v-if="!store.loading">
          <div v-if="store.data.length > 0">
            <table>
              <thead>
                <tr>
                  <th>جایگاه (placement)</th>
                  <th>تیتر</th>
                  <th>دکمه</th>
                  <th>ترتیب</th>
                  <th>وضعیت</th>
                  <th style="text-align: left">نمایش</th>
                  <th style="text-align: left">کلیک</th>
                  <th style="text-align: left">CTR</th>
                  <th style="text-align: left">تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in store.data" :key="index">
                  <td class="font-mono text-xs" dir="ltr">{{ item.placement }}</td>
                  <td>{{ item.title }}</td>
                  <td>
                    {{ item.button_text }}
                    <span v-if="item.button_link" class="font-mono text-xs opacity-60" dir="ltr">
                      ({{ item.button_link }})
                    </span>
                  </td>
                  <td>{{ item.sort_order }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="item.is_active ? 'badge-success' : 'badge-secondary'"
                    >
                      {{ item.is_active ? "فعال" : "غیرفعال" }}
                    </span>
                  </td>
                  <td class="text-sm">
                    {{ item.impressions || 0 }}
                  </td>
                  <td class="text-sm">
                    {{ item.clicks || 0 }}
                  </td>
                  <td class="text-sm">
                    {{ item.ctr != null ? `${item.ctr}٪` : "—" }}
                  </td>
                  <td class="setting">
                    <div class="actions justify-end">
                      <nuxt-link
                        :to="`/banner/form/${item.id}`"
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
      msg="آیا از حذف این بنر اطمینان دارید؟ (کارت در صفحات فرود نمایش داده نمیشود)"
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

.badge {
  @apply px-3 py-1 rounded-full text-xs;

  &.badge-success {
    @apply bg-green-100 text-green-700;
  }

  &.badge-secondary {
    @apply bg-gray-100 text-gray-500;
  }
}
</style>
