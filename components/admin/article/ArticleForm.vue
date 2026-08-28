<template>
  <vForm v-slot="{ handleSubmit }" as="">
    <div class="row">
      <div class="controls w-1/2">
        <label for="title">عنوان مقاله *</label>
        <input v-model="form.title" id="title" type="text" class="form-control" />
      </div>
      <div class="controls w-1/2">
        <label for="h1">عنوان H1 *</label>
        <input v-model="form.h1" id="h1" type="text" class="form-control" />
      </div>
    </div>

    <div class="row">
      <div class="controls w-full">
        <label for="summary">خلاصه مقاله</label>
        <textarea
          v-model="form.summary"
          id="summary"
          class="form-control min-h-[80px]"
          maxlength="500"
        ></textarea>
      </div>
    </div>

    <div class="row">
      <div class="controls w-1/3">
        <label for="type">نوع مقاله *</label>
        <v-select
          v-model="form.type"
          id="type"
          :options="typeOptions"
          :reduce="(option) => option.value"
          :clearable="false"
          autocomplete="off"
        />
      </div>
      <div class="controls w-1/3">
        <label for="hub">هاب *</label>
        <v-select
          v-model="form.hub"
          id="hub"
          :options="hubOptions"
          :reduce="(option) => option.value"
          :clearable="false"
          autocomplete="off"
        />
      </div>
      <div class="controls w-1/3" v-if="form.type == 'cluster'">
        <label for="parent_id">مقاله والد (پیلار) *</label>
        <v-select
          v-model="form.parent_id"
          id="parent_id"
          :options="pillarOptions"
          :reduce="(option) => option.id"
          label="title"
          autocomplete="off"
        />
      </div>
      <div class="controls w-1/3" v-if="form.type == 'location_hub'">
        <label for="location_slug">اسلاگ لوکیشن (مثلاً sarokhod) *</label>
        <input
          v-model="form.location_slug"
          id="location_slug"
          type="text"
          class="form-control"
        />
      </div>
    </div>

    <div class="row">
      <div class="controls w-1/4">
        <label for="status">وضعیت *</label>
        <v-select
          v-model="form.status"
          id="status"
          :options="statusOptions"
          :reduce="(option) => option.value"
          :clearable="false"
          autocomplete="off"
        />
      </div>
      <div class="controls w-1/4">
        <label for="reading_time">زمان مطالعه (دقیقه)</label>
        <input
          v-model="form.reading_time"
          id="reading_time"
          type="number"
          min="1"
          class="form-control"
        />
      </div>
      <div class="controls w-1/4">
        <label for="published_at">تاریخ انتشار</label>
        <input
          v-model="form.published_at"
          id="published_at"
          type="date"
          class="form-control"
        />
      </div>
      <div class="controls w-1/4">
        <label>تصویر شاخص</label>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn btn-primary h-[46px]"
            @click="setFeatured"
          >
            <i class="fa-regular fa-image"></i>
            انتخاب از گالری
          </button>
          <img
            v-if="featuredPreview"
            :src="featuredPreview"
            class="w-16 h-16 object-cover rounded"
          />
          <button
            v-if="form.featured_image_id"
            type="button"
            class="delete__action"
            @click="clearFeatured"
          >
            <i class="fa-regular fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="controls w-full">
        <label>محتوای مقاله *</label>
        <RichEditor v-model="form.content" :gallery="false" />
      </div>
    </div>

    <!-- سئو -->
    <div class="row mt-6">
      <div class="controls w-full">
        <h5 class="font-bold mb-2">تنظیمات سئو</h5>
      </div>
    </div>
    <div class="row">
      <div class="controls w-1/2">
        <label for="seo_title">عنوان سئو</label>
        <input
          v-model="form.seo_options.seo_title"
          id="seo_title"
          type="text"
          class="form-control"
        />
      </div>
      <div class="controls w-1/2">
        <label for="canonical_url">Canonical URL</label>
        <input
          v-model="form.seo_options.canonical_url"
          id="canonical_url"
          type="text"
          class="form-control"
        />
      </div>
    </div>
    <div class="row">
      <div class="controls w-1/2">
        <label for="seo_description">توضیحات سئو</label>
        <textarea
          v-model="form.seo_options.seo_description"
          id="seo_description"
          class="form-control min-h-[80px]"
          maxlength="500"
        ></textarea>
      </div>
      <div class="controls w-1/2 flex items-end pb-2">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="form.seo_options.is_indexable"
            class="w-4 h-4"
          />
          اجازه ایندکس در گوگل
        </label>
      </div>
    </div>

    <!-- متای لوکیشن (فقط Location Hub) -->
    <template v-if="form.type == 'location_hub'">
      <div class="row mt-6">
        <div class="controls w-full">
          <h5 class="font-bold mb-2">متای منطقه (Location Hub)</h5>
        </div>
      </div>
      <div class="row">
        <div class="controls w-1/4">
          <label for="average_meter_price">میانگین قیمت هر متر (تومان)</label>
          <input
            v-model="form.location_meta.average_meter_price"
            id="average_meter_price"
            type="number"
            min="0"
            class="form-control"
          />
        </div>
        <div class="controls w-1/4">
          <label for="distance_to_tehran_km">فاصله تا تهران (کیلومتر)</label>
          <input
            v-model="form.location_meta.distance_to_tehran_km"
            id="distance_to_tehran_km"
            type="number"
            min="0"
            class="form-control"
          />
        </div>
        <div class="controls w-1/4">
          <label for="distance_to_tehran_hours">زمان تا تهران (ساعت)</label>
          <input
            v-model="form.location_meta.distance_to_tehran_hours"
            id="distance_to_tehran_hours"
            type="number"
            step="0.1"
            min="0"
            class="form-control"
          />
        </div>
        <div class="controls w-1/4">
          <label for="weather_type">آب و هوا</label>
          <v-select
            v-model="form.location_meta.weather_type"
            id="weather_type"
            :options="['معتدل', 'شرجی', 'کوهستانی', 'گرم و خشک']"
            autocomplete="off"
          />
        </div>
      </div>
      <div class="row">
        <div class="controls w-1/4">
          <label for="investment_score">امتیاز سرمایه‌گذاری (۰ تا ۱۰)</label>
          <input
            v-model="form.location_meta.investment_score"
            id="investment_score"
            type="number"
            min="0"
            max="10"
            class="form-control"
          />
        </div>
        <div class="controls w-3/4">
          <label>مزایا</label>
          <div
            v-for="(item, index) in form.location_meta.advantages"
            :key="'adv-' + index"
            class="flex gap-2 mb-2"
          >
            <input
              v-model="form.location_meta.advantages[index]"
              type="text"
              class="form-control"
            />
            <button
              type="button"
              class="delete__action"
              @click="form.location_meta.advantages.splice(index, 1)"
            >
              <i class="fa-regular fa-trash"></i>
            </button>
          </div>
          <button
            type="button"
            class="btn btn-light btn-sm"
            @click="form.location_meta.advantages.push('')"
          >
            <i class="fa-regular fa-plus"></i>
            افزودن مزیت
          </button>
        </div>
      </div>
      <div class="row">
        <div class="controls w-3/4">
          <label>معایب</label>
          <div
            v-for="(item, index) in form.location_meta.disadvantages"
            :key="'dis-' + index"
            class="flex gap-2 mb-2"
          >
            <input
              v-model="form.location_meta.disadvantages[index]"
              type="text"
              class="form-control"
            />
            <button
              type="button"
              class="delete__action"
              @click="form.location_meta.disadvantages.splice(index, 1)"
            >
              <i class="fa-regular fa-trash"></i>
            </button>
          </div>
          <button
            type="button"
            class="btn btn-light btn-sm"
            @click="form.location_meta.disadvantages.push('')"
          >
            <i class="fa-regular fa-plus"></i>
            افزودن عیب
          </button>
        </div>
      </div>
    </template>

    <div class="row mt-6">
      <div class="controls w-full">
        <button
          class="btn btn-primary w-[140px] h-[46px]"
          @click="handleSubmit($emit('submit'))"
          :disabled="saving"
        >
          <template v-if="saving">
            <i class="fa-solid fa-spinner text-white text-xl animate-spin"></i>
          </template>
          <template v-else> ذخیره </template>
        </button>
      </div>
    </div>
  </vForm>

  <teleport to="body">
    <transition name="translate">
      <AdminMediaMediaImportModal
        v-if="galleryPopup"
        galleryType=""
        @closeModal="
          galleryPopup = false;
          indexStore.showModalFn(false);
        "
        @chooseMedia="galleryEvent"
      />
    </transition>
  </teleport>
</template>

<script setup>
import useStore from "~~/mixins/store";

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  pillarOptions: {
    type: Array,
    default: () => [],
  },
  saving: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["submit"]);

const { indexStore } = useStore();
const galleryPopup = ref(false);
const featuredDetails = ref(null);

const typeOptions = [
  { label: "پیلار (مقاله مرجع)", value: "pillar" },
  { label: "کلاستر (مقاله فرعی)", value: "cluster" },
  { label: "هاب معرفی منطقه", value: "location_hub" },
  { label: "گزارش بازار", value: "market_report" },
];

const hubOptions = [
  { label: "راهنمای خرید", value: "buying_guide" },
  { label: "راهنمای اجاره", value: "rental_guide" },
  { label: "سرمایه‌گذاری", value: "investment" },
  { label: "حقوقی و ثبتی", value: "legal" },
  { label: "ارزش‌گذاری و قیمت", value: "appraisal" },
  { label: "راهنمای ساخت", value: "construction_guide" },
  { label: "معاملات و مذاکره", value: "transaction" },
  { label: "مناطق و مقاصد", value: "location" },
];

const statusOptions = [
  { label: "پیش‌نویس", value: "draft" },
  { label: "منتشر شده", value: "published" },
  { label: "آرشیو", value: "archived" },
];

const featuredPreview = computed(() => {
  if (!featuredDetails.value) return null;
  const item = featuredDetails.value;
  return (
    item.userChoice ||
    item.meta_value?.["thumbnail"]?.get_url ||
    Object.values(item.meta_value || {})[0]?.get_url ||
    null
  );
});

function setFeatured() {
  indexStore.showModalFn(true);
  galleryPopup.value = true;
}

function clearFeatured() {
  featuredDetails.value = null;
  props.form.featured_image_id = null;
}

function galleryEvent(data) {
  if (data.format != "image") {
    featuredDetails.value = null;
    return;
  }
  featuredDetails.value = data;
  props.form.featured_image_id = data.id;
  galleryPopup.value = false;
  indexStore.showModalFn(false);
}
</script>

<style lang="scss" scoped>
label {
  @apply text-sm text-[#2B335E] mb-2 block;
}
</style>
