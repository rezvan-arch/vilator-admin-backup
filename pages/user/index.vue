<script>
import { useUserStore } from "~/store/admin/user/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | کاربران",
    });
    const userStore = useUserStore();
    userStore.loading = true;
    userStore.actionUserId = "";
    userStore.pagination = [];
    return {
      userStore,
    };
  },
  data() {
    return {
      currentPage: 1,
      trashConfirm: false,
    };
  },
  created() {
    if (this.$route.query.page && !isNaN(this.$route.query.page)) {
      this.currentPage = Number(this.$route.query.page);
    }
    this.userStore.getUser(this.currentPage);
  },
  methods: {
    trashUserConfirm(userId) {
      this.userStore.actionUserId = userId;
      this.trashConfirm = true;
    },
    trashUser() {
      if (this.userStore.actionUserId != "") {
        this.$toast("منتظر بمانید...", "info", 2000);
        this.trashConfirm = false;
        this.userStore.TrashUser().then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          } else {
            this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
          }
          this.userStore.actionUserId = "";
          this.userStore.users = [];
          this.userStore.loading = true;
          this.userStore.getUser(this.currentPage);
        });
      }
    },
    pagination(page = 1) {
      if (this.currentPage != page) {
        this.$router.push({ query: { page } });
        this.userStore.loading = true;
        this.currentPage = page;
        this.userStore.getUser(page);
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
          <h4 class="heading__title">لیست کاربران</h4>
          <div class="heading__actions">
            <nuxt-link to="/user/new" class="btn btn-primary">
              <i class="fa-regular fa-plus"></i>
              کاربر جدید
            </nuxt-link>
            <nuxt-link to="/user/trash" class="btn btn-danger">
              <i class="fa-regular fa-trash"></i>
              سطل زباله
            </nuxt-link>
          </div>
        </div>
        <div class="card__body table">
          <div v-if="!userStore.loading">
            <div v-if="userStore.users.length > 0">
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
                  <tr v-for="(item, index) in userStore.users" :key="index">
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
                        v-if="item.email && item.email != 'null'"
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
                        <nuxt-link
                          :to="`/user/${item.id}/edit`"
                          class="edit__action"
                        >
                          <i class="fa-regular fa-pen-to-square"></i>
                        </nuxt-link>
                        <nuxt-link :to="`/user/${item.id}`" class="see__action">
                          <i class="fa-regular fa-eye"></i>
                        </nuxt-link>
                        <button
                          class="delete__action"
                          @click="trashUserConfirm(item.id)"
                        >
                          <i class="fa-regular fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <AdminPagination
                v-if="
                  userStore.pagination && userStore.pagination.last_page > 1
                "
                @onChange="pagination"
                :currentPage="currentPage"
                :lastPage="userStore.pagination.last_page"
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
        v-if="trashConfirm"
        msg="آیا از انتقال حساب این کاربر به سطل زباله اطمینان دارید؟"
        @confirm="trashUser"
        @closeModal="trashConfirm = false"
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
