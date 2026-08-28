<script setup>
import useStore from "~/mixins/store";
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | پروژه‌های ساخت",
});

const { constructionStore } = useStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const trashConfirmModal = ref(false);
const loading = ref(null);
const { $toast } = useNuxtApp();

const statusLabels = {
  completed: "تکمیل شده",
  in_progress: "در حال ساخت",
};

if (route.query.page) {
  currentPage.value = route.query.page;
}

constructionStore.getAllProjects(currentPage.value);

function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    constructionStore.getAllProjects(page);
  }
}

function trashConfirm(id) {
  constructionStore.actionId = id;
  trashConfirmModal.value = true;
}

function deleteProject() {
  if (constructionStore.actionId != "") {
    trashConfirmModal.value = false;
    loading.value = constructionStore.actionId;
    constructionStore.deleteProject().then(() => {
      $toast("پروژه با موفقیت حذف شد", "success", 2000);
      constructionStore.projects = constructionStore.projects.filter(
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
        <h4 class="heading__title">پروژه‌های ساخت</h4>
        <div class="heading__actions">
          <nuxt-link to="/construction/projects/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            پروژه جدید
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!constructionStore.loading">
          <div v-if="constructionStore.projects.length > 0">
            <table>
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>موقعیت</th>
                  <th>متراژ</th>
                  <th>طبقات</th>
                  <th>سبک</th>
                  <th>وضعیت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in constructionStore.projects"
                  :key="index"
                >
                  <td class="font-bold">{{ item.title }}</td>
                  <td>{{ item.location_title ?? "-" }}</td>
                  <td>{{ item.area_meters }} متر</td>
                  <td>{{ item.floors }}</td>
                  <td>{{ item.style ?? "-" }}</td>
                  <td>
                    <span
                      class="badge badge-pill"
                      :class="
                        item.status == 'completed'
                          ? 'badge-success'
                          : 'badge-primary'
                      "
                    >
                      {{ statusLabels[item.status] || item.status }}
                    </span>
                  </td>
                  <td class="setting">
                    <div class="actions">
                      <nuxt-link
                        :to="`/construction/projects/edit/${item.id}`"
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
    msg="آیا از حذف این پروژه اطمینان دارید؟"
    @confirm="deleteProject"
    @closeModal="trashConfirmModal = false"
  />
</template>
