import { defineStore } from "pinia";

export const categoryStore = defineStore({
  id: "category",
  state: () => {
    return {
      loading: true,
      categories: [] as any,
      actionId: "",
      pagination: [] as any,
      types: [] as any,
    };
  },
  actions: {
    async getCategory(id: string) {
      this.loading = true;
      return await this.$axios
        .get(`/api/category/${id}?relations[]=types&relations[]=thumbnail`)
        .then((res: any) => {
          if (res.status == "success") {
            this.categories = res.data;
            if (this.categories.description == null) {
              this.categories.description = "";
            }
            if (this.categories.seo_option == null) {
              this.categories.seo_option = {};
            }
            this.loading = false;
          }
          return res;
        });
    },
    async getTypes() {
      this.loading = true;
      return await this.$axios.get(`/api/type/all/list`).then((res: any) => {
        if (res.status == "success") {
          this.types = res.data;
          this.loading = false;
        }
        return res;
      });
    },
    async getCategories(pageNum: any, search: string = "") {
      this.loading = true;
      return await this.$axios
        .get(`/api/category`, {
          params: {
            "relations[]": "types",
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
            "search[title]": search,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.categories = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }

          return res;
        });
    },
    async getCategoriesByType(slug: any, search: any = "") {
      this.loading = true;
      return await this.$axios
        .get(`/api/category/type/${slug}`, {
          params: {
            "search[title]": search,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.categories = res.data;
            this.loading = false;
          }

          return res;
        });
    },
    async getTrashedCategories(pageNum: any) {
      this.loading = true;
      this.$axios
        .get(`/api/category/trash/list`, {
          params: {
            "relations[]": "types",
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.categories = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }
        });
    },
    async deleteCategory() {
      this.loading = true;
      return await this.$axios.delete(
        `/api/category/trash/delete/${this.actionId}`
      );
    },
    async trashCategory() {
      this.loading = true;
      return await this.$axios.delete(`/api/category/${this.actionId}`);
    },
    async restoreCategory() {
      this.loading = true;
      return await this.$axios.post(
        `/api/category/trash/restore/${this.actionId}`
      );
    },
    async addNewCat(form: any) {
      this.loading = true;
      return await this.$axios.post(`/api/category`, form);
    },
    async editCat(form: any, id: string) {
      return await this.$axios.put(`/api/category/${id}`, form);
    },
  },
});
