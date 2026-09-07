<template>
  <div class="banner-preview">
    <h4 class="mb-4 text-lg font-semibold">پیش‌نمایش زنده</h4>

    <div class="card" :class="`placement-${placement}`">
      <div class="card__header">
        <div class="card__title">{{ title || 'تیتر کارت' }}</div>
      </div>

      <div class="card__body">
        <p class="mb-4">{{ description || 'توضیح کارت...' }}</p>

        <a
          :href="button_link || '#'"
          target="_blank"
          class="btn btn-primary"
          :class="is_active ? '' : 'opacity-50'"
        >
          {{ button_text || 'دکمه' }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  placement: string
  title: string
  description: string
  button_text: string
  button_link: string
  is_active: boolean
}>()
</script>

<style scoped>
.banner-preview {
  margin-bottom: 2rem;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.card__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.card__title {
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
}

.card__body {
  padding: 1.5rem;
}

.placement-landing {
  border-left: 4px solid #667eea;
}
</style>
