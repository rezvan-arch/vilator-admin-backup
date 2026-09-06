import { defineStore } from "pinia";

// محتوای لندینگهای استاندارد — پنل ادمین
// بک‌اند: modules/Web/LandingContent → /api/landing-content/*
export const landingContentStore = defineStore({
  id: "landing-content-admin",
  state: () => {
    return {
      loading: true,
      data: [],
      meta: [],
      single: null as any,
    };
  },
  actions: {
    async getAll(pageNum: any) {
      this.loading = true;
      const params = {
        page: pageNum != "" ? Number(pageNum) : 1,
        per_page: 50,
      };
      return await this.$axios.get(`/api/landing-content`, { params });
    },
    async getSingle(id: string) {
      this.loading = true;
      return this.$axios.get(`/api/landing-content/${id}`);
    },
    async create(data: any) {
      return await this.$axios.post(`/api/landing-content/create`, data);
    },
    async update(id: string, data: any) {
      return await this.$axios.put(`/api/landing-content/update/${id}`, data);
    },
    async deleteSingle(id: string) {
      this.loading = true;
      return await this.$axios.delete(`/api/landing-content/destroy/${id}`);
    },
  },
});
