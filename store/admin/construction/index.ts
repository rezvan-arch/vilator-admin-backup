import { defineStore } from "pinia";

export const constructionStore = defineStore({
  id: "construction",
  state: () => {
    return {
      loading: true,
      services: [],
      projects: [],
      leads: [],
      calculator: null,
      single: null,
      meta: [],
      actionId: "",
    };
  },
  actions: {
    // ---------- خدمات ساخت ----------
    async getAllServices(pageNum: any = 1, filters: any = {}) {
      this.loading = true;
      let params = {
        page: pageNum != "" && !isNaN(pageNum) ? Number(pageNum) : 1,
        ...filters,
      };

      await this.$axios
        .get(`/api/construction/services`, { params })
        .then((res: any) => {
          if (res.status == "success") {
            this.services = res.data;
            this.meta = res.meta;
            this.loading = false;
          }
        });
    },
    async getSingleService(id: string) {
      this.loading = true;
      await this.$axios.get(`/api/construction/services/${id}`).then((res: any) => {
        if (res.status == "success") {
          this.single = res.data;
          this.loading = false;
        }
      });
    },
    async createService(body: any) {
      return await this.$axios.post(`/api/construction/services/create`, body);
    },
    async updateService(id: string, body: any) {
      return await this.$axios.put(`/api/construction/services/update/${id}`, body);
    },
    async deleteService() {
      return await this.$axios.delete(
        `/api/construction/services/destroy/${this.actionId}`
      );
    },

    // ---------- پروژه‌های ساخت ----------
    async getAllProjects(pageNum: any = 1, filters: any = {}) {
      this.loading = true;
      let params = {
        page: pageNum != "" && !isNaN(pageNum) ? Number(pageNum) : 1,
        ...filters,
      };

      await this.$axios
        .get(`/api/construction/projects`, { params })
        .then((res: any) => {
          if (res.status == "success") {
            this.projects = res.data;
            this.meta = res.meta;
            this.loading = false;
          }
        });
    },
    async getSingleProject(id: string) {
      this.loading = true;
      await this.$axios.get(`/api/construction/projects/${id}`).then((res: any) => {
        if (res.status == "success") {
          this.single = res.data;
          this.loading = false;
        }
      });
    },
    async createProject(body: any) {
      return await this.$axios.post(`/api/construction/projects/create`, body);
    },
    async updateProject(id: string, body: any) {
      return await this.$axios.put(`/api/construction/projects/update/${id}`, body);
    },
    async deleteProject() {
      return await this.$axios.delete(
        `/api/construction/projects/destroy/${this.actionId}`
      );
    },

    // ---------- لیدها ----------
    async getAllLeads(pageNum: any = 1, filters: any = {}) {
      this.loading = true;
      let params = {
        page: pageNum != "" && !isNaN(pageNum) ? Number(pageNum) : 1,
        ...filters,
      };

      await this.$axios
        .get(`/api/construction/leads`, { params })
        .then((res: any) => {
          if (res.status == "success") {
            this.leads = res.data;
            this.meta = res.meta;
            this.loading = false;
          }
        });
    },
    async updateLead(id: string, body: any) {
      return await this.$axios.put(`/api/construction/leads/${id}`, body);
    },
    async deleteLead(id: string) {
      return await this.$axios.delete(`/api/construction/leads/${id}`);
    },
    // ---------- تنظیمات ماشین‌حساب تخمین هزینه ----------
    async getCalculatorSettings() {
      this.loading = true;
      return await this.$axios
        .get(`/api/construction/calculator-settings`)
        .then((res: any) => {
          if (res.status == "success") {
            this.calculator = res.data;
            this.loading = false;
          }
          return res;
        });
    },
    async updateCalculatorSettings(body: any) {
      return await this.$axios.put(`/api/construction/calculator-settings`, body);
    },
  },
});
