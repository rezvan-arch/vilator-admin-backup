import { defineStore } from "pinia";

export const propertyPriceStore = defineStore({
  id: "property-price",
  state: () => {
    return {
      loading: true,
      actionId: "",
      data: [],
      meta: [],
    };
  },
  actions: {
    async getAll(pageNum: any) {
      this.loading = true;
      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
      };

      return await this.$axios.get(`/api/property-price`, {
        params: params,
      });
    },
    async getSingle(id: string) {
      this.loading = true;
      return this.$axios.get(`/api/property-price/show/${id}`);
    },
    async deleteSingle(id: string) {
      this.loading = true;
      return await this.$axios.delete(`/api/property-price/delete/${id}`);
    },
    async getSingleByProperty(id: string) {
      this.loading = true;
      return this.$axios
        .get(`/api/property-price/show/property/${id}`)
        .then((res) => {
          this.loading = false;
          return res;
        });
    },
    async insertSingleDatePrice(data: any) {
      return await this.$axios.post(`/api/property-price/store`, data);
    },
    async updateSingleDatePrice(id: string, data: any) {
      return await this.$axios.put(`/api/property-price/edit/${id}`, data);
    },
    async deleteSingleDate(id: string, date: string) {
      return await this.$axios.delete(
        `/api/property-price/delete/${id}/single`,
        {
          data: {
            date,
          },
        }
      );
    },
  },
});
