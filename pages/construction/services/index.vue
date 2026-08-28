<script setup>
import useStore from "~/mixins/store";
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | خدمات ساخت",
});

const { constructionStore } = useStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const trashConfirmModal = ref(false);
const loading = ref(null);
const { $toast } = useNuxtApp();

const typeLabels = {
  design: "طراحی",
  contracting: "پیمانکاری ساخت",
  renovation: "بازسازی",
  interior_design: "طراحی داخلی",
  project_management: "مدیریت پروژه",
};

const statusLabels = {
  draft: "پیش‌نویس",
  published: "منتشر شده",
  archived: "آرشیو",
};

const statusBadges = {
  draft: "badge-primary",
  published: "badge-success",
  archived: "badge-secondary",
};

if (route.query.page) {
  currentPage.value = route.query.page;
}

constructionStore.getAllServices(currentPage.value);

function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    constructionStore.getAllServices(page);
  }
}

function trashConfirm(id) {
  constructionStore.actionId = id;
  trashConfirmModal.value = true;
}

function deleteService() {
  if (constructionStore.actionId != "") {
    trashConfirmModal.value = false;
    loading.value = constructionStore.actionId;
    constructionStore.deleteService().then(() => {
      $toast("خدمت با موفقیت حذف شد", "success", 2000);
      constructionStore.services = constructionStore.services.filter(
        (item) => item.id != constructionStore.actionId
      );
      constructionStore.actionId = "";
      loading.value = null;
    });
  }
}
</script>
<template>
  <section class="properties__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">خدمات ساخت</h4>
        <div class="heading__actions">
          <nuxt-link to="/construction/services/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            خدمت جدید
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!constructionStore.loading">
          <div v-if="constructionStore.services.length > 0">
            <table>
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>نوع خدمت</th>
                  <th>تعداد پکیج</th>
                  <th>وضعیت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in constructionStore.services"
                  :key="index"
                >
                  <td class="font-bold">{{ item.title }}</td>
                  <td>{{ typeLabels[item.service_type] || item.service_type }}</td>
                  <td>{{ item.packages?.length ?? 0 }}</td>
                  <td>
                    <span
                      class="badge badge-pill"
                      :class="statusBadges[item.status] || 'badge-primary'"
                    >
                      {{ statusLabels[item.status] || item.status }}
                    </span>
                  </td>
                  <td class="setting">
                    <div class="actions">
                      <nuxt-link
                        :to="`/construction/services/edit/${item.id}`"
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
                          <i class="fa-regular fa-trash"></i>
                        </template>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <AdminPagination
              v-if="constructionStore.meta && constructionStore.meta.last_page > 1"
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="constructionStore.meta.last_page"
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
    msg="آیا از حذف این خدمت اطمینان دارید؟"
    @confirm="deleteService"
    @closeModal="trashConfirmModal = false"
  />
</template>
