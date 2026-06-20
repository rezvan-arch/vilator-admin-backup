<script>
import { locationStore } from "~/store/admin/location/index";
import useStore from "~/mixins/store";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | لوکیشن ",
    });
    const store = locationStore();
    const { adminStore } = useStore();
    return {
      store,
      adminStore,
    };
  },
  data() {
    return {
      currentPage: 1,
      trashConfirmDialog: false,
      trashId: null,
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
      newLocForm: {
        title: "",
        slug: "",
        parent_id: "",
        type: "",
        status: "active",
      },
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
      locations: [],
      deleteLoading: null,
      loading: false,
      filterLoading: false,
      showFilter: false,
      debounce: null,
      filter: {
        related_location: null,
      },
    };
  },
  async created() {
    this.getLatest();
  },
  mounted() {},
  methods: {
    async getLatest() {
      await this.store
        .getAllHighway(this.currentPage, {
          related_location: this.filter.related_location
            ? this.filter.related_location
            : null,
        })
        .then(() => {
          if (this.currentPage == 1) {
            this.locations = this.store.data;
          }
          if (this.store.meta.last_page < this.currentPage) {
            this.$router.push({
              query: {
                page: undefined,
              },
            });
            this.currentPage = 1;
            this.store.getAllHighway(this.currentPage);
          }
        });
    },
    trashConfirm(id) {
      this.trashId = id;
      this.trashConfirmDialog = true;
    },
    async doTrashLocation() {
      if (this.trashId != null) {
        this.trashConfirmDialog = false;
        this.deleteLoading = this.trashId;
        await this.store
          .deleteLocation(this.trashId)
          .then((res) => {
            this.deleteLoading = null;
            this.store.data = this.store.data.filter(
              (item) => item.id != this.trashId
            );
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
            this.trashId = "";
          })
          .catch((err) => {
            this.deleteLoading = null;
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

    collapseFilter() {
      this.showFilter = !this.showFilter;
      if (this.showFilter) {
        this.$refs.filterBody.style.maxHeight =
          this.$refs.filterBody.scrollHeight + 48 + "px";
        this.$refs.filterBody.style.padding = "1.5rem";
        this.$refs.filterBody.style.opacity = "1";
      } else {
        this.$refs.filterBody.style.maxHeight = null;
        this.$refs.filterBody.style.padding = null;
        this.$refs.filterBody.style.opacity = null;
      }
    },
    submitFilter() {
      this.filterLoading = true;
      this.$router.push({
        query: {},
      });
      this.store.getAllHighway(1, {}).then((res) => {
        if (res.status == "success") {
          this.filterLoading = false;
        }
      });
    },
    deleteFilter() {
      this.$router.push({
        query: {},
      });
      this.filter = {};
      this.getLatest();
    },

    debounceSearch(data) {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.search(data);
      }, 600);
    },
    search(data) {
      this.store.getAllHighwaySearch(data);
    },
  },
  computed: {},
  watch: {},
};
</script>
<template>
  <section class="locations__list">
    <!-- <div class="card filter__box">
      <div class="card__header collapse__header" @click="collapseFilter">
        <h4 class="heading__title">فیلتر</h4>
      </div>
      <div class="card__body collapse__body showFilter" ref="filterBody">
        <div class="row">
          <div class="controls w-1/3">
            <label for="title">عنوان</label>
            <input
              v-model="filter.title"
              type="text"
              id="title"
              class="form-control"
            />
          </div>
          <div class="controls w-1/3">
            <label for="type">نوع لوکیشن</label>
            <v-select
              v-model="filter.type"
              id="type"
              :options="locationTypeOptions"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/12">
            <button
              type="button"
              @click="submitFilter"
              :disabled="filterLoading"
              class="btn btn-primary w-[100px]"
            >
              <template v-if="filterLoading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else> جستجو </template>
            </button>
          </div>
          <div class="controls w-1/12 mr-4">
            <button
              type="button"
              @click="deleteFilter"
              class="btn btn-danger w-[100px]"
              v-if="filter.parent || filter.title || filter.type"
            >
              حذف فیلتر
            </button>
          </div>
        </div>
      </div>
    </div> -->
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست لوکیشن جاده/بزرگراه/اتوبان/آزادراه</h4>
        <div class="heading__actions">
          <nuxt-link to="/locations/highway/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            لوکیشن جدید
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
                <th>لوکیشن مادر</th>
                <th>وضعیت</th>
                <th>تنظیمات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in store.data" :key="index">
                <td>
                  <div v-if="item.title">{{ item.title }}</div>
                  <div v-else>-</div>
                </td>
                <td class="c_ellipsis">
                  <div v-if="item.slug">{{ item.slug }}</div>
                  <div v-else>-</div>
                </td>
                <td>
                  <div v-if="item.related_location">
                    {{
                      item.related_location
                        .map((item) => item.title)
                        .join(" - ")
                    }}
                  </div>
                  <div v-else>-</div>
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
                    <nuxt-link
                      :to="`/locations/highway/edit/${item.id}`"
                      class="edit__action"
                    >
                      <i class="fa-regular fa-pen-to-square"></i>
                    </nuxt-link>
                    <button
                      class="delete__action"
                      @click="trashConfirm(item.id)"
                      :disabled="deleteLoading == item.id"
                    >
                      <template v-if="deleteLoading == item.id">
                        <i class="fa-solid fa-spinner text-xl animate-spin"></i>
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
      v-if="trashConfirmDialog"
      msg="آیا از حذف این لوکیشن اطمینان دارید؟"
      @confirm="doTrashLocation()"
      @closeModal="trashConfirmDialog = false"
    />
  </transition>
</template>
<style lang="scss" scoped>
.filter__box {
  @apply pb-0;
  .collapse__header {
    @apply cursor-pointer;
    .collapse__icon {
      @apply transition-transform duration-700;

      &.rotate {
        @apply rotate-180;
      }
    }
  }
  .collapse__body {
    padding: 1rem 1.5rem !important;
    @apply transition-all duration-700;

    &.showFilter {
      padding: 1rem 1.5rem !important;
    }
  }
}
</style>
