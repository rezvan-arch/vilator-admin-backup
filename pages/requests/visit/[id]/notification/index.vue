<script>
import { requestVisitStore } from "~/store/admin/request/visit/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | درخواست بازدید",
    });
    const store = requestVisitStore();
    const route = useRoute();

    store.getSingleVisit(route.params.id);

    return {
      store,
    };
  },
  data() {
    return {
      emailMessage: null,
      smsMessage: null,
      email: false,
      sms: false,
    };
  },
  methods: {
    async doSendNotification() {
      let body = {
        option: [],
        mail_message: "",
        sms_message: "",
      };

      if (this.email == true) {
        body.option.push("email");
        body.mail_message = this.emailMessage;
      } else {
        body.mail_message = undefined;
      }

      if (this.sms == true) {
        body.option.push("sms");
        body.sms_message = this.smsMessage;
      } else {
        body.sms_message = undefined;
      }

      this.store
        .sendNotification(body, this.store.data.id)
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          }
          this.store.loading = false;
        })
        .catch((err) => {
          this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
          this.store.loading = false;
        });
    },
  },
};
</script>
<template>
  <section class="info__request__notification">
    <div class="card">
      <div class="card__header">
        <h4 v-if="store.loading" class="heading__title">
          درحال بارگزاری اطلاعات...
        </h4>
        <h4 v-else class="heading__title">
          ارسال پیام برای {{ store.data.user.name }}
        </h4>
        <div class="heading__actions">
          <nuxt-link to="/requests/visit" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div class="card__body" v-if="!store.loading">
        <div class="row">
          <div class="controls w-full check_control">
            <div class="flex">
              <div v-if="store.data.user.email" class="flex items-center ml-4">
                <input
                  v-model="email"
                  id="email"
                  type="checkbox"
                  value="verify-mail"
                  name="email_verified_at"
                />
                <label for="email" class="checkbox_label"> ایمیل </label>
              </div>
              <div v-if="store.data.user.mobile" class="flex items-center ml-4">
                <input
                  v-model="sms"
                  id="sms"
                  type="checkbox"
                  value="verify-number"
                  name="mobile_verified_at"
                />
                <label for="sms" class="checkbox_label"> اس ام اس </label>
              </div>
            </div>
          </div>
        </div>
        <div v-if="store.data.user.email" class="row">
          <div class="controls w-full">
            <label for="mail_message">متن پیام ایمیل</label>
            <rich-editor v-model="emailMessage" :disable="!email" />
            <FormInputShowError errorKey="mail_message" />
          </div>
        </div>
        <div v-if="store.data.user.mobile" class="row">
          <div class="controls w-full">
            <label for="sms_message">متن پیام اس ام اس</label>
            <textarea
              v-model="smsMessage"
              type="text"
              id="sms_message"
              style="min-height: 188px"
              class="form-control form-textarea"
              maxlength="250"
              rows="4"
              :disabled="!sms"
            ></textarea>
            <FormInputShowError errorKey="sms_message" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <button class="btn btn-primary" @click="doSendNotification()">
              ارسال پیام
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
}

select {
  @apply bg-white w-full rounded-[4px];
}

.controls input[type="checkbox"] {
  @apply w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 focus:ring-offset-1;
}

.checkbox_label {
  margin-bottom: 0 !important;
  @apply inline-block mr-2 text-sm font-medium text-gray-900;
}

.check_control {
  @apply flex items-center pt-6;
}
</style>
