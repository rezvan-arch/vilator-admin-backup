<script>
import { locationStore } from "~/store/admin/location/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | لوکیشن ",
    });
    const store = locationStore();

    return {
      store,
    };
  },
  data() {
    return {
      currentPage: 1,
      deleteConfirmDialog: false,
      restoreConfirmDialog: false,
      actionId: null,
      locationTypeOptions: [
        { label: "کشور", value: "country" },
        { label: "جهت جغرافیایی", value: "direction" },
        { label: "استان", value: "province" },
        { label: "شهرستان", value: "township" },
        { label: "بخش", value: "district" },
        { label: "شهر", value: "city" },
        { label: "دهستان", value: "rural_district" },
        { label: "مرکز شهر", value: "downtown" },
        { label: "حومه شهر", value: "suburbs" },
        { label: "منطقه‌بندی شهرداری", value: "municipal_zoning" },
        { label: "جاده/بزرگراه/اتوبان/آزادراه", value: "highway" },
        { label: "روستا", value: "village" },
        { label: "محله", value: "neighbourhood" },
        { label: "بلوار / خیابان اصلی", value: "avenue" },
        { label: "کوچه / خیابان فرعی", value: "alley" },
        { label: "شهرک", value: "suburb" },
        { label: "مجتمع", value: "complex" },
      ],
      statusOptions: [
        {
          label: "فعال",
          value: "active",
        },
        {
          label: "غیرفعال",
          value: "de_active",
        },
      ],
    };
  },
  created() {
    if (this.$route.query.page) {
      this.currentPage = !isNaN(this.$route.query.page)
        ? Number(this.$route.query.page)
        : 1;
    }

    this.getLatest();
  },
  methods: {
    async getLatest() {
      await this.store.getTrashedLocations(this.currentPage).then(() => {
        if (this.store.meta.last_page < this.currentPage) {
          this.$router.push({
            query: {
              page: undefined,
            },
          });
          this.currentPage = 1;
          this.store.getTrashedLocations(this.currentPage);
        }
      });
    },
    restoreConfirm(id) {
      this.actionId = id;
      this.restoreConfirmDialog = true;
    },
    async doRestoreLocation() {
      if (this.actionId != null) {
        this.restoreConfirmDialog = false;
        await this.store
          .restoreLocation(this.actionId)
          .then((res) => {
            this.actionId = null;
            this.store.data = [];
            this.getLatest();
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          })
          .catch((err) => {
            this.getLatest();
          });
      }
    },
    deleteConfirm(id) {
      this.actionId = id;
      this.deleteConfirmDialog = true;
    },
    doDeleteLocation() {
      if (this.actionId != null) {
        this.deleteConfirmDialog = false;
        this.store
          .deleteLocation(this.actionId)
          .then((res) => {
            this.actionId = null;
            this.store.data = [];
            this.getLatest();
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
        this.currentPage = page;
        this.getLatest();
      }
    },
  },
};
</script>
<template>
  <section class="locations__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست سطل زباله لوکیشن</h4>
        <div class="heading__actions">
          <nuxt-link to="/locations/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            لوکیشن جدید
          </nuxt-link>
          <nuxt-link to="/locations" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table" v-if="!store.loading">
        <div v-if="store.data.length > 0">
          <table>
            <thead>
              <tr>
                <th>عنوان</th>
                <th>اسلاگ</th>
                <th>نوع تایپ</th>
                <th>وضعیت</th>
                <th style="text-align: left">تنظیمات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in store.data" :key="index">
                <td>
                  <div v-if="item.title">{{ item.title }}</div>
                  <div v-else>-</div>
                </td>
                <td>
                  <div v-if="item.slug">{{ item.slug }}</div>
                  <div v-else>-</div>
                </td>
                <td>
                  <div v-if="item.type">
                    {{
                      locationTypeOptions.find(
                        (type) => type.value == item.type
                      ).label
                    }}
                  </div>
                  <div v-else>-</div>
                </td>
                <td>
                  <div v-if="item.status">
                    {{
                      statusOptions.find((s) => s.value == item.status).label
                    }}
                  </div>
                  <div v-else>-</div>
                </td>
                <td class="setting">
                  <div class="actions justify-end">
                    <button
                      class="edit__action"
                      title="بازیابی لوکیشن"
                      @click="restoreConfirm(item.id)"
                    >
                      <i class="fa-solid fa-trash-arrow-up"></i>
                    </button>
                    <button
                      class="delete__action"
                      title="حذف لوکیشن"
                      @click="deleteConfirm(item.id)"
                    >
                      <i class="fa-regular fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <AdminPagination
            v-if="store.meta && store.meta.last_page > 1"
            @onChange="pagination"
            :currentPage="currentPage"
            :lastPage="store.meta.last_page"
          />
        </div>
        <div v-else class="empty__list">
          <p>موردی برای نمایش وجود ندارد</p>
        </div>
      </div>
      <div class="card__body" v-else>
        <div class="empty__list">
          <p>درحال بارگذاری اطلاعات...</p>
        </div>
      </div>
    </div>
  </section>

  <transition name="fade">
    <AdminModalsConfirmModal
      v-if="deleteConfirmDialog"
      msg="آیا از حذف همیشگی این لوکیشن اطمینان دارید؟"
      @confirm="doDeleteLocation"
      @closeModal="deleteConfirmDialog = false"
    />
  </transition>

  <transition name="fade">
    <AdminModalsConfirmModal
      v-if="restoreConfirmDialog"
      msg="آیا از بازگشت این لوکیشن اطمینان دارید؟"
      @confirm="doRestoreLocation"
      @closeModal="restoreConfirmDialog = false"
    />
  </transition>
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}
</style>
