import { defineStore } from "pinia";

export const detailStore = defineStore({
  id: "detail",
  state: () => {
    return {
      details: [] as any,
      attrsGroup: [] as any,
      trashDetails: [] as any,
      loading: true,
      error: [] as any,
      pagination: [] as any,
      actionId: "",
    };
  },
  actions: {
    async getDetails(pageNum: number) {
      return await this.$axios
        .get(`/api/property-detail`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
            "relations[]": "parent",
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.details = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }

          return res;
        });
    },
    async getAttrsGroups(pageNum: number) {
      return await this.$axios.get(`/api/Detail-group`).then((res: any) => {
        if (res.status == "success") {
          this.attrsGroup = res.data;
          this.loading = false;
        }

        return res;
      });
    },
    async getTrashDetails(pageNum: number | string) {
      this.loading = true;

      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
      };

      this.$axios
        .get(`/api/Detail/trash/list`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.trashDetails = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }
        });
    },
    async getSingleDetail(id: string) {
      this.loading = true;

      return this.$axios
        .get(`/api/Detail/${id}`, {
          params: {
            "relations[]": ["DetailGroups", "options", "options.thumbnail"],
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.details = res.data;
            if (this.details.description == null) {
              this.details.description = "";
            }
            if (this.details.item_styles == null) {
              this.details.item_styles = {};
            }
            this.loading = false;
          }

          return res;
        });
    },
    async trashDetail() {
      return await this.$axios.delete(`/api/attribute/${this.actionId}`);
    },
    async deleteAttr() {
      return await this.$axios.delete(
        `/api/Detail/trash/delete/${this.actionId}`
      );
    },
    async restoreAttr() {
      return await this.$axios.post(
        `/api/Detail/trash/restore/${this.actionId}`
      );
    },
    async addDetail(form: any) {
      return await this.$axios.post(`/api/Detail`, form);
    },
    async editDetail(data: any, id: string) {
      return await this.$axios.put(`/api/Detail/${id}`, {
        ...data,
        Detail_group_ids: data.Detail_group.map((item: any) => item.id),
      });
    },
    async editAttrOption(data: any, id: string) {
      return await this.$axios.put(`/api/Detail/${id}`, data);
    },
    async getAttrDetailList() {
      return await this.$axios
        .get(`/api/Detail/list/Detail-detail`)
        .then((res: any) => {
          if ((res.status = "success")) {
            this.details = res.data;
          }
        });
    },
  },
});
