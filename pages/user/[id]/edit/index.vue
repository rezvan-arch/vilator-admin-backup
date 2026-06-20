<script>
import { useUserStore } from "~/store/admin/user/index";
import { userRoleStore } from "~/store/admin/user/role/index";
import useStore from "~~/mixins/store";

export default {
  async setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ویرایش کاربر",
    });
    const { adminStore } = useStore();
    const store = useUserStore();
    const roleStore = userRoleStore();
    const route = useRoute();

    const verified = reactive({
      mobile: false,
      email: false,
    });

    store.loading = true;

    store.users = [];
    if (route.params.id != "") {
      await store.getSingleUser(route.params.id).then((res) => {
        if (store.users.is_staff == "1") {
          store.users.is_staff = true;
        }
        if (store.users.is_admin == "1") {
          store.users.is_admin = true;
        }
        if (store.users.roles.length) {
          let roleName = store.users.roles[0].name;
          store.users.roles = roleName;
        }

        if (store.users.mobile_verified_at) {
          verified.mobile = true;
        }
        if (store.users.email_verified_at) {
          verified.email = true;
        }
      });
    }

    roleStore.getAll(1);

    return {
      store,
      roleStore,
      verified,
      adminStore,
    };
  },
  data() {
    return {
      password: "",
      userTypeOptions: [
        { label: "صاحب خانه", value: "owner_house" },
        { label: "مشتری", value: "customer" },
        { label: "مشاور", value: "consultant" },
      ],
      avatar: "",
      previewAvatar: null,
      trashConfirm: false,
      trashLoading: false,
      loading: false,
    };
  },
  methods: {
    async updateUser() {
      if (this.store.users.name == "") {
        this.$toast("نام کاربری الزامی است!", "error", 2000);
        return;
      }

      if (this.store.users.mobile == "" && this.store.users.email == "") {
        this.$toast("ایمیل یا شماره همراه الزامی می باشد!", "error", 2000);
        return;
      }

      this.loading = true;
      let body = {
        name: this.store.users.name,
        email: this.store.users.email,
        mobile: this.store.users.mobile,
        type: this.store.users.type,
        role:
          !this.store.users.is_admin && this.store.users.is_staff
            ? this.store.users.roles
            : "",
        mobile_verified_at: this.store.users.mobile ? this.verified.mobile : 0,
        email_verified_at: this.store.users.email ? this.verified.email : 0,
        is_staff: this.store.users.is_staff,
        is_admin: this.store.users.is_admin,
        password: this.password,
      };

      this.store
        .editUser(body, this.store.users.id)
        .then((res) => {
          if (res.status == "success") {
            if (this.avatar != "") {
              this.store.userChangeAvatarLoading = true;
              var avatar = new FormData();
              avatar.append("avatar", this.avatar);
              this.store
                .addAvatar(this.store.users.id, avatar)
                .then((avatarRes) => {
                  if (avatarRes.status == "success") {
                    this.clearAvatar();
                    this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
                    this.store.getSingleUser(this.$route.params.id);
                    this.loading = false;
                  }
                  this.store.userChangeAvatarLoading = false;
                })
                .catch((err) => {
                  console.log("err", err);
                });
            } else {
              this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
              this.store.getSingleUser(this.$route.params.id);
              this.loading = false;
            }
          } else {
            this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
            this.loading = false;
          }
        })
        .catch((err) => {
          var keys = Object.keys(this.adminStore.errors);
          this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          this.loading = false;
        });
    },
    chooseAvatar() {
      this.avatar = this.$refs.file.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(this.avatar);
      reader.onload = (e) => {
        this.previewAvatar = e.target.result;
      };
    },
    removeAvatar() {
      this.store
        .removeAvatar(this.store.users.id)
        .then((avatarRes) => {
          if (avatarRes.status == "success") {
            this.store.users.avatar = null;
            this.previewAvatar = null;
            this.$toast(avatarRes.message, "success", 1500);
          }
          this.store.userRemoveAvatarLoading = false;
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
    clearAvatar() {
      // this.previewAvatar = null;
      this.avatar = "";
    },
    trashUser() {
      this.trashConfirm = false;
      this.store.actionUserId = this.store.users.id;
      this.trashLoading = true;
      this.store.TrashUser().then((res) => {
        if (res.status == "success") {
          this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          this.$router.push(`/user`);
        } else {
          this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
        }
        this.trashLoading = false;
        this.store.actionUserId = "";
      });
    },
  },

  watch: {
    store: {
      handler(val) {
        this.store.users.mobile = this.checkNumber(this.store.users.mobile);
      },
      deep: true,
    },
  },
};
</script>
<template>
  <section class="projects__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title" v-if="!store.loading">
          ویرایش کاربر: {{ store.users.name }}
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
            class="btn btn-danger w-[110px]"
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
        <vForm v-slot="{ errors, handleSubmit }" as="form">
          <div class="row">
            <div class="controls w-1/3">
              <FormTextInput
                name="name"
                label="نام و نام خانوادگی"
                v-model="store.users.name"
                :rules="'min:3|required'"
                :errors="errors['نام و نام خانوادگی']"
              />
              <FormInputShowError errorKey="name" />
            </div>
            <div class="controls w-1/3">
              <FormTextInput
                name="mobile"
                type="text"
                label="شماره همراه"
                v-model="store.users.mobile"
                :ltr="true"
                :rules="'numeric|min:11|max:11'"
                :errors="errors['شماره همراه']"
              />
              <FormInputShowError errorKey="mobile" />
              <!-- @input="
                (event) =>
                  (store.users.mobile = $checkNumber(event.target.value, 11))
              " -->
            </div>
            <div class="controls w-1/3">
              <label for="type">نوع کاربر</label>
              <v-select
                v-model="store.users.type"
                :reduce="(option) => option.value"
                :options="userTypeOptions"
                multiple
                :closeOnSelect="false"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="type" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/3">
              <FormTextInput
                name="email"
                type="email"
                label="ایمیل"
                v-model="store.users.email"
                :errors="errors['ایمیل']"
              />
              <FormInputShowError errorKey="email" />
            </div>
            <div class="controls w-1/3">
              <FormTextInput
                name="password"
                type="password"
                label="رمز عبور"
                v-model="password"
                :errors="errors['رمز عبور']"
              />
              <FormInputShowError errorKey="password" />
            </div>
            <div class="controls w-1/3">
              <label for="type">نقش کاربر</label>
              <v-select
                v-model="store.users.roles"
                :reduce="(option) => option.name"
                label="name"
                :options="roleStore.data"
                :disabled="
                  store.users.is_admin ||
                  (!store.users.is_admin && !store.users.is_staff)
                "
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="roles" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full check_control">
              <div class="flex flex-col gap-1">
                <div class="flex items-center ml-4">
                  <input
                    v-model="verified.mobile"
                    :disabled="!store.users.mobile"
                    id="confirm__number"
                    type="checkbox"
                    value="verify-number"
                    name="mobile_verified_at"
                  />
                  <label for="confirm__number" class="checkbox_label">
                    تایید موبایل
                  </label>
                </div>
                <div class="flex items-center ml-4">
                  <input
                    v-model="verified.email"
                    :disabled="!store.users.email"
                    id="confirm__mail"
                    type="checkbox"
                    value="verify-mail"
                    name="email_verified_at"
                  />
                  <label for="confirm__mail" class="checkbox_label">
                    تایید ایمیل
                  </label>
                </div>
                <div class="flex items-center ml-4">
                  <input
                    v-model="store.users.is_admin"
                    id="admin__user"
                    type="checkbox"
                    value="admin-user"
                    name="is_admin"
                  />
                  <label for="admin__user" class="checkbox_label">
                    مدیر کل
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    v-model="store.users.is_staff"
                    id="employee__user"
                    type="checkbox"
                    value="employee-user"
                    name="is_staff"
                  />
                  <label for="employee__user" class="checkbox_label">
                    کاربر کارمند
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="row p-4 pb-0">
            <div class="controls w-full thumbnail_box">
              <button
                type="button"
                class="btn btn-primary"
                @click="$refs.file.click()"
              >
                انتخاب آواتار
              </button>
              <input
                type="file"
                ref="file"
                class="hidden"
                accept="image/*"
                @input="chooseAvatar"
              />
              <div class="thumbnail relative">
                <div
                  class="delete"
                  @click="removeAvatar()"
                  v-if="store.users.avatar != null"
                >
                  <i class="fa-regular fa-circle-xmark"></i>
                </div>
                <div
                  class="delete"
                  @click="clearAvatar()"
                  v-else-if="previewAvatar != null && avatar != ''"
                >
                  <i class="fa-regular fa-circle-xmark"></i>
                </div>
                <img  v-if="previewAvatar != null" :src="previewAvatar" alt="" loading="lazy"  format="webp"/>
                <img  
                  v-else-if="store.users.avatar != null"
                  :src="store.users.avatar.get_url"
                  alt="" loading="lazy" format="webp"
                />
                <img  v-else src="/images/no-photo-available.png" alt="" loading="lazy" format="webp" />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <button
                :disabled="loading"
                class="btn btn-primary w-[100px]"
                @click="handleSubmit(updateUser)"
              >
                <template v-if="loading">
                  <i
                    class="fa-solid fa-spinner text-white text-xl animate-spin"
                  ></i>
                </template>
                <template v-else>ویرایش </template>
              </button>
            </div>
          </div>
        </vForm>
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

.controls input[type="checkbox"] {
  @apply w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 focus:ring-offset-1;
}

.checkbox_label {
  margin-bottom: 0 !important;
  @apply inline-block mr-2 text-sm font-medium text-gray-900;
}

.check_control {
  @apply flex items-center pt-6;
}

.thumbnail {
  img {
    @apply w-[200px] h-[140px] object-cover;
  }
}

.thumbnail_box {
  @apply flex items-center rounded-md justify-between bg-[#f7f7f7] border border-[#cacfe7] p-3;
}

.delete {
  @apply text-red-500 bg-white absolute -top-2 -left-2 cursor-pointer h-5 w-5 flex items-center justify-center rounded-full border-black;

  i {
    @apply text-base;
  }
}
</style>
