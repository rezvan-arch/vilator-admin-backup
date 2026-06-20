import { defineStore } from "pinia";

export const frontSettingsStore = defineStore({
  id: "settings",
  state: () => {
    return {
      loading: false,
      data: [],
      siteLogo: "",
      siteIcon: "",
      sitePricePercent: "",
      priceRangeLoading: true,
      priceRangeTab: 0,
      priceRangeData: [],
      priceRangeDataItems: [],
    };
  },
  actions: {
    async getAll() {
      this.loading = true;
      return await this.$axios
        .get(`/api/setting/public`)
        .then((res: any) => {
          if (res.status == "success") {
            this.data = res.data;
            res.data.map((s: any) => {
              if (s["key"] == "property_price_range") {
                if (s["value"] != "") {
                  let typeData = JSON.parse(s["value"]);
                  if (typeData != undefined && typeData.length) {
                    this.priceRangeData = typeData;
                    this.priceRangeTab = typeData[0].id;
                    this.priceRangeDataItems = typeData[0].items;
                  }
                }
              }
            });

            if (res.data.findIndex((s: any) => s.key == "logo") > -1) {
              if (res.data.find((s: any) => s.key == "logo").value) {
                if (res.data.find((s: any) => s.key == "logo").value.get_url) {
                  this.siteLogo = res.data.find(
                    (s: any) => s.key == "logo"
                  ).value.get_url;
                }
              }
            }

            if (res.data.findIndex((s: any) => s.key == "icon") > -1) {
              if (res.data.find((s: any) => s.key == "icon").value) {
                if (res.data.find((s: any) => s.key == "icon").value.get_url) {
                  this.siteIcon = res.data.find(
                    (s: any) => s.key == "icon"
                  ).value.get_url;
                }
              }
            }

            if (res.data.findIndex((s: any) => s.key == "price_percent") > -1) {
              if (res.data.find((s: any) => s.key == "price_percent").value) {
                this.sitePricePercent = res.data.find(
                  (s: any) => s.key == "price_percent"
                ).value;
              }
            }
          }
          this.priceRangeLoading = false;
          this.loading = false;
          return res;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
  },
});
