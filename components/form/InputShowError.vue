<script>
import { globalStore } from "~/store";
export default {
  setup() {
    const globalS = globalStore();
    return {
      globalS,
    };
  },
  props: ["errorKey"],
};
</script>

<template>
  <div
    v-if="Object.keys(globalS.errors).find((e) => e == errorKey) != undefined"
    class="text-red-500 text-sm mt-2 block"
  >
    {{ Object.entries(globalS.errors).find((i) => i[0] == errorKey)[1][0] }}
  </div>
</template>
