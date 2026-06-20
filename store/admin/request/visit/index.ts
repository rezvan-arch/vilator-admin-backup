import { defineStore } from "pinia";

export const requestVisitStore = defineStore({
  id: "request-visit",
  state: () => {
    return {
      loading: true,
      actionId: "",
      data: [],
      meta: [],
    };
  },
  actions: {
    async getRequestVisits(pageNum: any) {
      this.loading = true;
      this.$axios
        .get(`/api/visit-request`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.data = res.data;
            this.meta = res.meta;
            this.loading = false;
          }
        });
    },
    async getSingleVisit(id: string) {
      this.loading = true;
      this.$axios.get(`/api/visit-request/show/${id}`).then((res: any) => {
        if (res.status == "success") {
          this.data = res.data;
          this.meta = res.meta;
          this.loading = false;
        }
      });
    },
    async updateVisit(form: any, id: string) {
      this.loading = true;
      return await this.$axios.put(`/api/visit-request/update/${id}`, form);
    },
    async sendNotification(form: any, id: string) {
      this.loading = true;
      return await this.$axios.post(
        `/api/visit-request/send-notification/${id}`,
        form
      );
    },
  },
});
