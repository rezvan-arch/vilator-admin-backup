<script>
import useStore from "~~/mixins/store";
export default {
  props: ["edit", "id"],
  data() {
    return {
      form: {
        status: "active",
        attribute: null,
        attribute_id: "",
        query_type: "",
        type_ids: [],
        rule: [],
        sort_order: null,
        item_styles: {
          tag: "",
          type: "",
          mode: "",
          pos: "",
          size: "",
        },
      },
      debounceAttr: null,
      loading: false,
      editModal: false,
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
      queryOptions: [
        {
          label: "range",
          value: "range",
        },
        {
          label: "whereIn",
          value: "whereIn",
        },
        {
          label: "multiWhere",
          value: "multiWhere",
        },
        {
          label: "where",
          value: "where",
        },
        {
          label: "has",
          value: "has",
        },
      ],
      ruleOptions: [
        {
          label: "number",
          value: "number",
        },
        {
          label: "string",
          value: "string",
        },
        {
          label: "nullable",
          value: "nullable",
        },
        {
          label: "array",
          value: "array",
        },
      ],
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
      posOptions: [
        {
          label: "کنارهم",
          value: "side",
        },
        {
          label: "تک لاین",
          value: "line",
        },
      ],
      sizeOptions: [
        {
          label: "نصف",
          value: "half",
        },
        {
          label: "کامل",
          value: "full",
        },
      ],
    };
  },
  setup() {
    const { filterGroupsStore, adminStore, typesStore } = useStore();

    return {
      adminStore,
      filterGroupsStore,
      typesStore,
    };
  },
  methods: {
    addFilter() {
      if (
        this.form.attribute == null ||
        this.form.filed_type == "" ||
        this.form.query_type == "" ||
        this.form.rule == ""
      ) {
        this.$toast("لطفا تمامی موارد را وارد کنید", "error", 5000);
        return;
      }
      this.loading = true;
      this.filterGroupsStore
        .addFilter({
          ...this.form,
          attribute: undefined,
          attribute_id: this.form.attribute.id,
          group_id: this.filterGroupsStore.groupId,
        })
        .then((res) => {
          if (res.status == "success") {
            this.$emit("closeModal", {
              ...res.data,
              attribute: this.form.attribute,
            });
            this.$toast("فیلتر با موفقیت اضافه شد", "success", 5000);
            this.loading = false;
            this.form = {
              status: "active",
              attribute: null,
              attribute_id: "",
              query_type: "",
              type_ids: [],
              rule: [],
              sort_order: null,
              item_styles: {
                tag: "",
                type: "",
                mode: "",
                pos: "",
                size: "",
              },
            };
          }
        })
        .catch((err) => {
          if (this.adminStore.errors["attribute_id"]) {
            this.$toast(
              this.adminStore.errors["attribute_id"][0],
              "error",
              5000
            );
          }
          this.loading = false;
        });
    },
    editFilter() {
      if (this.form.title == "") {
        this.$toast("لطفا عنوان را وارد کنید", "error", 5000);
        return;
      }
      this.loading = true;

      this.filterGroupsStore
        .editFilter(
          {
            ...this.form,
            group_id: this.filterGroupsStore.groupId,
          },
          this.filterGroupsStore.singleFilter.id
        )
        .then((res) => {
          if (res.status == "success") {
            this.$emit("closeModal", res.data);
            this.$toast("فیلتر با موفقیت ویرایش شد", "success", 5000);
            this.form = {
              status: "active",
              attribute: null,
              attribute_id: "",
              query_type: "",
              type_ids: [],
              rule: [],
              sort_order: null,
              item_styles: {
                tag: "",
                type: "",
                mode: "",
                pos: "",
                size: "",
              },
            };
            this.loading = false;
          }
        })
        .catch((err) => {
          if (this.adminStore.errors["attribute_id"]) {
            this.$toast(
              this.adminStore.errors["attribute_id"][0],
              "error",
              5000
            );
          }
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
      this.filterGroupsStore.getSearchAttr(data);
    },
    checkTypes() {
      let attrTypes = this.edit
        ? this.filterGroupsStore.singleFilter.display_in_types
        : this.form.attribute.display_in_type;

      const array = [];
      this.typesStore.allTypes.forEach((item) => {
        if (attrTypes.includes(item.slug)) {
          array.push(item.id);
        }
      });

      this.form.type_ids = array;
    },
  },
  computed: {
    typeOptions() {
      let array = [];
      switch (this.form.item_styles.tag) {
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
              label: "ساده",
              value: "sample",
            },
            {
              label: "دکمه ای",
              value: "button",
            },
            {
              label: "گرد",
              value: "round",
            },
          ];
          break;
      }
      return array;
    },
    modeOptions() {
      let array = [];
      switch (this.form.item_styles.tag) {
        case "input":
          array = [
            {
              label: "دو اینپوت",
              mode: "two_input",
            },
            {
              label: "تک اینپوت",
              value: "one_input",
            },
          ];
          break;
        case "checkbox":
          array = [
            {
              label: "تک",
              value: "single",
            },
          ];
          break;
      }
      return array;
    },
  },
  created() {
    if (this.edit) {
      this.editModal = true;

      this.form = {
        status: this.filterGroupsStore.singleFilter.status,
        attribute: this.filterGroupsStore.singleFilter.attribute,
        attribute_id: this.filterGroupsStore.singleFilter.attribute.id,
        query_type: this.filterGroupsStore.singleFilter.query_type,
        attribute_group: "property_attribute",

        rule: this.filterGroupsStore.singleFilter.rule,
        sort_order: Number(this.filterGroupsStore.singleFilter.sort_order),
        item_styles: this.filterGroupsStore.singleFilter.item_styles,
      };

      this.checkTypes();
    }
  },
};
</script>
<template>
  <div @click.self="" class="upload__modal">
    <div class="modal__base">
      <div class="modal__header">
        <h2 v-if="editModal">ویرایش فیلتر</h2>
        <h2 v-else>اضافه کردن فیلتر</h2>

        <button class="close__btn" type="button" @click="$emit('closeModal')">
          <i class="fa-regular fa-xmark"></i>
        </button>
      </div>
      <div class="modal__body">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="form px-3">
            <div class="row">
              <div class="controls w-1/3">
                <label for="status">مشخصه</label>
                <v-select
                  v-model="form.attribute"
                  label="title"
                  id="status"
                  :options="filterGroupsStore.searchAttr"
                  :clearable="false"
                  autocomplete="off"
                  @option:selected="checkTypes"
                  @search="debounceSearchAttr"
                  :filterable="false"
                >
                  <template #no-options>
                    <p class="text-sm opacity-60 text-center">
                      گزینه مورد نظر پیدا نشد
                    </p>
                  </template>
                </v-select>
              </div>
              <div class="controls w-1/3">
                <label for="tag">نوع کوئری (query_type)</label>
                <v-select
                  v-model="form.query_type"
                  id="tag"
                  :options="queryOptions"
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
              </div>
              <div class="controls w-1/3">
                <label for="status">قانون (rule)</label>
                <v-select
                  v-model="form.rule"
                  :reduce="(option) => option.value"
                  id="status"
                  :options="ruleOptions"
                  :clearable="false"
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
              </div>
            </div>
            <div class="row">
              <!-- <div class="controls w-1/3">
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
              </div>
              <div class="controls w-1/3">
                <label for="status">نوع ملک</label>
                <v-select
                  v-model="form.type_ids"
                  :reduce="(option) => option.id"
                  id="status"
                  :options="typesStore.allTypes"
                  :clearable="false"
                  label="title"
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
              </div> -->
              <!-- <div class="controls w-1/3">
                <label for="sort_order">ترتیب مرتب سازی</label>
                <input
                  v-model="form.sort_order"
                  type="number"
                  id="title"
                  class="form-control"
                />
              </div> -->
            </div>
            <!-- <div class="row">
              <div class="controls w-1/3">
                <label for="tag">تگ فیلتر</label>
                <v-select
                  v-model="form.item_styles.tag"
                  id="tag"
                  :options="tagOptions"
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
              </div>
              <div class="controls w-1/3">
                <label for="tag">نوع فیلتر</label>
                <v-select
                  v-model="form.item_styles.type"
                  id="tag"
                  :options="typeOptions"
                  :clearable="false"
                  :reduce="(option) => option.value"
                  :disabled="form.item_styles.tag == 'radio'"
                  autocomplete="off"
                >
                  <template #no-options>
                    <p class="text-sm opacity-60 text-center">
                      گزینه مورد نظر پیدا نشد
                    </p>
                  </template>
                </v-select>
              </div>
              <div class="controls w-1/3">
                <label for="tag">حالت فیلتر</label>
                <v-select
                  v-model="form.item_styles.mode"
                  id="tag"
                  :options="modeOptions"
                  :clearable="false"
                  :reduce="(option) => option.value"
                  :disabled="
                    form.item_styles.tag != 'input' &&
                    form.item_styles.tag != 'checkbox'
                  "
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
              <div class="controls w-1/3">
                <label for="tag">موقعیت فیلتر</label>
                <v-select
                  v-model="form.item_styles.pos"
                  id="tag"
                  :options="posOptions"
                  :clearable="false"
                  :reduce="(option) => option.value"
                  :disabled="
                    form.item_styles != 'input' || form.item_styles.mode == 'one_input'
                  "
                  autocomplete="off"
                >
                  <template #no-options>
                    <p class="text-sm opacity-60 text-center">
                      گزینه مورد نظر پیدا نشد
                    </p>
                  </template>
                </v-select>
              </div>
              <div class="controls w-1/3">
                <label for="tag">سایز فیلتر</label>
                <v-select
                  v-model="form.item_styles.size"
                  id="tag"
                  :options="sizeOptions"
                  :clearable="false"
                  :reduce="(option) => option.value"
                  :disabled="
                    form.item_styles.tag == 'input' || form.item_styles.tag == 'select'
                  "
                  autocomplete="off"
                >
                  <template #no-options>
                    <p class="text-sm opacity-60 text-center">
                      گزینه مورد نظر پیدا نشد
                    </p>
                  </template>
                </v-select>
              </div>
            </div> -->
          </div>
          <div class="action">
            <button
              v-if="editModal"
              class="btn btn-success ml-2 w-[120px]"
              :disabled="loading"
              @click="handleSubmit(editFilter)"
            >
              <template v-if="loading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else> ویرایش </template>
            </button>
            <button
              v-else
              class="btn btn-success ml-2 w-[120px]"
              :disabled="loading"
              @click="handleSubmit(addFilter)"
            >
              <template v-if="loading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else> اضافه کردن </template>
            </button>
            <button
              class="btn btn-elevated"
              :disabled="loading"
              @click="$emit('closeModal')"
            >
              انصراف
            </button>
          </div>
        </vForm>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.upload__modal {
  @apply fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center;

  .modal__base {
    box-shadow: 0 2px 18px 1px rgb(49 53 72 / 10%);
    @apply rounded-lg bg-white w-[1024px];

    .modal__header {
      @apply flex py-[10px] px-4  relative border-b bg-gray-200 rounded-t-lg;

      h2 {
        @apply text-base font-bold py-1;
      }
      button {
        @apply absolute left-2 top-2 h-6 w-6 border border-[#a6aab4] rounded-md px-2 flex items-center text-xs text-black;
      }
    }

    .form {
      @apply py-4;
    }

    .action {
      @apply pt-3 pb-4 px-4 flex items-center justify-end gap-2 border-t;

      button {
        @apply h-[38px] py-0 disabled:opacity-75 flex items-center justify-center;
      }
    }
  }
}
</style>
