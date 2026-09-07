import { defineStore } from "pinia";

// بنرهای «کارت بومی» صفحات فرود — پنل ادمین
// بک‌اند: modules/Web/Banner → /api/banner/*
export const bannerStore = defineStore({
  id: "banner-admin",
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
      return await this.$axios.get(`/api/banner`, { params });
    },
    async getSingle(id: string) {
      this.loading = true;
      return this.$axios.get(`/api/banner/${id}`);
    },
    async create(data: any) {
      return await this.$axios.post(`/api/banner/create`, data);
    },
    async update(id: string, data: any) {
      return await this.$axios.put(`/api/banner/update/${id}`, data);
    },
    async deleteSingle(id: string) {
      this.loading = true;
      return await this.$axios.delete(`/api/banner/destroy/${id}`);
    },
  },
});
