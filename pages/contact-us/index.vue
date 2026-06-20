<script>
import { contactUsStore } from "~/store/admin/contact-us/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ارتباط باما ",
    });
    const store = contactUsStore();

    return {
      store,
    };
  },
  data() {
    return {
      currentPage: 1,
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
      await this.store.getAll(this.currentPage).then(() => {
        if (this.store.meta.last_page < this.currentPage) {
          this.$router.push({
            query: {
              page: undefined,
            },
          });
          this.currentPage = 1;
          this.store.getAll(this.currentPage);
        }
      });
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
  <section class="contact__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست ارتباط با ما</h4>
      </div>
      <div class="card__body table">
        <div v-if="!store.loading">
          <div v-if="store.data.length > 0">
            <table>
              <thead>
                <tr>
                  <th>نام کامل</th>
                  <th>موضوع</th>
                  <th>موبایل</th>
                  <th>ایمیل</th>
                  <th>تاریخ</th>
                  <th>وضعیت</th>
                  <th style="text-align: left">مشاهده</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in store.data" :key="index">
                  <td>
                    <span v-if="item.full_name">
                      {{ item.full_name }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <span v-if="item.subject">{{ item.subject }}</span>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <span v-if="item.mobile">{{ item.mobile }}</span>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <span v-if="item.email">{{ item.email }}</span>
                    <span v-else>-</span>
                  </td>
                  <td style="direction: ltr;">
                    <span v-if="item.created_at">{{ convertDate(item.created_at,true) }}</span>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <span
                        v-if="item.viewer"
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
                        :to="`/contact-us/${item.id}`"
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
