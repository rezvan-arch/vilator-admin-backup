<script setup>
import { frontSettingsStore } from "~/store/settings/index";
const fss = frontSettingsStore();
let link = [];
await fss.getAll().then(() => {
  if (!fss.loading && fss.data.length) {
    if (fss.siteIcon != "") {
      link.push({
        rel: "icon",
        href: fss.siteIcon,
        sizes: "32x32",
      });
    }
    if (fss.siteLogo != "") {
      link.push({
        rel: "icon",
        href: fss.siteLogo,
        type: "image/png",
      });
    }
  }
});

useHead({
  title: "ویلاطور",
  link: link,
});
</script>
<template>
  <div class="auth__container">
    <slot />
  </div>
</template>
<style lang="scss">
html {
  height: 100% !important;
}
body {
  min-height: 100% !important;
  // @apply flex items-center justify-center;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.auth__container {
  background: #f4f5fa !important;
  min-height: 100vh;
  /* overflow: auto; */
  display: flex;
  align-items: center;
}
</style>
