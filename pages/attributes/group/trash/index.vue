<script setup>
import useStore from "~/mixins/store";
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | گروه مشخصه ",
});

// variables
const { attrGroupsStore } = useStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const deleteConfirm = ref(false);
const restoreConfirm = ref(false);
  const { $toast } = useNuxtApp();

if (route.query.page) {
  currentPage.value = route.query.page;
}
attrGroupsStore.getTrashAttributes(currentPage.value);

function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    attrGroupsStore.getTrashAttributes(page);
  }
}

function deleteAttrConfirm(attrId) {
  attrGroupsStore.actionAttrId = attrId;
  deleteConfirm.value = true;
}

function restoreAttrConfirm(attrId) {
  attrGroupsStore.actionAttrId = attrId;
  restoreConfirm.value = true;
}

function deleteAttr() {
  if (attrGroupsStore.actionAttrId != "") {
    deleteConfirm.value = false;
    $toast("منتظر بمانید...", "info", 2000);
    attrGroupsStore.deleteAttr().then((res) => {
      attrGroupsStore.actionAttrId = "";
      attrGroupsStore.Attrs = [];
      attrGroupsStore.getTrashAttributes(currentPage.value);
    });
  }
}

function restoreAttr() {
  if (attrGroupsStore.actionAttrId != "") {
    restoreConfirm.value = false;
    $toast("منتظر بمانید...", "info", 2000);
    attrGroupsStore.restoreAttr().then((res) => {
      attrGroupsStore.actionAttrId = "";
      attrGroupsStore.Attrs = [];
      attrGroupsStore.getTrashAttributes(currentPage.value);
    });
  }
}
</script>
<template>
  <section class="group__trash">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست سطل زباله گروه مشخصه ها</h4>
        <div class="heading__actions">
          <nuxt-link to="/attributes/group/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            گروه مشخصه جدید
          </nuxt-link>
          <nuxt-link to="/attributes/group" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!attrGroupsStore.loading">
          <div v-if="attrGroupsStore.trashAttributes.length > 0">
            <table v-if="attrGroupsStore.trashAttributes.length > 0">
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>نوع تایپ</th>
                  <th>ترتیب مرتب سازی</th>
                  <th>وضعیت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in attrGroupsStore.trashAttributes"
                  :key="index"
                >
                  <td>{{ item.title }}</td>
                  <td>
                    <template v-if="item.type">
                      {{ item.type.map((item) => item.title).join(",") }}
                    </template>
                    <template v-else> - </template>
                  </td>
                  <td>
                    <template v-if="item.sort_order">
                      {{ item.sort_order }}
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
                      <button
                        class="edit__action"
                        title="بازیابی گروه مشخصه"
                        @click="restoreAttrConfirm(item.id)"
                      >
                        <i class="fa-solid fa-trash-arrow-up"></i>
                      </button>
                      <button
                        class="delete__action"
                        title="حذف گروه مشخصه"
                        @click="deleteAttrConfirm(item.id)"
                      >
                        <i class="fa-regular fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <AdminPagination
              v-if="
                attrGroupsStore.pagination &&
                attrGroupsStore.pagination.last_page > 1
              "
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="attrGroupsStore.pagination.last_page"
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
    msg="آیا از حذف همیشگی این گروه مشخصه اطمینان دارید؟"
    @confirm="deleteAttr"
    @closeModal="deleteConfirm = false"
  />

  <ConfirmModal
    v-if="restoreConfirm"
    msg="آیا از بازگردانی این گروه مشخصه اطمینان دارید؟"
    @confirm="restoreAttr"
    @closeModal="restoreConfirm = false"
  />
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}
</style>
