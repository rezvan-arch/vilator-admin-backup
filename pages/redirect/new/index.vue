<script>
import ConfirmModal from "~/components/admin/modals/ConfirmModal.vue";
import useStore from "~/mixins/store";
import { redirectStore } from "~/store/admin/redirect";
export default {
  data() {
    return {
      form: {
        old_url: "",
        new_url: "",
        type: 301,
      },
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
      title: "پنل مدیریت | ساخت ریدایرکت جدید",
    });
    const store = redirectStore();
    const { indexStore, adminStore } = useStore();
    return {
      store,
      indexStore,
      adminStore,
    };
  },
  methods: {
    async addRedirect() {
      if (this.form.title == "") {
        this.$toast("عنوان وارد نشده است!", "error", 2000);
        return;
      }
      this.loading = true;
      // setTimeout(() => {
      //   let request;
      //   if (window.XMLHttpRequest) request = new XMLHttpRequest();
      //   else request = new ActiveXObject("Microsoft.XMLHTTP");
      //   request.open(
      //     "GET",
      //     `${window.location.hostname == "localhost" ? "http" : "https"}://${
      //       window.location.host
      //     }/${decodeURI(this.form.new_url)}`,
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
      this.createConfirm = false;
      this.loading = true;
      this.store
        .addRedirect({
          old_url: decodeURI(this.form.old_url),
          new_url: decodeURI(this.form.new_url),
          type: this.form.type,
        })
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست شما با موفقیت انجام شد", "success", 2000);
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
  <section class="type__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">اضافه کردن ریدایرکت</h4>
        <div class="heading__actions"></div>
      </div>
      <div class="card__body">
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
                v-model="form.old_url"
                label="لینک قدیمی"
                :ltr="true"
                name="old_url"
                rules="required"
                :errors="errors['لینک قدیمی']"
              />
              <FormInputShowError errorKey="old_url" />
            </div>
            <div class="controls w-1/2">
              <FormTextInput
                v-model="form.new_url"
                label="لینک جدید"
                :ltr="true"
                name="new_url"
                rules="required"
                :errors="errors['لینک جدید']"
              />
              <FormInputShowError errorKey="new_url" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/3">
              <label for="status">نوع ریدایرکت</label>
              <v-select
                v-model="form.type"
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
                @click="handleSubmit(addRedirect)"
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
  <teleport to="body">
    <transition name="fade">
      <ConfirmModal
        v-if="createConfirm"
        msg="صفحه جدید مورد نظر شما وجود ندارد، آیا میخواهید به ساخت ریدایرکت ادامه دهید؟"
        @confirm="sendRequest"
        @closeModal="createConfirm = false"
      /> </transition
  ></teleport>
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
