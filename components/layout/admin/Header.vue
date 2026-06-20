<script setup>
import { meStore } from "~/store/me";
const me = meStore();
const drop = ref(false);
const router = useRouter();

function closeDrop() {
  drop.value = false;
}

function logout() {
  me.logout();
  const token = useCookie("JWT");
  token.value = null;
  router.push("/auth");
}
</script>
<template>
  <header>
    <h3>ویلاطور</h3>
    <div class="navbar__nav" v-click-outside="closeDrop">
      <button @click="drop = !drop">
        <template v-if="me.userData.name">
          {{ me.userData.name }}
        </template>
        <template v-else>
          کاربر
        </template>
      </button>
      <transition name="translate">
        <div class="navbar__dropdown" v-show="drop">
          <button class="logout" @click="logout">خروج</button>
        </div>
      </transition>
    </div>
  </header>
</template>
<style lang="scss" scoped>
header {
  box-shadow: 0 2px 30px 2px rgb(0 0 0 / 10%);
  @apply w-full h-[72px] bg-white flex items-center justify-between px-[18px];

  h3 {
    @apply text-[#6B6F82] text-base;
  }

  button {
    @apply text-[#6b6f82] text-base font-bold py-[1.2rem] px-4;
  }

  .navbar__nav {
    @apply relative min-w-[150px];
  }

  button {
    @apply w-full text-center;
  }

  .navbar__dropdown {
    @apply absolute top-[110%] left-0 w-full min-w-[150px] bg-white shadow-lg rounded-md;

    .logout {
      @apply w-full text-red-500 text-right;
    }
  }
}
</style>
