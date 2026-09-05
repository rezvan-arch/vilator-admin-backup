<script setup>
// تحلیل داخلی CRO — گزارش رویدادهای تبدیل (کالکشن track_events بک‌اند)
import { trackStore } from "~/store/admin/track";

definePageMeta({ layout: "admin" });

const dayOptions = [
  { label: "۷ روز", value: 7 },
  { label: "۳۰ روز", value: 30 },
  { label: "۹۰ روز", value: 90 },
];

const eventTitles = {
  property_view: "بازدید ملک",
  call_click: "کلیک تماس",
  whatsapp_click: "کلیک واتساپ",
  sms_click: "کلیک پیامک",
  telegram_click: "کلیک تلگرام",
  email_click: "کلیک ایمیل",
  visit_request_submit: "ثبت درخواست بازدید",
  info_request_submit: "ثبت درخواست اطلاعات",
  property_bookmark: "ذخیره علاقه‌مندی",
  construction_lead_submit: "لید ساخت و ساز",
  calculator_lead_submit: "لید ماشین‌حساب",
};

onMounted(() => {
  trackStore.getSummary(trackStore.days);
});

const perEvent = computed(() => trackStore.summary?.per_event ?? {});
const topProperties = computed(() => trackStore.summary?.top_properties ?? []);
const topCities = computed(() => trackStore.summary?.top_cities ?? []);

function applyDays() {
  trackStore.getSummary(trackStore.days);
}
function formatNumber(v) {
  return Number(v || 0).toLocaleString("fa-IR");
}
</script>
<template>
  <section class="properties__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">تحلیل داخلی رویدادها (CRO)</h4>
      </div>
      <div class="card__body table">
        <div class="filter__box flex gap-2 mb-4">
          <v-select
            v-model="trackStore.days"
            placeholder="بازه"
            :options="dayOptions"
            :reduce="(option) => option.value"
            :clearable="false"
            autocomplete="off"
            class="w-[140px]"
            @option:selected="applyDays"
          />
        </div>

        <div v-if="!trackStore.loading">
          <!-- قیف: ترتیب رویدادها از بک‌اند میآید (بازدید → تماس → درخواست → لید) -->
          <div v-if="Object.keys(perEvent).length > 0">
            <table>
              <thead>
                <tr>
                  <th>رویداد</th>
                  <th>تعداد</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(count, event) in perEvent" :key="event">
                  <td class="font-bold">
                    {{ eventTitles[event] ?? event }}
                  </td>
                  <td dir="ltr">{{ formatNumber(count) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="py-6 text-center text-gray-400">
            هنوز رویدادی ثبت نشده است (دیتای مرورگر پس از deploy سایت جمع میشود)
          </div>

          <div
            v-if="topProperties.length > 0"
            class="mt-8"
          >
            <h5 class="font-bold mb-2">پربازدیدترین ملک‌ها</h5>
            <table>
              <thead>
                <tr>
                  <th>کد ملک</th>
                  <th>بازدید</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in topProperties" :key="index">
                  <td dir="ltr">{{ item.key }}</td>
                  <td dir="ltr">{{ formatNumber(item.count) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="topCities.length > 0" class="mt-8">
            <h5 class="font-bold mb-2">شهرهای پرترافیک</h5>
            <table>
              <thead>
                <tr>
                  <th>شهر</th>
                  <th>رویداد</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in topCities" :key="index">
                  <td>{{ item.key }}</td>
                  <td dir="ltr">{{ formatNumber(item.count) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else class="py-6 text-center">
          <i class="fa-solid fa-spinner animate-spin ml-2"></i>
          در حال بارگذاری...
        </div>
      </div>
    </div>
  </section>
</template>
