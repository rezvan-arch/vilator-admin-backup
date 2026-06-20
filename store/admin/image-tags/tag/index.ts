import { defineStore } from "pinia";

export const tagStore = defineStore({
  id: "tag",
  state: () => {
    return {
      loading: true,
      tags: [] as any,
      actionId: "",
      pagination: [] as any,
    };
  },
  actions: {
    async getTags() {
      this.loading = true;
      this.$axios
        .get(`/api/image-tag`, {
          params: {
            "relations[]": "group",
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.tags = res.data;
            this.loading = false;
          }
        });
    },
    async getSingleTag(id: any) {
      this.loading = true;
      return await this.$axios
        .get(`/api/image-tag/show/${id}`)
        .then((res: any) => {
          if (res.status == "success") {
            this.tags = res.data;
            this.loading = false;
          }

          return res;
        });
    },
    async deleteTag() {
      return await this.$axios
        .delete(`/api/image-tag/delete/${this.actionId}`)
        .then((res: any) => {
          if (res.status == "success") {
            this.tags = this.tags.filter(
              (item: any) => item.id != this.actionId
            );
          }

          return res;
        });
    },
    async addNewTag(form: any) {
      return await this.$axios
        .post(`/api/image-tag/create`, form)
        .then((res: any) => {
          if (res.status == "success") {
            this.tags.unshift({ ...res.data });
          }

          return res;
        });
    },
    async editTag(form: any) {
      return await this.$axios
        .put(`/api/image-tag/edit/${this.actionId}`, form)
        .then((res: any) => {
          return res;
        });
    },
  },
});
