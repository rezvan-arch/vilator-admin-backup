<script>
import useStore from "~~/mixins/store";
import { categoryStore } from "~/store/admin/category/index";
export default {
  setup() {
    definePageMeta({ layout: "admin" });

    useHead({
      title: "پنل مدیریت | ساخت صفت جدید ",
    });
    const store = categoryStore();
    const { indexStore, adminStore } = useStore();
    store.actionId = "";
    store.loading = true;
    store.pagination = [];

    return {
      store,
      indexStore,
      adminStore,
    };
  },
  data() {
    return {
      title: "",
      form: {
        title: "",
        slug: "",
        type_ids: [],
        description: "",
        short_description: "",
        sort_order: null,
        status: "active",
        thumbnail: "",
        thumbnail_id: null,
        seo_option: {
          seo_title: "",
          seo_description: "",
        },
      },
      galleryPopup: false,
      thumbnailDetails: null,
      statusOptions: [
        {
          label: "فعال",
          value: "active",
        },
        {
          label: "غیرفعال",
          value: "de_active",
        },
      ],
      loading: false,
    };
  },
  created() {
    this.store.getCategories(1);
    this.store.getTypes();
  },
  methods: {
    async addCat() {
      if (this.form.title == "") {
        this.$toast("عنوان الزامی است!", "error", 2000);
        return;
      }
      if (this.form.type_ids.length == 0) {
        this.$toast("نوع تایپ الزامی است!", "error", 2000);
        return;
      }
      this.loading = true;

      this.store
        .addNewCat(this.form)
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
            this.$router.push("/category");
          }
          this.loading = false;
        })
        .catch((err) => {
          if (this.adminStore.errors["slug"].length != 0) {
            this.$toast(this.adminStore.errors["slug"][0], "error", 2000);
          } else {
            var keys = Object.keys(this.adminStore.errors);
            this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          }
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
  watch: {
    title(val, oldVal) {
      if (
        oldVal != undefined &&
        this.form.slug.replaceAll("-", "") == oldVal.replaceAll(" ", "")
      ) {
        this.form.title = this.title;
        this.form.slug = this.form.title.trim().replaceAll(" ", "-");
      }
    },
  },
};
</script>
<template>
  <section class="category__new">
    <vForm v-slot="{ errors, handleSubmit }" as="">
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">اضافه کردن صفت</h4>
          <div class="heading__actions">
            <nuxt-link to="/category" class="btn btn-primary">
              <i class="fa-regular fa-list"></i>
              لیست
            </nuxt-link>
          </div>
        </div>
        <div class="card__body">
          <div class="row">
            <div class="controls w-1/2">
              <FormTextInput
                name="title"
                label="عنوان"
                v-model="title"
                rules="min:3|required"
                :errors="errors['عنوان']"
              />
              <FormInputShowError errorKey="title" />
            </div>
            <div class="controls w-1/2">
              <FormTextInput
                name="slug"
                label="اسلاگ"
                v-model="form.slug"
                rules="min:3|required"
                :errors="errors['اسلاگ']"
              />
              <FormInputShowError errorKey="slug" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <label for="description">توضیحات کوتاه</label>
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
              <label for="full_description">توضیحات کامل</label>
              <rich-editor v-model="form.description" />
              <FormInputShowError errorKey="description" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/3">
              <label for="type_ids">نوع تایپ</label>
              <v-select
                v-model="form.type_ids"
                id="type_ids"
                :reduce="(option) => option.id"
                label="title"
                :options="store.types"
                multiple
                :closeOnSelect="false"
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
            <div class="controls w-1/3">
              <label for="sort_order">شماره ترتیب</label>
              <input
                v-model="form.sort_order"
                type="number"
                id="sort_order"
                class="form-control"
              />
              <FormInputShowError errorKey="sort_order" />
            </div>
            <div class="controls w-1/3">
              <label for="status">وضعیت</label>
              <v-select
                v-model="form.status"
                id="status"
                :reduce="(option) => option.value"
                :options="statusOptions"
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
        </div>
      </div>
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">بخش تنظیمات سئو</h4>
        </div>
        <div class="card__body">
          <div class="row">
            <div class="controls w-1/2">
              <label for="seo_title">عنوان سئو</label>
              <input
                v-model="form.seo_option.seo_title"
                type="text"
                id="seo_title"
                class="form-control"
              />
              <FormInputShowError errorKey="seo_title" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <div class="flex items-center justify-between">
                <label for="seo_description">توضیح سئو</label>
                <span v-if="form.seo_option.seo_option" class="opacity-60">
                  {{ form.seo_option.seo_option.seo_description.length }}
                </span>
              </div>
              <textarea
                v-model="form.seo_option.seo_description"
                type="text"
                id="seo_description"
                class="form-control form-textarea"
                maxlength="250"
                rows="3"
              ></textarea>
              <FormInputShowError errorKey="seo_description" />
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card__body">
          <div class="row">
            <div class="controls w-full">
              <button
                :disabled="loading"
                class="btn btn-primary w-[110px]"
                @click="handleSubmit(addCat)"
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
        </div>
      </div>
    </vForm>
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
