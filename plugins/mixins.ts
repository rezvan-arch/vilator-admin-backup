import { defineNuxtPlugin } from "#app";
import mixins from "~~/mixins/mixins";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.mixin(mixins);
});
