import { defineStore } from "pinia";

export const meStore = defineStore({
  id: "me",
  state: () => {
    return {
      loading: true,
      userData: {} as any,
      isAuth: false,
      token: null as String | null,
    };
  },
  actions: {
    async getDetails() {
      this.loading = true;
      if (useCookie("JWT").value) {
        return this.$axios
          .get("/api/profile/get-current")
          .then((res: any) => {
            if (res.status == "success") {
              this.userData = res.data;
              this.isAuth = true;
            }
            this.loading = false;
            return res;
          })
          .catch((err) => {
            this.loading = false;
            this.isAuth = false;
          });
      } else {
        this.loading = false;
        this.isAuth = false;
        // throw new Error();
      }
    },
    setUser(data: any) {
      this.userData = data;
      this.isAuth = true;
    },
    setToken(data: any) {
      this.token = data;
    },
    logout() {
      this.userData = {};
      this.isAuth = false;
    },
    async createStatistics(data: any) {
      const userToken = useCookie("user-token");
      await this.$axios
        .post(`/api/statistic/create`, {
          data,
        })
        .then((res: any) => {
          if (res.status == "success") {
            if (res.data.token != null) {
              userToken.value = res.data.token;
            }
          }
        });
    },
  },
});
