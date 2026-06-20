<script setup>
import { globalStore } from "~~/store";
import { authStore } from "~~/store/auth";
import { frontSettingsStore } from "~/store/settings/index";
const fss = frontSettingsStore();

definePageMeta({ layout: "auth" });
useHead({
  title: "ورود با شماره موبایل",
});
const { $toast } = useNuxtApp();

const auth = authStore();
const mobileCookie = useCookie("mobile", {
  maxAge: 60 * 60 * 24 * 100,
  secure: true,
  path: "/",
});
const globalS = globalStore();
globalS.errors = {};
const loading = ref(false);

// variables
const mobile = ref(null);
const router = useRouter();

// methods
function setMobileInCookie() {
  mobileCookie.value = `${mobile.value}`;
}
function setMobileInLS() {
  localStorage.setItem("number", mobile.value);
}

function sendCode() {
  if (mobile.value == null) {
    $toast("شماره موبایل خود را وارد نمایید.", "error", 5000);
    return;
  }
  if (mobile.value.length < 11) {
    $toast("شماره موبایل خود را صحیح وارد نمایید.", "error", 5000);
    return;
  }
  loading.value = true;
  globalS.errors = {};

  auth
    .sendCode(mobile.value)
    .then((res) => {
      loading.value = false;
      if (res.status == "success") {
        setMobileInCookie();
        $toast(res.message, "success", 5000);
        router.push("/auth/mobile/verify");
      }
      if (res.status == "error") $toast(res.message, "error", 5000);
    })
    .catch((res) => {
      loading.value = false;
      $toast(res.message.mobile[0], "error", 5000);
    });
}
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
        <p class="text-center">شماره موبایل خود را وارد کنید</p>
        <form @submit.prevent="sendCode">
          <div class="controls w-full">
            <span><i class="fa-regular fa-phone"></i></span>
            <input
              v-model="mobile"
              type="text"
              id="email"
              class="form-control c-number"
              placeholder="موبایل"
              @input="mobile = checkNumber(mobile, 11)"
            />
          </div>
          <div class="controls w-full">
            <button
              type="submit"
              class="submit"
              :disabled="loading"
              aria-label=" ارسال کد"
            >
              <template v-if="loading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else>
                <i class="fa-regular fa-lock-open"></i>
                ارسال کد
              </template>
            </button>
          </div>
        </form>
      </div>
      <div class="box__footer">
        <nuxt-link to="/auth/reset-password" aria-label=" بازیابی رمز عبور ">
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
</style>
