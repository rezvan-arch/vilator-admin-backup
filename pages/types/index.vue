<script setup>
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
import { typesStore } from "~~/store/admin/types";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | تایپ ها",
});

// variables
const store = typesStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const trashConfirm = ref(false);
const deleteLoading = ref(null);
const showFilter = ref(false);
const filterBody = ref(null);
const { $toast } = useNuxtApp();
const statusOption = [
  {
    label: "فعال",
    value: "active",
  },
  {
    label: "غیر فعال",
    value: "de_active",
  },
];
const filter = reactive({
  title: "",
  slug: "",
  status: "",
});
const filterLoading = ref(false);

if (route.query.page) {
  currentPage.value = route.query.page;
}

store.getType(currentPage.value);

// methods
function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    store.getType(page, filter);
  }
}

function trashTypeConfirm(typeId) {
  store.actionTypeId = typeId;
  trashConfirm.value = true;
}

function trashType() {
  if (store.actionTypeId != "") {
    deleteLoading.value = store.actionTypeId;
    trashConfirm.value = false;
    store.trashType().then((res) => {
      store.types = store.types.filter((item) => item.id != store.actionTypeId);
      store.actionTypeId = "";
      deleteLoading.value = null;
      $toast("درخواست شما با موفقیت انجام شد.", "success", 2000);
    });
  }
}
function collapseFilter() {
  showFilter.value = !showFilter.value;
  if (showFilter.value) {
    filterBody.value.style.maxHeight =
      filterBody.value.scrollHeight + 48 + "px";
    filterBody.value.style.padding = "1.5rem";
    filterBody.value.style.opacity = "1";
  } else {
    filterBody.value.style.maxHeight = null;
    filterBody.value.style.padding = null;
    filterBody.value.style.opacity = null;
  }
}

function submitFilter() {
  filterLoading.value = true;
  store.getType(currentPage.value, filter).then((res) => {
    if (res.status == "success") {
      filterLoading.value = false;
    }
  });
}
</script>
<template>
  <section class="types__list">
    <div class="card filter__box">
      <div class="card__header collapse__header" @click="collapseFilter">
        <h4 class="heading__title">فیلتر</h4>
        <span class="collapse__icon" :class="{ rotate: showFilter }">
          <i class="fa-regular fa-chevron-down"></i>
        </span>
      </div>
      <div
        class="card__body collapse__body"
        :class="{ showFilter: showFilter }"
        ref="filterBody"
      >
        <div class="row">
          <div class="controls w-1/3">
            <label for="title">عنوان</label>
            <input
              v-model="filter.title"
              type="text"
              id="title"
              class="form-control"
            />
          </div>
          <div class="controls w-1/3">
            <label for="slug">اسلاگ</label>
            <input
              v-model="filter.slug"
              type="text"
              id="slug"
              class="form-control"
            />
          </div>
          <div class="controls w-1/3">
            <label for="status">وضعیت</label>
            <v-select
              v-model="filter.status"
              id="status"
              :options="statusOption"
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
        </div>
        <div class="row">
          <div class="controls w-1/4">
            <button
              @click="submitFilter"
              :disabled="filterLoading"
              class="btn btn-primary w-[100px]"
            >
              <template v-if="filterLoading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else> جستجو </template>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست تایپ ها</h4>
        <div class="heading__actions">
          <nuxt-link to="/types/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            تایپ جدید
          </nuxt-link>
          <nuxt-link to="/types/trash" class="btn btn-danger">
            <i class="fa-regular fa-trash"></i>
            سطل زباله
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!store.loading">
          <div v-if="store.types.length > 0">
            <table>
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>توضیحات</th>
                  <th>اسلاگ</th>
                  <th>وضعیت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in store.types" :key="index">
                  <td class="c_ellipsis">{{ item.title }}</td>
                  <td class="c_ellipsis">
                    <template v-if="item.short_description">
                      {{ item.short_description }}
                    </template>
                    <template v-else>-</template>
                  </td>
                  <td>
                    {{ item.slug }}
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
                      <nuxt-link
                        :to="`/types/edit/${item.id}`"
                        class="edit__action"
                      >
                        <i class="fa-regular fa-pen-to-square"></i>
                      </nuxt-link>
                      <button
                        class="delete__action"
                        :disabled="deleteLoading == item.id"
                        @click="trashTypeConfirm(item.id)"
                      >
                        <template v-if="deleteLoading == item.id">
                          <i
                            class="fa-solid fa-spinner text-xl animate-spin"
                          ></i>
                        </template>
                        <template v-else>
                          <i class="fa-regular fa-trash"></i>
                        </template>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <AdminPagination
              v-if="store.pagination && store.pagination.last_page > 1"
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="store.pagination.last_page"
            />
          </div>
          <div v-else class="empty__list">
            <p>موردی برای نمایش وجود ندارد</p>
          </div>
        </div>
        <div v-else class="empty__list">
          <p>درحال بارگذاری اطلاعات...</p>
        </div>
      </div>
    </div>
  </section>

  <ConfirmModal
    v-if="trashConfirm"
    msg="آیا از انتقال این تایپ به سطل زباله اطمینان دارید؟"
    @confirm="trashType"
    @closeModal="trashConfirm = false"
  />
</template>
<style lang="scss" scoped>
.filter__box {
  @apply pb-0;
  .collapse__header {
    @apply cursor-pointer;
    .collapse__icon {
      @apply transition-transform duration-700;

      &.rotate {
        @apply rotate-180;
      }
    }
  }
  .collapse__body {
    padding: 0 1.5rem !important;
    @apply max-h-0 overflow-hidden transition-all duration-700 opacity-0;

    &.showFilter {
      padding: 1rem 1.5rem !important;
    }
  }
}
</style>
