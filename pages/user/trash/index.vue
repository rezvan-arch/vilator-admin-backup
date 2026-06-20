<script>
import { useUserStore } from "~/store/admin/user/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    const store = useUserStore();

    store.actionUserId = "";
    store.loading = true;
    store.users = [];
    useHead({
      title: "پنل مدیریت | کاربران",
    });

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

    this.store.getUserTrashList(this.currentPage);
  },
  methods: {
    deleteUserConfirm(userId) {
      this.store.actionUserId = userId;
      this.deleteConfirm = true;
    },
    restoreUserConfirm(userId) {
      this.store.actionUserId = userId;
      this.RestoreConfirm = true;
    },
    deleteUser() {
      if (this.store.actionUserId != "") {
        this.deleteConfirm = false;
        this.store.DeleteUser().then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          } else {
            this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
          }
          this.store.actionUserId = "";
          this.store.users = [];
          this.store.loading = true;
          this.store.getUserTrashList(this.currentPage);
        });
      }
    },
    restoreUser() {
      if (this.store.actionUserId != "") {
        this.RestoreConfirm = false;
        this.store.RestoreUser().then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          } else {
            this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
          }
          this.store.actionUserId = "";
          this.store.users = [];
          this.store.loading = true;
          this.store.getUserTrashList(this.currentPage);
        });
      }
    },
    pagination(page = 1) {
      if (this.currentPage != page) {
        this.$router.push({ query: { page } });
        this.store.loading = true;
        this.currentPage = page;
        this.store.getUserTrashList(page);
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
          <h4 class="heading__title">سطل زباله</h4>
          <div class="heading__actions">
            <nuxt-link to="/user/new" class="btn btn-primary">
              <i class="fa-regular fa-plus"></i>
              کاربر جدید
            </nuxt-link>
            <nuxt-link to="/user" class="btn btn-primary">
              <i class="fa-regular fa-list"></i>
              لیست کاربران
            </nuxt-link>
          </div>
        </div>
        <div class="card__body table">
          <div v-if="!store.loading">
            <div v-if="store.users.length > 0">
              <table>
                <thead>
                  <tr>
                    <th>نام و نام خانوادگی</th>
                    <th style="text-align: center">شماره موبایل</th>
                    <th style="text-align: center">ایمیل</th>
                    <th>ادمین</th>
                    <th style="text-align: left">تنظیمات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in store.users" :key="index">
                    <td>
                      <span v-if="item.name">{{ item.name }}</span>
                      <span v-else>-</span>
                    </td>
                    <td>
                      <div
                        v-if="item.mobile"
                        :class="{
                          verify: item.mobile_verified_at != null,
                          n_verify: item.mobile_verified_at == null,
                        }"
                      >
                        {{ item.mobile }}
                      </div>
                      <div style="text-align: center" v-else>-</div>
                    </td>
                    <td>
                      <div
                        v-if="item.email"
                        :class="{
                          verify: item.email_verified_at != null,
                          n_verify: item.email_verified_at == null,
                        }"
                      >
                        {{ item.email }}
                      </div>
                      <div style="text-align: center" v-else>-</div>
                    </td>
                    <td>
                      <div class="flex gap-1">
                        <span
                          v-if="item.is_admin"
                          class="badge badge-pill badge-success"
                        >
                          ادمین
                        </span>
                        <span
                          v-if="item.is_staff"
                          class="badge badge-pill badge-primary"
                        >
                          کارمند
                        </span>
                      </div>
                    </td>
                    <td class="setting">
                      <div class="actions justify-end">
                        <button
                          class="edit__action"
                          title="بازیابی کاربر"
                          @click="restoreUserConfirm(item.id)"
                        >
                          <i class="fa-solid fa-trash-arrow-up"></i>
                        </button>
                        <button
                          class="delete__action"
                          title="حذف کاربر"
                          @click="deleteUserConfirm(item.id)"
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
    <div class="fp_popup_overlay" v-if="deleteConfirm">
      <div class="popup_base">
        <div class="popup_heading">
          آیا از حذف همیشگی این کاربر اطمینان دارید؟
        </div>
        <div class="popup_body">
          <button class="btn btn-danger ml-2" @click="deleteUser()">بله</button>
          <button class="btn btn-elevated" @click="deleteConfirm = false">
            انصراف
          </button>
        </div>
      </div>
    </div>
    <div class="fp_popup_overlay" v-if="RestoreConfirm">
      <div class="popup_base">
        <div class="popup_heading">
          آیا از بازگردانی این کاربر اطمینان دارید؟
        </div>
        <div class="popup_body">
          <button class="btn btn-danger ml-2" @click="restoreUser()">
            بله
          </button>
          <button class="btn btn-elevated" @click="RestoreConfirm = false">
            انصراف
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.verified__number,
.verified__mail {
  @apply text-base text-[#28D094] mr-1 inline-block;
}
</style>
