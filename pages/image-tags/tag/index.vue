<script>
import useStore from "~~/mixins/store";

export default {
  setup() {
    definePageMeta({ layout: "admin" });

    useHead({
      title: "پنل مدیریت | تگ ها ",
    });
    const { tagStore, tagGroupStore, indexStore } = useStore();

    tagStore.actionId = "";
    tagStore.loading = true;
    tagStore.pagination = [];
    tagGroupStore.getGroups();

    return {
      tagStore,
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
      await this.tagStore.getTags(this.currentPage).then(() => {
        if (this.tagStore.pagination.last_page < this.currentPage) {
          this.$router.push({
            query: {
              page: undefined,
            },
          });
          this.currentPage = 1;
          this.tagStore.getTags(this.currentPage);
        }
      });
    },
    editTag(catId, data) {
      this.tagStore.actionId = catId;
      this.editData = data;
      this.popup = true;
      this.indexStore.showModalFn(true);
    },
    deleteTagConfirm(catId) {
      this.tagStore.actionId = catId;
      this.deleteConfirm = true;
    },
    deleteTag() {
      if (this.tagStore.actionId != "") {
        this.deleteConfirm = false;
        this.deleteLoading = this.tagStore.actionId;
        this.tagStore
          .deleteTag()
          .then((res) => {
            this.tagStore.actionId = "";
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
        this.tagStore.loading = true;
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
          <h4 class="heading__title">لیست تگ ها</h4>
          <div class="heading__actions">
            <button class="btn btn-primary" @click="openPopup">
              <i class="fa-regular fa-plus"></i>تگ جدید
            </button>
          </div>
        </div>
        <div class="card__body table">
          <div v-if="!tagStore.loading">
            <div v-if="tagStore.tags.length > 0">
              <table>
                <thead>
                  <tr>
                    <th>عنوان</th>
                    <th>اسلاگ</th>
                    <th>گروه تگ</th>
                    <th>وضعیت</th>
                    <th style="text-align: left">تنظیمات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in tagStore.tags" :key="index">
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
                      <template v-if="item.group">
                        {{ item.group.title }}
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
                          @click="editTag(item.id, item)"
                        >
                          <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          class="delete__action"
                          @click="deleteTagConfirm(item.id)"
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
                v-if="tagStore.pagination && tagStore.pagination.last_page > 1"
                @onChange="pagination"
                :currentPage="currentPage"
                :lastPage="tagStore.pagination.last_page"
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
        msg="آیا از حذف این تگ اطمینان دارید؟"
        @confirm="deleteTag()"
        @closeModal="deleteConfirm = false"
      />
    </transition>

    <teleport to="body">
      <transition name="translate">
        <AdminImageTagsTagFormModal
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
<style lang="scss" scoped></style>
