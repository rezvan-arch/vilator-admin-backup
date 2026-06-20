<script>
import useStore from "~~/mixins/store";
export default {
  data() {
    return {
      form: {
        title: "",
        slug: "",
        status: "active",
        display_in_type: [],
        select_detail: [],
        description: "",
        sort_order: null,
        hide_in_single: null,
        display_label: null,
        display_in_filter: 0,
      },
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
      modeOption: [
        {
          label: "ویژگی",
          value: "property_attribute",
        },
        {
          label: "مشخصات ملک",
          value: "property_detail",
        },
      ],
      loading: false,
    };
  },
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ساخت مشخصه جدید ",
    });
    const { attributeStore, adminStore, typesStore } = useStore();

    attributeStore.getAttrsGroups();
    typesStore.getAllType();

    return {
      attributeStore,
      adminStore,
      typesStore,
    };
  },
  unmounted() {
    this.attributeStore.fromDetailsRoute = false;
  },
  methods: {
    addAttr() {
      if (this.form.title == "") {
        this.$toast("لطفا عنوان را وارد کنید", "error", 5000);
        return;
      }

      this.loading = true;

      this.attributeStore
        .addAttribute({
          ...this.form,
          sort_order: this.form.sort_order
            ? Number(this.form.sort_order)
            : null,

          display_label: this.form.display_label ? 1 : 0,
          hide_in_single: this.form.hide_in_single ? 1 : 0,
        })
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 5000);
            this.$router.push(
              `/attributes/attribute/edit/${res.data.id}`
            );
            this.loading = false;
          }
        })
        .catch((err) => {
          var keys = Object.keys(this.adminStore.errors);
          if (keys.length > 0) {
            this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          }
          this.loading = false;
        });
    },
  },
  computed: {
    getFilterType() {
      return this.typesStore.allTypes.filter((item) =>
        this.form.display_in_type.includes(item.slug)
      );
    },
  },
};
</script>
<template>
  <section class="attribute__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">اضافه کردن مشخصه</h4>
      </div>
      <div class="card__body">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="row">
            <div class="controls w-1/2">
              <FormTextInput
                v-model="form.title"
                name="title"
                label="عنوان"
                rules="min:3|required"
                :errors="errors['عنوان']"
              />
              <FormInputShowError errorKey="title" />
            </div>
            <div class="controls w-1/2">
              <FormTextInput
                v-model="form.slug"
                name="slug"
                label="اسلاگ"
                rules="min:3"
                :errors="errors['اسلاگ']"
              />
              <FormInputShowError errorKey="slug" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/2">
              <label for="attribute_group">نمایش در تایپ</label>
              <v-select
                v-model="form.display_in_type"
                id="attribute_group"
                multiple
                :closeOnSelect="false"
                :options="typesStore.allTypes"
                :reduce="(option) => option.slug"
                label="title"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="attribute_group" />
            </div>
            <div class="controls w-1/2">
              <label for="attribute_group">نمایش در مشخصات</label>
              <v-select
                v-model="form.select_detail"
                id="attribute_group"
                multiple
                :closeOnSelect="false"
                :options="getFilterType"
                label="title"
                :reduce="(option) => option.slug"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="attribute_group" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/2">
              <label for="status">وضعیت</label>
              <v-select
                v-model="form.status"
                id="status"
                :options="statusOptions"
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
              <FormInputShowError errorKey="status" />
            </div>
            <div class="controls w-1/3">
              <FormTextInput
                v-model="form.sort_order"
                name="sort_order"
                label="ترتیب مرتب سازی"
                type="number"
                :ltr="true"
                :errors="errors['ترتیب مرتب سازی']"
              />
              <FormInputShowError errorKey="sort_order" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <label for="description">توضیحات</label>
              <rich-editor v-model="form.description" />
              <FormInputShowError errorKey="description" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/2 check_control">
              <div class="flex flex-col">
                <div class="flex items-center mb-4">
                  <input
                    v-model="form.display_label"
                    id="display_label"
                    type="checkbox"
                    value="display_label"
                    class=""
                  />
                  <label for="display_label" class="checkbox_label">
                    نمایش لیبل
                  </label>
                </div>
                <div class="flex items-center mb-4">
                  <input
                    v-model="form.hide_in_single"
                    id="hide_in_single"
                    type="checkbox"
                    value="hide_in_single"
                    class=""
                  />
                  <label for="hide_in_single" class="checkbox_label">
                    مخفی کردن در صفحه سینگل
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <button
                :disabled="loading"
                @click="handleSubmit(addAttr)"
                class="btn btn-primary w-[120px] h-[46px]"
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
