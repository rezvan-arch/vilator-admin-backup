import { defineStore } from "pinia";

export const userPermStore = defineStore({
  id: "user-perm",
  state: () => {
    return {
      loading: true,
      data: [],
      meta: [],
    };
  },
  actions: {
    async getPerms() {
      this.loading = true;
      await this.$axios.get(`/api/permission`).then((res: any) => {
        if (res.status == "success") {
          this.data = res.data;
          this.meta = res.meta;
          this.loading = false;
        }
      });
    },
  },
});
