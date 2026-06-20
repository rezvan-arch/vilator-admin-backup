<script>
import { userRoleStore } from "~/store/admin/user/role/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ویرایش نقش کاربری",
    });
    const store = userRoleStore();

    return {
      store,
    };
  },
  data() {
    return {
      deleteConfirmDialog: false,
    };
  },
  created() {
    this.store.getSingle(this.$route.params.id).then((res) => {
      if (res.status == "success") {
        this.store.data = res.data;
        this.store.meta = res.meta;
      }
      this.store.loading = false;
    });
  },
  methods: {
    async doEditRole() {
      if (this.store.data.name == null || this.store.data.name == "") {
        this.$toast("عنوان وارد نشده است!", "error", 2000);
        return;
      }

      this.store
        .editRole(
          {
            name: this.store.data.name,
          },
          this.store.data.id
        )
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
            this.$router.push("/role");
          } else {
            this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
            this.store.loading = false;
          }
        })
        .catch(() => {
          this.store.loading = false;
        });
    },
    doDeleteRole() {
      this.store
        .deleteRole(this.store.data.id)
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
            this.$router.push(`/role`);
          } else {
            this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
            this.store.loading = false;
          }
        })
        .catch((err) => {
          this.store.loading = false;
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
          ویرایش نقش: {{ store.data.name }}
        </h4>
        <h4 class="heading__title" v-else>درحال دریافت اطلاعات...</h4>
        <div class="heading__actions">
          <nuxt-link to="/role/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            نقش کاربری جدید
          </nuxt-link>
          <button @click="deleteConfirmDialog = true" class="btn btn-danger">
            <i class="fa-regular fa-trash"></i>
            حذف نقش کاربری
          </button>
          <nuxt-link to="/role" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            نقش های کاربری
          </nuxt-link>
        </div>
      </div>
      <div class="card__body" v-if="!store.loading">
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              name="name"
              label="عنوان"
              v-model="store.data.name"
              rules="min:3|required"
            />
            <FormInputShowError errorKey="name" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <button class="btn btn-primary" @click="doEditRole">ویرایش</button>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="deleteConfirmDialog"
        msg="آیا از حذف همیشگی این نقش کاربری اطمینان دارید؟"
        @confirm="doDeleteRole"
        @closeModal="deleteConfirmDialog = false"
      />
    </transition>
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
