<script>
import { userRoleStore } from "~/store/admin/user/role/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | نقش کاربری",
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
    if (this.$route.params.id) {
      this.store.getSingle(this.$route.params.id).then((res) => {
        if (res.status == "success") {
          this.store.data = res.data;
          this.store.meta = res.meta;
        }
        this.store.loading = false;
      });
    }
  },
  methods: {
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
        <h4 class="heading__title" v-if="!store.loading">مشاهده نقش</h4>
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
            <label for="name">شناسه</label>
            <span v-if="store.data.id">{{ store.data.id }}</span>
            <span v-else>-</span>
          </div>
          <div class="controls w-1/2">
            <label for="name">عنوان</label>
            <div v-if="store.data.name">
              <span>{{ store.data.name }}</span>
              <nuxt-link
                :to="`/role/${store.data.id}/edit`"
                class="mr-1 text-blue-500"
              >
                <i class="fa-regular fa-pen-to-square"></i>
              </nuxt-link>
            </div>
            <span v-else>-</span>
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <div class="flex mb-4 mt-10">
              <label class="font-bold" style="font-size: 1.2rem" for="name"
                >دسترسی ها</label
              >
              <nuxt-link
                :to="`/role/${store.data.id}/permissions`"
                class="mr-1 text-blue-500"
              >
                <i class="fa-regular fa-pen-to-square"></i>
              </nuxt-link>
            </div>
            <div class="perms_base" v-if="store.data.permissions.length">
              <div
                class="perms_item"
                v-for="perm in store.data.permissions"
                :key="perm.id"
              >
                <label :for="'checkbox_' + perm.id">
                  <i class="fa-solid fa-check"></i>
                  <span class="check__text">{{ perm.title }}</span>
                </label>
              </div>
            </div>
            <span v-else>-</span>
          </div>
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
</template>
<style lang="scss" scoped>
.perms_base {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  .perms_item {
    width: 33%;
    display: flex;
    align-items: center;

    i {
      @apply text-lime-600 ml-2 mt-1 block;
    }
    label {
      display: flex;
    }
    .item_checkbox {
      margin-left: 10px;
      transform: scale(1);
    }
  }
}
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
