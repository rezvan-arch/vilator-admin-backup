<script>
import { requestPropertySaleStore } from "~/store/admin/request/property-sell/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | درخواست فروش",
    });
    const store = requestPropertySaleStore();

    store.loading = true;
    store.actionId = "";
    store.meta = [];

    return {
      store,
    };
  },
  data() {
    return {
      currentPage: 1,

      filter: {
        user_name: "",
        user_mobile: "",
        min_price: "",
        max_price: "",
      },
      showFilter: false,
      filterLoading: false,
    };
  },
  created() {
    if (this.$route.query.page && !isNaN(this.$route.query.page)) {
      this.currentPage = Number(this.$route.query.page);
    }
    if (this.hasFilter) {
      const keys = Object.keys(this.$route.query);
      keys.forEach((item) => {
        if (Object.hasOwn(this.filter, item)) {
          this.filter[item] = this.$route.query[item];
        }
      });
    }

    this.store.getRequestPropertySale(this.currentPage, this.filter);
  },
  mounted() {
    if (this.hasFilter) {
      this.collapseFilter();
    }
  },
  methods: {
    async getLatest() {
      await this.store
        .getRequestPropertySale(this.currentPage, this.filter)
        .then(() => {
          if (this.store.meta.last_page < this.currentPage) {
            this.$router.push({
              query: {
                ...this.$route.query,
                page: undefined,
              },
            });
            this.currentPage = 1;
            this.store.getRequestPropertySale(this.currentPage, this.filter);
          }
        });
    },
    pagination(page = 1) {
      if (this.currentPage != page) {
        this.$router.push({
          query: {
            ...this.$route.query,
            page,
          },
        });
        this.store.loading = true;
        this.currentPage = page;
        this.store.getRequestPropertySale(page, this.filter);
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

      const keys = Object.keys(this.filter);
      const query = {};
      keys.forEach((item) => {
        if (this.filter[item])
          query[item] = this.filter[item] != "" ? this.filter[item] : undefined;
      });

      this.$router.push({
        ...this.$route.query,
        query: query,
      });

      this.store
        .getRequestPropertySale(this.currentPage, this.filter)
        .then((res) => {
          if (res.status == "success") {
            this.filterLoading = false;
          }
        });
    },

    deleteFilter() {
      this.filter = {
        user_name: "",
        user_mobile: "",
        min_price: "",
        max_price: "",
      };

      this.submitFilter();
    },
  },
  computed: {
    hasFilter() {
      return (
        Object.values(this.$route.query).filter(
          (item) => item != "" && item != "page"
        ).length > 0
      );
    },
  },
};
</script>
<template>
  <section class="propertySale__list">
    <div class="card filter__box">
      <div class="card__header collapse__header" @click="collapseFilter">
        <h4 class="heading__title">فیلتر</h4>
        <span class="collapse__icon" :class="{ rotate: showFilter }">
          <i class="fa-regular fa-chevron-down"></i>
        </span>
      </div>
      <div
        class="card__body collapse__body flex-col !items-stretch"
        :class="{ showFilter: showFilter }"
        ref="filterBody"
      >
        <form @submit.prevent="submitFilter">
          <div class="row">
            <div class="controls w-1/3">
              <label for="user_name">نام کاربر</label>
              <input
                v-model="filter.user_name"
                type="text"
                id="user_name"
                class="form-control"
              />
            </div>
            <div class="controls w-1/3">
              <label for="user_mobile">شماره تماس</label>
              <input
                v-model="filter.user_mobile"
                type="number"
                id="user_mobile"
                class="form-control c-number"
              />
            </div>
            <div class="controls w-1/3">
              <label for="min_price">حداقل قیمت</label>
              <input
                v-model="filter.min_price"
                type="number"
                id="min_price"
                class="form-control c-number"
              />
            </div>
            <div class="controls w-1/3">
              <label for="max_price">حداکثر قیمت</label>
              <input
                v-model="filter.max_price"
                type="number"
                id="max_price"
                class="form-control c-number"
              />
            </div>
          </div>
          <div class="row">
            <div class="controls !flex gap-3">
              <button
                type="submit"
                :disabled="filterLoading"
                class="btn btn-primary min-w-[100px]"
              >
                <template v-if="filterLoading">
                  <i
                    class="fa-solid fa-spinner text-white text-xl animate-spin"
                  ></i>
                </template>
                <template v-else> جستجو </template>
              </button>
              <button
                type="button"
                v-if="hasFilter"
                @click="deleteFilter"
                class="btn btn-danger min-w-[100px]"
              >
                حذف فیلتر
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست درخواست فروش ملک</h4>
      </div>
      <div class="card__body table">
        <div v-if="!store.loading">
          <div v-if="store.data.length > 0">
            <table>
              <thead>
                <tr>
                  <th>کاربر</th>
                  <th>شماره موبایل</th>
                  <th>آدرس</th>
                  <th>قیمت</th>
                  <th>وضعیت</th>
                  <th style="text-align: left">تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in store.data" :key="index">
                  <td>
                    <nuxt-link :to="`/user/${item.user.id}`" v-if="item.user">
                      {{ item.user.name }}
                    </nuxt-link>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <span v-if="item.user">
                      {{ item.user.mobile }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <span v-if="item.address">{{ item.address }}</span>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <span v-if="item.price">{{
                      separateNumber(item.price)
                    }}</span>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <span
                        v-if="item.reviewed_date != null"
                        class="badge badge-pill badge-success"
                      >
                        دیده شده
                      </span>
                      <span v-else class="badge badge-pill badge-primary">
                        دیده نشده
                      </span>
                    </div>
                  </td>
                  <td class="setting">
                    <div class="actions justify-end">
                      <nuxt-link
                        :to="`/requests/property-sell/${item.id}`"
                        class="see__action"
                      >
                        <i class="fa-regular fa-eye"></i>
                      </nuxt-link>
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
        <div v-else class="empty__list">
          <p>درحال بارگذاری اطلاعات...</p>
        </div>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}

.notification_off {
  @apply text-[#FF4961] text-2xl;
}

.notification_on {
  @apply text-[#28D094] text-2xl;
}
</style>
