import { defineStore } from "pinia";

export const authStore = defineStore({
  id: "auth",
  state: () => {
    return {
      users: [],
    };
  },
  actions: {
    async signIn(data: any) {
      return await this.$axios.post("/api/auth/login", data);
    },
    async register(data: any) {
      let mobile;
      if (data.mobile) {
        mobile = data.mobile[0] !== "0" ? `0${data.mobile}` : data.mobile;
      }
      return await this.$axios.post("/api/auth/register", {
        ...data,
        mobile,
      });
    },
    async sendCode(data: any) {
      return await this.$axios.post("/api/auth/login/mobile", {
        mobile: data[0] !== "0" ? `0${data}` : data,
      });
    },
    async validationCode(data: any) {
      return await this.$axios.post(
        "/api/auth/login/mobile/validation-code",
        data
      );
    },
    async resetPassword(type: string, data: any) {
      let url =
        type == "email"
          ? "/api/auth/reset-password"
          : `/api/auth/change-password?token=${data.token}`;

      data =
        type == "email" ? { email: data.email } : { password: data.password };
      return await this.$axios.post(url, data);
    },
  },
});
