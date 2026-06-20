import { defineStore } from "pinia";

export const adminStore = defineStore({
  id: "admin",
  state: () => {
    return {
      user: [],
      errors: {},
      statistics: null,
      loading: true,
    };
  },
  actions: {
    setErrors(error: {}) {
      this.errors = error;
    },
    setUser(data: any) {
      this.user = data;
    },
    async getStatistics() {
      this.loading = true;
      return await this.$axios
        .get(`/api/statistic/app-statistic`)
        .then((res: any) => {
          if ((res.status = "success")) {
            this.statistics = res.data;
            this.loading = false;
          }
        })
        .catch((err) => console.log(err));
    },
  },
});
