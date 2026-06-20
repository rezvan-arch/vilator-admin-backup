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
      deleteConfirm: false,
      loading: false,
      editLoading: false,
      popup: false,
      editData: null,
      actionId: null,
    };
  },
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ویرایش گروه فیلتر ",
    });
    const {
      filterGroupsStore,
      attributeStore,
      typesStore,
      adminStore,
      indexStore,
    } = useStore();
    const route = useRoute();
    filterGroupsStore.getSingleFilterGroup(route.params.id).then((res) => {
      if (res.status == "success") {
        filterGroupsStore.groupId = res.data.id;
      }
    });

    return {
      filterGroupsStore,
      adminStore,
      indexStore,
      attributeStore,
      typesStore,
    };
  },
  methods: {
    updateFilterGroup() {
      // const body = {
      //   title: this.filterGroupsStore.filters.title,
      //   slug: this.filterGroupsStore.filters.slug,
      //   sort_order: this.filterGroupsStore.filters.sort_order,
      //   status: this.filterGroupsStore.filters.status,
      //   type_ids: this.filterGroupsStore.filters.type.map((item) => item.id),
      // };
      this.loading = true;
      this.filterGroupsStore
        .editFilterGroup(
          {
            ...this.filterGroupsStore.filterGroup,
          },
          this.filterGroupsStore.filterGroup.id
        )
        .then((res) => {
          if (res.status == "success") {
            this.$toast(res.message, "success", 2000);
            this.$router.push("/filters");
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
    deleteFilter() {
      this.deleteConfirm = false;
      this.loading = this.filterGroupsStore.actionId;
      this.filterGroupsStore
        .deleteFilter()
        .then((res) => {
          if (res.status == "success") {
            this.filterGroupsStore.filterGroup.filters =
              this.filterGroupsStore.filterGroup.filters.filter(
                (item) => item.id != this.filterGroupsStore.actionId
              );

            this.$toast("فیلتر مورد نظر حذف شد", "success", 5000);
            this.loading = null;
          }
        })
        .catch((err) => {
          this.loading = null;
        });
    },
    addFilter() {
      this.filterGroupsStore.getSearchAttr();
      this.typesStore.getAllType();
      this.actionId = this.filterGroupsStore.filterGroup.id;
      this.popup = true;
      this.indexStore.showModalFn(true);
      this.editData = null;
    },
    closePopup(data) {
      this.popup = false;
      this.indexStore.showModalFn(false);
      if (data != null && this.editData != null) {
        // this.filterGroupsStore.getSingleFilterGroup(this.$route.params.id);
        // this.filterGroupsStore.filterGroup.filters = data.filters;
      } else if (data != null) {
        this.filterGroupsStore.filterGroup.filters.unshift(data);
      }
      this.editData = null;
    },
    async editItem(id) {
      this.actionId = this.filterGroupsStore.filterGroup.id;
      this.editLoading = id;
      await this.filterGroupsStore.getSingleFilter(id).then(async (res) => {
        if (res.status == "success") {
          await this.attributeStore.getAttrDetailList();
          await this.typesStore.getAllType();
          this.popup = true;
          this.editData = true;
          this.indexStore.showModalFn(true);
          this.editLoading = null;
        }
      });
    },
    deleteItem(data) {
      this.deleteConfirm = true;
      this.filterGroupsStore.actionId = data.id;
    },
  },
};
</script>
<template>
  <section class="group__edit">
    <template v-if="!filterGroupsStore.loading">
      <div class="card">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="card__header">
            <h4 class="heading__title">ویرایش گروه فیلتر</h4>
            <div class="heading__actions">
              <button class="btn btn-primary" @click="addFilter">
                <i class="fa-solid fa-plus"></i>
                اضافه کردن فیلتر
              </button>
              <button
                class="btn btn-primary w-[120px]"
                @click="handleSubmit(updateFilterGroup)"
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
                  v-model="filterGroupsStore.filterGroup.title"
                  name="title"
                  label="عنوان"
                  rules="min:3|required"
                  :errors="errors['عنوان']"
                />
                <FormInputShowError errorKey="title" />
              </div>
              <div class="controls w-1/3">
                <FormTextInput
                  v-model="filterGroupsStore.filterGroup.slug"
                  name="slug"
                  label="اسلاگ"
                  rules="min:3|required"
                  :errors="errors['اسلاگ']"
                />
                <FormInputShowError errorKey="slug" />
              </div>
              <div class="controls w-1/3">
                <label for="status">وضعیت</label>
                <v-select
                  v-model="filterGroupsStore.filterGroup.status"
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
          </div>
        </vForm>
      </div>
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">فیلتر ها</h4>
          <div class="heading__actions">
            <button class="btn btn-primary w-[40px]" @click="addFilter">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
        <div class="card__body">
          <table v-if="filterGroupsStore.filterGroup.filters.length > 0">
            <thead>
              <tr>
                <th>نام مشخصه</th>
                <th>اسلاگ</th>
                <th>نوع کوئری (query_type)</th>
                <th>قانون (rule)</th>
                <th>وضعیت</th>
                <th>تنظیمات</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in filterGroupsStore.filterGroup.filters"
                :key="index"
              >
                <td>
                  <template v-if="item.attribute">
                    {{ item.attribute.title }}
                  </template>
                </td>
                <td>
                  <template v-if="item.attribute">
                    {{ item.attribute.slug }}
                  </template>
                </td>
                <td>
                  <template v-if="item.query_type">
                    {{ item.query_type }}
                  </template>
                </td>
                <td>
                  <template v-if="item.rule">
                    {{ item.rule.join(" , ") }}
                  </template>
                </td>
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
                    <button class="edit__action" @click="editItem(item.id)">
                      <i
                        v-if="editLoading == item.id"
                        class="fa-solid fa-spinner text-xl animate-spin"
                      ></i>
                      <i v-else class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button class="delete__action" @click="deleteItem(item)">
                      <i
                        v-if="loading == item.id"
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
        v-if="deleteConfirm"
        msg="آیا از حذف این فیلتر اطمینان دارید؟"
        @confirm="deleteFilter"
        @closeModal="deleteConfirm = false"
      />
    </transition>
  </teleport>
  <teleport to="body">
    <transition name="fade">
      <AdminFiltersFormModal
        v-if="popup"
        :edit="editData"
        :id="actionId"
        @closeModal="closePopup"
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
