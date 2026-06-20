import { defineStore } from "pinia";

export const userRoleStore = defineStore({
  id: "user-role",
  state: () => {
    return {
      loading: true,
      data: [],
      meta: [],
    };
  },
  actions: {
    async getAll(pageNum: any) {
      this.loading = true;
      this.$axios
        .get(`/api/role`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.data = res.data;
            this.meta = res.meta;
            this.loading = false;
          }
        });
    },
    async getSingle(id: string) {
      this.loading = true;
      return await this.$axios.get(`/api/role/${id}`);
    },
    async addRole(data: any) {
      this.loading = true;
      return await this.$axios.post(`/api/role`, data);
    },
    async editRole(data: any, id: string) {
      this.loading = true;
      return await this.$axios.put(`/api/role/${id}`, data);
    },
    async deleteRole(id: string) {
      this.loading = true;
      return await this.$axios.delete(`/api/role/${id}`);
    },
    async syncRolePerms(data: any, id: string) {
      this.loading = true;
      return await this.$axios.post(`/api/role/${id}/permission/sync`, data);
    },
  },
});
