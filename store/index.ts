import { defineStore } from "pinia";

export const globalStore = defineStore({
  id: "global",
  state: () => {
    return {
      errors: {},
      showModal: false,
      headerActions: false,
    };
  },
  actions: {
    setErrors(error: {}) {
      this.errors = error;
    },
    showModalFn(data: boolean) {
      this.showModal = data;
    },
    showActionsFn(data: boolean) {
      this.headerActions = data;
    },
  },
});
