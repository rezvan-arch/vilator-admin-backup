<script>
import ConfirmModal from "~/components/admin/modals/ConfirmModal.vue";
import useStore from "~/mixins/store";
import { redirectStore } from "~/store/admin/redirect/index";
export default {
  data() {
    return {
      errors: {},
      deleteConfirm: false,
      deleteLoading: false,
      typeOption: [
        { label: "301 کاملا انتقال یافت.", value: 301 },
        { label: "302 پیدا شد.", value: 302 },
        { label: "307 به طور موقت تغییر مسیر داده شده.", value: 307 },
        { label: "410 محتوای حذف شده است.", value: 410 },
        { label: "451 به دلایل امنیتی غیرقابل دسترس است.", value: 451 },
      ],
      loading: false,
      createConfirm: false,
    };
  },
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ویرایش ریدایرکت",
    });
    const { indexStore, adminStore } = useStore();
    const store = redirectStore();
    const route = useRoute();
    store.getSingleRedirect(route.params.id);
    return { store, indexStore, adminStore };
  },
  methods: {
    deleteRedirect() {
      this.deleteConfirm = false;
      this.store.loading = true;
      this.deleteLoading = true;
      this.store.actionId = this.store.redirect.id;
      this.store
        .deleteRedirect()
        .then((res) => {
          if (res.status == "success") {
            this.store.actionId = "";
            this.$router.push("/redirect");
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
    updateRedirect() {
      if (this.store.redirect.old_url == "") {
        this.$toast("لینک قدیمی وارد نشده است!", "error", 2000);
        return;
      }
      if (this.store.redirect.new_url == "") {
        this.$toast("لینک جدید وارد نشده است!", "error", 2000);
        return;
      }
      if (this.store.redirect.type == "") {
        this.$toast("نوع ریدایرکت وارد نشده است!", "error", 2000);
        return;
      }
      this.loading = true;
      // setTimeout(() => {
      //   let request;
      //   if (window.XMLHttpRequest) request = new XMLHttpRequest();
      //   else request = new ActiveXObject("Microsoft.XMLHTTP");
      //   request.open(
      //     "GET",
      //     `http://${window.location.host}/${decodeURI(
      //       this.store.redirect.new_url
      //     )}`,
      //     false
      //   );
      //   request.send();
      //   if (request.status === 404) {
      //     this.createConfirm = true;
      //     this.loading = false;
      //   } else if (request.status === 200) {
      //     this.sendRequest();
      //   }
      // }, 250);
      this.sendRequest();
    },
    async sendRequest() {
      const body = {
        old_url: decodeURI(this.store.redirect.old_url),
        new_url: decodeURI(this.store.redirect.new_url),
        type: this.store.redirect.type,
      };
      this.store
        .editRedirect(body, this.store.redirect.id)
        .then((res) => {
          if (res.status == "success") {
            this.$toast(res.message, "success", 2000);
            this.loading = false;
            this.$router.push("/redirect");
          }
        })
        .catch((err) => {
          var keys = Object.keys(this.adminStore.errors);
          this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          this.loading = false;
        });
    },
  },
  components: { ConfirmModal },
};
</script>
<template>
  <section class="type__edit">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">ویرایش ریدایرکت</h4>
        <div class="heading__actions">
          <nuxt-link to="/redirect/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            ریدایرکت جدید
          </nuxt-link>
          <button
            :disabled="deleteLoading"
            @click="deleteConfirm = true"
            class="btn btn-danger"
          >
            <template v-if="deleteLoading">
              <i
                class="fa-solid fa-spinner text-white text-xl animate-spin"
              ></i>
            </template>
            <template v-else>
              <i class="fa-regular fa-trash"></i>
              حذف ریدایرکت
            </template>
          </button>
        </div>
      </div>
      <div class="card__body" v-if="!store.loading">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="row">
            <div class="controls w-full">
              <div
                class="bg-orange-100 border-t-4 border-orange-500 rounded-b text-orange-900 px-4 py-3 shadow-md mb-4"
                role="alert"
              >
                <div class="flex items-center">
                  <div class="py-1">
                    <i
                      class="fa-regular fa-triangle-exclamation fill-current h-6 w-6 text-orange-500 ml-4 text-2xl"
                    ></i>
                  </div>
                  <div>
                    <!-- <p class="font-bold">Our privacy policy has changed</p> -->
                    <p class="text-sm font-semibold">
                      در این بخش اسلاگ صفحه مورد نظر را وارد کنید.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/2">
              <FormTextInput
                v-model="store.redirect.old_url"
                label="لینک قدیمی"
                name="old_url"
                rules="required"
                :errors="errors['لینک قدیمی']"
                :ltr="true"
              />
              <FormInputShowError errorKey="old_url" />
            </div>
            <div class="controls w-1/2">
              <FormTextInput
                v-model="store.redirect.new_url"
                label="لینک جدید"
                name="new_url"
                rules="required"
                :errors="errors['لینک جدید']"
                :ltr="true"
              />
              <FormInputShowError errorKey="new_url" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/3">
              <label for="status">نوع ریدایرکت</label>
              <v-select
                v-model="store.redirect.type"
                id="type"
                :options="typeOption"
                :clearable="false"
                :reduce="(options) => options.value"
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
            <div class="controls w-full">
              <button
                class="btn btn-primary w-[110px]"
                :disabled="loading"
                @click="handleSubmit(updateRedirect)"
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
      <ConfirmModal
        v-if="createConfirm"
        msg="صفحه جدید مورد نظر شما وجود ندارد، آیا میخواهید به ساخت ریدایرکت ادامه دهید؟"
        @confirm="sendRequest"
        @closeModal="createConfirm = false"
      />
    </transition>
    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="deleteConfirm"
        msg="آیا از حذف این ریدایرکت اطمینان دارید؟"
        @confirm="deleteRedirect"
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
