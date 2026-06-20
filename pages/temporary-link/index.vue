<script setup>
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
import { linksStore } from "~/store/admin/temporaryLink/index";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | لینک موقت",
});

// variables
const store = linksStore();
const route = useRoute();
const router = useRouter();
const { $toast } = useNuxtApp();
const currentPage = ref(1);
const deleteConfirm = ref(false);
const deleteLoading = ref(false);

if (route.query.page) {
  currentPage.value = route.query.page;
}

store.getLinks(currentPage.value);

// methods
function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    store.getLinks(page);
  }
}

function deleteLinkConfirm(linkId) {
  store.actionLinkId = linkId;
  deleteConfirm.value = true;
}

function deleteLink() {
  deleteLoading.value = store.actionLinkId;
  if (store.actionLinkId != "") {
    deleteConfirm.value = false;
    $toast("منتظر بمانید...", "info", 2000);
    store.deleteLink().then((res) => {
      store.links = store.links.filter((link) => link.id != store.actionLinkId);
      store.actionLinkId = "";
      deleteLoading.value = false;
    });
  }
}

function copy(data) {
  navigator.clipboard.writeText(data).then(() => {
    $toast("لینک با موفقیت کپی شد.", "success", 5000);
  });
}
</script>
<template>
  <section class="types__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست لینک ها</h4>
        <div class="heading__actions">
          <nuxt-link to="/temporary-link/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            لینک جدید
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!store.loading">
          <div v-if="store.links.length > 0">
            <table>
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>تعداد بازدید</th>
                  <th>تعداد باقی مانده بازدید</th>
                  <th>تاریخ انقضاء</th>
                  <th>وضعیت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in store.links" :key="index">
                  <td class="c_ellipsis">{{ item.title }}</td>
                  <td class="c_ellipsis">
                    <template v-if="item.used_count != null">
                      {{ item.used_count }}
                    </template>
                    <template v-else>-</template>
                  </td>
                  <td>
                    <template v-if="item.expire_count != null">
                      {{ item.expire_count }}
                    </template>
                    <template v-else>-</template>
                  </td>
                  <td style="direction: ltr">
                    <template v-if="item.expire_time != null">
                      {{ convertDate(item.expire_time, true) }}
                    </template>
                    <template v-else>-</template>
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
                      <button class="text-cyan-500" @click="copy(item.token)">
                        <i class="fa-regular fa-copy"></i>
                      </button>
                      <nuxt-link
                        :to="`/temporary-link/edit/${item.id}`"
                        class="edit__action"
                      >
                        <i class="fa-regular fa-pen-to-square"></i>
                      </nuxt-link>
                      <button
                        class="delete__action"
                        @click="deleteLinkConfirm(item.id)"
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
    msg="آیا از حذف همیشگی این لینک اطمینان دارید؟"
    @confirm="deleteLink"
    @closeModal="deleteConfirm = false"
  />
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}
</style>
