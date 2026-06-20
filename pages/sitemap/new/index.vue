<script>
import ConfirmModal from "~/components/admin/modals/ConfirmModal.vue";
import useStore from "~/mixins/store";
import moment from "jalali-moment";
import "jalali-moment";

export default {
  data() {
    return {
      form: {
        url: "",
        type: "page",
        last_modify: "",
        is_index: false,
      },
      sitemapOption: [
        "page",
        "landing",
        "category",
        "video",
        "narration",
        "property",
      ],
      loading: false,
      createConfirm: false,
    };
  },
  setup() {
    definePageMeta({ layout: "admin" });
    const { indexStore, adminStore, sitemapStore } = useStore();
    useHead({
      title: "پنل مدیریت | ساخت سایت مپ جدید",
    });
    return {
      sitemapStore,
      indexStore,
      adminStore,
    };
  },
  methods: {
    async addSitemap() {
      this.sendRequest();
    },
    async sendRequest() {
      this.createConfirm = false;
      this.loading = true;
      this.sitemapStore
        .addSitemap(this.form)
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست شما با موفقیت انجام شد", "success", 2000);
            this.loading = false;
            this.$router.push("/sitemap");
          }
        })
        .catch((err) => {
          var keys = Object.keys(this.adminStore.errors);
          this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          this.loading = false;
        });
    },
  },
  beforeMount() {
    this.form.last_modify = moment
      .from(new Date().toLocaleDateString(), "en", "MM/DD/YYYY")
      .locale("en")
      .format("YYYY/MM/DD");
  },
  components: { ConfirmModal },
};
</script>
<template>
  <section class="type__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">اضافه کردن سایت مپ</h4>
        <div class="heading__actions"></div>
      </div>
      <div class="card__body">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="row">
            <div class="controls w-full">
              <FormTextInput
                v-model="form.url"
                label="لینک "
                :ltr="true"
                name="url"
                rules="required"
                :errors="errors['لینک ']"
              />
              <FormInputShowError errorKey="url" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/3">
              <label for="type">تاریخ</label>
              <input id="date" type="text" class="date form-control" />
              <datePicker
                v-model="form.last_modify"
                custom-input=".date"
                format="YYYY-MM-DD"
                displayFormat="jYYYY/jMM/jDD"
                simple
              />
              <FormInputShowError errorKey="last_modify" />
            </div>
            <div class="controls w-1/3">
              <label for="type">نوع سایت مپ</label>
              <v-select
                v-model="form.type"
                id="type"
                :options="sitemapOption"
                :clearable="false"
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
            <div class="controls w-1/3">
              <div class="checkbox">
                <input
                  v-model="form.is_index"
                  id="is_index"
                  type="checkbox"
                  value="is_index"
                  class=""
                />
                <label for="is_index" class="checkbox_label"> ایندکس </label>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <button
                class="btn btn-primary w-[110px]"
                :disabled="loading"
                @click="handleSubmit(addSitemap)"
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
.controls {
  @apply flex flex-col;

  .checkbox {
    @apply h-[46px] mt-7 flex items-center;
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
</style>
