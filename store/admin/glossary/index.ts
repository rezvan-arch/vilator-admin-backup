import { defineStore } from "pinia";

// واژهنامه لینکدهی هوشمند — پنل ادمین
// بک‌اند: modules/Web/Glossary → /api/glossary/*
export const glossaryStore = defineStore({
  id: "glossary-admin",
  state: () => {
    return {
      loading: true,
      data: [],
      meta: [],
      single: null as any,
      scanResult: null as any,
      scanning: false,
      suggestions: null as any,
      previewResult: null as any,
      previewing: false,
    };
  },
  actions: {
    async getAll(pageNum: any, filters: any = {}) {
      this.loading = true;
      const params: any = {
        page: pageNum != "" ? Number(pageNum) : 1,
        per_page: 100,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.is_active !== "" && filters.is_active !== null && filters.is_active !== undefined)
        params.is_active = filters.is_active;
      return await this.$axios.get(`/api/glossary`, { params });
    },
    async getSingle(id: string) {
      this.loading = true;
      return this.$axios.get(`/api/glossary/${id}`);
    },
    async create(data: any) {
      return await this.$axios.post(`/api/glossary/create`, data);
    },
    async update(id: string, data: any) {
      return await this.$axios.put(`/api/glossary/update/${id}`, data);
    },
    async deleteSingle(id: string) {
      this.loading = true;
      return await this.$axios.delete(`/api/glossary/destroy/${id}`);
    },
    async scan() {
      this.scanning = true;
      try {
        const res = await this.$axios.post(`/api/glossary/scan`);
        this.scanResult = res.status == "success" ? res.data : null;
        return res;
      } finally {
        this.scanning = false;
      }
    },
    async getUrlSuggestions() {
      if (this.suggestions) return this.suggestions;
      const res = await this.$axios.get(`/api/glossary/url-suggestions`);
      this.suggestions = res.status == "success" ? res.data : null;
      return this.suggestions;
    },
    async preview(text: string, path: string) {
      this.previewing = true;
      try {
        const res = await this.$axios.post(`/api/glossary/preview`, { text, path });
        this.previewResult = res.status == "success" ? res.data : null;
        return res;
      } finally {
        this.previewing = false;
      }
    },
  },
});
