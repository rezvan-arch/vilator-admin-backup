<script>
import { requestVisitStore } from "~/store/admin/request/visit/index";
import moment from "jalali-moment";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | درخواست بازدید",
    });
    const momenT = moment();
    const store = requestVisitStore();
    const route = useRoute();

    store.getSingleVisit(route.params.id);

    return {
      momenT,
      store,
    };
  },
  data() {
    return {
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
  methods: {
    async doUpdateVisit() {
      let body = {
        admin_description: this.store.data.admin_description,
        final_date: this.store.data.final_date,
        status: this.store.data.status,
      };

      this.store
        .updateVisit(body, this.store.data.id)
        .then((res) => {
          this.store.loading = false;
          this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
        })
        .catch((err) => {
          this.store.loading = false;
          this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
        });
    },
  },
};
</script>
<template>
  <section class="visit__edit">
    <div class="card">
      <div class="card__header">
        <h4 v-if="store.loading" class="heading__title">
          درحال بارگزاری اطلاعات...
        </h4>
        <h4 v-else class="heading__title">نمایش در خواست بازدید</h4>
        <div class="heading__actions">
          <nuxt-link to="/requests/visit" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div
        v-if="!store.loading"
        class="card__body border border-b border-t-0 border-l-0 border-r-0 border-[#0000001a]"
      >
        <div class="row">
          <div class="controls w-1/5">
            <label for="user_name">نام کاربر</label>
            <nuxt-link
              v-if="store.data.user"
              :to="`/user/${store.data.user.id}`"
              class="text-baseBlue-500"
            >
              {{ store.data.user.name }}
            </nuxt-link>
            <div v-else>-</div>
          </div>
          <div class="controls w-1/5">
            <label for="user_name">شماره موبایل</label>
            <span v-if="store.data.user">
              {{ store.data.user.mobile }}
            </span>
            <div v-else>-</div>
          </div>
          <div class="controls w-1/5">
            <label for="property_name">نام ملک</label>
            <nuxt-link
              :to="`/property/${store.data.property.slug}`"
              v-if="store.data.property"
            >
              {{ store.data.property.title }}
            </nuxt-link>
            <div v-else>-</div>
          </div>
          <div class="controls w-1/5">
            <label for="notific">اطلاع رسانی</label>
            <span id="notific" v-if="store.data.notified">انجام شد</span>
            <span id="notific" v-else>انجام نشده</span>
          </div>
          <div class="controls w-1/5">
            <label for="suggested_date">تاریخ پیشنهادی</label>
            <span class="suggested_date" v-if="store.data.suggested_date">{{
              convertDate(store.data.suggested_date)
            }}</span>
            <span class="suggested_date" v-else>-</span>
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <label for="description">توضیحات کاربر</label>
            <div
              v-if="store.data.description"
              v-html="store.data.description"
            ></div>
            <div v-else>-</div>
          </div>
        </div>
      </div>
      <div class="card__body" v-if="!store.loading">
        <div class="row">
          <div class="controls w-1/2">
            <label for="status">وضعیت</label>
            <v-select
              v-model="store.data.status"
              :reduce="(option) => option.value"
              id="status"
              :options="status"
              :clearable="false"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <FormInputShowError errorKey="status" />
          </div>
          <div class="controls w-1/2">
            <label for="type">تاریخ بازدید</label>
            <datePicker
              v-model="store.data.final_date"
              format="YYYY-MM-DD HH:mm"
              displayFormat="jYYYY/jMM/jDD"
              simple
            />
            <FormInputShowError errorKey="final_date" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <label for="admin_description">توضیحات ادمین</label>
            <rich-editor v-model="store.data.admin_description" />
            <FormInputShowError errorKey="admin_description" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <button class="btn btn-primary" @click="doUpdateVisit()">
              ویرایش
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.controls label {
  @apply text-sm text-[#2B335E] mb-2 block;
}

select {
  @apply bg-white w-full rounded-[4px];
}

.controls input[type="checkbox"] {
  @apply w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 focus:ring-offset-1;
}
</style>
