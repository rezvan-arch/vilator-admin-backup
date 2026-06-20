<script setup>
import useStore from "~/mixins/store";
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | گروه مشخصه ",
});

const { attrGroupsStore } = useStore();
const route = useRoute();
const router = useRouter();
const { $toast } = useNuxtApp();
const currentPage = ref(1);
const trashConfirm = ref(false);

if (route.query.page) {
  currentPage.value = route.query.page;
}

attrGroupsStore.getAttributes(currentPage.value);

function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    attrGroupsStore.getAttributes(page);
  }
}

function trashAttrConfirm(attrId) {
  attrGroupsStore.actionAttrId = attrId;
  trashConfirm.value = true;
}

function trashAttribute() {
  if (attrGroupsStore.actionAttrId != "") {
    $toast("منتظر بمانید...", "info", 2000);
    trashConfirm.value = false;
    attrGroupsStore.trashAttribute().then((res) => {
      attrGroupsStore.actionAttrId = "";
      attrGroupsStore.attributes = [];
      attrGroupsStore.getAttributes(currentPage.value);
    });
  }
}
</script>
<template>
  <section class="group__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست گروه مشخصه ها</h4>
        <div class="heading__actions">
          <nuxt-link to="/attributes/group/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            گروه مشخصه جدید
          </nuxt-link>
          <nuxt-link to="/attributes/group/trash" class="btn btn-danger">
            <i class="fa-regular fa-trash"></i>
            سطل زباله
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!attrGroupsStore.loading">
          <div v-if="attrGroupsStore.attributes.length > 0">
            <table v-if="attrGroupsStore.attributes.length > 0">
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>اسلاگ</th>
                  <th>نوع تایپ</th>
                  <th>ترتیب مرتب سازی</th>
                  <th>وضعیت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in attrGroupsStore.attributes"
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
                    <template v-if="item.types">
                      {{ item.types.map((item) => item.title).join(",") }}
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
                      <nuxt-link
                        :to="`/attributes/group/edit/${item.id}`"
                        class="edit__action"
                      >
                        <i class="fa-regular fa-pen-to-square"></i>
                      </nuxt-link>
                      <button
                        class="delete__action"
                        @click="trashAttrConfirm(item.id)"
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
    v-if="trashConfirm"
    msg="آیا از انتقال این گروه مشخصه به سطل زباله اطمینان دارید؟"
    @confirm="trashAttribute"
    @closeModal="trashConfirm = false"
  />
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}
</style>
