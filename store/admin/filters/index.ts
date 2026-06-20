import { defineStore } from "pinia";

export const filterGroupsStore = defineStore({
  id: "filterGroups",
  state: () => {
    return {
      filterGroup: [] as any,
      filters: [] as any,
      singleFilter: {},
      loading: true,
      error: [] as any,
      pagination: [] as any,
      searchAttr: [] as any,
      actionId: "",
      groupId: "",
    };
  },
  actions: {
    async getFilterGroup(pageNum: number) {
      return await this.$axios
        .get(`/api/filter-group`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.filterGroup = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }

          return res;
        });
    },
    async getSingleFilterGroup(id: string) {
      this.loading = true;

      return this.$axios
        .get(`/api/filter-group/show/${id}`, {
          params: {
            "relations[]": ["filters", "filters.attribute"],
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.filterGroup = res.data;
            if (this.filterGroup.type != null) {
              this.filterGroup.type = this.filterGroup.type.map((item: any) => {
                return {
                  label: item.title,
                  id: item.id,
                };
              });
            }
            this.loading = false;
          }

          return res;
        });
    },
    async deleteFilterGroup() {
      return await this.$axios.delete(
        `/api/filter-group/delete/${this.actionId}`
      );
    },
    async addFilterGroup(form: any) {
      return await this.$axios.post(`/api/filter-group/create`, form);
    },
    async editFilterGroup(body: any, id: string) {
      return await this.$axios.put(`/api/filter-group/update/${id}`, body);
    },
    async getFilters(pageNum: number) {
      return await this.$axios
        .get(`/api/filter`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.filters = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }

          return res;
        });
    },
    async getSingleFilter(id: string) {
      return this.$axios
        .get(`/api/filter/${id}`, {
          params: {
            "relations[]": ["attribute", "types"],
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.singleFilter = res.data;
          }

          return res;
        });
    },
    async deleteFilter() {
      return await this.$axios.delete(`/api/filter/${this.actionId}`);
    },
    async addFilter(form: any) {
      return await this.$axios.post(`/api/filter`, form);
    },
    async editFilter(data: any, id: string) {
      return await this.$axios.put(`/api/filter/${id}`, data);
    },
    async getSearchAttr(search: number) {
      return await this.$axios
        .get(`/api/attribute`, {
          params: {
            search: { title: search },
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.searchAttr = res.data;
            this.loading = false;
          }

          return res;
        });
    },
  },
});
