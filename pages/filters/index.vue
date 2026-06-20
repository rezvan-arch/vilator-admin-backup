<script setup>
import useStore from "~/mixins/store";
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | گروه فیلترها ",
});

const { filterGroupsStore } = useStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const deleteConfirm = ref(false);
const loading = ref(null);
  const { $toast } = useNuxtApp();

if (route.query.page) {
  currentPage.value = route.query.page;
}

filterGroupsStore.getFilterGroup(currentPage.value);

function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    filterGroupsStore.getFilterGroup(page);
  }
}

function deleteFilterConfirm(attrId) {
  filterGroupsStore.actionId = attrId;
  deleteConfirm.value = true;
}

function deleteFilter() {
  if (filterGroupsStore.actionId != "") {
    loading.value = filterGroupsStore.actionId;
    deleteConfirm.value = false;
    filterGroupsStore.deleteFilterGroup().then((res) => {
      filterGroupsStore.filterGroup = filterGroupsStore.filterGroup.filter(
        (item) => item.id != filterGroupsStore.actionId
      );
      filterGroupsStore.actionId = "";
      $toast("گروه فیلتر با موفقیت حذف شد", "success", 2000);
      loading.value = null;
    });
  }
}
</script>
<template>
  <section class="group__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست گروه فیلتر ها</h4>
        <div class="heading__actions">
          <nuxt-link to="/filters/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            گروه فیلتر جدید
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!filterGroupsStore.loading">
          <div v-if="filterGroupsStore.filterGroup.length > 0">
            <table v-if="filterGroupsStore.filterGroup.length > 0">
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>اسلاگ</th>
                  <th>وضعیت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in filterGroupsStore.filterGroup"
                  :key="index"
                >
                  <td>{{ item.title }}</td>
                  <td>
                    <template v-if="item.slug">
                      {{ item.slug }}
                    </template>
                    <template v-else> - </template>
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
                        :to="`/filters/edit/${item.id}`"
                        class="edit__action"
                      >
                        <i class="fa-regular fa-pen-to-square"></i>
                      </nuxt-link>
                      <button
                        class="delete__action"
                        @click="deleteFilterConfirm(item.id)"
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
                filterGroupsStore.pagination &&
                filterGroupsStore.pagination.last_page > 1
              "
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="filterGroupsStore.pagination.last_page"
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
    msg="آیا از از حذف این گروه فیلتر اطمینان دارید؟"
    @confirm="deleteFilter"
    @closeModal="deleteConfirm = false"
  />
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}
</style>
