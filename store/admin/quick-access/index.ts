import { defineStore } from "pinia";

export const useQuickAccessStore = defineStore({
  id: "quickAccess",
  state: () => {
    return {
      quickAccess: [] as any,
      searchAttr: [] as any,
      loading: true,
      actionId: null,
      error: [] as any,
      pagination: [] as any,
    };
  },
  actions: {
    async getAllQuickAccess(pageNum: number) {
      return await this.$axios
        .get(`/api/attribute-quick-access/index`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
            "relations[]": "attribute",
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.quickAccess = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }

          return res;
        });
    },
    async getSingleQuickAccess(id: string) {
      this.loading = true;

      return this.$axios
        .get(`/api/attribute-quick-access/show/${id}`)
        .then((res: any) => {
          if (res.status == "success") {
            this.quickAccess = res.data;

            this.loading = false;
          }

          return res;
        });
    },
    async deleteQuickAccess() {
      return await this.$axios.delete(
        `/api/attribute-quick-access/delete/${this.actionId}`
      );
    },
    async addQuickAccess(form: any) {
      return await this.$axios.post(`/api/attribute-quick-access/create`, form);
    },
    async editQuickAccess(data: any, id: string) {
      return await this.$axios.put(`/api/attribute-quick-access/update/${id}`, {
        ...data,
        attribute_id: data.attribute.id,
      });
    },
    async getSearchAttr(search: number, page: number = 1) {
      return await this.$axios
        .get(`/api/attribute/list/attributes`, {
          params: {
            search: { title: search },
            "relations[]": ["parent", "options"],
            per_page: 20,
            page,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            if (page > 1) {
              this.searchAttr = [...this.searchAttr, ...res.data];
            } else {
              this.searchAttr = res.data;
            }
            this.pagination = res.meta;
            this.loading = false;
          }

          return res;
        });
    },
  },
});
