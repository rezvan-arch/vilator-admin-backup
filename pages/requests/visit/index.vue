<script>
import { requestVisitStore } from "~/store/admin/request/visit/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | درخواست بازدید",
    });
    const store = requestVisitStore();

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
      await this.store.getRequestVisits(this.currentPage).then(() => {
        if (this.store.meta.last_page < this.currentPage) {
          this.$router.push({
            query: {
              page: undefined,
            },
          });
          this.currentPage = 1;
          this.store.getRequestVisits(this.currentPage);
        }
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
  },
};
</script>
<template>
  <section class="visit__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست درخواست های بازدید</h4>
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
                  <th>تاریخ پیشنهادی</th>
                  <th>تاریخ بازدید</th>
                  <th>وضعیت</th>
                  <th>اطلاع رسانی</th>
                  <th style="text-align: left">تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in store.data" :key="index">
                  <td>
                    <nuxt-link
                      :to="`/user/${item.user.id}`"
                      v-if="item.user && item.user.name"
                    >
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
                    <div v-if="item.suggested_date">
                      {{ convertDate(item.suggested_date) }}
                    </div>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <div v-if="item.final_date">
                      {{ convertDate(item.final_date) }}
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
                        :to="`/requests/visit/${item.id}`"
                        class="see__action"
                      >
                        <i class="fa-regular fa-eye"></i>
                      </nuxt-link>
                      <nuxt-link
                        :to="`/requests/visit/${item.id}/notification`"
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
