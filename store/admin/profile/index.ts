import { defineStore } from "pinia";

export const profileStore = defineStore({
  id: "profile",
  state: () => {
    return {
      loading: true,
      data: [],
      currentUser: [],
    };
  },
  actions: {
    async getCurrentUser() {
      this.loading = true;

      return await this.$axios
        .get(`/api/profile/get-current`)
        .then((res: any) => {
          if (res.status == "success") {
            this.currentUser = res.data;
            this.loading = false;
          }
        });
    },
    async sendEmailVerification() {
      this.loading = true;
      return await this.$axios.post(`/api/profile/email/verify`);
    },
  },
});
