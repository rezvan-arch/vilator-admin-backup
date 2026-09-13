<template>
  <!--
    توضیح کمکی فیلد — آیکون کوچک کنار label؛ هاور/فوکوس، متن توضیح نمایش
    داده میشود (جلسه ۴۸: مستندات متغیرهای بنر بدون شلوغکردن فرم).
    CSS خام — @apply با variantهای خاص در ادمین میشکند (درس پروژه).
  -->
  <span
    class="form-hint"
    tabindex="0"
    role="note"
    :aria-label="text"
  >
    <i class="fa-regular fa-circle-question" aria-hidden="true"></i>
    <span class="form-hint__box" v-text="text"></span>
  </span>
</template>

<script>
export default {
  props: {
    text: { type: String, required: true },
  },
};
</script>

<style scoped>
.form-hint {
  position: relative;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  margin-inline-start: 6px;
  color: #94a3b8;
  cursor: help;
  outline: none;
}

.form-hint i {
  font-size: 14px;
  line-height: 1;
}

.form-hint:hover,
.form-hint:focus {
  color: #3b82f6;
}

.form-hint__box {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  right: -8px;
  z-index: 50;
  width: max-content;
  max-width: 320px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #1e293b;
  color: #f1f5f9;
  font-size: 12px;
  line-height: 1.9;
  text-align: right;
  white-space: pre-line;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  direction: rtl;
}

.form-hint:hover .form-hint__box,
.form-hint:focus .form-hint__box {
  display: block;
}
</style>
