<script>
import useStore from "~/mixins/store";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ویرایش صفت ",
    });
    const { indexStore, adminStore, categoryStore } = useStore();
    const route = useRoute();
    categoryStore.getCategory(route.params.id);
    categoryStore.getTypes();

    watch(
      () => categoryStore.categories.title,
      (val, oldVal = "") => {
        if (
          oldVal != undefined &&
          categoryStore.categories.slug.replaceAll("-", "") ==
            oldVal.replaceAll(" ", "")
        ) {
          categoryStore.categories.slug = categoryStore.categories.title
            .trim()
            .replaceAll(" ", "-");
        }
      }
    );

    return {
      categoryStore,
      indexStore,
      adminStore,
    };
  },
  data() {
    return {
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
      galleryPopup: false,
      thumbnailDetails: null,
      trashConfirm: false,
      loading: false,
      trashLoading: false,
    };
  },
  created() {},
  methods: {
    trashCategory() {
      this.trashConfirm = false;
      this.trashLoading = true;
      this.categoryStore.actionId = this.categoryStore.categories.id;
      this.categoryStore
        .trashCategory()
        .then(() => {
          this.categoryStore.actionId = "";
          this.$router.push(`/category`);
          this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          this.trashLoading = false;
        })
        .catch((err) => {
          this.categoryStore.actionId = "";
          this.categoryStore.loading = false;
          this.trashLoading = false;
        });
    },
    async editCategory() {
      if (this.categoryStore.categories.title == "") {
        this.$toast("عنوان الزامی است!", "error", 2000);
        return;
      }

      if (this.categoryStore.categories.types.length < 1) {
        this.$toast("نوع تایپ الزامی است!", "error", 2000);
        return;
      }

      this.loading = true;
      let body = {
        title: this.categoryStore.categories.title
          ? this.categoryStore.categories.title
          : "",
        slug: this.categoryStore.categories.slug,
        type_ids: this.categoryStore.categories.types.map((item) => item.id),
        description: this.categoryStore.categories.description,
        short_description: this.categoryStore.categories.short_description,
        status: this.categoryStore.categories.status,
        sort_order: Number(this.categoryStore.categories.sort_order),
        thumbnail_id: this.categoryStore.categories.thumbnail_id,
        seo_option: {
          seo_title: this.categoryStore.categories.seo_option.seo_title,
          seo_description:
            this.categoryStore.categories.seo_option.seo_description,
        },
      };

      this.categoryStore
        .editCat(body, this.categoryStore.categories.id)
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
            this.$router.push("/category");
            this.loading = false;
          }
        })
        .catch((err) => {
          this.loading = false;
          let list = Object.keys(this.adminStore.errors);
          this.$toast(this.adminStore.errors[list[0]][0], "error", 2000);
        });
    },
    galleryEvent(data) {
      if (data.type != "image" && data.type != "plan") {
        this.$toast("تصویرشاخص انتخابی نامعتبر می باشد!", "error", 2000);
        return;
      }
      this.thumbnailDetails = data;
      this.categoryStore.categories.thumbnail_id = data.id;
      this.galleryPopup = false;
      this.indexStore.showModalFn(false);
    },
    setThumbnail() {
      this.indexStore.showModalFn(true);
      this.galleryPopup = true;
    },
    clearThumbnail() {
      this.thumbnailDetails = null;
      this.categoryStore.categories.thumbnail = null;
      this.categoryStore.categories.thumbnail_id = null;
    },
  },
};
</script>

<template>
  <section class="category__new">
    <template v-if="!categoryStore.loading">
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">ویرایش صفت</h4>
          <div class="heading__actions">
            <nuxt-link to="/category/new" class="btn btn-primary">
              <i class="fa-regular fa-plus"></i>
              صفت جدید
            </nuxt-link>
            <button
              :disabled="trashLoading"
              @click="trashConfirm = true"
              class="btn btn-danger w-[110px]"
            >
              <template v-if="trashLoading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else>
                <i class="fa-regular fa-trash"></i>
                حذف صفت
              </template>
            </button>
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
                v-model="categoryStore.categories.title"
                rules="min:3|required"
              />
              <FormInputShowError errorKey="title" />
            </div>
            <div class="controls w-1/2">
              <FormTextInput
                name="slug"
                label="اسلاگ"
                v-model="categoryStore.categories.slug"
                rules="min:3"
              />
              <FormInputShowError errorKey="slug" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <label for="description">توضیحات کوتاه</label>

              <textarea
                v-model="categoryStore.categories.short_description"
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
              <rich-editor v-model="categoryStore.categories.description" />
              <FormInputShowError errorKey="description" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/3">
              <label for="types">نوع تایپ</label>
              <v-select
                v-model="categoryStore.categories.types"
                multiple
                :closeOnSelect="false"
                id="types"
                label="title"
                :options="categoryStore.types"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="types" />
            </div>
            <div class="controls w-1/3">
              <label for="sort_order">شماره ترتیب</label>
              <input
                v-model="categoryStore.categories.sort_order"
                type="number"
                id="sort_order"
                class="form-control"
              />
              <FormInputShowError errorKey="sort_order" />
            </div>
            <div class="controls w-1/3">
              <label for="status">وضعیت</label>
              <v-select
                v-model="categoryStore.categories.status"
                :reduce="(option) => option.value"
                id="status"
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
                  v-if="
                    thumbnailDetails != null ||
                    categoryStore.categories.thumbnail != null
                  "
                >
                  <i class="fa-regular fa-circle-xmark"></i>
                </div>
                <img  
                  v-if="thumbnailDetails != null"
                  :src="thumbnailDetails.get_url"
                  alt="" loading="lazy" format="webp"
                />
                <img  
                  v-else-if="categoryStore.categories.thumbnail != null"
                  :src="categoryStore.categories.thumbnail.get_url"
                  alt="" loading="lazy" format="webp"
                />
                <img  v-else src="/images/no-photo-available.png" alt="" loading="lazy" format="webp" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="card" v-if="!categoryStore.loading">
        <div class="card__header">
          <h4 class="heading__title">بخش تنظیمات سئو</h4>
        </div>
        <div class="card__body">
          <div class="row">
            <div
              v-if="categoryStore.categories.seo_option"
              class="controls w-1/2"
            >
              <label for="seo_title">عنوان سئو</label>
              <input
                v-model="categoryStore.categories.seo_option.seo_title"
                type="text"
                id="seo_title"
                class="form-control"
              />
              <FormInputShowError errorKey="seo_title" />
            </div>
          </div>
          <div class="row">
            <div
              v-if="categoryStore.categories.seo_option"
              class="controls w-full"
            >
              <div class="flex items-center justify-between">
                <label for="seo_description">توضیح سئو</label>
                <span
                  v-if="categoryStore.categories.seo_option.seo_description"
                  class="opacity-60"
                >
                  {{
                    categoryStore.categories.seo_option.seo_description.length
                  }}
                </span>
              </div>
              <textarea
                v-model="categoryStore.categories.seo_option.seo_description"
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
      <div class="card" v-if="!categoryStore.loading">
        <div class="card__body">
          <div class="row">
            <div class="controls w-full">
              <button
                :disabled="loading"
                class="btn btn-primary w-[110px]"
                @click="editCategory()"
              >
                <template v-if="loading">
                  <i
                    class="fa-solid fa-spinner text-white text-xl animate-spin"
                  ></i>
                </template>
                <template v-else> ویرایش </template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="card">
        <div class="card__body">
          <p>درحال بارگذاری اطلاعات...</p>
        </div>
      </div>
    </template>
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
    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="trashConfirm"
        msg="آیا از انتقال این صفت به سطل زباله اطمینان دارید؟"
        @confirm="trashCategory()"
        @closeModal="trashConfirm = false"
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
