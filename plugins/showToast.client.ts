import { defineNuxtPlugin } from "#app";
import Toast, { POSITION, useToast } from "vue-toastification";
import "vue-toastification/dist/index.css";

const toast: any = useToast();

export default defineNuxtPlugin((nuxtApp) => {
  const $pinia = nuxtApp.vueApp.config.globalProperties.$pinia;

  nuxtApp.vueApp.use(Toast, {
    position: POSITION.BOTTOM_CENTER,
    icon: false,
    rtl: true,
    showCloseButtonOnHover: true,
  });

  const showToast = (msg: string, type: string, time = 5000) =>
    toast[type](msg, { timeout: time });

  nuxtApp.vueApp.config.globalProperties.$toast = showToast;

  $pinia.use(({ store }) => {
    store.$toast = nuxtApp.vueApp.config.globalProperties.$toast;
  });

  return {
    provide: {
      toast: (msg: string, type: string, time = 5000) =>
        toast[type](msg, { timeout: time }),
    },
  };
});
