<script setup>
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | تاییدیه شماره ",
});
const form = {
  verify: true,
};
</script>
<template>
  <section class="verify__number">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">ارسال تاییدیه شماره</h4>
      </div>
      <div class="card__body">
        <div class="row">
          <p>برای ارسال تاییدیه شماره دکمه زیر را کلیک کنید</p>
        </div>
        <div class="row">
          <div class="controls w-full submit">
            <button v-if="!form.verify" class="btn btn-primary">
              ارسال تاییدیه
            </button>
            <button v-else class="btn btn-success">شماره شما تایید شده</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.controls label {
  @apply text-sm text-[#2B335E] mb-2 block;

  .verify {
    @apply text-[#28D094];
  }
}

.submit {
  @apply flex items-center justify-end;
}
</style>
