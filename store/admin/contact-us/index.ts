import { defineStore } from "pinia";

export const contactUsStore = defineStore({
  id: "contact-us",
  state: () => {
    return {
      loading: true,
      data: [],
      meta: [],
    };
  },
  actions: {
    async getSingle(id: string) {
      this.loading = true;
      await this.$axios
        .get(`/api/contact-us/${id}`, {
          params: {
            "relations[]": ["viewer", "file"],
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.data = res.data;
            this.meta = [];
            this.loading = false;
          }
        });
    },
    async updateSingle(id: string, body: any) {
      return await this.$axios.put(`/api/contact-us/${id}`, body);
    },
    async getAll(pageNum: any) {
      this.loading = true;
      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
      };

      await this.$axios
        .get(`/api/contact-us?relations[]=viewer`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.data = res.data;
            this.meta = res.meta;
            this.loading = false;
          }
        });
    },
  },
});
