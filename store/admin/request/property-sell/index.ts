import { defineStore } from "pinia";

export const requestPropertySaleStore = defineStore({
  id: "property-sell",
  state: () => {
    return {
      loading: true,
      actionId: "",
      data: [],
      meta: [],
    };
  },
  actions: {
    async getRequestPropertySale(pageNum: any, search: any) {
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
      return this.$axios
        .get(`/api/property-sell`, {
          params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.data = res.data;
            this.meta = res.meta;
            this.loading = false;
          }
          return res;
        });
    },
    async getSinglePropertySale(id: string) {
      this.loading = true;
      this.$axios
        .get(`/api/property-sell/${id}`, {
          params: {
            "relations[]": ["viewer", "user", "images"],
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.data = res.data;
            this.meta = [];
            this.loading = false;
          }
        });
    },

    async updateSingle(id: string, body: any) {
      return await this.$axios.put(`/api/property-sell/${id}`, body);
    },
  },
});
