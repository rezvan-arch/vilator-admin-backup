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
  },
});
