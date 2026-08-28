import { defineStore } from "pinia";

export const articleStore = defineStore({
  id: "article",
  state: () => {
    return {
      loading: true,
      data: [],
      single: null,
      meta: [],
      actionId: "",
    };
  },
  actions: {
    async getAll(pageNum: any = 1, filters: any = {}) {
      this.loading = true;
      let params = {
        page: pageNum != "" && !isNaN(pageNum) ? Number(pageNum) : 1,
        ...filters,
      };

      await this.$axios.get(`/api/article`, { params }).then((res: any) => {
        if (res.status == "success") {
          this.data = res.data;
          this.meta = res.meta;
          this.loading = false;
        }
      });
    },
    async getSingle(id: string) {
      this.loading = true;
      await this.$axios.get(`/api/article/${id}`).then((res: any) => {
        if (res.status == "success") {
          this.single = res.data;
          this.loading = false;
        }
      });
    },
    async createArticle(body: any) {
      return await this.$axios.post(`/api/article/create`, body);
    },
    async updateArticle(id: string, body: any) {
      return await this.$axios.put(`/api/article/update/${id}`, body);
    },
    async deleteArticle() {
      return await this.$axios.delete(`/api/article/destroy/${this.actionId}`);
    },
  },
});
