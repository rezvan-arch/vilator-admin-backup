import { defineStore } from "pinia";

export const requestInformationStore = defineStore({
  id: "request-information",
  state: () => {
    return {
      loading: true,
      actionId: "",
      data: [] as any,
      meta: [] as any,
    };
  },
  actions: {
    async getRequestInformation(pageNum: any, search: any) {
      this.loading = true;

      const keys = Object.keys(search);
      const obj: any = {};
      keys.forEach((item) => {
        if (search[item]) obj[`search[${item}]`] = search[item];
      });

      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
        ...obj,
      };
      return await this.$axios
        .get(`/api/information-request?relations[]=user&relations[]=property`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.data = res.data;
            if (this.data.admin_description == null) {
              this.data.admin_description = "";
            }
            this.meta = res.meta;
            this.loading = false;
          }
          return res;
        });
    },
    async getSingleRequestInformation(id: string) {
      this.loading = true;
      this.$axios
        .get(
          `/api/information-request/show/${id}?relations[]=user&relations[]=property`
        )
        .then((res: any) => {
          if (res.status == "success") {
            this.data = res.data;
            if (this.data.admin_description == null) {
              this.data.admin_description = "";
            }
            this.meta = res.meta;
            this.loading = false;
          }
        });
    },
    async updateRequestInformation(form: any, id: string) {
      this.loading = true;
      return await this.$axios.put(`/api/information-request/update/${id}`, form);
    },
    async sendNotification(form: any, id: string) {
      this.loading = true;
      return await this.$axios.post(
        `/api/information-request/send-notification/${id}`,
        form
      );
    },
  },
});
