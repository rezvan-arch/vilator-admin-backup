<script setup>
// imports
import useStore from "~~/mixins/store";
import { globalStore } from "~~/store";
import { frontSettingsStore } from "~/store/settings/index";
const fss = frontSettingsStore();

definePageMeta({ layout: "auth" });
useHead({
  title: "تایید شماره موبایل",
});

// data
const { meStore, authStore, errorsStore } = useStore();
const { $toast } = useNuxtApp();
const router = useRouter();
const cookie = useCookie("JWT", {
  maxAge: 60 * 60 * 24 * 100,
  secure: true,
  path: "/",
});
const globalS = globalStore();
globalS.errors = {};
const loading = ref(false);
// variables
let mobile = useCookie("mobile");
let LSMobile;
if (process.client) {
  LSMobile = localStorage.getItem("number");
}

if (mobile.value == null && LSMobile == null) router.push("/auth/mobile");

const confirmForm = reactive({
  mobile:
    String(mobile.value).charAt(0) == "9" ? "0" + mobile.value : mobile.value,
  code: "",
});

if (mobile.value == null) {
  confirmForm.mobile =
    String(LSMobile).charAt(0) == "9" ? "0" + LSMobile : LSMobile;
}

const resendCodeReq = ref(false);
const minute = ref(2);
const second = ref(0);
const time = ref(null);
const timer = ref(null);

// methods
function verify() {
  if (confirmForm.code == "") {
    $toast("کد ارسالی را وارد نمایید", "error", 5000);
    return;
  }
  loading.value = true;
  globalS.errors = {};

  authStore
    .validationCode(confirmForm)
    .then((res) => {
      loading.value = false;
      if (res.status == "success") {
        $toast("شما با موفقیت وارد حساب خود شدید", "success", 5000);
        localStorage.removeItem("number");
        mobile.value = null;

        meStore.setUser(res.data.user);
        cookie.value = res.data.token;

        if (res.data.user.is_admin || res.data.user.is_staff) {
          router.push("/");
        } else {
          router.push("/auth");
        }
      }
    })
    .catch((res) => {
      loading.value = false;
      $toast(globalS.errors, "error", 5000);
    });
}

const resendCode = () => {
  sendCode();
  minute.value = 2;
  second.value = 0;

  changeTimer();
  resendCodeReq.value = true;
  timer.value = setInterval(changeTimer, 1000);
};

const changeTimer = () => {
  time.value = `${minute.value < 10 ? "0" : ""}${minute.value}:${
    second.value < 10 ? "0" : ""
  }${second.value}`;

  if (minute.value == 0 && second.value == 0) {
    clearInterval(timer.value);
    minute.value = 5;
    second.value = 0;
    resendCodeReq.value = false;
  }

  if (second.value < 1 && minute.value > 0) {
    second.value = 60;
    minute.value--;
  }

  second.value -= 1;
};

const sendCode = () => {
  authStore.sendCode(confirmForm.mobile).then((res) => {
    if (res.status == "success") {
      $toast("کد تایید برای شما ارسال شد.", "success", 5000);
    }
  });
};

changeTimer();
</script>
<template>
  <div class="auth">
    <div class="auth__box">
      <div class="box__header">
        <nuxt-link to="/auth" class="header__logo" aria-label="header__logo">
          <img :src="fss.siteLogo" alt="" loading="lazy" format="webp" />
        </nuxt-link>
        <h6 class="header__subtitle">
          <span>ویلاطور</span>
        </h6>
      </div>
      <div class="box__main">
        <p class="text-center">کد پیامکی را وارد کنید</p>
        <form @submit.prevent="verify">
          <div class="controls w-full">
            <span><i class="fa-regular fa-phone"></i></span>
            <input
              v-model="confirmForm.mobile"
              type="number"
              id="mobile"
              class="form-control"
              placeholder="موبایل"
              disabled
            />
          </div>
          <div class="controls w-full">
            <span><i class="fa-regular fa-key"></i></span>
            <input
              v-model="confirmForm.code"
              type="number"
              id="code"
              class="form-control"
              placeholder="کد"
            />
          </div>
          <div class="controls w-full">
            <button
              type="submit"
              class="submit"
              :disabled="loading"
              aria-label="تایید کد"
            >
              <template v-if="loading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else>
                <i class="fa-regular fa-lock-open"></i>
                تایید کد
              </template>
            </button>
          </div>

          <div v-if="!editNumber" class="resend__code">
            <button
              :disabled="resendCodeReq"
              @click="resendCode"
              aria-label="ارسال مجدد کد"
            >
              <template v-if="!resendCodeReq">
                <i class="fa-regular fa-rotate-right"></i> ارسال مجدد کد
              </template>
              <template v-else>
                <p>
                  <span>{{ time }}</span> تا درخواست مجدد کد
                </p>
              </template>
            </button>
          </div>
        </form>
      </div>
      <div class="box__footer">
        <nuxt-link to="/auth/reset-password" aria-label="بازیابی رمز عبور ">
          بازیابی رمز عبور
        </nuxt-link>
        <nuxt-link to="/auth/register" aria-label="ثبت نام">ثبت نام</nuxt-link>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.auth {
  @apply w-full h-full flex items-center justify-center py-5;

  .auth__box {
    @apply bg-white rounded-md shadow-lg min-w-[460px] w-[460px] py-4 px-6;

    .box__header {
      @apply flex flex-col items-center;

      .header__logo {
        @apply w-20 h-20;

        img {
          @apply w-full h-full;
        }
      }

      .header__subtitle {
        @apply border-b border-[#DADADA] w-full text-center pt-2 flex items-center justify-center mt-4;

        span {
          @apply bg-white px-3 text-sm text-[#6B6F82] absolute whitespace-nowrap w-fit;
        }
      }
    }

    .box__main {
      @apply mt-10;

      .controls {
        @apply mt-4 first:mt-0 last:mt-8;
      }
    }

    .box__footer {
      @apply border-t border-[#DADADA] mt-10 pt-4 flex items-center justify-between;

      a {
        @apply text-baseBlue-500;
      }
    }
  }
}

.controls {
  @apply px-4 flex items-center relative;

  span {
    @apply absolute right-8 flex text-[#6B6F82];
  }

  input {
    @apply pr-10 h-12;
  }

  .submit {
    @apply bg-baseBlue-500 text-white text-base w-full rounded py-4 px-4 flex items-center justify-center gap-2 h-[56px];
  }
}

.form-control {
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  @apply block w-full h-[calc(1.25em+1rem+2px)] py-3 px-4 text-base font-normal leading-5 text-[#3B4781] bg-white bg-clip-padding border border-[#babfc7] rounded-[4px];
}

.form-control:focus {
  @apply text-[#4e5154] bg-white border-[#1e9ff2] outline-none shadow-none;
}

p {
  @apply text-base text-[#6b6f82] mb-3;
}

.resend__code {
  @apply mt-6 flex justify-center items-center;

  button {
    @apply text-baseBlue-500 text-sm;
  }

  p {
    @apply text-sm text-[#656565] mb-0;

    span {
      @apply ml-2 text-baseBlue-500 inline-block w-9 text-left;
    }
  }
}
</style>
