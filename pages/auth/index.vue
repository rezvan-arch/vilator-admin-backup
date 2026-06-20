<script setup>
import useStore from "~~/mixins/store";
import { globalStore } from "~~/store";
import { frontSettingsStore } from "~/store/settings/index";
const fss = frontSettingsStore();

definePageMeta({ layout: "auth" });
useHead({
  title: "ورود به ویلاطور",
});
const { authStore, meStore, adminStore } = useStore();
const globalS = globalStore();
const loading = ref(false);

const { $toast } = useNuxtApp();
const router = useRouter();
const cookie = useCookie("JWT", {
  maxAge: 60 * 60 * 24 * 100,
  secure: true,
  path: "/",
});

// variables
const loginFrom = {
  email: "",
  password: "",
};

// methods
function signIn() {
  console.log('test');
  if (loginFrom.email == "" || loginFrom.password == "") {
    $toast("لطفا تمامی فیلد ها را پر کنید.", "error", 5000);
    return;
  }
  loading.value = true;

  authStore
    .signIn(loginFrom)
    .then((res) => {
      if (res.status == "success") {
        meStore.setUser(res.data.user);
        cookie.value = res.data.token;

        if (res.data.user.is_admin || res.data.user.is_staff) {
          router.push("/");
        } else {
          router.push("/auth");
        }

        loading.value = false;
      }
    })
    .catch((res) => {
      loading.value = false;
      // var keys = Object.keys(adminStore.errors);
      $toast(res.message[0], "error", 2000);
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
          <span>ورود به ویلاطور</span>
        </h6>
      </div>
      <div class="box__main">
        <form @submit.prevent="signIn">
          <div class="controls w-full">
            <span><i class="fa-regular fa-envelope"></i></span>
            <input
              v-model="loginFrom.email"
              type="email"
              id="email"
              class="form-control"
              placeholder="ایمیل"
            />
          </div>
          <div class="controls w-full">
            <span><i class="fa-regular fa-key"></i></span>
            <input
              v-model="loginFrom.password"
              type="password"
              id="price"
              class="form-control"
              placeholder="رمز عبور"
            />
          </div>
          <div class="controls w-full">
            <button
              type="submit"
              class="submit"
              :disabled="loading"
              aria-label="ورود"
            >
              <template v-if="loading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else>
                <i class="fa-regular fa-lock-open"></i>
                ورود
              </template>
            </button>
          </div>
        </form>
        <div class="other__ways">
          <nuxt-link to="/auth/mobile" aria-label="ورود با شماره تلفن ">
            ورود با شماره تلفن
          </nuxt-link>
        </div>
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

.other__ways {
  @apply border-t border-[#DADADA] mx-4 mt-8 pt-4 flex justify-center;

  a {
    @apply bg-baseBlue-500 text-white text-base rounded py-3 px-10 w-fit;
  }
}
</style>
