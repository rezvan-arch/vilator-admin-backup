import { defineStore } from "pinia";

export const tagGroupStore = defineStore({
  id: "tagGroup",
  state: () => {
    return {
      loading: true,
      groups: [] as any,
      actionId: "",
      pagination: [] as any,
    };
  },
  actions: {
    async getGroups() {
      this.loading = true;
      this.$axios.get(`/api/image-tag-group`).then((res: any) => {
        if (res.status == "success") {
          this.groups = res.data;
          this.loading = false;
        }
      });
    },
    async getSingleGroup(id: any) {
      this.loading = true;
      return await this.$axios
        .get(`/api/image-tag-group/show/${id}`)
        .then((res: any) => {
          if (res.status == "success") {
            this.groups = res.data;
            this.loading = false;
          }

          return res;
        });
    },
    async deleteGroup() {
      return await this.$axios
        .delete(`/api/image-tag-group/delete/${this.actionId}`)
        .then((res: any) => {
          if (res.status == "success") {
            this.groups = this.groups.filter(
              (item: any) => item.id != this.actionId
            );
          }

          return res;
        });
    },
    async addNewGroup(form: any) {
      return await this.$axios
        .post(`/api/image-tag-group/create`, form)
        .then((res: any) => {
          if (res.status == "success") {
            this.groups.unshift(res.data);
          }

          return res;
        });
    },
    async editGroup(form: any) {
      return await this.$axios
        .put(`/api/image-tag-group/edit/${this.actionId}`, form)
        .then((res: any) => {
          if (res.status == "success") {
            this.groups.forEach((item: any) => {
              if (item.id == this.actionId) {
                item.title = form.title;
                item.slug = form.slug;
                item.status = form.status;
              }
            });
          }

          this.actionId = "";

          return res;
        });
    },
    async getGroupsTag() {
      this.loading = true;
      this.$axios
        .get(`/api/image-tag-group`, {
          params: {
            "relations[]": "tags",
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.groups = res.data;
            this.loading = false;
          }
        });
    },
  },
});
