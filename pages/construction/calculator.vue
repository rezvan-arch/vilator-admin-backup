<script setup>
import useStore from "~/mixins/store";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | تنظیمات ماشین‌حساب ساخت",
});

const { constructionStore } = useStore();
const { $toast } = useNuxtApp();

constructionStore.getCalculatorSettings();

const form = reactive({
  rates: {
    villa: { economic: null, modern: null, luxury: null },
    apartment: { economic: null, modern: null, luxury: null },
  },
  floor_factor_mid: 1.3,
  floor_factor_high: 1.6,
  spread_percent: 10,
  active: true,
});

watch(
  () => constructionStore.calculator,
  (val) => {
    if (!val) return;
    form.rates.villa.economic = val.rates?.villa?.economic ?? null;
    form.rates.villa.modern = val.rates?.villa?.modern ?? null;
    form.rates.villa.luxury = val.rates?.villa?.luxury ?? null;
    form.rates.apartment.economic = val.rates?.apartment?.economic ?? null;
    form.rates.apartment.modern = val.rates?.apartment?.modern ?? null;
    form.rates.apartment.luxury = val.rates?.apartment?.luxury ?? null;
    form.floor_factor_mid = val.floor_factor_mid ?? 1.3;
    form.floor_factor_high = val.floor_factor_high ?? 1.6;
    form.spread_percent = val.spread_percent ?? 10;
    form.active = val.active ?? true;
  },
  { immediate: true }
);

const saving = ref(false);
async function save() {
  saving.value = true;
  try {
    const res = await constructionStore.updateCalculatorSettings({
      rates: form.rates,
      floor_factor_mid: Number(form.floor_factor_mid),
      floor_factor_high: Number(form.floor_factor_high),
      spread_percent: Number(form.spread_percent),
      active: form.active,
    });
    if (res.status == "success") {
      $toast("تنظیمات ماشین‌حساب ذخیره شد", "success", 2000);
    }
  } catch (err) {
    $toast(err?.message || "ذخیره نشد", "error", 3000);
  } finally {
    saving.value = false;
  }
}

const qualityLabels = {
  economic: "اقتصادی",
  modern: "مدرن / متوسط",
  luxury: "لوکس",
};
</script>

<template>
  <div class="p-5">
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-xl font-black text-gray-800">تنظیمات ماشین‌حساب تخمین هزینه ساخت</h1>
    </div>

    <div v-if="constructionStore.loading" class="text-sm text-gray-400 py-10 text-center">
      در حال بارگذاری…
    </div>

    <div v-else class="max-w-3xl space-y-6">
      <!-- نرخ هر متر مربع -->
      <div class="bg-white rounded-xl border p-5">
        <h2 class="font-bold text-sm mb-4 text-gray-700">نرخ ساخت (تومان بر متر مربع زیربنا)</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="(qualities, type) in form.rates" :key="type" class="space-y-3">
            <h3 class="font-bold text-xs text-[#40aac8]">
              {{ type === "villa" ? "ویلا" : "آپارتمان" }}
            </h3>
            <div v-for="(val, q) in qualities" :key="q" class="flex items-center gap-3">
              <label class="w-28 text-xs text-gray-600">{{ qualityLabels[q] }}</label>
              <input
                v-model.number="form.rates[type][q]"
                type="number"
                min="0"
                class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#40aac8]"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ضریب‌های جهشی طبقات -->
      <div class="bg-white rounded-xl border p-5">
        <h2 class="font-bold text-sm mb-2 text-gray-700">ضریب‌های جهشی طبقات آپارتمان</h2>
        <p class="text-[11px] text-gray-400 mb-4 leading-5">
          طبق سند v3: ویلا در هر طبقه‌ای ضریب ۱ می‌گیرد؛ آپارتمان ۴ تا ۸ طبقه با ضریب میانی و
          بیش از ۸ طبقه با ضریب بالا محاسبه می‌شود.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center gap-3">
            <label class="w-56 text-xs text-gray-600">ضریب میانی (۴ تا ۸ طبقه)</label>
            <input
              v-model.number="form.floor_factor_mid"
              type="number"
              step="0.1"
              min="1"
              max="3"
              class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#40aac8]"
            />
          </div>
          <div class="flex items-center gap-3">
            <label class="w-56 text-xs text-gray-600">ضریب بالا (بیش از ۸ طبقه)</label>
            <input
              v-model.number="form.floor_factor_high"
              type="number"
              step="0.1"
              min="1"
              max="3"
              class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#40aac8]"
            />
          </div>
          <div class="flex items-center gap-3">
            <label class="w-56 text-xs text-gray-600">دامنه بازه (درصد ±)</label>
            <input
              v-model.number="form.spread_percent"
              type="number"
              min="0"
              max="100"
              class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#40aac8]"
            />
          </div>
          <div class="flex items-center gap-3">
            <label class="w-56 text-xs text-gray-600">فعال</label>
            <input v-model="form.active" type="checkbox" class="w-4 h-4" />
          </div>
        </div>
      </div>

      <button
        type="button"
        :disabled="saving"
        @click="save"
        class="rounded-lg bg-[#40aac8] text-white font-bold text-sm px-8 py-3 hover:bg-[#3598b5] disabled:opacity-60"
      >
        <i v-if="saving" class="fa-solid fa-spinner fa-spin ml-2"></i>
        ذخیره تنظیمات
      </button>
    </div>
  </div>
</template>
