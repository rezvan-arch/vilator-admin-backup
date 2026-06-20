import { defineStore } from "pinia";

export const attrGroupsStore = defineStore({
  id: "attrGroups",
  state: () => {
    return {
      attributes: [] as any,
      trashAttributes: [] as any,
      loading: true,
      error: [] as any,
      pagination: [] as any,
      actionAttrId: "",
    };
  },
  actions: {
    async getAttributes(pageNum: number) {
      return await this.$axios
        .get(`/api/attribute-group`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
            "relations[]": "types",
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.attributes = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }

          return res;
        });
    },
    async getTrashAttributes(pageNum: number | string) {
      this.loading = true;

      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
        "relations[]": "types",
      };

      this.$axios
        .get(`/api/attribute-group/trash/list`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.trashAttributes = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }
        });
    },
    async getSingleAttribute(id: string) {
      this.loading = true;

      this.$axios
        .get(`/api/attribute-group/${id}`, {
          params: {
            "relations[]": ["types", "attributes"],
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.attributes = res.data;

            if (this.attributes.description == null) {
              this.attributes.description = "";
            }

            this.attributes.display_label = this.attributes.display_label == 1;
            this.attributes.display_in_filter =
              this.attributes.display_in_filter == 1;

            if (this.attributes.type != null) {
              this.attributes.type = this.attributes.type.map((item: any) => {
                return {
                  label: item.title,
                  id: item.id,
                };
              });
            }
            this.loading = false;
          }
        });
    },
    async trashAttribute() {
      return await this.$axios.delete(
        `/api/attribute-group/${this.actionAttrId}`
      );
    },
    async deleteAttr() {
      return await this.$axios.delete(
        `/api/attribute-group/trash/delete/${this.actionAttrId}`
      );
    },
    async restoreAttr() {
      return await this.$axios.post(
        `/api/attribute-group/trash/restore/${this.actionAttrId}`
      );
    },
    async addAttribute(form: any) {
      return await this.$axios.post(`/api/attribute-group`, form);
    },
    async editType(body: any, id: string) {
      return await this.$axios.put(`/api/attribute-group/${id}`, body);
    },
  },
});
