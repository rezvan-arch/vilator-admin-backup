<script setup>
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
import { projectStore } from "~~/store/admin/project/index";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | پروژه ها",
});

// variables
const store = projectStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const deleteConfirm = ref(false);
const restoreConfirm = ref(false);
const { $toast } = useNuxtApp();

if (route.query.page) {
  currentPage.value = route.query.page;
}

store.getTrashProperty(currentPage.value);

function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    store.getTrashProperty(page);
  }
}

function deletePropertyConfirm(propertyId) {
  store.actionPropertyId = propertyId;
  deleteConfirm.value = true;
}

function restorePropertyConfirm(propertyId) {
  store.actionPropertyId = propertyId;
  restoreConfirm.value = true;
}

function deleteProperty() {
  if (store.actionPropertyId != "") {
    deleteConfirm.value = false;
    $toast("منتظر بمانید...", "info", 2000);
    store.deleteProperty().then((res) => {
      store.actionPropertyId = "";
      store.properties = [];
      store.getTrashProperty(currentPage.value);
    });
  }
}

function restoreProperty() {
  if (store.actionPropertyId != "") {
    restoreConfirm.value = false;
    $toast("منتظر بمانید...", "info", 2000);
    store.restoreProperty().then((res) => {
      store.actionPropertyId = "";
      store.properties = [];
      store.getTrashProperty(currentPage.value);
    });
  }
}
</script>
<template>
  <section class="properties__trash">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست سطل زباله پروژه ها</h4>
        <div class="heading__actions">
          <nuxt-link to="/project/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            پروژه جدید
          </nuxt-link>
          <nuxt-link to="/project" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!store.loading">
          <div v-if="store.trashProperties.length > 0">
            <table v-if="store.trashProperties.length > 0">
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>کدپروژه</th>
                  <th>اسلاگ</th>
                  <th>عنوان</th>
                  <th>وضعیت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in store.trashProperties" :key="index">
                  <td>{{ item.title }}</td>
                  <td>
                    {{ item.property_code }}
                  </td>
                  <td>
                    {{ item.slug }}
                  </td>
                  <td>
                    <template v-if="item.type">
                      {{ item.type.title }}
                    </template>
                    <template v-else> - </template>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <span
                        v-if="item.status == 'private'"
                        class="badge badge-pill badge-primary"
                      >
                        خصوصی
                      </span>
                      <span
                        v-if="item.status == 'public'"
                        class="badge badge-pill badge-success"
                      >
                        عمومی
                      </span>
                      <span
                        v-if="item.status == 'draft'"
                        class="badge badge-pill badge-warning"
                      >
                        پیش نویس
                      </span>
                    </div>
                  </td>
                  <td class="setting">
                    <div class="actions">
                      <button
                        class="edit__action"
                        title="بازیابی پروژه"
                        @click="restorePropertyConfirm(item.id)"
                      >
                        <i class="fa-solid fa-trash-arrow-up"></i>
                      </button>
                      <button
                        class="delete__action"
                        title="حذف پروژه"
                        @click="deletePropertyConfirm(item.id)"
                      >
                        <i class="fa-regular fa-trash"></i>
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
    v-if="deleteConfirm"
    msg="آیا از حذف همیشگی این پروژه اطمینان دارید؟"
    @confirm="deleteProperty"
    @closeModal="deleteConfirm = false"
  />

  <ConfirmModal
    v-if="restoreConfirm"
    msg="آیا از بازگردانی این پروژه اطمینان دارید؟"
    @confirm="restoreProperty"
    @closeModal="restoreConfirm = false"
  />
</template>
<style lang="scss" scoped>
.verified__number,
.verified__mail {
  @apply text-base text-[#28D094] mr-1 inline-block;
}
</style>
