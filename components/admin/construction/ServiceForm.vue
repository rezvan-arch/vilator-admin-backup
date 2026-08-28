<template>
  <vForm v-slot="{ handleSubmit }" as="">
    <div class="row">
      <div class="controls w-1/2">
        <label for="title">عنوان خدمت *</label>
        <input v-model="form.title" id="title" type="text" class="form-control" />
      </div>
      <div class="controls w-1/4">
        <label for="service_type">نوع خدمت *</label>
        <v-select
          v-model="form.service_type"
          id="service_type"
          :options="serviceTypeOptions"
          :reduce="(option) => option.value"
          :clearable="false"
          autocomplete="off"
        />
      </div>
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
        <label>محتوای خدمت *</label>
        <RichEditor v-model="form.content" :gallery="false" />
      </div>
    </div>

    <!-- پکیج‌ها -->
    <div class="row mt-6">
      <div class="controls w-full flex items-center justify-between">
        <h5 class="font-bold">پکیج‌ها و تعرفه‌ها</h5>
        <button
          type="button"
          class="btn btn-light btn-sm"
          @click="form.packages.push({ title: '', description: '', price: null, features: [] })"
        >
          <i class="fa-regular fa-plus"></i>
          افزودن پکیج
        </button>
      </div>
    </div>
    <div
      v-for="(pkg, index) in form.packages"
      :key="'pkg-' + index"
      class="card mb-3 p-3 border rounded"
    >
      <div class="row">
        <div class="controls w-1/3">
          <label>عنوان پکیج *</label>
          <input v-model="pkg.title" type="text" class="form-control" />
        </div>
        <div class="controls w-1/3">
          <label>قیمت (تومان)</label>
          <input v-model="pkg.price" type="number" min="0" class="form-control" />
        </div>
        <div class="controls w-1/3 flex items-end">
          <button
            type="button"
            class="delete__action"
            @click="form.packages.splice(index, 1)"
          >
            <i class="fa-regular fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="row">
        <div class="controls w-full">
          <label>توضیحات پکیج</label>
          <textarea v-model="pkg.description" class="form-control min-h-[60px]"></textarea>
        </div>
      </div>
      <div class="row">
        <div class="controls w-full">
          <label>ویژگی‌ها (هر خط یک مورد)</label>
          <textarea
            v-model="pkg.featuresText"
            class="form-control min-h-[60px]"
            placeholder="مثلاً: نقشه معماری&#10;نظارت کارگاهی"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- سوالات متداول -->
    <div class="row mt-6">
      <div class="controls w-full flex items-center justify-between">
        <h5 class="font-bold">سوالات متداول</h5>
        <button
          type="button"
          class="btn btn-light btn-sm"
          @click="form.faqs.push({ question: '', answer: '' })"
        >
          <i class="fa-regular fa-plus"></i>
          افزودن سوال
        </button>
      </div>
    </div>
    <div
      v-for="(faq, index) in form.faqs"
      :key="'faq-' + index"
      class="card mb-3 p-3 border rounded"
    >
      <div class="row">
        <div class="controls w-1/2">
          <label>سوال *</label>
          <input v-model="faq.question" type="text" class="form-control" />
        </div>
        <div class="controls w-1/2 flex items-end gap-2">
          <input
            v-model="faq.answer"
            type="text"
            class="form-control"
            placeholder="پاسخ"
          />
          <button
            type="button"
            class="delete__action"
            @click="form.faqs.splice(index, 1)"
          >
            <i class="fa-regular fa-trash"></i>
          </button>
        </div>
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
const props = defineProps({
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

const serviceTypeOptions = [
  { label: "طراحی", value: "design" },
  { label: "پیمانکاری ساخت", value: "contracting" },
  { label: "بازسازی و نوسازی", value: "renovation" },
  { label: "طراحی داخلی", value: "interior_design" },
  { label: "مدیریت پروژه", value: "project_management" },
];

const statusOptions = [
  { label: "پیش‌نویس", value: "draft" },
  { label: "منتشر شده", value: "published" },
  { label: "آرشیو", value: "archived" },
];

// تبدیل آرایه features به متن و برعکس برای پکیج‌ها
watch(
  () => props.form.packages,
  (packages) => {
    packages.forEach((pkg) => {
      if (pkg.featuresText === undefined) {
        pkg.featuresText = (pkg.features ?? []).join("\n");
      }
    });
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
label {
  @apply text-sm text-[#2B335E] mb-2 block;
}
</style>
