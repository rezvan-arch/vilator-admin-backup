<script>
import ConfirmModal from "~/components/admin/modals/ConfirmModal.vue";
import useStore from "~/mixins/store";
export default {
  data() {
    return {
      errors: {},
      deleteConfirm: false,
      deleteLoading: false,
      loading: false,
      createConfirm: false,
    };
  },
  setup() {
    definePageMeta({ layout: "admin" });
    const { indexStore, adminStore, sitemapStore } = useStore();
    const route = useRoute();
    sitemapStore.getSingleSitemap(route.params.id);
    useHead({
      title: "پنل مدیریت | ویرایش سایت مپ",
    });
    return { sitemapStore, indexStore, adminStore };
  },
  methods: {
    deleteSitemap() {
      this.deleteConfirm = false;
      this.sitemapStore.loading = true;
      this.deleteLoading = true;
      this.sitemapStore.actionId = this.sitemapStore.sitemap.id;
      this.sitemapStore
        .deleteSitemap()
        .then((res) => {
          if (res.status == "success") {
            this.sitemapStore.actionId = "";
            this.$router.push("/sitemap");
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
    updateSitemap() {
      if (this.sitemapStore.sitemap.url == "") {
        this.$toast("لینک قدیمی وارد نشده است!", "error", 2000);
        return;
      }
      this.loading = true;
      this.sendRequest();
    },
    async sendRequest() {
      const body = {
        ...this.sitemapStore.sitemap,
        url: decodeURI(this.sitemapStore.sitemap.url),
      };
      this.sitemapStore
        .editSitemap(body, this.sitemapStore.sitemap.id)
        .then((res) => {
          if (res.status == "success") {
            this.$toast(res.message, "success", 2000);
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
  components: { ConfirmModal },
};
</script>
<template>
  <section class="type__edit">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">ویرایش سایت مپ</h4>
        <div class="heading__actions">
          <nuxt-link to="/sitemap/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            سایت مپ جدید
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
              حذف سایت مپ
            </template>
          </button>
        </div>
      </div>
      <div class="card__body" v-if="!sitemapStore.loading">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="row">
            <div class="controls w-full">
              <FormTextInput
                v-model="sitemapStore.sitemap.url"
                label="لینک "
                name="url"
                rules="required"
                :errors="errors['لینک ']"
                :ltr="true"
              />
              <FormInputShowError errorKey="url" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/3">
              <label for="type">تاریخ</label>
              <input
                id="date"
                type="text"
                class="date form-control"
                :value="
                  sitemapStore.sitemap.last_modify != null
                    ? convertDate(sitemapStore.sitemap.last_modify)
                    : ''
                "
              />
              <datePicker
                v-model="sitemapStore.sitemap.last_modify"
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
                v-model="sitemapStore.sitemap.type"
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
                  v-model="sitemapStore.sitemap.is_index"
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
                @click="handleSubmit(updateSitemap)"
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
        msg="صفحه جدید مورد نظر شما وجود ندارد، آیا میخواهید به ساخت سایت مپ ادامه دهید؟"
        @confirm="sendRequest"
        @closeModal="createConfirm = false"
      />
    </transition>
    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="deleteConfirm"
        msg="آیا از حذف این سایت مپ اطمینان دارید؟"
        @confirm="deleteSitemap"
        @closeModal="deleteConfirm = false"
      />
    </transition>
  </teleport>
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
