<script setup>
import useStore from "~~/mixins/store";

definePageMeta({ layout: "admin" });

useHead({
  title: "پنل مدیریت",
});

// variables
const { propertyStore, adminStore } = useStore();

propertyStore.getProperty(1);
adminStore.getStatistics();
</script>
<template>
  <section class="index">
    <!-- statistics -->
    <div class="statistics">
      <div class="card w-1/4">
        <div class="right">
          <h3 v-if="!adminStore.loading">
            {{ adminStore.statistics.user_count }}
          </h3>
          <h3 v-else>-</h3>
          <span>تعداد کاربران</span>
        </div>
        <div class="left">
          <i class="fa-light fa-user"></i>
        </div>
      </div>
      <div class="card w-1/4">
        <div class="right">
          <h3 v-if="!adminStore.loading">
            {{ adminStore.statistics.property_count }}
          </h3>
          <h3 v-else>-</h3>
          <span>تعداد ملک</span>
        </div>
        <div class="left">
          <i class="fa-light fa-house"></i>
        </div>
      </div>
      <div class="card w-1/4">
        <div class="right">
          <h3 v-if="!adminStore.loading">
            {{ adminStore.statistics.visit_request_count }}
          </h3>
          <h3 v-else>-</h3>
          <span>تعداد درخواست بازدید</span>
        </div>
        <div class="left">
          <i class="fa-light fa-house-circle-exclamation"></i>
        </div>
      </div>
      <div class="card w-1/4">
        <div class="right">
          <h3 v-if="!adminStore.loading">
            {{ adminStore.statistics.information_request_count }}
          </h3>
          <h3 v-else>-</h3>
          <span>تعداد درخواست اطلاعات بیشتر</span>
        </div>
        <div class="left">
          <i class="fa-light fa-memo-circle-info"></i>
        </div>
      </div>
    </div>
    <!-- quick access -->
    <div class="quick__access">
      <nuxt-link to="/user" class="card w-1/4">
        <div class="card__header">لیست کاربران</div>
      </nuxt-link>
      <nuxt-link to="/user/new" class="card w-1/4">
        <div class="card__header">ساخت کاربر جدید</div>
      </nuxt-link>
      <nuxt-link to="/property" class="card w-1/4">
        <div class="card__header">لیست ملک</div>
      </nuxt-link>
      <nuxt-link to="/property/new" class="card w-1/4">
        <div class="card__header">ساخت ملک جدید</div>
      </nuxt-link>
    </div>
    <!-- property list -->
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">آخرین ملک های ثبت شده</h4>
      </div>
      <div class="card__body table">
        <div v-if="!propertyStore.loading">
          <div v-if="propertyStore.properties.length > 0">
            <table>
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>کدملک</th>
                  <th>اسلاگ</th>
                  <th>عنوان</th>
                  <th>وضعیت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in propertyStore.properties"
                  :key="index"
                >
                  <td>{{ item.title }}</td>
                  <td>
                    {{ item.property_code }}
                  </td>
                  <td>
                    {{ item.slug }}
                  </td>
                  <td>
                    <template v-if="item.type != null">
                      {{ item.type.title }}
                    </template>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <span
                        v-if="item.status == 'private'"
                        class="badge badge-pill badge-primary"
                      >
                        خصوصی
                      </span>
                      <span
                        v-if="item.status == 'public'"
                        class="badge badge-pill badge-success"
                      >
                        عمومی
                      </span>
                      <span
                        v-if="item.status == 'draft'"
                        class="badge badge-pill badge-warning"
                      >
                        پیش نویس
                      </span>
                    </div>
                  </td>
                  <td class="setting">
                    <div class="actions">
                      <nuxt-link
                        v-if="item.status == 'draft'"
                        :to="`https://new.vilator.com/property/${item.slug}?preview=true`"
                        target="_blank"
                        title="نمایش ملک"
                        class="see__action"
                      >
                        <i class="fa-regular fa-eye"></i>
                      </nuxt-link>
                      <nuxt-link
                        v-else
                        :to="`https://new.vilator.com/property/${item.slug}`"
                        target="_blank"
                        title="نمایش ملک"
                        class="see__action"
                      >
                        <i class="fa-regular fa-eye"></i>
                      </nuxt-link>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
.statistics {
  @apply flex gap-2;
  .card {
    @apply flex items-center justify-between p-4;

    .right {
      h3 {
        @apply font-bold text-4xl pb-4;
      }

      span {
        @apply text-base opacity-80;
      }
    }

    .left {
      @apply text-5xl;
    }

    &:nth-child(1) {
      h3,
      .left {
        @apply text-cyan-400;
      }
    }
    &:nth-child(2) {
      h3,
      .left {
        @apply text-green-400;
      }
    }
    &:nth-child(2) {
      h3,
      .left {
        @apply text-green-400;
      }
    }
    &:nth-child(3) {
      h3,
      .left {
        @apply text-orange-400;
      }
    }
    &:nth-child(4) {
      h3,
      .left {
        @apply text-red-400;
      }
    }
  }
}
.quick__access {
  @apply flex gap-2;
  .card {
    @apply opacity-70 hover:opacity-100 hover:text-[#666ee8] transition-all duration-300;
  }
}
</style>
