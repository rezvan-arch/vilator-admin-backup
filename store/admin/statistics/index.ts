import { defineStore } from "pinia";

export const statisticsStore = defineStore({
  id: "statistics",
  state: () => {
    return {
      statistics: [],
      loading: true,
      error: [],
      pagination: [],
      actionId: "",
    };
  },
  actions: {
    async getStatistics(pageNum: number | string, search: any = "") {
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

      return await this.$axios
        .get(`/api/statistic`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.statistics = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }
          return res;
        });
    },
    async getSingleStatistic(id: string) {
      this.loading = true;

      this.$axios.get(`/api/statistic/show/${id}`).then((res: any) => {
        if (res.status == "success") {
          this.statistics = res.data;
          this.loading = false;
        }
      });
    },
  },
});
