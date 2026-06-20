<script>
import { useUserStore } from "~/store/admin/user/index";
export default {
  setup() {
    definePageMeta({ layout: "admin" });
    const store = useUserStore();
    const route = useRoute();
    store.loading = true;
    store.error = [];
    store.getSingleUser(route.params.id);
    useHead({
      title: "پنل مدیریت | اطلاعات کاربر",
    });

    return {
      store,
    };
  },
  data() {
    return {
      userTypeOptions: [
        { label: "صاحب خانه", value: "owner_house" },
        { label: "مشتری", value: "customer" },
        { label: "مشاور", value: "consultant" },
      ],
      trashConfirm: false,
      trashLoading: false,
    };
  },
  methods: {
    removeAvatar() {
      if (this.store.users.id) {
        this.store
          .removeAvatar(this.store.users.id)
          .then((avatarRes) => {
            if (avatarRes.status == "success") {
              this.store.users.avatar = null;
              this.$toast(avatarRes.message, "success", 1500);
            }
            this.store.userRemoveAvatarLoading = false;
          })
          .catch((err) => {});
      }
    },
    trashUser() {
      this.trashConfirm = false;
      this.store.actionUserId = this.store.users.id;
      this.trashLoading = true;
      this.store
        .TrashUser()
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
            this.$router.push(`/user`);
          } else {
            this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
          }
          this.store.loading = true;
          this.trashLoading = false;
          this.store.actionUserId = "";
        })
        .catch((err) => {
          this.trashLoading = false;
        });
    },
  },
};
</script>

<template>
  <section class="projects__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title" v-if="!store.loading">
          نمایش کاربر: {{ store.users.name }}
        </h4>
        <h4 class="heading__title" v-else>درحال دریافت اطلاعات...</h4>

        <div class="heading__actions" v-if="!store.loading">
          <nuxt-link to="/user/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            کاربر جدید
          </nuxt-link>
          <button
            :disabled="trashLoading"
            @click="trashConfirm = true"
            class="btn btn-danger"
          >
            <template v-if="trashLoading">
              <i
                class="fa-solid fa-spinner text-white text-xl animate-spin"
              ></i>
            </template>
            <template v-else>
              <i class="fa-regular fa-trash"></i> حذف کاربر
            </template>
          </button>
          <nuxt-link to="/user" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست کاربران
          </nuxt-link>
        </div>
      </div>
      <div class="card__body" v-if="!store.loading">
        <div
          v-if="typeof store.error !== 'undefined' && store.error.length === 0"
        >
          <div class="row">
            <div class="controls w-1/3">
              <label for="name">نام و نام خانوادگی</label>
              <div class="tincolor">{{ store.users.name }}</div>
            </div>
            <div class="controls w-1/3">
              <label for="email">شماره همراه</label>
              <span
                v-if="store.users.mobile"
                :class="{ 'text-red-500': !store.users.mobile_verified_at }"
                >{{ store.users.mobile }}</span
              >
              <span v-else>-</span>
            </div>
            <div class="controls w-1/3">
              <label for="email">نوع کاربر</label>
              <div
                v-if="store.users.type && store.users.type.length"
                class="flex gap-1"
              >
                <div v-for="userType in userTypeOptions" :key="userType.value">
                  <span
                    class="badge badge-pill badge-success"
                    v-if="
                      store.users.type.find((type) => type == userType.value)
                    "
                    >{{ userType.label }}</span
                  >
                </div>
              </div>
              <span v-else>-</span>
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/3">
              <label for="email">ایمیل</label>
              <span
                v-if="store.users.email"
                :class="{ 'text-red-500': !store.users.email_verified_at }"
                >{{ store.users.email }}</span
              >
              <span v-else>-</span>
            </div>
            <div class="controls w-1/3">
              <label for="email">نقش کاربر</label>
              <nuxt-link
                v-if="store.users.roles.length"
                :to="`/role/${store.users.roles[0].id}`"
                >{{ store.users.roles[0].name }}</nuxt-link
              >
              <span v-else>-</span>
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <label for="email">ادمین</label>
              <div class="flex gap-1">
                <span
                  v-if="store.users.is_admin"
                  class="badge badge-pill badge-success"
                  >ادمین</span
                >
                <span
                  v-if="store.users.is_staff"
                  class="badge badge-pill badge-primary"
                  >کارمند</span
                >
                <div v-if="!store.users.is_admin && !store.users.is_staff">
                  -
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/5">
              <label for="name">آواتار</label>
              <div class="thumbnail relative">
                <div
                  class="delete"
                  @click="removeAvatar()"
                  v-if="store.users.avatar != null"
                >
                  <i class="fa-regular fa-circle-xmark"></i>
                </div>
                <img  
                  v-if="store.users.avatar != null"
                  :src="store.users.avatar.get_url"
                  alt="" loading="lazy" format="webp"
                />
                <img  
                  v-if="store.users.avatar == null"
                  src="/images/no-photo-available.png"
                  alt="" loading="lazy" format="webp"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          {{ store.error.message }}
        </div>
      </div>
      <div class="card__body" v-else>
        <div>درحال بارگذاری...</div>
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
</template>
<style lang="scss" scoped>
.controls label {
  @apply text-sm text-[#2B335E] mb-2 block;
}

select {
  @apply bg-white w-full rounded-[4px];
}

// .controls input[type="checkbox"] {
//   @apply w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus: ring-blue-500 focus:ring-2 focus:ring-offset-1;
// }

.checkbox_label {
  margin-bottom: 0 !important;
  @apply inline-block mr-2 text-sm font-medium text-gray-900;
}

.check_control {
  @apply flex items-center pt-6;
}

.thumbnail {
  @apply block rounded-md bg-[#f7f7f7] border border-[#cacfe7] p-[20px];

  img {
    @apply w-[200px] h-[140px] object-cover;
  }
}
.delete {
  @apply text-red-500 bg-white absolute -top-2 -left-2 cursor-pointer h-5 w-5 flex items-center justify-center rounded-full border-black;

  i {
    @apply text-base;
  }
}
</style>
