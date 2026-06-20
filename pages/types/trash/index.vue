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
const { $toast } = useNuxtApp();
const currentPage = ref(1);
const deleteConfirm = ref(false);
const deleteLoading = ref(false);
const restoreConfirm = ref(false);
const restoreLoading = ref(false);

if (route.query.page) {
  currentPage.value = route.query.page;
}

store.getTrashType(currentPage.value);

function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    store.getTrashType(page);
  }
}

function deleteTypeConfirm(typeId) {
  store.actionTypeId = typeId;
  deleteConfirm.value = true;
}

function restoreTypeConfirm(typeId) {
  store.actionTypeId = typeId;
  restoreConfirm.value = true;
}

function deleteType() {
  if (store.actionTypeId != "") {
    deleteConfirm.value = false;
    deleteLoading.value = store.actionTypeId;
    store.deleteType().then((res) => {
      store.trashTypes = store.trashTypes.filter(
        (item) => item.id != store.actionTypeId
      );
      store.actionTypeId = "";
      deleteLoading.value = null;
      $toast("درخواست شما با موفقیت انجام شد.", "success", 2000);
    });
  }
}

function restoreType() {
  if (store.actionTypeId != "") {
    restoreLoading.value = store.actionTypeId;
    restoreConfirm.value = false;
    store.restoreType().then((res) => {
      store.trashTypes = store.trashTypes.filter(
        (item) => item.id != store.actionTypeId
      );
      store.actionTypeId = "";
      restoreLoading.value = null;
      $toast("درخواست شما با موفقیت انجام شد.", "success", 2000);
    });
  }
}
</script>
<template>
  <section class="types__trash">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست سطل زباله تایپ ها</h4>
        <div class="heading__actions">
          <nuxt-link to="/types/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            تایپ جدید
          </nuxt-link>
          <nuxt-link to="/types" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!store.loading">
          <div v-if="store.trashTypes.length > 0">
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
                <tr v-for="(item, index) in store.trashTypes" :key="index">
                  <td class="c_ellipsis">{{ item.title }}</td>
                  <td class="c_ellipsis">
                    <div
                      v-if="item.description"
                      v-html="item.description"
                    ></div>
                    <div v-else>-</div>
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
                      <button
                        class="edit__action"
                        title="بازیابی کاربر"
                        :disabled="restoreLoading == item.id"
                        @click="restoreTypeConfirm(item.id)"
                      >
                        <template v-if="restoreLoading == item.id">
                          <i
                            class="fa-solid fa-spinner text-xl animate-spin"
                          ></i>
                        </template>
                        <template v-else>
                          <i class="fa-solid fa-trash-arrow-up"></i>
                        </template>
                      </button>
                      <button
                        class="delete__action"
                        title="حذف کاربر"
                        :disabled="deleteLoading == item.id"
                        @click="deleteTypeConfirm(item.id)"
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
    v-if="deleteConfirm"
    msg="آیا از حذف همیشگی این تایپ اطمینان دارید؟"
    @confirm="deleteType"
    @closeModal="deleteConfirm = false"
  />

  <ConfirmModal
    v-if="restoreConfirm"
    msg="آیا از بازگردانی این تایپ اطمینان دارید؟"
    @confirm="restoreType"
    @closeModal="restoreConfirm = false"
  />
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}
</style>
