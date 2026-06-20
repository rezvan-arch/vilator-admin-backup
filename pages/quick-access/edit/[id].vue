<script>
import useStore from "~/mixins/store";

export default {
  data() {
    return {
      errors: {},
      deleteConfirm: false,
      deleteLoading: false,
      loading: false,
      debounceAttr: null,
      observer: null,
      load: null,
    };
  },
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ویرایش دسترسی سریع ",
    });
    const { typesStore, adminStore, quickAccessStore, attributeStore } =
      useStore();
    const route = useRoute();
    typesStore.getAllType();
    quickAccessStore.getSearchAttr();

    const attrOptions = computed(() => {
      let array = [];
      quickAccessStore.searchAttr.forEach((item) => {
        array = [...array, item, ...item.options];
      });

      return array.map((item) => {
        if (item.options && item.options.length > 0) {
          return { ...item, type: "parent" };
        } else if (item.item_styles && item.item_styles.type == "single") {
          return { ...item, type: "single" };
        } else {
          return { ...item, type: "child" };
        }
      });
    });
    quickAccessStore.getSingleQuickAccess(route.params.id);

    const type_select = computed(() => {
      return typesStore.allTypes.map((item) => {
        return {
          label: item.title,
          id: item.id,
          slug: item.slug,
        };
      });
    });

    return {
      typesStore,
      adminStore,
      quickAccessStore,
      attributeStore,
      attrOptions,
      type_select,
    };
  },
  methods: {
    deleteQuickAccess() {
      this.deleteConfirm = false;
      this.quickAccessStore.loading = true;
      this.deleteLoading = true;
      this.quickAccessStore.actionId = this.quickAccessStore.quickAccess.id;
      this.quickAccessStore
        .deleteQuickAccess()
        .then((res) => {
          if (res.status == "success") {
            this.quickAccessStore.actionId = "";
            this.$router.push("/quick-access");
          } else {
            this.loading = false;
          }
          this.deleteLoading = false;
        })
        .catch(() => {
          this.loading = false;
          this.deleteLoading = false;
        });
    },
    updateQuick() {
      if (
        this.quickAccessStore.quickAccess.sort == "" ||
        this.quickAccessStore.quickAccess.attribute == null
      ) {
        $toast("لطفا تمامی موارد را پر کنید.", "error", 2000);
        return;
      }
      this.loading = true;

      this.quickAccessStore
        .editQuickAccess(
          this.quickAccessStore.quickAccess,
          this.quickAccessStore.quickAccess.id
        )
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست شما با موفقیت انجام شد", "success", 2000);
            this.loading = false;
            this.$router.push("/quick-access");
          }
        })
        .catch((err) => {
          var keys = Object.keys(this.adminStore.errors);
          this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          this.loading = false;
        });
    },

    debounceSearchAttr(data) {
      clearTimeout(this.debounceAttr);
      this.debounceAttr = setTimeout(() => {
        this.searchAttr(data);
      }, 700);
    },
    searchAttr(data) {
      this.quickAccessStore.getSearchAttr(data);
    },
    async infiniteScroll([{ isIntersecting, target }]) {
      if (isIntersecting) {
        const ul = target.offsetParent;
        const scrollTop = target.offsetParent.scrollTop;

        this.quickAccessStore.getSearchAttr(
          "",
          this.quickAccessStore.pagination.current_page + 1
        );
        await this.$nextTick();
        setTimeout(() => {
          ul.scrollTop = scrollTop + 10;
        }, 450);
      }
    },

    async onOpen() {
      if (this.hasNextPage) {
        await this.$nextTick();
        this.observer.observe(this.$refs.load);
      }
    },
    onClose() {
      this.observer.disconnect();
    },
  },
  computed: {
    hasNextPage() {
      return (
        this.quickAccessStore.pagination.current_page <
        this.quickAccessStore.pagination.last_page
      );
    },
  },
  mounted() {
    this.observer = new IntersectionObserver(this.infiniteScroll);
  },
};
</script>
<template>
  <section class="type__edit">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">ویرایش دسترسی سریع</h4>
        <div class="heading__actions">
          <nuxt-link to="/quick-access/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            دسترسی سریع جدید
          </nuxt-link>
          <button
            :disabled="deleteLoading"
            @click="deleteConfirm = true"
            class="btn btn-danger min-w-[170px]"
          >
            <template v-if="deleteLoading">
              <i
                class="fa-solid fa-spinner text-white text-xl animate-spin"
              ></i>
            </template>
            <template v-else>
              <i class="fa-regular fa-trash"></i>
              حذف دسترسی سریع
            </template>
          </button>
        </div>
      </div>
      <div class="card__body" v-if="!quickAccessStore.loading">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="row">
            <div class="controls w-1/2">
              <label for="attribute">مشخصه </label>
              <v-select
                v-model="quickAccessStore.quickAccess.attribute"
                id="attribute"
                :options="attrOptions"
                label="title"
                @search="debounceSearchAttr"
                autocomplete="off"
                :selectable="(option) => option.type != 'parent'"
                :filterable="false"
                @open="onOpen"
                @close="onClose"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template #option="{ title, type }">
                  <div
                    v-if="type == 'parent' || type == 'single='"
                    style="display: flex"
                  >
                    <strong>{{ title }}</strong>
                  </div>
                  <div v-if="type == 'child'" style="display: flex">
                    <p>- {{ title }}</p>
                  </div>
                </template>
                <template #list-footer>
                  <li
                    v-show="hasNextPage"
                    ref="load"
                    class="loader text-sm opacity-50 px-5 text-center w-full"
                  >
                    درحال دریافت
                  </li>
                </template>
              </v-select>
              <FormInputShowError errorKey="attribute" />
            </div>

            <div class="controls w-1/2">
              <label for="type">تایپ</label>
              <v-select
                v-model="quickAccessStore.quickAccess.type"
                id="type"
                multiple
                :closeOnSelect="false"
                :options="type_select"
                :reduce="(option) => option.slug"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="type_ids" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/4">
              <label for="sort">ترتیب مرتب سازی</label>
              <input
                v-model="quickAccessStore.quickAccess.sort"
                type="number"
                id="sort"
                class="form-control"
              />
              <FormInputShowError errorKey="sort" />
            </div>
            <div class="controls w-1/4">
              <label for="status">وضعیت</label>
              <v-select
                v-model="quickAccessStore.quickAccess.is_active"
                id="status"
                :options="[
                  {
                    label: 'فعال',
                    value: 1,
                  },
                  {
                    label: 'غیرفعال',
                    value: 0,
                  },
                ]"
                :reduce="(option) => option.value"
                :clearable="false"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <button
                class="btn btn-primary w-[110px]"
                :disabled="loading"
                @click="handleSubmit(updateQuick)"
              >
                <template v-if="loading">
                  <i
                    class="fa-solid fa-spinner text-white text-xl animate-spin"
                  ></i>
                </template>
                <template v-else> بروزرسانی</template>
              </button>
            </div>
          </div>
        </vForm>
      </div>
      <div class="card__body" v-else>
        <div>درحال بارگذاری...</div>
      </div>
    </div>
  </section>
  <teleport to="body">
    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="deleteConfirm"
        msg="آیا از حذف این دسترسی سریع اطمینان دارید؟"
        @confirm="deleteQuickAccess"
        @closeModal="deleteConfirm = false"
      />
    </transition>
  </teleport>
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
