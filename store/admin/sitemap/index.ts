import { defineStore } from "pinia";

export const useSitemapStore = defineStore({
  id: "sitemap",
  state: () => {
    return {
      sitemap: [] as any,
      allTypes: [] as any,
      trashTypes: [] as any,
      loading: true,
      error: [] as any,
      pagination: [] as any,
      actionId: "",
    };
  },
  actions: {
    async getSitemap(pageNum: number | string) {
      this.loading = true;

      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
      };

      return await this.$axios
        .get(`/api/site-map/index`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.sitemap = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }
          return res;
        });
    },
    async getSingleSitemap(id: string) {
      this.loading = true;

      this.$axios.get(`/api/site-map/show/${id}`).then((res: any) => {
        if (res.status == "success") {
          this.sitemap = res.data;
          this.loading = false;
        }
      });
    },
    async addSitemap(form: any) {
      return await this.$axios.post(`/api/site-map/create`, form);
    },
    async deleteSitemap() {
      return await this.$axios.delete(`/api/site-map/delete/${this.actionId}`);
    },
    async editSitemap(body: any, id: string) {
      return await this.$axios.put(`/api/site-map/edit/${id}`, body);
    },
  },
});
