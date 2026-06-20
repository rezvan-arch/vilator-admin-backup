<script setup>
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | اطلاعات پروفایل ",
});
const form = {
  name: "امیرحسین زبردست",
  mail: {
    value: "amirhz.dev@gmail.com",
    verify: true,
  },
  number: {
    value: "09027206371",
    verify: true,
  },
};
</script>
<template>
  <section class="profile__info">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">تغییر اطلاعات پروفایل</h4>
      </div>
      <div class="card__body">
        <div class="row">
          <div class="controls w-full">
            <label for="title">نام</label>
            <input
              v-model="form.name"
              type="text"
              id="title"
              class="form-control"
            />
            <FormInputShowError errorKey="name" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <label for="price"
              >شماره همراه
              <span v-if="form.number.verify" class="verify"
                >(تایید شده)</span
              ></label
            >
            <input
              v-model="form.number.value"
              type="text"
              id="price"
              class="form-control"
              @input="
                (event) => (form.number.value = $checkNumber(event.target.value, 11))
              "
            />
            <FormInputShowError errorKey="number" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <label for="slug"
              >ایمیل
              <span v-if="form.mail.verify" class="verify"
                >(تایید شده)</span
              ></label
            >
            <input
              v-model="form.mail.value"
              type="text"
              id="slug"
              class="form-control"
            />
            <FormInputShowError errorKey="mail" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full submit">
            <button class="btn btn-primary">ذخیره اطلاعات</button>
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
  @apply flex justify-end;
}
</style>
