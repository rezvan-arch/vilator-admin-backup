<script>
import { useUserStore } from "~/store/admin/user/index";
import { userRoleStore } from "~/store/admin/user/role/index";
import useStore from "~~/mixins/store";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    const { adminStore } = useStore();
    const store = useUserStore();
    const roleStore = userRoleStore();

    store.loading = false;
    store.error = [];

    roleStore.getAll(1);
    useHead({
      title: "پنل مدیریت | ساخت کاربر جدید",
    });

    return {
      store,
      roleStore,
      adminStore,
    };
  },
  data() {
    return {
      form: {
        name: "",
        email: "",
        mobile: "",
        password: "",
        type: "",
        role: "",
        is_admin: false,
        is_staff: false,
        mobile_verified_at: false,
        email_verified_at: false,
      },
      userTypeOptions: [
        { label: "صاحب خانه", value: "owner_house" },
        { label: "مشتری", value: "customer" },
        { label: "مشاور", value: "consultant" },
      ],
      avatar: "",
      previewAvatar: null,
      loading: false,
    };
  },
  methods: {
    async addUser() {
      if (this.form.name == "") {
        this.$toast("نام و نام خانوادگی وارد نشده است!", "error", 2000);
        return;
      }

      if (this.form.mobile == "" && this.form.email == "") {
        this.$toast("ایمیل یا شماره همراه الزامی می باشد!", "error", 2000);
        return;
      }

      if (this.form.mobile != "") {
        let phoneNumber = this.form.mobile;

        if (phoneNumber.length != "11") {
          this.$toast("شماره همراه صحیح نمی باشد!", "error", 2000);
          return;
        }
      }
      this.loading = true;

      let checkRole =
        !this.form.is_admin && this.form.is_staff ? this.form.role : "";
      this.form.role = checkRole;

      if (!this.form.email) {
        this.form.email_verified_at = 0;
      }

      if (!this.form.mobile) {
        this.form.mobile_verified_at = 0;
      }

      await this.store
        .addUser(this.form)
        .then((res) => {
          if (res.status == "success") {
            if (this.avatar != "") {
              this.store.userChangeAvatarLoading = true;
              var avatar = new FormData();
              avatar.append("avatar", this.avatar);
              this.store
                .addAvatar(res.data._id, avatar)
                .then((avatarRes) => {
                  if (avatarRes.status == "success") {
                    this.clearAvatar();
                    // this.$toast(avatarRes.message, "success", 1500);
                  }
                  this.store.userChangeAvatarLoading = false;
                })
                .catch((err) => {
                  console.log("err", err);
                });
            }

            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
            this.$router.push("/user");
          } else {
            this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
          }
          this.loading = false;
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
    clearAvatar() {
      this.previewAvatar = null;
      this.avatar = "";
    },
  },
  watch: {
    form: {
      handler(val) {
        this.form.mobile = this.checkNumber(this.form.mobile);
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
        <h4 class="heading__title" v-if="!store.loading">اضافه کردن کاربر</h4>
        <h4 class="heading__title" v-else>درحال دریافت اطلاعات...</h4>

        <div class="heading__actions" v-if="!store.loading">
          <nuxt-link to="/user" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست کاربران
          </nuxt-link>
        </div>
      </div>
      <div class="card__body">
        <vForm v-slot="{ errors, handleSubmit }" as="form">
          <div class="row">
            <div class="controls w-1/3">
              <FormTextInput
                name="name"
                label="نام و نام خانوادگی"
                v-model="form.name"
                :rules="'min:3|required'"
                :errors="errors['نام و نام خانوادگی']"
              />
              <FormInputShowError errorKey="name" />
            </div>
            <div class="controls w-1/3">
              <FormTextInput
                name="mobile"
                type="number"
                label="شماره همراه"
                v-model="form.mobile"
                :ltr="true"
                :rules="'numeric|min:11|max:11'"
                :errors="errors['شماره همراه']"
              />
              <FormInputShowError errorKey="mobile" />
            </div>
            <div class="controls w-1/3">
              <label for="type">نوع کاربر</label>
              <v-select
                v-model="form.type"
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
                v-model="form.email"
                :errors="errors['ایمیل']"
              />
              <FormInputShowError errorKey="email" />
            </div>
            <div class="controls w-1/3">
              <FormTextInput
                name="password"
                type="password"
                label="رمز عبور"
                v-model="form.password"
                :errors="errors['رمز عبور']"
              />
              <FormInputShowError errorKey="password" />
            </div>
            <div class="controls w-1/3">
              <label for="type">نقش کاربر</label>
              <v-select
                v-model="form.role"
                :reduce="(option) => option.name"
                label="name"
                :options="roleStore.data"
                :disabled="form.is_admin || (!form.is_admin && !form.is_staff)"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="role" />
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
                  @click="clearAvatar()"
                  v-if="previewAvatar != null || avatar != ''"
                >
                  <i class="fa-regular fa-circle-xmark"></i>
                </div>
                <img  v-if="previewAvatar != null" :src="previewAvatar" alt="" loading="lazy" format="webp" />
                <img  v-else src="/images/no-photo-available.png" alt="" loading="lazy" format="webp" />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="controls w-full check_control">
              <div class="flex flex-col" style="gap: 10px">
                <div class="flex items-center ml-4">
                  <input
                    v-model="form.mobile_verified_at"
                    :disabled="!form.mobile"
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
                    v-model="form.email_verified_at"
                    :disabled="!form.email"
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
                    v-model="form.is_admin"
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
                    v-model="form.is_staff"
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
          <div class="row">
            <div class="controls w-full mt-5">
              <button
                :disabled="loading"
                class="btn btn-primary w-[110px]"
                @click="handleSubmit(addUser)"
              >
                <template v-if="loading">
                  <i
                    class="fa-solid fa-spinner text-white text-xl animate-spin"
                  ></i>
                </template>
                <template v-else> اضافه کردن </template>
              </button>
            </div>
          </div>
        </vForm>
      </div>
    </div>
  </section>
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
  @apply flex items-center rounded-md justify-between bg-[#f7f7f7] border border-[#cacfe7] py-[20px] px-3;
}

.delete {
  @apply text-red-500 bg-white absolute -top-2 -left-2 cursor-pointer h-5 w-5 flex items-center justify-center rounded-full border-black;

  i {
    @apply text-base;
  }
}
</style>
