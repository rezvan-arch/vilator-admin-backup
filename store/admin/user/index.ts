import { defineStore } from "pinia";

export const useUserStore = defineStore({
  id: "user",
  state: () => {
    return {
      loading: true,
      actionUserId: "",
      error: [],
      users: [],
      pagination: [],
      userChangeAvatarLoading: false,
      userRemoveAvatarLoading: false,
      notActiveLoading: true,
      notActiveUsers: [],
      notActivePagination: [],
      consultant: [] as any,
      ownerHouse: [] as any,
    };
  },
  actions: {
    async getSingleUser(userId: any) {
      await this.$axios
        .get(userId == "" ? `/api/user` : `/api/user/${userId}`)
        .then((res: any) => {
          if (res.status == "success") {
            this.users = {
              ...res.data,
              email_verified_at:
                res.data.email_verified_at != null &&
                res.data.email_verified_at != ""
                  ? true
                  : false,
              mobile_verified_at:
                res.data.mobile_verified_at != null &&
                res.data.mobile_verified_at != ""
                  ? true
                  : false,
              is_admin: res.data.is_admin == 1 ? true : false,
              is_staff: res.data.is_staff == 1 ? true : false,
            };
            this.loading = false;
          }
        })
        .catch((err: any) => {
          this.error = err.data;
          this.loading = false;
        });
    },
    async getUser(pageNum: any) {
      return await this.$axios
        .get(`/api/user`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.users = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }

          return res;
        });
    },
    async getUserNotActive(pageNum: any) {
      return await this.$axios
        .get(`/api/user`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
            not_active: true,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.notActiveUsers = res.data;
            this.notActivePagination = res.meta;
            this.notActiveLoading = false;
          }

          return res;
        });
    },
    async getUserSelect(type: string, search: any = "") {
      return await this.$axios
        .get(`/api/user/search/select`, {
          params: {
            type: type,
            search: search,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            if (type == "consultant") {
              this.consultant = res.data;
            }
            if (type == "owner_house") {
              this.ownerHouse = res.data;
            }
          }
        });
    },
    async getUserTrashList(pageNum: any) {
      this.$axios
        .get(`/api/user/trash/list`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.users = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }
        });
    },
    async TrashUser() {
      return await this.$axios.delete(`/api/user/${this.actionUserId}`);
    },
    async DeleteUser() {
      return await this.$axios.delete(
        `/api/user/trash/delete/${this.actionUserId}`
      );
    },
    async RestoreUser() {
      return await this.$axios.post(
        `/api/user/trash/restore/${this.actionUserId}`
      );
    },
    async addUser(form: any) {
      return await this.$axios.post(`/api/user`, {
        ...form,
        email_verified_at: form.email_verified_at == true ? 1 : 0,
        mobile_verified_at: form.mobile_verified_at == true ? 1 : 0,
        is_admin: form.is_admin == true ? 1 : 0,
        is_staff: form.is_staff == true ? 1 : 0,
      });
    },
    async editUser(form: any, id: string) {
      return await this.$axios.put(`/api/user/${id}`, {
        ...form,
        email_verified_at: form.email_verified_at == true ? 1 : 0,
        mobile_verified_at: form.mobile_verified_at == true ? 1 : 0,
        is_admin: form.is_admin == true ? 1 : 0,
        is_staff: form.is_staff == true ? 1 : 0,
      });
    },
    async addAvatar(id: string, file: any) {
      this.userChangeAvatarLoading = true;
      return await this.$axios.post(`/api/user/${id}/avatar/add`, file);
    },
    async removeAvatar(id: string) {
      this.userRemoveAvatarLoading = true;
      return await this.$axios.post(`/api/user/${id}/avatar/remove`);
    },
  },
});
