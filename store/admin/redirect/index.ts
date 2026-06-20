import { defineStore } from "pinia";

export const redirectStore = defineStore({
  id: "redirect",
  state: () => {
    return {
      redirect: [] as any,
      allTypes: [] as any,
      trashTypes: [] as any,
      loading: true,
      error: [] as any,
      pagination: [] as any,
      actionId: "",
    };
  },
  actions: {
    async getRedirect(pageNum: number | string) {
      this.loading = true;

      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
      };

      return await this.$axios
        .get(`/api/redirect`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.redirect = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }
          return res;
        });
    },
    async getTrashRedirect(pageNum: number | string) {
      this.loading = true;

      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
      };

      this.$axios
        .get(`/api/type/trash/list`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.trashTypes = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }
        });
    },
    async getSingleRedirect(id: string) {
      this.loading = true;

      this.$axios.get(`/api/redirect/show/${id}`).then((res: any) => {
        if (res.status == "success") {
          this.redirect = res.data;
          this.loading = false;
        }
      });
    },
    async addRedirect(form: any) {
      return await this.$axios.post(`/api/redirect/create`, form);
    },
    async deleteRedirect() {
      return await this.$axios.delete(`/api/redirect/delete/${this.actionId}`);
    },
    async editRedirect(body: any, id: string) {
      return await this.$axios.put(`/api/redirect/edit/${id}`, body);
    },
  },
});
