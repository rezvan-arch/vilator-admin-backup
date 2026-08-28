<template>
  <vForm v-slot="{ handleSubmit }" as="">
    <div class="row">
      <div class="controls w-1/3">
        <label for="title">عنوان پروژه *</label>
        <input v-model="form.title" id="title" type="text" class="form-control" />
      </div>
      <div class="controls w-1/3">
        <label for="location_title">موقعیت (متن آزاد)</label>
        <input
          v-model="form.location_title"
          id="location_title"
          type="text"
          class="form-control"
          placeholder="مثلاً کلوخک، مازندران"
        />
      </div>
      <div class="controls w-1/3">
        <label for="style">سبک ساخت</label>
        <v-select
          v-model="form.style"
          id="style"
          :options="['مدرن', 'کلاسیک', 'نئوکلاسیک', 'روستیک']"
          autocomplete="off"
        />
      </div>
    </div>

    <div class="row">
      <div class="controls w-1/4">
        <label for="area_meters">متراژ زیربنا *</label>
        <input
          v-model="form.area_meters"
          id="area_meters"
          type="number"
          min="10"
          class="form-control"
        />
      </div>
      <div class="controls w-1/4">
        <label for="floors">تعداد طبقات *</label>
        <input
          v-model="form.floors"
          id="floors"
          type="number"
          min="1"
          class="form-control"
        />
      </div>
      <div class="controls w-1/4">
        <label for="duration_months">مدت ساخت (ماه)</label>
        <input
          v-model="form.duration_months"
          id="duration_months"
          type="number"
          min="1"
          class="form-control"
        />
      </div>
      <div class="controls w-1/4">
        <label for="pstatus">وضعیت پروژه *</label>
        <v-select
          v-model="form.status"
          id="pstatus"
          :options="[
            { label: 'تکمیل شده', value: 'completed' },
            { label: 'در حال ساخت', value: 'in_progress' },
          ]"
          :reduce="(option) => option.value"
          :clearable="false"
          autocomplete="off"
        />
      </div>
    </div>

    <div class="row">
      <div class="controls w-full">
        <label for="short_description">توضیح کوتاه</label>
        <textarea
          v-model="form.short_description"
          id="short_description"
          class="form-control min-h-[80px]"
        ></textarea>
      </div>
    </div>

    <div class="row">
      <div class="controls w-full">
        <label>محتوای پروژه</label>
        <RichEditor v-model="form.content" :gallery="false" />
      </div>
    </div>

    <div class="row">
      <div class="controls w-1/2">
        <label for="video_url">لینک ویدیوی معرفی</label>
        <input
          v-model="form.video_url"
          id="video_url"
          type="text"
          class="form-control"
          placeholder="https://"
        />
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
    <div class="row">
      <div class="controls w-full">
        <label for="seo_description">توضیحات سئو</label>
        <textarea
          v-model="form.seo_options.seo_description"
          id="seo_description"
          class="form-control min-h-[80px]"
        ></textarea>
      </div>
    </div>

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
</template>

<script setup>
defineProps({
  form: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});
defineEmits(["submit"]);
</script>

<style lang="scss" scoped>
label {
  @apply text-sm text-[#2B335E] mb-2 block;
}
</style>
