<script>
import useStore from "~~/mixins/store";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | گروه تگ ها ",
    });
    const { tagGroupStore, indexStore } = useStore();
    const { $toast } = useNuxtApp();

    tagGroupStore.actionId = "";
    tagGroupStore.loading = true;
    tagGroupStore.pagination = [];

    return {
      tagGroupStore,
      indexStore,
    };
  },
  data() {
    return {
      currentPage: 1,
      deleteConfirm: false,
      deleteLoading: "",
      popup: false,
      editData: null,
    };
  },
  created() {
    if (this.$route.query.page && !isNaN(this.$route.query.page)) {
      this.currentPage = Number(this.$route.query.page);
    }

    this.getLatest();
  },
  methods: {
    async getLatest() {
      await this.tagGroupStore.getGroups(this.currentPage).then(() => {
        if (this.tagGroupStore.pagination.last_page < this.currentPage) {
          this.$router.push({
            query: {
              page: undefined,
            },
          });
          this.currentPage = 1;
          this.tagGroupStore.getGroups(this.currentPage);
        }
      });
    },
    editGroup(catId, data) {
      this.tagGroupStore.actionId = catId;
      this.editData = data;
      this.popup = true;
      this.indexStore.showModalFn(true);
    },
    deleteGroupConfirm(catId) {
      this.tagGroupStore.actionId = catId;
      this.deleteConfirm = true;
    },
    deleteGroup() {
      if (this.tagGroupStore.actionId != "") {
        this.deleteConfirm = false;
        this.deleteLoading = this.tagGroupStore.actionId;
        this.tagGroupStore
          .deleteGroup()
          .then((res) => {
            this.tagGroupStore.actionId = "";
            this.deleteLoading = "";
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          })
          .catch((err) => {
            this.getLatest();
          });
      }
    },
    pagination(page = 1) {
      if (this.currentPage != page) {
        this.$router.push({ query: { page } });
        this.tagGroupStore.loading = true;
        this.currentPage = page;
        this.getLatest();
      }
    },
    openPopup() {
      this.popup = true;
      this.indexStore.showModalFn(true);
    },
  },
};
</script>
<template>
  <div>
    <section class="properties__list">
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">لیست گروه تگ ها</h4>
          <div class="heading__actions">
            <button class="btn btn-primary" @click="openPopup">
              <i class="fa-regular fa-plus"></i>
              گروه تگ جدید
            </button>
          </div>
        </div>
        <div class="card__body table">
          <div v-if="!tagGroupStore.loading">
            <div v-if="tagGroupStore.groups.length > 0">
              <table>
                <thead>
                  <tr>
                    <th>عنوان</th>
                    <th>اسلاگ</th>
                    <th>وضعیت</th>
                    <th style="text-align: left">تنظیمات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in tagGroupStore.groups"
                    :key="index"
                  >
                    <td>
                      {{ item.title }}
                    </td>
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
                      <div class="actions justify-end">
                        <button
                          class="edit__action"
                          @click="editGroup(item.id, item)"
                        >
                          <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          class="delete__action"
                          @click="deleteGroupConfirm(item.id)"
                        >
                          <template v-if="deleteLoading == item.id">
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
                  tagGroupStore.pagination &&
                  tagGroupStore.pagination.last_page > 1
                "
                @onChange="pagination"
                :currentPage="currentPage"
                :lastPage="tagGroupStore.pagination.last_page"
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

    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="deleteConfirm"
        msg="آیا از حذف این گروه تگ اطمینان دارید؟"
        @confirm="deleteGroup()"
        @closeModal="deleteConfirm = false"
      />
    </transition>

    <teleport to="body">
      <transition name="translate">
        <AdminImageTagsGroupFormModal
          v-if="popup"
          :edit="editData"
          @closeModal="
            popup = false;
            indexStore.showModalFn(false);
            editData = null;
          "
        />
      </transition>
    </teleport>
  </div>
</template>
<style lang="scss" scoped>
.heading__actions button {
  @apply flex items-center gap-2;
}
</style>
