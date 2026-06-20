<script setup>
import useStore from "~~/mixins/store";
const { indexStore, meStore } = useStore();

useHead({
  title: "پنل مدیریت",
});
</script>
<template>
  <LayoutAdminMenu />
  <div class="body">
    <LayoutAdminHeader />
    <transition name="fade">
      <div
        v-if="indexStore.showModal"
        @click="indexStore.showModalFn(false)"
        class="shadow"
      ></div>
    </transition>
    <main>
      <slot v-cloak />
    </main>
  </div>
</template>
<style lang="scss">
[v-cloak] {
  display: none;
}
.body {
  background: #f4f5fa !important;
  @apply w-[calc(100%-260px)] mr-[260px];

  main {
    min-height: calc(100vh - 72px);
    @apply p-[18px];
  }
}

.shadow {
  @apply fixed top-0 left-0 w-full h-full z-40 bg-[#00000080];
}

body {
  display: block !important;
}

input[type="number"],
input[type="text"].c-number {
  -moz-appearance: textfield;
  text-align: left;
  direction: ltr;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
<style src="~/assets/scss/layout/admin/main.scss"></style>

<style lang="scss">
/* ALIFP */
.fp_popup_overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;

  .popup_base {
    box-shadow: 0 2px 18px 1px rgb(49 53 72 / 10%);
    margin-bottom: 1.25rem;
    padding: 1.5rem;
    border-radius: 0.375rem;
    --tw-bg-opacity: 1;
    background-color: rgb(255 255 255 / var(--tw-bg-opacity));
    width: 425px;

    .popup_heading {
      border-bottom: 1px solid rgb(227 235 243 / 0.7);
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }

    .popup_body {
      background-color: #ffffff;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
