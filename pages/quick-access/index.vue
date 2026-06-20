<script setup>
import useStore from "~/mixins/store";
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | دسترسی سریع ",
});

const { quickAccessStore } = useStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const trashConfirmModal = ref(false);
const loading = ref(null);
const { $toast } = useNuxtApp();

if (route.query.page) {
  currentPage.value = route.query.page;
}

quickAccessStore.getAllQuickAccess(currentPage.value);

function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    quickAccessStore.getAllQuickAccess(page);
  }
}

function trashConfirm(attrId) {
  quickAccessStore.actionId = attrId;
  trashConfirmModal.value = true;
}

function deleteQuickAccess() {
  if (quickAccessStore.actionId != "") {
    trashConfirmModal.value = false;
    loading.value = quickAccessStore.actionId;
    quickAccessStore.deleteQuickAccess().then((res) => {
      $toast("درخواست شما با موفقیت انجام شد", "success", 2000);
      quickAccessStore.quickAccess = quickAccessStore.quickAccess.filter(
        (item) => item.id != quickAccessStore.actionId
      );
      quickAccessStore.actionId = "";
      loading.value = null;
    });
  }
}

function checkTag(tag) {
  let val;
  switch (tag) {
    case "input":
      val = "اینپوت (input)";
      break;
    case "checkbox":
      val = "اینپوت چند انتخابی (checkbox)";
      break;
    case "radio":
      val = "دکمه رادیویی (Radio button)";
      break;
    case "select":
      val = "لیست کشویی (select)";
      break;
  }
  return val;
}
</script>
<template>
  <section class="properties__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست دسترسی سریع</h4>
        <div class="heading__actions">
          <nuxt-link to="/quick-access/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            دسترسی سریع جدید
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!quickAccessStore.loading">
          <div v-if="quickAccessStore.quickAccess.length > 0">
            <table v-if="quickAccessStore.quickAccess.length > 0">
              <thead>
                <tr>
                  <th>مشخصه</th>
                  <th>اسلاگ</th>
                  <th>ترتیب مرتب سازی</th>
                  <th>وضعیت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in quickAccessStore.quickAccess"
                  :key="index"
                >
                  <td>{{ item.attribute.title }}</td>
                  <td>
                    {{ item.attribute.slug }}
                  </td>
                  <td>
                    {{ item.sort }}
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <span
                        v-if="item.is_active == 1"
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
                        :to="`/quick-access/edit/${item.id}`"
                        class="edit__action"
                      >
                        <i class="fa-regular fa-pen-to-square"></i>
                      </nuxt-link>
                      <button
                        class="delete__action"
                        @click="trashConfirm(item.id)"
                        :disabled="loading == item.id"
                      >
                        <template v-if="loading == item.id">
                          <i
                            class="fa-solid fa-spinner text-xl animate-spin"
                          ></i>
                        </template>
                        <template v-else>
                          <i class="fa-regular fa-trash"></i
                        ></template>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <AdminPagination
              v-if="
                quickAccessStore.pagination &&
                quickAccessStore.pagination.last_page > 1
              "
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="quickAccessStore.pagination.last_page"
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
    v-if="trashConfirmModal"
    msg="آیا از حذف این دسترسی سریع اطمینان دارید؟"
    @confirm="deleteQuickAccess"
    @closeModal="trashConfirmModal = false"
  />
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}
</style>
