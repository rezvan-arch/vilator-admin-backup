<script>
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
import useStore from "~~/mixins/store";
export default {
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
      tagOptions: [
        {
          label: "اینپوت (input)",
          value: "input",
        },
        {
          label: "اینپوت چند انتخابی (checkbox)",
          value: "checkbox",
        },
        {
          label: "دکمه رادیویی (Radio button)",
          value: "radio",
        },
        {
          label: "لیست کشویی (select)",
          value: "select",
        },
      ],
      adminWidthOptions: [
        {
          label: "تمام عرض",
          value: "w-full",
        },
        {
          label: "نصف صفحه",
          value: "w-1/2",
        },
      ],
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
        {
          label: "شش ستون",
          value: 6,
        },
      ],
      items: [
        {
          id: 1,
          title: "",
          slug: "",
          status: "active",
        },
      ],
      deleteConfirm: false,
      popup: false,
      editData: null,
      actionId: null,
      loading: false,
      deleteLoading: false,
      form: {
        title: "",
        slug: "",
        status: "active",
        thumbnail_id: null,
        display_label: false,
        hide_in_single: false,
        display_in_filter: false,
        display_in_type: [null],
      },
      newOptionLoading: false,
      editModal: false,
      galleryPopup: false,
      thumbnailDetails: null,
      showForm: false,
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
    };
  },
  async setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ویرایش مشخصه",
    });
    const { attributeStore, indexStore, adminStore, typesStore } = useStore();
    const route = useRoute();
    const router = useRouter();
    await attributeStore.getSingleAttribute(route.params.id).then((res) => {
      if (res.status == "success") {
        if (res.data.parent != null) {
          router.push("/attributes/attribute/edit/" + res.data.parent.id);
        }
      }
    });
    attributeStore.getAttrsGroups();
    typesStore.getAllType();
    return {
      attributeStore,
      indexStore,
      adminStore,
      typesStore,
    };
  },
  methods: {
    editAttr() {
      if (
        this.attributeStore.attributes.attribute_group.length == 0 &&
        this.attributeStore.attributes.group == "property_attribute"
      ) {
        this.$toast("لطفا گروه مشخصه را وارد کنید", "error", 5000);
        return;
      }
      this.loading = true;
      this.attributeStore
        .editAttribute(
          {
            ...this.attributeStore.attributes,
            sort_order: this.attributeStore.attributes.sort_order
              ? Number(this.attributeStore.attributes.sort_order)
              : null,
            hide_in_single: this.attributeStore.attributes.hide_in_single
              ? 1
              : 0,
            display_label: this.attributeStore.attributes.display_label ? 1 : 0,
          },
          this.attributeStore.attributes.id
        )
        .then((res) => {
          if (res.status == "success") {
            this.$toast("مشخصه موردنظر با موفقیت ویرایش شد", "success", 5000);
            this.loading = false;
          }
        })
        .catch((err) => {
          var keys = Object.keys(this.adminStore.errors);
          this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          this.loading = false;
        });
    },
    addOptions() {
      this.actionId = this.attributeStore.attributes.id;
      this.popup = true;
      this.indexStore.showModalFn(true);
    },
    closePopup(data) {
      if (data != null && this.editData == null) {
        this.attributeStore.attributes.options.push({
          id: data._id,
          title: data.title,
          slug: data.slug,
          status: data.status,
        });
      } else if (data != null) {
        this.attributeStore.attributes.options.forEach((item) => {
          if (item.id == data.id) {
            item.title = data.title;
            item.slug = data.slug;
            item.status = data.status;
          }
        });
      }
      this.editData = null;
    },
    editItem(data) {
      this.editData = data;
      this.editModal = true;
      this.form = JSON.parse(JSON.stringify(data));

      this.form.display_in_filter = this.form.display_in_filter == 1;
      this.form.hide_in_single = this.form.hide_in_single == 1;
      this.form.display_label = this.form.display_label == 1;

      this.thumbnailDetails = data.thumbnail;
      if (!this.showForm) this.collapseFilter();
      this.$router.push({
        hash: "#new__option",
      });
    },
    deleteOption() {
      this.deleteConfirm = false;
      this.deleteLoading = this.attributeStore.actionAttrId;
      this.attributeStore
        .deleteAttr()
        .then((res) => {
          if (res.status == "success") {
            this.attributeStore.attributes.options =
              this.attributeStore.attributes.options.filter(
                (item) => item.id != this.attributeStore.actionAttrId
              );

            this.$toast("آپشن مورد نظر حذف شد", "success", 5000);
            this.deleteLoading = null;
            this.attributeStore.actionAttrId = null;
          }
        })
        .catch((err) => {
          this.deleteLoading = null;
        });
    },
    deleteItem(data) {
      this.deleteConfirm = true;
      this.attributeStore.actionAttrId = data.id;
    },
    addOption() {
      if (this.form.title == "") {
        this.$toast("لطفا تمامی موارد را وارد کنید", "error", 5000);
        return;
      }
      this.newOptionLoading = true;

      this.attributeStore
        .addAttribute({
          ...this.form,
          parent_id: this.attributeStore.attributes.id,
          display_label: this.form.display_label ? 1 : 0,
          hide_in_single: this.form.hide_in_single ? 1 : 0,
          display_in_filter: this.form.display_in_filter ? 1 : 0,
          display_in_type: [null],
        })
        .then((res) => {
          if (res.status == "success") {
            this.form = {
              title: "",
              slug: "",
              status: "active",
              thumbnail_id: null,
              parent_id: this.attributeStore.attributes.id,
              display_label: false,
              display_in_filter: false,
              hide_in_single: false,
              display_in_type: [null],
            };
            this.thumbnailDetails = null;
            this.closePopup(res.data);
            this.$toast("آپشن با موفقیت اضافه شد", "success", 5000);
            this.collapseFilter();
            this.newOptionLoading = false;
          }
        })
        .catch((err) => {
          var keys = Object.keys(this.adminStore.errors);
          this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          this.newOptionLoading = false;
        });
    },
    editOption() {
      if (this.form.title == "") {
        this.$toast("لطفا عنوان را وارد کنید", "error", 5000);
        return;
      }
      this.newOptionLoading = true;

      this.attributeStore
        .editAttrOption(
          {
            title: this.form.title,
            slug: this.form.slug,
            status: this.form.status,
            thumbnail_id: this.form.thumbnail_id,
            parent_id: this.attributeStore.attributes.id,
            display_label: this.form.display_label ? 1 : 0,
            display_in_filter: this.form.display_in_filter ? 1 : 0,
            hide_in_single: this.form.hide_in_single ? 1 : 0,
            display_in_type: [null],
            select_detail: [],
          },
          this.editData.id
        )
        .then((res) => {
          if (res.status == "success") {
            this.$toast("آپشن با موفقیت ویرایش شد", "success", 5000);
            this.attributeStore.attributes.options =
              this.attributeStore.attributes.options.map((item) => {
                if (item.id == this.editData.id) {
                  item = res.data;
                  item.thumbnail = this.thumbnailDetails;
                }
                return item;
              });
            this.closePopup({ ...this.form, id: this.editData.id });
            this.collapseFilter();
            this.form = {
              title: "",
              slug: "",
              status: "active",
              thumbnail_id: null,
              parent_id: this.attributeStore.attributes.id,
              display_label: false,
              display_in_filter: false,
              hide_in_single: false,
              display_in_type: [null],
            };
            this.thumbnailDetails = null;
            this.newOptionLoading = false;
          }
        })
        .catch((err) => {
          var keys = Object.keys(this.adminStore.errors);
          this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          this.newOptionLoading = false;
        });
    },
    setThumbnail() {
      this.indexStore.showModalFn(true);
      this.galleryPopup = true;
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
    clearThumbnail() {
      this.thumbnailDetails = null;
      this.form.thumbnail_id = null;
    },
    collapseFilter() {
      this.showForm = !this.showForm;
      if (this.showForm) {
        this.$refs.addOption.style.maxHeight =
          this.$refs.addOption.scrollHeight + 48 + "px";
        this.$refs.addOption.style.padding = "1.5rem";
        this.$refs.addOption.style.opacity = "1";
      } else {
        this.$refs.addOption.style.maxHeight = null;
        this.$refs.addOption.style.padding = null;
        this.$refs.addOption.style.opacity = null;
      }
    },
    cancelOption() {
      this.collapseFilter();
      this.form = {
        title: "",
        slug: "",
        status: "active",
        thumbnail_id: null,
      };
      this.thumbnailDetails = null;

      this.editData = null;
      this.editModal = false;
    },
  },
  computed: {
    typeOptions() {
      let array = [];
      if (
        this.attributeStore.attributes.item_styles &&
        this.attributeStore.attributes.item_styles.tag
      ) {
        switch (this.attributeStore.attributes.item_styles.tag) {
          case "input":
            array = [
              {
                label: "اینپوت متنی",
                value: "text",
              },
              {
                label: "اینپوت عددی",
                value: "number",
              },
            ];
            break;
          case "select":
            array = [
              {
                label: "سلکت تکی",
                value: "single",
              },
              {
                label: "سلکت چند انتخابی",
                value: "multi",
              },
            ];
            break;
          case "checkbox":
            array = [
              {
                label: "چک باکس تکی",
                value: "single",
              },
              {
                label: "چک باکس چند انتخابی",
                value: "multi",
              },
            ];
            break;
        }
      }

      if (array.length == 0) {
        this.attributeStore.attributes.item_styles.type = "";
      }
      return array;
    },
    getFilterType() {
      return this.typesStore.allTypes.filter((item) => {
        if (this.attributeStore.attributes.display_in_type)
          return this.attributeStore.attributes.display_in_type.includes(
            item.slug
          );
      });
    },
  },
  components: { ConfirmModal },
};
</script>
<template>
  <section class="attribute__edit">
    <template v-if="!attributeStore.loading">
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
              توجه داشته باشید با ویرایش مشخصه ممکن است در صفحه ملک مشکلاتی به
              وجود آید
            </p>
          </div>
        </div>
      </div>
      <div class="card">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="card__header">
            <h4 class="heading__title">ویرایش مشخصه ملک</h4>
            <div class="heading__actions">
              <nuxt-link
                v-if="
                  attributeStore.attributes.item_styles &&
                  attributeStore.attributes.item_styles.tag &&
                  attributeStore.attributes.item_styles.tag != '' &&
                  attributeStore.attributes.item_styles.tag != 'input' &&
                  attributeStore.attributes.item_styles.type != 'single' &&
                  attributeStore.attributes.item_styles.type != null
                "
                class="btn btn-primary"
                @click="collapseFilter"
                to="#new__option"
              >
                <i class="fa-solid fa-plus"></i>
                اضافه کردن آپشن
              </nuxt-link>
              <button
                class="btn btn-primary w-[120px]"
                @click="handleSubmit(editAttr)"
                :disabled="loading"
              >
                <template v-if="loading">
                  <i
                    class="fa-solid fa-spinner text-white text-xl animate-spin"
                  ></i>
                </template>
                <template v-else> بروزرسانی </template>
              </button>
            </div>
          </div>
          <div class="card__body">
            <div class="row">
              <div class="controls w-1/3">
                <FormTextInput
                  v-model="attributeStore.attributes.title"
                  name="title"
                  label="عنوان"
                  rules="min:3|required"
                  :errors="errors['عنوان']"
                />
                <FormInputShowError errorKey="title" />
              </div>
              <div class="controls w-1/3">
                <FormTextInput
                  v-model="attributeStore.attributes.slug"
                  name="slug"
                  label="اسلاگ"
                  rules="min:3"
                  :errors="errors['اسلاگ']"
                />
                <FormInputShowError errorKey="slug" />
              </div>
              <div class="controls w-1/3">
                <label for="status">وضعیت</label>
                <v-select
                  v-model="attributeStore.attributes.status"
                  id="status"
                  :options="statusOptions"
                  :clearable="false"
                  :reduce="(option) => option.value"
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
              <div class="controls w-1/2">
                <label for="attribute_group">نمایش در تایپ</label>
                <v-select
                  v-model="attributeStore.attributes.display_in_type"
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
                  v-model="attributeStore.attributes.select_detail"
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
              <div
                v-if="attributeStore.attributes.item_styles"
                class="controls w-1/3"
              >
                <label for="tag">ساختار مشخصه</label>
                <v-select
                  v-model="attributeStore.attributes.item_styles['tag']"
                  id="tag"
                  :options="tagOptions"
                  :clearable="false"
                  :reduce="(option) => option.value"
                  @option:selected="
                    attributeStore.attributes.item_styles['type'] = null
                  "
                  autocomplete="off"
                >
                  <template #no-options>
                    <p class="text-sm opacity-60 text-center">
                      گزینه مورد نظر پیدا نشد
                    </p>
                  </template>
                </v-select>
                <FormInputShowError errorKey="tag" />
              </div>
              <div
                v-if="attributeStore.attributes.item_styles"
                class="controls w-1/3"
              >
                <label for="type">حالت نمایش مشخصه</label>
                <v-select
                  v-model="attributeStore.attributes.item_styles.type"
                  id="type"
                  :options="typeOptions"
                  :clearable="false"
                  :reduce="(option) => option.value"
                  :disabled="typeOptions.length == 0"
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
              <div
                v-if="attributeStore.attributes.item_styles"
                class="controls w-1/3"
              >
                <label for="admin_panel_item_width">حالت نمایش مشخصه</label>
                <v-select
                  v-model="
                    attributeStore.attributes.item_styles.admin_panel_item_width
                  "
                  id="admin_panel_item_width"
                  :options="adminWidthOptions"
                  :clearable="false"
                  :reduce="(option) => option.value"
                  autocomplete="off"
                >
                  <template #no-options>
                    <p class="text-sm opacity-60 text-center">
                      گزینه مورد نظر پیدا نشد
                    </p>
                  </template>
                </v-select>
                <FormInputShowError errorKey="admin_panel_item_width" />
              </div>
            </div>
            <div class="row">
              <div
                class="controls w-1/3"
                v-if="
                  attributeStore.attributes.item_styles &&
                  attributeStore.attributes.item_styles.tag == 'checkbox' &&
                  attributeStore.attributes.item_styles.type == 'multi'
                "
              >
                <label for="grid_column_count">ستون های گروه مشخصه</label>
                <v-select
                  v-model="
                    attributeStore.attributes.item_styles.grid_column_count
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
                <FormTextInput
                  v-model="attributeStore.attributes.sort_order"
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

                <rich-editor v-model="attributeStore.attributes.description" />
                <FormInputShowError errorKey="description" />
              </div>
            </div>
            <div class="row">
              <div class="controls w-1/2 check_control">
                <div class="flex flex-col">
                  <div class="flex items-center mb-4">
                    <input
                      v-model="attributeStore.attributes.display_label"
                      id="display_label"
                      type="checkbox"
                      value="display_label"
                      class=""
                      :disabled="
                        attributeStore.attributes.item_styles.tag ==
                          'checkbox' &&
                        attributeStore.attributes.item_styles.type == 'single'
                      "
                    />
                    <label for="display_label" class="checkbox_label">
                      نمایش لیبل
                    </label>
                  </div>
                  <div class="flex items-center mb-4">
                    <input
                      v-model="attributeStore.attributes.hide_in_single"
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
          </div>
        </vForm>
      </div>

      <template
        v-if="
          attributeStore.attributes.item_styles &&
          attributeStore.attributes.item_styles.tag &&
          attributeStore.attributes.item_styles.tag != '' &&
          attributeStore.attributes.item_styles.tag != 'input'
        "
      >
        <div
          v-if="
            attributeStore.attributes.item_styles.tag == 'radio' ||
            attributeStore.attributes.item_styles.tag == 'select' ||
            (attributeStore.attributes.item_styles.tag == 'checkbox' &&
              attributeStore.attributes.item_styles.type == 'multi')
          "
          class="card"
        >
          <div class="card__header">
            <h4 class="heading__title">آپشن های مشخصه</h4>
            <div class="heading__actions">
              <button class="btn btn-primary w-[40px]" @click="collapseFilter">
                <i v-if="!showForm" class="fa-solid fa-plus"></i>
                <i v-else class="fa-solid fa-minus"></i>
              </button>
            </div>
          </div>
          <div class="card__body">
            <div class="new__option" id="new__option" ref="addOption">
              <vForm v-slot="{ errors, handleSubmit }" as="form">
                <div class="form">
                  <div class="row">
                    <div class="controls w-2/6">
                      <FormTextInput
                        v-model="form.title"
                        name="link"
                        label="عنوان"
                        class="form-control"
                      />
                    </div>
                    <div class="controls w-2/6">
                      <FormTextInput
                        v-model="form.slug"
                        name="slug"
                        label="اسلاگ"
                        class="form-control"
                      />
                    </div>
                    <div class="controls w-2/12">
                      <label for="status">وضعیت</label>
                      <v-select
                        v-model="form.status"
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
                  <div class="row px-4">
                    <div class="controls thumbnail_box">
                      <button
                        class="btn btn-primary"
                        type="button"
                        @click="setThumbnail"
                      >
                        انتخاب آیکون
                      </button>
                      <div class="thumbnail relative">
                        <div
                          class="delete"
                          @click="clearThumbnail()"
                          v-if="
                            thumbnailDetails != null ||
                            form.thumbnail_id != null
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
                          v-else
                          src="/images/no-photo-available.png"
                          alt="" loading="lazy" format="webp"
                        />
                      </div>
                    </div>
                    <div class="controls w-full check_control">
                      <div class="flex flex-row gap-8">
                        <div class="flex items-center mb-4">
                          <input
                            v-model="form.display_label"
                            id="display_label_option"
                            type="checkbox"
                            value="display_label_option"
                            class=""
                          />
                          <label
                            for="display_label_option"
                            class="checkbox_label"
                          >
                            نمایش لیبل
                          </label>
                        </div>
                        <div class="flex items-center mb-4">
                          <input
                            v-model="form.hide_in_single"
                            id="hide_in_single_option"
                            type="checkbox"
                            value="hide_in_single_option"
                            class=""
                          />
                          <label
                            for="hide_in_single_option"
                            class="checkbox_label"
                          >
                            مخفی کردن در صفحه سینگل
                          </label>
                        </div>
                        <div class="flex items-center mb-4">
                          <input
                            v-model="form.display_in_filter"
                            id="display_in_filter"
                            type="checkbox"
                            value="display_in_filter"
                            class=""
                          />
                          <label for="display_in_filter" class="checkbox_label">
                            نمایش در فیلتر
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="action">
                  <button
                    v-if="editModal"
                    class="btn btn-success ml-2 w-[120px]"
                    :disabled="form.title == '' || newOptionLoading"
                    type="button"
                    @click="handleSubmit(editOption)"
                  >
                    <template v-if="newOptionLoading">
                      <i
                        class="fa-solid fa-spinner text-white text-xl animate-spin"
                      ></i>
                    </template>
                    <template v-else> ویرایش </template>
                  </button>
                  <button
                    v-else
                    class="btn btn-success ml-2 w-[120px]"
                    :disabled="form.title == '' || newOptionLoading"
                    type="button"
                    @click="handleSubmit(addOption)"
                  >
                    <template v-if="newOptionLoading">
                      <i
                        class="fa-solid fa-spinner text-white text-xl animate-spin"
                      ></i>
                    </template>
                    <template v-else> اضافه کردن </template>
                  </button>
                  <button
                    class="btn btn-elevated"
                    :disabled="newOptionLoading"
                    @click="cancelOption"
                    type="button"
                  >
                    انصراف
                  </button>
                </div>
              </vForm>
            </div>
            <table v-if="attributeStore.attributes.options.length > 0">
              <thead>
                <tr>
                  <th>آیکون</th>
                  <th>عنوان</th>
                  <th>اسلاگ</th>
                  <th>وضعیت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in attributeStore.attributes.options"
                  :key="index"
                >
                  <td class="w-[75px]">
                    <template v-if="item.thumbnail">
                      <img  :src="item.thumbnail.get_url" alt="" loading="lazy" format="webp" />
                    </template>
                    <template v-else>
                      <img  src="/images/no-photo-available.png" alt="" loading="lazy" format="webp" />
                    </template>
                  </td>
                  <td>{{ item.title }}</td>
                  <td>{{ item.slug }}</td>
                  <td>
                    <div class="flex gap-1">
                      <span
                        v-if="item.status == 'active'"
                        class="badge badge-pill badge-success"
                      >
                        فعال
                      </span>
                      <span v-else class="badge badge-pill badge-primary">
                        غیر فعال
                      </span>
                    </div>
                  </td>
                  <td class="setting">
                    <div class="actions">
                      <button class="edit__action" @click="editItem(item)">
                        <i class="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button class="delete__action" @click="deleteItem(item)">
                        <i
                          v-if="deleteLoading == item.id"
                          class="fa-solid fa-spinner text-xl animate-spin"
                        ></i>
                        <i v-else class="fa-regular fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
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

  <ConfirmModal
    v-if="deleteConfirm"
    msg="آیا از حذف این آپشن اطمینان دارید؟"
    @confirm="deleteOption"
    @closeModal="deleteConfirm = false"
  />
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

.heading__actions button {
  @apply h-[46px] flex items-center gap-2 justify-center;
}

.new__option {
  @apply mb-5 max-h-0 duration-500 transition-all overflow-hidden rounded-md opacity-0 px-5  border-2;

  .action {
    @apply pt-3 pb-4 px-4 flex items-center justify-end gap-2 border-t;

    button {
      @apply h-[38px] py-0 disabled:opacity-75 flex items-center justify-center;
    }
  }

  .thumbnail_box {
    @apply flex border border-[#babfc7] items-center gap-4 rounded-md justify-between p-3;

    .thumbnail {
      img {
        @apply max-w-[100px] w-[100px] h-[66px] object-cover;
      }
    }

    button {
      @apply text-sm;
    }
    .delete {
      @apply text-red-500 bg-white absolute -top-2 -left-2 cursor-pointer h-5 w-5 flex items-center justify-center rounded-full border-black;

      i {
        @apply text-base;
      }
    }
  }
}

.action {
  @apply mt-4;
}
</style>
