<script>
import useStore from "~~/mixins/store";
export default {
  data() {
    return {
      form: {
        title: "",
        slug: "",
        type_ids: [],
        attribute_ids: [],
        status: "active",
        description: "",
        sort_order: null,
        display_label: false,
        item_styles: {
          grid_column_count: null,
          display_mode: null,
        },
      },
      loading: false,
      column_select: [
        {
          label: "سه ستون",
          value: 3,
        },
        {
          label: "چهار ستون",
          value: 4,
        },
        {
          label: "پنج ستون",
          value: 5,
        },
      ],
      display_select: [
        {
          label: "عادی (normal)",
          value: "normal",
        },
        {
          label: "جمع (collapse)",
          value: "collapse",
        },
      ],
      debounceAttr: null,
    };
  },
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ساخت گروه مشخصه ",
    });
    const { typesStore, attrGroupsStore, adminStore, attributeStore } =
      useStore();

    typesStore.getAllType();
    const type_select = computed(() => {
      return typesStore.allTypes.map((item) => {
        return {
          label: item.title,
          id: item.id,
        };
      });
    });
    attributeStore.getSearchAttr();

    return {
      type_select,
      attrGroupsStore,
      adminStore,
      attributeStore,
    };
  },
  methods: {
    addAttribute() {
      if (this.form.type_ids == "") {
        this.$toast("لطفا تایپ را انتخاب کنید.", "error", 2000);
        return;
      }
      this.loading = true;

      this.attrGroupsStore
        .addAttribute({
          ...this.form,
          display_label: this.form.display_label ? 1 : 0,
          attribute_ids: this.form.attribute_ids.map((a) => a.id),
        })
        .then((res) => {
          if (res.status == "success") {
            this.$toast(res.message, "success", 2000);
            this.$router.push(`/attributes/group`);
            this.loading = false;
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
      this.attributeStore.getSearchAttr(data);
    },
  },
};
</script>
<template>
  <section class="group__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">اضافه کردن گروه مشخصه</h4>
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
                rules="min:3|required"
                :errors="errors['اسلاگ']"
              />
              <FormInputShowError errorKey="slug" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/2">
              <label for="type">تایپ</label>
              <v-select
                v-model="form.type_ids"
                id="type"
                multiple
                :closeOnSelect="false"
                :options="type_select"
                :reduce="(option) => option.id"
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
            <div class="controls w-1/2">
              <label for="status">وضعیت</label>
              <v-select
                v-model="form.status"
                id="status"
                :options="[
                  {
                    label: 'فعال',
                    value: 'active',
                  },
                  {
                    label: 'غیرفعال',
                    value: 'de_active',
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
            <div
              v-if="attrGroupsStore.attributes.item_styles"
              class="controls w-1/3"
            >
              <label for="display_mode">حالت نمایش</label>
              <v-select
                v-model="form.item_styles.display_mode"
                id="display_mode"
                :options="display_select"
                :reduce="(option) => option.value"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="display_mode" />
            </div>
            <div class="controls w-1/3">
              <label for="grid_column_count">ستون های گروه مشخصه</label>
              <v-select
                v-model="form.item_styles.grid_column_count"
                id="grid_column_count"
                :options="column_select"
                :reduce="(option) => option.value"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="grid_column_count" />
            </div>
            <div class="controls w-1/3">
              <label for="sort_order">ترتیب مرتب سازی</label>
              <input
                v-model="form.sort_order"
                type="number"
                id="title"
                class="form-control"
              />
              <FormInputShowError errorKey="sort_order" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <label for="type">مشخصه ها</label>
              <v-select
                v-model="form.attribute_ids"
                id="type"
                multiple
                :closeOnSelect="false"
                :options="attributeStore.searchAttr"
                @search="debounceSearchAttr"
                label="title"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="attribute_ids" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <label for="desc">توضیحات</label>
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
                    نمایش لیبل های آیتم
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <button
                class="btn btn-primary w-[120px] h-[46px]"
                @click="handleSubmit(addAttribute)"
                :disabled="loading"
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
