<script>
import { profileStore } from "~/store/admin/profile/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | تاییدیه ایمیل ",
    });
    const store = profileStore();

    store.getCurrentUser();

    return {
      store,
    };
  },
  data() {
    return {};
  },
  methods: {
    async doVerifyEmail() {
      let error = false;

      if (!error) {
        this.store
          .sendEmailVerification()
          .then((res) => {
            this.store.loading = false;
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
            this.$router.push("/profile/info");
          })
          .catch((err) => {
            this.store.loading = false;
            this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
          });
      }
    },
  },
};
</script>
<template>
  <section class="verify__mail">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title" v-if="!store.loading">
          ارسال تاییدیه ایمیل
        </h4>
        <h4 class="heading__title" v-else>درحال دریافت اطلاعات...</h4>
      </div>
      <div class="card__body" v-if="!store.loading">
        <div class="row">
          <p>برای ارسال تاییدیه ایمیل دکمه زیر را کلیک کنید</p>
        </div>
        <div class="row">
          <div class="controls w-full submit">
            <button
              v-if="store.currentUser && !store.currentUser.email_verified_at"
              class="btn btn-primary"
              @click="doVerifyEmail()"
              :disabled="verifyBtnDisabled"
            >
              ارسال تاییدیه
            </button>
            <button v-else disabled class="btn btn-success">
              ایمیل شما تایید شده
            </button>
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
