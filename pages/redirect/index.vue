<script setup>
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
import { redirectStore } from "~~/store/admin/redirect";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | ریدایرکت",
});

// variables
const store = redirectStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const deleteConfirm = ref(false);
const deleteLoading = ref(null);
const { $toast } = useNuxtApp();

if (route.query.page) {
  currentPage.value = route.query.page;
}

store.getRedirect(currentPage.value);

// methods
function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    store.getRedirect(page);
  }
}

function deleteRedirectConfirm(typeId) {
  store.actionId = typeId;
  deleteConfirm.value = true;
}

function deleteRedirect() {
  if (store.actionId != "") {
    deleteLoading.value = store.actionId;
    deleteConfirm.value = false;
    store.deleteRedirect().then((res) => {
      store.redirect = store.redirect.filter(
        (item) => item.id != store.actionId
      );
      store.actionId = "";
      deleteLoading.value = null;
      $toast("درخواست شما با موفقیت انجام شد.", "success", 2000);
    });
  }
}
</script>
<template>
  <section class="types__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست ریدایرکت ها</h4>
        <div class="heading__actions">
          <nuxt-link to="/redirect/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            ریدایرکت جدید
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!store.loading">
          <div v-if="store.redirect.length > 0">
            <table>
              <thead>
                <tr>
                  <th>لینک قدیمی</th>
                  <th>لینک جدید</th>
                  <th>نوع ریدایرکت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in store.redirect" :key="index">
                  <td class="c_ellipsis">{{ item.old_url }}</td>
                  <td class="c_ellipsis">{{ item.new_url }}</td>
                  <td class="c_ellipsis">{{ item.type }}</td>
                  <td class="setting">
                    <div class="actions">
                      <nuxt-link
                        :to="`/redirect/edit/${item.id}`"
                        class="edit__action"
                      >
                        <i class="fa-regular fa-pen-to-square"></i>
                      </nuxt-link>
                      <button
                        class="delete__action"
                        :disabled="deleteLoading == item.id"
                        @click="deleteRedirectConfirm(item.id)"
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
    msg="آیا از حذف این ریدایرکت اطمینان دارید؟"
    @confirm="deleteRedirect"
    @closeModal="deleteConfirm = false"
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
