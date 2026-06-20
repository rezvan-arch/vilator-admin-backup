<script setup>
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | تغییر رمز عبور ",
});
const form = {
  oldPass: "",
  newPass: "",
};
</script>
<template>
  <section class="profile__password">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">تغییر رمز عبور</h4>
      </div>
      <div class="card__body">
        <div class="row">
          <div class="controls w-full">
            <label for="oldPass"> رمز عبور فعلی </label>
            <input
              v-model="form.oldPass"
              type="text"
              id="oldPass"
              class="form-control"
            />
            <FormInputShowError errorKey="oldPass" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <label for="newPass"> رمز عبور جدید </label>
            <input
              v-model="form.newPass"
              type="text"
              id="newPass"
              class="form-control"
            />
            <FormInputShowError errorKey="newPass" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full submit">
            <button class="btn btn-primary">تغییر رمز عبور</button>
            <div class="resetPass">
              <p>
                رمز عبور خود را فراموش کردید؟
                <nuxt-link to="">بازیابی رمز عبور</nuxt-link>
              </p>
            </div>
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
  @apply flex items-center justify-between;

  .resetPass {
    @apply text-sm text-[#6B6F82] mb-0;

    a {
      @apply text-[#1E9FF2];
    }
  }
}
</style>
