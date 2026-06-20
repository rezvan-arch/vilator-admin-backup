import { defineStore } from "pinia";

export const attributeStore = defineStore({
  id: "attribute",
  state: () => {
    return {
      attributes: [] as any,
      searchAttr: [] as any,
      attrsGroup: [] as any,
      trashAttributes: [] as any,
      loading: true,
      error: [] as any,
      pagination: [] as any,
      actionAttrId: "",
      fromDetailsRoute: false as boolean,
    };
  },
  actions: {
    async getAttributes(pageNum: number) {
      this.loading = true;
      return await this.$axios
        .get(`/api/attribute`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
            "relations[]": ["attributeGroups", "parent", "options"],
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
    async getSearchAttr(search: number) {
      return await this.$axios
        .get(`/api/attribute`, {
          params: {
            search: { 'title': search },
            "relations[]": ["attributeGroups", "parent", "options"],
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
    async getAttrsGroups(pageNum: number) {
      return await this.$axios.get(`/api/attribute-group`).then((res: any) => {
        if (res.status == "success") {
          this.attrsGroup = res.data;
          this.loading = false;
        }

        return res;
      });
    },
    async getTrashAttributes(pageNum: number | string, group: string) {
      this.loading = true;

      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
        group,
      };

      this.$axios
        .get(`/api/attribute/trash/list`, {
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

      return this.$axios
        .get(`/api/attribute/${id}`, {
          params: {
            "relations[]": [
              "attributeGroups",
              "options",
              "options.thumbnail",
              "parent",
              "types",
            ],
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.attributes = res.data;
            if (this.attributes.description == null) {
              this.attributes.description = "";
            }

            this.attributes.quick_access = this.attributes.quick_access == 1;
            this.attributes.display_label = this.attributes.display_label == 1;
            this.attributes.hide_in_single = this.attributes.hide_in_single == 1;
            this.attributes.display_in_filter =
              this.attributes.display_in_filter == 1;

            if (this.attributes.item_styles == null) {
              this.attributes.item_styles = {};
            }
            this.loading = false;
          }

          return res;
        });
    },
    async trashAttribute() {
      return await this.$axios.delete(`/api/attribute/${this.actionAttrId}`);
    },
    async deleteAttr() {
      return await this.$axios.delete(
        `/api/attribute/trash/delete/${this.actionAttrId}`
      );
    },
    async restoreAttr() {
      return await this.$axios.post(
        `/api/attribute/trash/restore/${this.actionAttrId}`
      );
    },
    async addAttribute(form: any) {
      return await this.$axios.post(`/api/attribute`, form);
    },
    async editAttribute(data: any, id: string) {
      let attribute_group_ids;
      if (data.attribute_group) {
        attribute_group_ids = data.attribute_group.map((item: any) => item.id);
      }

      let property_detail_type;
      if (data.property_detail_types) {
        property_detail_type = data.property_detail_types.map(
          (item: any) => item.id
        );
      }
      return await this.$axios.put(`/api/attribute/${id}`, {
        ...data,
        attribute_group_ids,
        property_detail_type,
      });
    },
    async editAttrOption(data: any, id: string) {
      return await this.$axios.put(`/api/attribute/${id}`, data);
    },
    async getAttrDetailList() {
      return await this.$axios
        .get(`/api/attribute/list/attribute-detail`)
        .then((res: any) => {
          if ((res.status = "success")) {
            this.attributes = res.data;
          }
        });
    },
  },
});
