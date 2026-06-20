<script>
import { userRoleStore } from "~/store/admin/user/role/index";
import { userPermStore } from "~/store/admin/user/permission/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ویرایش نقش کاربری",
    });
    const store = userRoleStore();
    const permStore = userPermStore();

    return {
      store,
      permStore,
    };
  },
  data() {
    return {
      permsReCollect: [],
      permForm: [],
    };
  },
  async created() {
    this.permStore.getPerms().then(() => {
      this.permStore.data.map((perm) => {
        let groupIndex = this.permsReCollect.findIndex(
          (g) => g.group == perm["group"]
        );

        if (this.permsReCollect[groupIndex] == undefined) {
          this.permsReCollect.push({
            group: perm["group"],
            label: perm["group_title"],
            perms: [
              {
                id: perm["id"],
                fullName: perm["name"],
                name: perm["name"],
                label: perm["title"],
              },
            ],
          });
        } else {
          this.permsReCollect[groupIndex].perms.push({
            id: perm["id"],
            fullName: perm["name"],
            name: perm["name"],
            label: perm["title"],
          });
        }
      });
    });

    if (this.$route.params.id != "") {
      this.store.getSingle(this.$route.params.id).then((res) => {
        if (res.status == "success") {
          this.store.data = res.data;
          this.store.loading = false;
          res.data.permissions.map((perm) => {
            this.permForm[perm["name"]] = true;
          });
        }
      });
    }
  },
  methods: {
    async doSyncRolePerms() {
      let error = false;
      let permRdyToSync = [];
      Object.entries(this.permForm).forEach((p) => {
        if (p[1] == true) {
          permRdyToSync.push(p[0]);
        }
      });

      if (!permRdyToSync.length) {
        this.$toast("دسترسی الزامی است!", "error", 2000);
        error = true;
      }

      if (!error) {
        this.store
          .syncRolePerms(
            {
              permissions: permRdyToSync,
            },
            this.store.data.id
          )
          .then((res) => {
            if (res.status == "success") {
              this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
              this.$router.push("/role");
            } else {
              this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
            }
          });
      }
    },
  },
};
</script>
<template>
  <section class="projects__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title" v-if="!store.loading && !permStore.loading">
          ویرایش سطح دسترسی های مربوط به: {{ store.data.name }}
        </h4>
        <h4 class="heading__title" v-else>درحال دریافت اطلاعات...</h4>
        <div class="heading__actions">
          <nuxt-link to="/role/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            نقش کاربری جدید
          </nuxt-link>
          <nuxt-link to="/role" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            نقش های کاربری
          </nuxt-link>
        </div>
      </div>
      <div class="card__body" v-if="!store.loading && !permStore.loading">
        <div class="row">
          <div class="controls w-1/2">
            <label for="name">شناسه</label>
            <span v-if="store.data.id">{{ store.data.id }}</span>
            <span v-else>-</span>
          </div>
          <div class="controls w-1/2">
            <label for="name">عنوان</label>
            <nuxt-link
              v-if="store.data.name"
              :to="`/role/${store.data.id}`"
              >{{ store.data.name }}</nuxt-link
            >
            <span v-else>-</span>
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <button class="btn btn-primary" @click="doSyncRolePerms">
              بروزرسانی
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!store.loading && !permStore.loading">
      <div
        class="card"
        v-for="permGroup in permsReCollect"
        :key="permGroup.group"
      >
        <div class="card__header">
          <h4 class="heading__title">{{ permGroup.label }}</h4>
        </div>
        <div class="card__body">
          <div class="perms_base">
            <div
              class="perms_item"
              v-for="permItem in permGroup.perms"
              :key="permItem.id"
            >
              <label :for="'checkbox_' + permItem.id">
                <input
                  v-model="permForm[permItem.fullName]"
                  type="checkbox"
                  :id="'checkbox_' + permItem.id"
                  class="item_checkbox"
                />
                <span class="check__text">{{ permItem.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card__body" v-if="!store.loading && !permStore.loading">
        <div class="row">
          <div class="controls w-full">
            <button class="btn btn-primary" @click="doSyncRolePerms">
              بروزرسانی
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.perms_base {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  .perms_item {
    width: 300px;
    label {
      display: flex;
    }
    .item_checkbox {
      margin-left: 10px;
      transform: scale(1.2);
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
