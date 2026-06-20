<script setup>
import useStore from "~/mixins/store";
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | مشخصه ها ",
});

// variables
const { attributeStore } = useStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const deleteConfirm = ref(false);
const restoreConfirm = ref(false);
const restoreLoading = ref(null);
const deleteLoading = ref(null);
const { $toast } = useNuxtApp();

if (route.query.page) {
  currentPage.value = route.query.page;
}
attributeStore.getTrashAttributes(currentPage.value, "property_attribute");

function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    attributeStore.getTrashAttributes(page, "property_attribute");
  }
}

function deleteAttrConfirm(attrId) {
  attributeStore.actionAttrId = attrId;
  deleteConfirm.value = true;
}

function restoreAttrConfirm(attrId) {
  attributeStore.actionAttrId = attrId;
  restoreConfirm.value = true;
}

function deleteAttr() {
  if (attributeStore.actionAttrId != "") {
    deleteConfirm.value = false;
    deleteLoading.value = attributeStore.actionAttrId;
    attributeStore.deleteAttr().then((res) => {
      $toast("درخواست شما با موفقیت انجام شد", "success", 2000);
      attributeStore.trashAttributes = attributeStore.trashAttributes.filter(
        (item) => item.id != attributeStore.actionAttrId
      );
      attributeStore.actionAttrId = "";
      deleteLoading.value = null;
    });
  }
}

function restoreAttr() {
  if (attributeStore.actionAttrId != "") {
    restoreConfirm.value = false;
    restoreLoading.value = attributeStore.actionAttrId;
    attributeStore.restoreAttr().then((res) => {
      $toast("درخواست شما با موفقیت انجام شد", "success", 2000);
      attributeStore.trashAttributes = attributeStore.trashAttributes.filter(
        (item) => item.id != attributeStore.actionAttrId
      );
      attributeStore.actionAttrId = "";
      restoreLoading.value = null;
    });
  }
}
</script>
<template>
  <section class="attribute__trash">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست سطل زباله ویژگی ها</h4>
        <div class="heading__actions">
          <nuxt-link
            to="/attributes/attribute/new"
            class="btn btn-primary"
          >
            <i class="fa-regular fa-plus"></i>
            ویژگی جدید
          </nuxt-link>
          <nuxt-link to="/attributes/attribute" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!attributeStore.loading">
          <div v-if="attributeStore.trashAttributes.length > 0">
            <table v-if="attributeStore.trashAttributes.length > 0">
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
                <tr
                  v-for="(item, index) in attributeStore.trashAttributes"
                  :key="index"
                >
                  <td>{{ item.title }}</td>
                  <td>
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
                        title="بازیابی ویژگی"
                        @click="restoreAttrConfirm(item.id)"
                        :disabled="restoreLoading"
                      >
                        <template v-if="restoreLoading == item.id">
                          <i
                            class="fa-solid fa-spinner text-xl animate-spin"
                          ></i>
                        </template>
                        <template v-else>
                          <i class="fa-solid fa-trash-arrow-up"></i>
                          ></template
                        >
                      </button>
                      <button
                        class="delete__action"
                        title="حذف ویژگی"
                        @click="deleteAttrConfirm(item.id)"
                        :disabled="deleteLoading"
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
              v-if="
                attributeStore.pagination &&
                attributeStore.pagination.last_page > 1
              "
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="attributeStore.pagination.last_page"
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
    msg="آیا از حذف همیشگی این ویژگی اطمینان دارید؟"
    @confirm="deleteAttr"
    @closeModal="deleteConfirm = false"
  />

  <ConfirmModal
    v-if="restoreConfirm"
    msg="آیا از بازگردانی این ویژگی اطمینان دارید؟"
    @confirm="restoreAttr"
    @closeModal="restoreConfirm = false"
  />
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}
</style>
