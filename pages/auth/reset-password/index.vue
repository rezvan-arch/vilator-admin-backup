<script setup>
import { globalStore } from "~~/store";
import { authStore } from "~~/store/auth";
import { frontSettingsStore } from "~/store/settings/index";
const fss = frontSettingsStore();

definePageMeta({ layout: "auth" });
useHead({
  title: "تغییر رمز ورود",
});

const auth = authStore();
const { $toast } = useNuxtApp();
const router = useRouter();
const route = useRoute();
const emailCookie = useCookie("email", {
  maxAge: 60 * 60 * 24 * 100,
  secure: true,
  path: "/",
});
const level = ref("email");

if (route.query.token) {
  level.value = "resetPass";
}

// variables
const resetForm = {
  email: "",
  password: "",
  confirm_password: "",
};
const globalS = globalStore();
globalS.errors = {};
const loading = ref(false);

// methods
function resetPassword() {
  if (level.value == "email") {
    if (resetForm.email == "") {
      $toast("ایمیل خود را وارد نمایید.", "error", 5000);
      return;
    }
    loading.value = true;
    globalS.errors = {};

    auth
      .resetPassword("email", {
        email: resetForm.email,
      })
      .then((res) => {
        loading.value = false;
        if (res.status == "success") {
          $toast("درخواست شما با موفقیت انجام شد", "success", 5000);
          router.push("/auth");
          emailCookie.value = resetForm.email;
        }
      })
      .catch((res) => {
        loading.value = false;
        $toast(globalS.errors.email[0], "error", 5000);
      });
  } else {
    if (resetForm.password == "" || resetForm.confirm_password == "") {
      $toast("فرم را کامل پر کنید", "error", 5000);
      return;
    }
    if (resetForm.password.length < 8) {
      $toast("رمز عبور باید بیشتر از 8 رقم باشد", "error", 5000);
      return;
    }
    if (resetForm.password != resetForm.confirm_password) {
      $toast("تکرار رمز صحیح نمی باشد", "error", 5000);
      return;
    }
    loading.value = true;
    globalS.errors = {};

    auth
      .resetPassword("reset", {
        password: resetForm.password,
        token: route.query.token,
      })
      .then((res) => {
        if (res.status == "success") {
          $toast("درخواست شما با موفقیت انجام شد", "success", 5000);
          emailCookie.value = null;
          router.push("/auth");
          loading.value = false;
        }
      })
      .catch((res) => {
        // $toast(globalS.errors.email[0], "error", 5000);
        loading.value = false;
      });
  }
}
</script>
<template>
  <div class="auth">
    <div class="auth__box">
      <div class="box__header">
        <nuxt-link to="/auth" class="header__logo" aria-label="siteLogo">
          <img :src="fss.siteLogo" alt="" loading="lazy" format="webp" />
        </nuxt-link>
        <h6 class="header__subtitle">
          <span>فراموشی رمز عبور</span>
        </h6>
      </div>
      <div class="box__main">
        <form @submit.prevent="resetPassword">
          <div v-if="level == 'email'" class="controls w-full">
            <span><i class="fa-regular fa-envelope"></i></span>
            <input
              v-model="resetForm.email"
              type="email"
              id="email"
              class="form-control"
              placeholder="ایمیل"
            />
          </div>
          <div v-if="level == 'resetPass'" class="controls w-full">
            <span><i class="fa-regular fa-key-skeleton-left-right"></i></span>
            <input
              v-model="resetForm.password"
              type="password"
              id="password"
              class="form-control"
              placeholder="رمز جدید"
            />
          </div>
          <div v-if="level == 'resetPass'" class="controls w-full">
            <span><i class="fa-regular fa-key-skeleton-left-right"></i></span>
            <input
              v-model="resetForm.confirm_password"
              type="password"
              id="confirm_password"
              class="form-control"
              placeholder="تکرار رمز"
            />
          </div>
          <div class="controls w-full">
            <button
              type="submit"
              class="submit"
              :disabled="loading"
              aria-label="ارسال کد"
            >
              <template v-if="loading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else>
                <template v-if="level == 'email'">
                  <i class="fa-regular fa-lock-open"></i>
                  ارسال کد
                </template>
                <template v-else>
                  <i class="fa-regular fa-lock-open"></i>
                  تغییر رمز
                </template>
              </template>
            </button>
          </div>
        </form>
        <div class="other__ways">
          <p>آیا حساب کاربری دارید؟</p>
          <nuxt-link to="/auth" aria-label="ورود">ورود</nuxt-link>
        </div>
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

      button {
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

.other__ways {
  @apply mt-6 flex justify-center items-center text-[#6b6f82];

  a {
    @apply text-baseBlue-500 text-base rounded w-fit mr-2;
  }
}
</style>
