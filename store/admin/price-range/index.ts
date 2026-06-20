import { defineStore } from "pinia";

export const priceRangeStore = defineStore({
  id: "price-range",
  state: () => {
    return {
      loading: true,
      types: [
        {
          id: Math.random().toString(36).slice(2),
          type_id: "",
          type_title: "",
          items: [
            {
              id: Math.random().toString(36).slice(2),
              min: null,
              max: null,
              text: "",
            },
          ],
        },
      ],
    };
  },
  actions: {
    addType() {
      this.types.push({
        id: Math.random().toString(36).slice(2),
        type_id: "",
        type_title: "",
        items: [
          {
            id: Math.random().toString(36).slice(2),
            min: null,
            max: null,
            text: "",
          },
        ],
      });
    },
    addItem(id: Number | String) {
      this.types.forEach((type) => {
        if (type.id == id) {
          type.items.push({
            id: Math.random().toString(36).slice(2),
            min: null,
            max: null,
            text: "",
          });
        }
      });
    },
    deleteItem(id: Number | String, typeId: Number | String) {
      this.types.forEach((type) => {
        if (type.id == typeId) {
          type.items.forEach((item) => {
            if (item.id == id) {
              type.items = type.items.filter((item) => item.id != id);
            }
          });
        }
      });
    },
    deleteType(id: Number | String) {
      this.types = this.types.filter((item) => item.id != id);
    },
    async getData() {
      this.loading = true;
      return this.$axios
        .get(`/api/setting`)
        .then((res: any) => {
          if (res.status == "success") {
            res.data.map((s: any) => {
              if (s["key"] == "property_price_range") {
                if (s["value"].length || s["value"] != null) {
                  let typeData = JSON.parse(s["value"]);
                  this.types = typeData;
                }
              }
            });
          }
          this.loading = false;
        })
        .catch((err: any) => {
          this.loading = false;
        });
    },
    async submit() {
      this.loading = true;
      return await this.$axios
        .post(`/api/setting/edit`, {
          public: {
            property_price_range: JSON.stringify(this.types),
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            if (!this.types.length) {
              this.addType();
            }
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          } else {
            this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
          }
          this.loading = false;
        })
        .catch((err: any) => {
          this.loading = false;
        });
    },
  },
});
