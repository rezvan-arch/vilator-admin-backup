<script>
import { userRoleStore } from "~/store/admin/user/role/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ساخت نقش کاربری جدید",
    });
    const store = userRoleStore();

    return {
      store,
    };
  },
  data() {
    return {
      form: {
        name: "",
      },
    };
  },
  methods: {
    async doAddRole() {
      if (this.form.name == "") {
        this.$toast("عنوان وارد نشده است!", "error", 2000);
        return;
      }

      this.store.addRole(this.form).then((res) => {
        if (res.status == "success") {
          this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          this.$router.push("/role");
        } else {
          this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
        }
      });
    },
  },
};
</script>
<template>
  <section class="projects__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">اضافه کردن نقش کاربری</h4>
      </div>
      <div class="card__body">
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              name="name"
              label="عنوان"
              v-model="form.name"
              rules="min:3|required"
            />
            <FormInputShowError errorKey="name" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <button class="btn btn-primary" @click="doAddRole">
              اضافه کردن
            </button>
          </div>
        </div>
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
</style>
