import { defineStore } from "pinia";

export const landingPage = defineStore({
  id: "landing-page",
  state: () => {
    return {
      loading: true,
      searches: [] as any,
      searchCitiesData: [] as any,
      searchCategoryData: [] as any,
      actionId: "",
      pagination: [] as any,
      types: [] as any,
      candidates: [] as any,
      candidatesLoading: false,
      formula: {
        h1: "",
        seo_title: "",
        meta_desc: "",
        intro: "",
      } as any,
      formulaSaving: false,
      // کاندید انتخابشده در مودال کاندیدها — فرم «ساخت صفحه فرود» آن را پیش‌پر می‌کند
      prefill: null as any,
      // جلسه ۵۲ — هوشمندی پنل (الگوی دیار): متریک واقعی + کاندید جستجوی واقعی
      metrics: {} as any,
      metricsLoading: false,
      realCandidates: [] as any,
      realCandidatesLoading: false,
      quickAdding: "",
      togglingId: "",
    };
  },
  actions: {
    async getSearch(id: string) {
      this.loading = true;
      return await this.$axios
        .get(`/api/landing-page/show/${id}`, {
          params: {
            "relations[]": "image",
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.searches = res.data;

            if (this.searches.description == null) {
              this.searches.description = "";
            }
            this.searches.display_index = this.searches.display_index == 1;
          }
          return res;
        });
    },
    async getTypes() {
      this.loading = true;
      return await this.$axios.get(`/api/type/all/list`).then((res: any) => {
        if (res.status == "success") {
          this.types = res.data;
        }
        return res;
      });
    },
    async getSearchLocationCities(search: string = "") {
      let params = {
        "search[type]": "city",
        "search[title]": search,
      };
      return await this.$axios
        .get(`/api/public/location/search`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.searchCitiesData = res.data;
          }
          return res;
        });
    },
    async getSearchCategory(data: string = "") {
      let params;
      if (data != "") {
        params = {
          "search[title]": data,
        };
      }
      return await this.$axios
        .get(`/api/category`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.searchCategoryData = res.data;
          }
          return res;
        });
    },
    async getSearches(pageNum: any) {
      this.loading = true;
      return await this.$axios
        .get(`/api/landing-page`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.searches = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }

          return res;
        });
    },
    async deleteSearch() {
      return await this.$axios.delete(
        `/api/landing-page/delete/${this.actionId}`
      );
    },
    async addNewSearch(form: any) {
      this.loading = true;
      return await this.$axios.post(`/api/landing-page/create`, form);
    },
    async editSearch(form: any, id: string) {
      return await this.$axios.put(`/api/landing-page/edit/${id}`, form);
    },
    async getCandidates(params: any = {}) {
      this.candidatesLoading = true;
      return await this.$axios
        .get(`/api/landing-page/candidates`, {
          params: {
            min_count: 1,
            limit: 100,
            ...params,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.candidates = res.data.candidates;
          }
          this.candidatesLoading = false;
          return res;
        })
        .catch((err: any) => {
          this.candidatesLoading = false;
          return Promise.reject(err);
        });
    },
    async bulkGenerate(body: any = {}) {
      return await this.$axios.post(`/api/landing-page/bulk-generate`, {
        min_count: 1,
        limit: 200,
        ...body,
      });
    },
    async getFormula() {
      return await this.$axios.get(`/api/landing-page/formula`).then((res: any) => {
        if (res.status == "success") {
          this.formula = {
            h1: res.data.h1 ?? "",
            seo_title: res.data.seo_title ?? "",
            meta_desc: res.data.meta_desc ?? "",
            intro: res.data.intro ?? "",
          };
        }
        return res;
      });
    },
    async updateFormula(payload: any) {
      this.formulaSaving = true;
      return await this.$axios
        .put(`/api/landing-page/formula`, payload)
        .then((res: any) => {
          this.formulaSaving = false;
          return res;
        })
        .catch((err: any) => {
          this.formulaSaving = false;
          return Promise.reject(err);
        });
    },
    // جلسه ۵۲ — متریک واقعی ۷روزه لندینگها (بازدید/تعامل/تبدیل) از دیتای واقعی کاربران
    async getMetrics() {
      this.metricsLoading = true;
      return await this.$axios
        .get(`/api/landing-page/metrics`, { params: { days: 7 } })
        .then((res: any) => {
          if (res.status == "success") {
            this.metrics = res.data ?? {};
          }
          this.metricsLoading = false;
          return res;
        })
        .catch(() => {
          this.metricsLoading = false;
        });
    },
    // کاندیدهای «جستجوی واقعی کاربران» — پرتکرارترین جستجوهای بدون لندینگ
    async getRealCandidates(params: any = {}) {
      this.realCandidatesLoading = true;
      return await this.$axios
        .get(`/api/landing-page/real-candidates`, {
          params: { days: 30, min_views: 3, limit: 10, ...params },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.realCandidates = res.data.candidates ?? [];
          }
          this.realCandidatesLoading = false;
          return res;
        })
        .catch(() => {
          this.realCandidatesLoading = false;
        });
    },
    // افزودن سریع کاندید واقعی به لندینگها (auto + بامپ/purge خودکار بک‌اند)
    async quickAdd(path: string) {
      this.quickAdding = path;
      return await this.$axios
        .post(`/api/landing-page/quick-add`, { path })
        .then((res: any) => {
          this.quickAdding = "";
          return res;
        })
        .catch((err: any) => {
          this.quickAdding = "";
          return Promise.reject(err);
        });
    },
    // کلید سریع ایندکس‌پذیری از لیست
    async toggleIndex(id: string) {
      this.togglingId = id;
      return await this.$axios
        .post(`/api/landing-page/toggle-index/${id}`)
        .then((res: any) => {
          this.togglingId = "";
          return res;
        })
        .catch((err: any) => {
          this.togglingId = "";
          return Promise.reject(err);
        });
    },
  },
});
