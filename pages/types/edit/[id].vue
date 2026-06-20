<script>
import useStore from "~/mixins/store";
import { typesStore } from "~/store/admin/types/index";
export default {
  data() {
    return {
      options: [
        {
          label: "فعال",
          value: "active",
        },
        { label: "غیرفعال", value: "de_active" },
      ],
      errors: {},
      galleryPopup: false,
      thumbnailDetails: null,
      trashConfirm: false,
      trashLoading: false,
      loading: false,
    };
  },
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ویرایش تایپ ",
    });
    const { indexStore, adminStore } = useStore();
    const store = typesStore();
    const route = useRoute();
    store.getSingleType(route.params.id);

    return { store, indexStore, adminStore };
  },
  methods: {
    trashType() {
      this.trashConfirm = false;
      this.store.loading = true;
      this.trashLoading = true;
      this.store.actionTypeId = this.store.types.id;
      this.store
        .trashType()
        .then((res) => {
          if (res.status == "success") {
            this.store.actionTypeId = "";
            this.$router.push("/types");
          } else {
            this.loading = false;
          }
          this.trashLoading = false;
        })
        .catch(() => {
          this.loading = false;
          this.trashLoading = false;
        });
    },
    updateType() {
      if (this.store.types.title == "") {
        this.$toast("عنوان وارد نشده است!", "error", 2000);
        return;
      }
      this.loading = true;

      const body = {
        title: this.store.types.title,
        slug: this.store.types.slug,
        short_description: this.store.types.short_description,
        status: this.store.types.status,
        description: this.store.types.description,
        thumbnail_id: this.store.types.thumbnail_id,
      };

      this.store
        .editType(body, this.store.types.id)
        .then((res) => {
          if (res.status == "success") {
            this.$toast(res.message, "success", 2000);
            this.loading = false;
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
      this.store.types.thumbnail_id = data.id;
      this.galleryPopup = false;
      this.indexStore.showModalFn(false);
    },
    setThumbnail() {
      this.indexStore.showModalFn(true);
      this.galleryPopup = true;
    },
    clearThumbnail() {
      this.thumbnailDetails = null;
      this.store.types.thumbnail = null;
      this.store.types.thumbnail_id = null;
    },
  },
};
</script>
<template>
  <section class="type__edit">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">ویرایش تایپ</h4>
        <div class="heading__actions">
          <nuxt-link to="/types/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            تایپ جدید
          </nuxt-link>
          <button
            :disabled="trashLoading"
            @click="trashConfirm = true"
            class="btn btn-danger"
          >
            <template v-if="trashLoading">
              <i
                class="fa-solid fa-spinner text-white text-xl animate-spin"
              ></i>
            </template>
            <template v-else>
              <i class="fa-regular fa-trash"></i>
              حذف تایپ
            </template>
          </button>
          <nuxt-link to="/types/trash" class="btn btn-primary">
            <i class="fa-regular fa-trash"></i>
            سطل زباله
          </nuxt-link>
        </div>
      </div>
      <div class="card__body" v-if="!store.loading">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="row">
            <div class="controls w-full">
              <FormTextInput
                v-model="store.types.title"
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
              <FormTextInput
                v-model="store.types.slug"
                label="اسلاگ"
                name="slug"
                rules="min:3"
                :errors="errors['اسلاگ']"
              />
              <FormInputShowError errorKey="slug" />
            </div>
            <div class="controls w-1/2">
              <label for="status">وضعیت</label>
              <v-select
                v-model="store.types.status"
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
                v-model="store.types.short_description"
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
              <rich-editor v-model="store.types.description" />
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
                  v-if="
                    thumbnailDetails != null || store.types.thumbnail != null
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
                  v-else-if="store.types.thumbnail != null"
                  :src="store.types.thumbnail.get_url"
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
                @click="handleSubmit(updateType)"
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
        msg="آیا از انتقال این تایپ به سطل زباله اطمینان دارید؟"
        @confirm="trashType"
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
