import { defineStore } from "pinia";

export const fullscreenStore = defineStore({
  id: "fullscreen",
  state: () => {
    return { fullscreenModal: false, fullscreenItems: [], fullscreenActive: 0 };
  },
  actions: {
    showModal() {
      this.fullscreenModal = true;
    },
    closeModal() {
      this.fullscreenModal = false;
    },
    setFullscreenItems(payload: any) {
      this.fullscreenItems = payload;
    },
    setFullscreenActive(payload: any) {
      this.fullscreenActive = payload;
    },
  },
});
