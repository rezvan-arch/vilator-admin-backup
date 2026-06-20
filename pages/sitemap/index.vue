<script setup>
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
import useStore from "~/mixins/store";
definePageMeta({ layout: "admin" });

useHead({
  title: "پنل مدیریت | سایت مپ",
});

// variables
const { sitemapStore } = useStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const deleteConfirm = ref(false);
const deleteLoading = ref(null);
const { $toast } = useNuxtApp();

if (route.query.page) {
  currentPage.value = route.query.page;
}

sitemapStore.getSitemap(currentPage.value);

// methods
function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    sitemapStore.getSitemap(page);
  }
}

function deleteSitemapConfirm(typeId) {
  sitemapStore.actionId = typeId;
  deleteConfirm.value = true;
}

function deleteSitemap() {
  if (sitemapStore.actionId != "") {
    deleteLoading.value = sitemapStore.actionId;
    deleteConfirm.value = false;
    sitemapStore.deleteSitemap().then((res) => {
      sitemapStore.sitemap = sitemapStore.sitemap.filter(
        (item) => item.id != sitemapStore.actionId
      );
      sitemapStore.actionId = "";
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
        <h4 class="heading__title">لیست سایت مپ ها</h4>
        <div class="heading__actions">
          <nuxt-link to="/sitemap/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            سایت مپ جدید
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!sitemapStore.loading">
          <div v-if="sitemapStore.sitemap.length > 0">
            <table>
              <thead>
                <tr>
                  <th>لینک</th>
                  <th>تاریخ آخرین اصلاح</th>
                  <th>نوع سایت مپ</th>
                  <th>ایندکس</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in sitemapStore.sitemap" :key="index">
                  <td class="c_ellipsis">{{ item.url }}</td>
                  <td class="c_ellipsis">
                    <template v-if="item.last_modify == null"> - </template>
                    <template v-else>
                      {{ convertDate(item.last_modify) }}
                    </template>
                  </td>
                  <td class="c_ellipsis">{{ item.type }}</td>
                  <td class="c_ellipsis">
                    <span v-if="item.is_index" class="badge badge-success">
                      <i class="fa fa-check"></i>
                    </span>
                    <span v-else class="badge badge-danger">
                      <i class="fa fa-times"></i>
                    </span>
                  </td>
                  <td class="setting">
                    <div class="actions">
                      <nuxt-link
                        :to="`/sitemap/edit/${item.id}`"
                        class="edit__action"
                      >
                        <i class="fa-regular fa-pen-to-square"></i>
                      </nuxt-link>
                      <button
                        class="delete__action"
                        :disabled="deleteLoading == item.id"
                        @click="deleteSitemapConfirm(item.id)"
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
                sitemapStore.pagination && sitemapStore.pagination.last_page > 1
              "
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="sitemapStore.pagination.last_page"
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
    msg="آیا از حذف این سایت مپ اطمینان دارید؟"
    @confirm="deleteSitemap"
    @closeModal="deleteConfirm = false"
  />
</template>
<style lang="scss" scoped>
.badge {
  @apply rounded-full text-white w-6 h-6;
}
</style>
