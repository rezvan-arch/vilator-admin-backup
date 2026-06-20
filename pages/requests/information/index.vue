<script>
import { requestInformationStore } from "~/store/admin/request/information/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | درخواست اطلاعات بیشتر",
    });
    const store = requestInformationStore();

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
      requestType: [
        {
          label: "تصویر",
          value: "image",
        },
        {
          label: "ویدیو",
          value: "video",
        },
        {
          label: "موقعیت",
          value: "location",
        },
        {
          label: "توضیحات",
          value: "description",
        },
      ],
      status: [
        {
          label: "انجام شده",
          value: "done",
          color: "bg-green-500",
        },
        {
          label: "دردست اقدام",
          value: "pending",
          color: "bg-yellow-500",
        },
        {
          label: "رد شده",
          value: "reject",
          color: "bg-red-500",
        },
        {
          label: "بازدید شده",
          value: "visited",
          color: "bg-green-500",
        },
        {
          label: "بررسی شده",
          value: "reviewed",
          color: "bg-green-500",
        },
      ],
      showFilter: false,
      filterBody: null,
      statusOption: [
        {
          label: "انجام شده",
          value: "done",
        },
        {
          label: "دردست اقدام",
          value: "pending",
        },
        {
          label: "رد شده",
          value: "reject",
        },
        {
          label: "بازدید شده",
          value: "visited",
        },
        {
          label: "بررسی شده",
          value: "reviewed",
        },
      ],
      typeOption: [
        {
          label: "تصویر",
          value: "image",
        },
        {
          label: "ویدیو",
          value: "video",
        },
        {
          label: "موقعیت",
          value: "location",
        },
        {
          label: "توضیحات",
          value: "description",
        },
      ],
      filter: {
        type: "",
        status: "",
      },
      filterLoading: false,
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
      await this.store
        .getRequestInformation(this.currentPage, this.filter)
        .then((res) => {
          if (this.store.meta.last_page < this.currentPage) {
            this.$router.push({
              query: {
                page: undefined,
              },
            });
            this.currentPage = 1;
            this.store.getRequestInformation(this.currentPage, this.filter);
          }
          this.filterLoading = false;
        });
    },
    pagination(page = 1) {
      if (this.currentPage != page) {
        this.$router.push({ query: { page } });
        this.store.loading = true;
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
        setTimeout(() => {
          if (this.showFilter) this.$refs.filterBody.style.overflow = "visible";
        }, 700);
      } else {
        this.$refs.filterBody.style.maxHeight = null;
        this.$refs.filterBody.style.padding = null;
        this.$refs.filterBody.style.opacity = null;
        this.$refs.filterBody.style.overflow = "hidden";
      }
    },

    submitFilter() {
      this.filterLoading = true;
      this.getLatest();
    },
  },
};
</script>
<template>
  <section class="information__list">
    <div class="card filter__box">
      <div class="card__header collapse__header" @click="collapseFilter">
        <h4 class="heading__title">فیلتر</h4>
        <!-- <span class="collapse__icon" :class="{ rotate: showFilter }">
          <i class="fa-regular fa-chevron-down"></i>
        </span> -->
      </div>
      <div
        class="card__body collapse__body"
        :class="{ showFilter: showFilter }"
        ref="filterBody"
      >
        <div class="row">
          <div class="controls w-1/3">
            <label for="type">نوع درخواست</label>
            <v-select
              v-model="filter.type"
              id="type"
              :options="typeOption"
              :reduce="(option) => option.value"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
          </div>
          <div class="controls w-1/3">
            <label for="status">وضعیت</label>
            <v-select
              v-model="filter.status"
              id="status"
              :options="statusOption"
              :reduce="(option) => option.value"
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
          <div class="controls w-1/4">
            <button
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
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست درخواست اطلاعات بیشتر</h4>
      </div>
      <div class="card__body table">
        <div v-if="!store.loading">
          <div v-if="store.data.length > 0">
            <table>
              <thead>
                <tr>
                  <th>کاربر</th>
                  <th>شماره موبایل</th>
                  <th>ملک</th>
                  <th>تاریخ ایجاد</th>
                  <th>نوع درخواست</th>
                  <th>وضعیت</th>
                  <th>اطلاع رسانی</th>
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
                    <div v-if="item.user && item.user.mobile">
                      {{ item.user.mobile }}
                    </div>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <nuxt-link
                      :to="`https://new.vilator.com/property/${item.property.slug}`"
                      target="_blank"
                      v-if="item.property"
                    >
                      {{ item.property.title }}
                    </nuxt-link>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <div v-if="item.created_at">
                      {{ convertDate(item.created_at) }}
                    </div>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <div v-if="item.type">
                      {{ requestType.find((s) => s.value == item.type).label }}
                    </div>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <span
                        v-if="item.status"
                        :class="`badge badge-pill text-white ${
                          status.find((s) => s.value == item.status).color
                        }`"
                      >
                        {{ status.find((s) => s.value == item.status).label }}
                      </span>
                      <span v-else>-</span>
                    </div>
                  </td>
                  <td>
                    <div class="flex">
                      <span v-if="item.notified" class="notification_on">
                        <i class="fa-solid fa-square-check"></i>
                      </span>
                      <span v-else class="notification_off">
                        <i class="fa-solid fa-square-xmark"></i>
                      </span>
                    </div>
                  </td>
                  <td class="setting">
                    <div class="actions justify-end">
                      <nuxt-link
                        :to="`/requests/information/${item.id}`"
                        class="see__action"
                      >
                        <i class="fa-regular fa-eye"></i>
                      </nuxt-link>
                      <nuxt-link
                        :to="`/requests/information/${item.id}/notification`"
                        class="notification__action"
                      >
                        <i class="fa-regular fa-envelope"></i>
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
.filter__box {
  @apply pb-0;
  .collapse__header {
    // @apply cursor-pointer;
    .collapse__icon {
      @apply transition-transform duration-700;

      &.rotate {
        @apply rotate-180;
      }
    }
  }
  .collapse__body {
    @apply transition-all duration-700 opacity-100;

    &.showFilter {
      padding: 1rem 1.5rem !important;
    }
  }
}

.filters {
  @apply flex items-center gap-3 w-1/2;

  select {
    @apply w-1/2;
  }
}

.notification_off {
  @apply text-[#FF4961] text-2xl;
}

.notification_on {
  @apply text-[#28D094] text-2xl;
}
</style>
