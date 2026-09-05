import { defineStore } from "pinia";

// نظرات مشتریان — پنل ادمین
// بک‌اند: modules/Web/Testimonial → /api/testimonial/*
export const testimonialStore = defineStore({
  id: "testimonial-admin",
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
      };
      return await this.$axios.get(`/api/testimonial`, { params });
    },
    async getSingle(id: string) {
      this.loading = true;
      return this.$axios.get(`/api/testimonial/${id}`);
    },
    async create(data: any) {
      return await this.$axios.post(`/api/testimonial/create`, data);
    },
    async update(id: string, data: any) {
      return await this.$axios.put(`/api/testimonial/update/${id}`, data);
    },
    async deleteSingle(id: string) {
      this.loading = true;
      return await this.$axios.delete(`/api/testimonial/destroy/${id}`);
    },
  },
});
