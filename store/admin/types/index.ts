import { defineStore } from "pinia";

export const typesStore = defineStore({
  id: "types",
  state: () => {
    return {
      types: [] as any,
      allTypes: [] as any,
      trashTypes: [] as any,
      loading: true,
      error: [] as any,
      pagination: [] as any,
      actionTypeId: "",
    };
  },
  actions: {
    async getType(pageNum: number | string, search: any = "") {
      this.loading = true;

      const keys = Object.keys(search);
      const obj: any = {};
      keys.forEach((item) => {
        if (search[item]) obj[`search[${item}]`] = search[item];
      });
      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
        ...obj,
      };

      return await this.$axios
        .get(`/api/type`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.types = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }
          return res;
        });
    },
    async getAllType() {
      this.loading = true;

      this.$axios.get(`/api/type/all/list`).then((res: any) => {
        if (res.status == "success") {
          this.allTypes = res.data;
          this.loading = false;
        }
      });
    },
    async getTrashType(pageNum: number | string) {
      this.loading = true;

      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
      };

      this.$axios
        .get(`/api/type/trash/list`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.trashTypes = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }
        });
    },
    async getSingleType(id: string) {
      this.loading = true;

      this.$axios
        .get(`/api/type/${id}`, {
          params: {
            "relations[]": ["thumbnail"],
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.types = res.data;
            if (this.types.description == null) {
              this.types.description = "";
            }
            this.loading = false;
          }
        });
    },
    async addType(form: any) {
      return await this.$axios.post(`/api/type`, form);
    },
    async trashType() {
      return await this.$axios.delete(`/api/type/${this.actionTypeId}`);
    },
    async deleteType() {
      return await this.$axios.delete(
        `/api/type/trash/delete/${this.actionTypeId}`
      );
    },
    async restoreType() {
      return await this.$axios.post(
        `/api/type/trash/restore/${this.actionTypeId}`
      );
    },
    async editType(body: any, id: string) {
      return await this.$axios.put(`/api/type/${id}`, body);
    },
  },
});
