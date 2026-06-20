<script>
import useStore from "~/mixins/store";
import { typesStore } from "~/store/admin/types";
export default {
  data() {
    return {
      form: {
        title: "",
        slug: "",
        status: "active",
        description: "",
        short_description: "",
        thumbnail_id: null,
      },
      galleryPopup: false,
      thumbnailDetails: null,
      options: [
        {
          label: "فعال",
          value: "active",
        },
        { label: "غیرفعال", value: "de_active" },
      ],
      loading: false,
    };
  },
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ساخت تایپ جدید",
    });
    const store = typesStore();
    const { indexStore, adminStore } = useStore();

    return {
      store,
      indexStore,
      adminStore,
    };
  },
  methods: {
    async addType() {
      if (this.form.title == "") {
        this.$toast("عنوان وارد نشده است!", "error", 2000);
        return;
      }
      this.loading = true;

      this.store
        .addType(this.form)
        .then((res) => {
          if (res.status == "success") {
            this.loading = false;
            this.$toast("درخواست شما با موفقیت انجام شد", "success", 2000);
            this.$router.push("/types");
          }
        })
        .catch((err) => {
          var keys = Object.keys(this.adminStore.errors);
          this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          this.loading = false;
        });
    },
    galleryEvent(data) {
      if (data.type != "image" && data.type != "plan") {
        this.$toast("تصویرشاخص انتخابی نامعتبر می باشد!", "error", 2000);
        return;
      }
      this.thumbnailDetails = data;
      this.form.thumbnail_id = data.id;
      this.galleryPopup = false;
      this.indexStore.showModalFn(false);
    },
    setThumbnail() {
      this.indexStore.showModalFn(true);
      this.galleryPopup = true;
    },
    clearThumbnail() {
      this.thumbnailDetails = null;
      this.form.thumbnail_id = null;
    },
  },
};
</script>
<template>
  <section class="type__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">اضافه کردن تایپ</h4>
        <div class="heading__actions">
          <nuxt-link to="/types/trash" class="btn btn-danger">
            <i class="fa-regular fa-trash"></i>
            سطل زباله
          </nuxt-link>
        </div>
      </div>
      <div class="card__body">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="row">
            <div class="controls w-full">
              <FormTextInput
                v-model="form.title"
                label="عنوان"
                name="title"
                rules="min:3|required"
                :errors="errors['عنوان']"
              />
              <FormInputShowError errorKey="title" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/2">
              <FormTextInput v-model="form.slug" label="اسلاگ" name="slug" />
              <FormInputShowError errorKey="slug" />
            </div>
            <div class="controls w-1/2">
              <label for="status">وضعیت</label>
              <v-select
                v-model="form.status"
                id="status"
                :options="options"
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
              <FormInputShowError errorKey="status" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <label for="short_description">توضیحات کوتاه</label>
              <textarea
                v-model="form.short_description"
                type="text"
                id="short_description"
                class="form-control form-textarea"
                maxlength="250"
                rows="3"
              ></textarea>
              <FormInputShowError errorKey="short_description" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <label for="desc">توضیحات</label>
              <rich-editor v-model="form.description" />
              <FormInputShowError errorKey="description" />
            </div>
          </div>
          <div class="row p-4">
            <div class="controls w-full thumbnail_box">
              <button class="btn btn-primary" @click="setThumbnail">
                انتخاب تصویر شاخص
              </button>
              <div class="thumbnail relative">
                <div
                  class="delete"
                  @click="clearThumbnail()"
                  v-if="thumbnailDetails != null || form.thumbnail_id != null"
                >
                  <i class="fa-regular fa-circle-xmark"></i>
                </div>
                <img  
                  v-if="thumbnailDetails != null"
                  :src="thumbnailDetails.get_url"
                  alt="" loading="lazy" format="webp"
                />
                <img  v-else src="/images/no-photo-available.png" alt="" loading="lazy" format="webp" />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <button
                class="btn btn-primary w-[110px]"
                :disabled="loading"
                @click="handleSubmit(addType)"
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
    <transition name="translate">
      <AdminMediaMediaImportModal
        v-if="galleryPopup"
        galleryType="image"
        :justImage="true"
        :multiple="false"
        @closeModal="
          galleryPopup = false;
          indexStore.showModalFn(false);
        "
        @chooseMedia="galleryEvent"
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
