<script>
import { userRoleStore } from "~/store/admin/user/role/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | نقش های کاربری",
    });
    const store = userRoleStore();
    return {
      store,
    };
  },
  data() {
    return {
      currentPage: 1,
      deleteConfirmDialog: false,
      actionId: null,
    };
  },
  created() {
    this.store.loading = true;

    if (this.$route.query.page && !isNaN(this.$route.query.page)) {
      this.currentPage = Number(this.$route.query.page);
    }

    this.getLatest();
  },
  methods: {
    async getLatest() {
      await this.store.getAll(this.currentPage);
    },
    deleteConfirm(id) {
      this.actionId = id;
      this.deleteConfirmDialog = true;
    },
    doDeleteRole() {
      if (this.actionId != null) {
        this.deleteConfirmDialog = false;
        this.store
          .deleteRole(this.actionId)
          .then((res) => {
            if (res.status == "success") {
              this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
            } else {
              this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
            }
            this.actionId = null;
            this.store.data = [];
            this.store.meta = [];
            this.getLatest();
          })
          .catch((err) => {
            this.getLatest();
          });
      }
    },
  },
};
</script>
<template>
  <div>
    <section class="users__list">
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">لیست نقش های کاربری</h4>
          <div class="heading__actions">
            <nuxt-link to="/role/new" class="btn btn-primary">
              <i class="fa-regular fa-plus"></i>
              نقش کاربری جدید
            </nuxt-link>
          </div>
        </div>
        <div class="card__body table">
          <div v-if="!store.loading">
            <div v-if="store.data.length > 0">
              <table>
                <thead>
                  <tr>
                    <th>عنوان</th>
                    <th>تنظیمات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in store.data" :key="index">
                    <td>
                      <span v-if="item.name">{{ item.name }}</span>
                      <span v-else>-</span>
                    </td>
                    <td class="setting">
                      <div class="actions flex justify-end">
                        <nuxt-link
                          :to="`/role/${item.id}/edit`"
                          class="edit__action"
                        >
                          <i class="fa-regular fa-pen-to-square"></i>
                        </nuxt-link>
                        <nuxt-link
                          :to="`/role/${item.id}/permissions`"
                          class="edit__action"
                        >
                          <i class="fa-regular fa-gear"></i>
                        </nuxt-link>
                        <nuxt-link
                          :to="`/role/${item.id}`"
                          class="see__action"
                        >
                          <i class="fa-regular fa-eye"></i>
                        </nuxt-link>
                        <button
                          class="delete__action"
                          title="حذف نقش"
                          @click="deleteConfirm(item.id)"
                        >
                          <i class="fa-regular fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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
        msg="آیا از حذف همیشگی این نقش کاربری اطمینان دارید؟"
        @confirm="doDeleteRole"
        @closeModal="deleteConfirmDialog = false"
      />
    </transition>
  </div>
</template>
<style lang="scss" scoped>
.verified__number,
.verified__mail {
  @apply text-base text-[#28D094] mr-1 inline-block;
}
</style>
