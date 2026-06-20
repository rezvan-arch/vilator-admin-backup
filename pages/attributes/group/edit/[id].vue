<script>
import useStore from "~~/mixins/store";
export default {
  data() {
    return {
      form: {
        title: "",
        type: "",
        status: "",
        description: "",
      },
      trashConfirm: false,
      loading: false,
      trashLoading: false,
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
    };
  },
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ویرایش گروه مشخصه ",
    });
    const { attrGroupsStore, typesStore, adminStore, attributeStore } =
      useStore();
    const route = useRoute();
    attrGroupsStore.getSingleAttribute(route.params.id);

    typesStore.getAllType();
    const type_select = computed(() => {
      return typesStore.allTypes;
    });

    attributeStore.getSearchAttr();

    return { attrGroupsStore, type_select, adminStore, attributeStore };
  },
  methods: {
    updateType() {
      this.loading = true;
      console.log(this.attrGroupsStore.attributes.display_label);
      this.attrGroupsStore
        .editType(
          {
            ...this.attrGroupsStore.attributes,
            display_label: this.attrGroupsStore.attributes.display_label
              ? 1
              : 0,
            type_ids: this.attrGroupsStore.attributes.types.map(
              (item) => item.id
            ),
            attribute_ids: this.attrGroupsStore.attributes.attributes.map(
              (item) => item.id
            ),
          },
          this.attrGroupsStore.attributes.id
        )
        .then((res) => {
          if (res.status == "success") {
            this.$toast(res.message, "success", 2000);
            this.$router.push("/attributes/group");
            this.loading = false;
          }
        })
        .catch((err) => {
          if (this.adminStore.errors["slug"]) {
            this.$toast(this.adminStore.errors["slug"][0], "error", 5000);
          }

          this.loading = false;
        });
    },
    trashAttribute() {
      this.attrGroupsStore.actionAttrId = this.attrGroupsStore.attributes.id;
      this.trashLoading = true;
      this.$toast("منتظر بمانید...", "info", 2000);
      this.trashConfirm = false;
      this.attrGroupsStore
        .trashAttribute()
        .then(() => {
          this.attrGroupsStore.actionAttrId = "";
          this.$router.push(`/attributes/group`);
          this.trashLoading = false;
        })
        .catch((err) => {
          this.trashLoading = false;
        });
    },
    debounceSearchAttr(data) {
      clearTimeout(this.debounceCategory);
      this.debounceCategory = setTimeout(() => {
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
  <section class="group__edit">
    <template v-if="!attrGroupsStore.loading">
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">ویرایش گروه مشخصه</h4>
          <div class="heading__actions">
            <nuxt-link to="/attributes/group/new" class="btn btn-primary">
              <i class="fa-regular fa-plus"></i>
              گروه مشخصه جدید
            </nuxt-link>
            <button
              :disabled="trashLoading"
              @click="trashConfirm = true"
              class="btn btn-danger w-[140px]"
            >
              <template v-if="trashLoading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else>
                <i class="fa-regular fa-trash"></i>
                حذف گروه مشخصه
              </template>
            </button>
            <nuxt-link to="/attributes/group" class="btn btn-primary">
              <i class="fa-regular fa-list"></i>
              لیست گروه مشخصه
            </nuxt-link>
          </div>
        </div>
        <div class="card__body">
          <vForm v-slot="{ errors, handleSubmit }" as="">
            <div class="row">
              <div class="controls w-1/2">
                <FormTextInput
                  v-model="attrGroupsStore.attributes.title"
                  name="title"
                  label="عنوان"
                  rules="min:3|required"
                  :errors="errors['عنوان']"
                />
                <FormInputShowError errorKey="title" />
              </div>
              <div class="controls w-1/2">
                <FormTextInput
                  v-model="attrGroupsStore.attributes.slug"
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
                  v-model="attrGroupsStore.attributes.types"
                  id="type"
                  multiple
                  :closeOnSelect="false"
                  label="title"
                  :options="type_select"
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
              <div class="controls w-1/2">
                <label for="status">وضعیت</label>
                <v-select
                  v-model="attrGroupsStore.attributes.status"
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
                <FormInputShowError errorKey="status" />
              </div>
            </div>
            <div class="row">
              <div
                v-if="attrGroupsStore.attributes.item_styles"
                class="controls w-1/3"
              >
                <label for="display_mode">حالت نمایش</label>
                <v-select
                  v-model="attrGroupsStore.attributes.item_styles.display_mode"
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
              <div
                v-if="attrGroupsStore.attributes.item_styles"
                class="controls w-1/3"
              >
                <label for="grid_column_count">ستون های گروه مشخصه</label>
                <v-select
                  v-model="
                    attrGroupsStore.attributes.item_styles.grid_column_count
                  "
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
                  v-model="attrGroupsStore.attributes.sort_order"
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
                  v-model="attrGroupsStore.attributes.attributes"
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
                <rich-editor v-model="attrGroupsStore.attributes.description" />
                <FormInputShowError errorKey="description" />
              </div>
            </div>
            <div class="row">
              <div class="controls w-1/2 check_control">
                <div class="flex flex-col">
                  <div class="flex items-center mb-4">
                    <input
                      v-model="attrGroupsStore.attributes.display_label"
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
                  @click="handleSubmit(updateType)"
                  :disabled="loading"
                >
                  <template v-if="loading">
                    <i
                      class="fa-solid fa-spinner text-white text-xl animate-spin"
                    ></i>
                  </template>
                  <template v-else>بروزرسانی</template>
                </button>
              </div>
            </div>
          </vForm>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="card">
        <div class="card__body">
          <div>درحال بارگذاری...</div>
        </div>
      </div>
    </template>
  </section>
  <teleport to="body">
    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="trashConfirm"
        msg="آیا از انتقال این گروه مشخصه به سطل زباله اطمینان دارید؟"
        @confirm="trashAttribute()"
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

.checkbox_label {
  margin-bottom: 0 !important;
  @apply inline-block mr-2 text-sm font-medium text-gray-900;
}

.check_control {
  @apply flex items-center pt-6;
}
</style>
