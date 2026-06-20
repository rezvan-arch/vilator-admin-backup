import { defineStore } from "pinia";

export const projectStore = defineStore({
  id: "project",
  state: () => {
    return {
      properties: [] as any,
      trashProperties: [] as any,
      loading: true,
      error: [] as any,
      pagination: [] as any,
      actionPropertyId: "",
      attributeGroupItems: [] as any,
      propertyDetailItems: [] as any,
      attributes_json: [] as any,
      property_details: [] as any,
      imageFileStore: [] as any,
      videoFileStore: [] as any,
      planFileStore: [] as any,
      staticFilter: [
        {
          slug: "property_code",
          title: "کدملک",
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "string",
          },
        },
        {
          slug: "price",
          title: "قیمت",
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "range",
          },
        },
        {
          slug: "postal_code",
          title: "کدپستی",
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "string",
          },
        },
      ],
      filtersData: [
        {
          slug: "land-area",
          title: "مساحت زمین",
          type: ["villa", "commercial", "apartment"],
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "object",
          },
        },
        {
          slug: "building-area",
          title: "متراژ بنا",
          type: ["villa", "apartment"],
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "object",
          },
        },
        {
          slug: "view",
          title: "منظره",
          type: ["villa", "apartment", "commercial", "land"],
          value: "",
          options: {
            tag: "input",
            type: "text",
            mode: "array",
          },
        },
        {
          slug: "bedroom",
          title: "اتاق خواب",
          type: ["villa", "apartment"],
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "array",
          },
        },
        {
          slug: "bathroom",
          title: "حموم",
          type: ["villa", "apartment"],
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "array",
          },
        },
        {
          slug: "wc",
          title: "سرویس بهداشتی",
          type: ["villa", "apartment", "commercial"],
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "array",
          },
        },
        {
          slug: "parking",
          title: "پارکینگ",
          type: ["villa", "apartment", "commercial"],
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "array",
          },
        },
        {
          slug: "elevator",
          title: "آسانسور",
          type: ["commercial", "apartment"],
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "array",
          },
        },
        {
          slug: "depot",
          title: "انباری",
          type: ["apartment"],
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "array",
          },
        },
        {
          slug: "corner",
          title: "نبش",
          type: ["villa", "apartment", "commercial", "land"],
          value: "",
          options: {
            tag: "input",
            type: "text",
            mode: "array",
          },
        },
        {
          slug: "document",
          title: "سند",
          type: ["villa", "apartment", "commercial", "land"],
          value: "",
          options: {
            tag: "input",
            type: "text",
            mode: "array",
          },
        },
        {
          slug: "direction",
          title: "جهت",
          type: ["villa", "apartment", "commercial", "land"],
          value: "",
          options: {
            tag: "input",
            type: "text",
            mode: "array",
          },
        },
        {
          slug: "built_year",
          title: "سال ساخت",
          type: ["villa", "apartment", "commercial", "land"],
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "string",
          },
        },
        {
          slug: "floors",
          title: "طبقات",
          type: ["villa", "apartment"],
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "array",
          },
        },
        {
          slug: "unit-per-floors",
          title: "تعداد واحد در هر طبقه",
          type: ["commercial", "apartment"],
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "array",
          },
        },
        {
          slug: "building-floor",
          title: "طبقه",
          type: ["commercial", "apartment"],
          value: "",
          options: {
            tag: "input",
            type: "number",
            mode: "array",
          },
        },
      ],
      filterHead: {
        type: [],
        category: [],
        property_status: "",
        suburb: [],
        district: [],
        city: [],
      },
      requestBody: {},
    };
  },
  getters: {
    getFilteredData(): any {
      let filter: any[] = [];

      this.filtersData.forEach((item: any) => {
        let checkInclude: any[] = [];
        this.filterHead.type.forEach((cType: any) => {
          checkInclude.push(item.type.includes(cType) ? true : false);
        });
        if (!checkInclude.includes(false)) filter.push(item);
      });

      return this.filterHead.type.length > 0
        ? [...new Set(filter)].sort((a, b) => a.sort_order - b.sort_order)
        : this.filtersData;
    },
  },
  actions: {
    async getProperty(pageNum: string) {
      this.loading = true;

      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
      };

      this.$axios
        .post(
          `/api/property`,
          {
            query: {
              publishing_date: "desc",
              ...this.requestBody,
              property_type: "project",
            },
          },
          {
            params: { ...params, per_page: 16, "relations[]": "type" },
          }
        )
        .then((res: any) => {
          if (res.status == "success") {
            this.properties = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }
        })
        .then((err) => {
          this.loading = false;
        });
    },
    async getTrashProperty(pageNum: number | string) {
      this.loading = true;

      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
        "relations[]": "type",
      };

      this.$axios
        .get(`/api/property/trash/list`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.trashProperties = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }
        });
    },
    async trashProperty() {
      return await this.$axios.delete(
        `/api/property/destroy/${this.actionPropertyId}`
      );
    },
    async deleteProperty() {
      return await this.$axios.delete(
        `/api/property/trash/delete/${this.actionPropertyId}`
      );
    },
    async restoreProperty() {
      return await this.$axios.post(
        `/api/property/trash/restore/${this.actionPropertyId}`
      );
    },
    async addProperty(data: any) {
      return await this.$axios.post(`/api/property/create`, data);
    },
    async getSingleProperty(id: string) {
      this.loading = true;

      return await this.$axios
        .get(`/api/property/${id}`, {
          params: {
            "relations[]": [
              "images",
              "videos",
              "narration",
              "plans",
              "type",
              "categories",
              "city",
              "suburb",
              "district",
              "direction",
              "province",
              "alley",
              "avenue",
              "complex",
              "village",
              "thumbnail",
              "propertyOwner",
              "consultant",
              "primaryCategory",
            ],
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.properties = res.data;
            if (this.properties.description == null) {
              this.properties.description = "";
            }
          }

          return res;
        });
    },
    async updateProperty(id: string) {
      let category_ids = null;
      if (this.properties.category != null) {
        category_ids = this.properties.category.map((item: any) => item.id);
      }

      let consultant_id = null;
      if (this.properties.consultant != null) {
        consultant_id =
          this.properties.consultant.id != undefined
            ? this.properties.consultant.id
            : this.properties.consultant;
      }

      let property_owner_id = null;
      if (this.properties.property_owner != null) {
        property_owner_id =
          this.properties.property_owner.id != undefined
            ? this.properties.property_owner.id
            : this.properties.property_owner;
      }

      let direction_id = null;
      if (this.properties.direction != null) {
        direction_id = this.properties.direction.id;
      }

      let province_id = null;
      if (this.properties.province != null) {
        province_id = this.properties.province.id;
      }

      let city_id = null;
      if (this.properties.city != null) {
        city_id = this.properties.city.id;
      }

      let suburb_id = null;
      if (this.properties.suburb != null) {
        suburb_id = this.properties.suburb.id;
      }

      let district_id = null;
      if (this.properties.district != null) {
        district_id = this.properties.district.id;
      }

      let village_id = null;
      if (this.properties.village != null) {
        village_id = this.properties.village.id;
      }

      let avenue_id = null;
      if (this.properties.avenue != null) {
        avenue_id = this.properties.avenue.id;
      }

      let alley_id = null;
      if (this.properties.alley != null) {
        alley_id = this.properties.alley.id;
      }

      let complex_id = null;
      if (this.properties.complex != null) {
        complex_id = this.properties.complex.id;
      }

      let primary_category_id = null;
      if (this.properties.primary_category != null) {
        primary_category_id = this.properties.primary_category.id;
      }

      let thumbnail_id = null;
      if (this.properties.thumbnail != null) {
        if (typeof this.properties.thumbnail == "string") {
          thumbnail_id = this.properties.thumbnail;
        } else {
          thumbnail_id = this.properties.thumbnail.id;
        }
      }

      let narration_id = null;
      if (this.properties.narration != null) {
        narration_id = this.properties.narration.id;
      }

      // check media is_main
      if (this.properties.images_ids) {
        const mainImage = this.properties.images_ids.map(
          (item: any) => item.is_main
        );
        if (!mainImage.includes(1)) {
          this.properties.images.forEach((item: any, index: any) => {
            if (index +1 <= 20) item.is_main = 1;
          });
          this.properties.images_ids.forEach((item: any, index: any) => {
            if (index +1 <= 20) item.is_main = 1;
          });
        }
      }

      return await this.$axios.put(`/api/property/update/${id}`, {
        ...this.properties,
        category_ids,
        consultant_id,
        property_owner_id,
        direction_id,
        province_id,
        city_id,
        suburb_id,
        district_id,
        complex_id,
        alley_id,
        avenue_id,
        village_id,
        thumbnail_id,
        narration_id,
        primary_category_id,
        images_ids: this.properties.images_ids,
        attributes_json: this.attributes_json,
        property_details: this.property_details,
        is_not_used: this.properties.is_not_used ? 1 : 0,
        is_luxury: this.properties.is_luxury ? 1 : 0,
        is_special: this.properties.is_special ? 1 : 0,
      });
    },
    async slugExist(slug: string) {
      return await this.$axios.get(
        `/api/is-slug-exist?slug=${slug}&model=properties`
      );
    },
    async getAttrGroupsByType(type: string) {
      return await this.$axios
        .get(`/api/attribute/by-type/${type}`, {
          params: { "relations[]": "attributes" },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.attributeGroupItems = res.data;

            if (this.properties.attributes_json != null) {
              this.attributeGroupItems.forEach((attrGroup: any) => {
                attrGroup.attributes.forEach((attr: any) => {
                  this.properties.attributes_json.forEach((item: any) => {
                    if (attr.id == item.attribute_id) {
                      if (
                        attr.item_styles.tag == "input" &&
                        item[item.attribute_id] &&
                        item[item.attribute_id].value
                      ) {
                        attr["value"] = item[item.attribute_id].value;
                      }
                      if (
                        attr.item_styles.tag == "select" ||
                        attr.item_styles.tag == "radio" ||
                        attr.item_styles.tag == "checkbox"
                      ) {
                        if (
                          attr.item_styles.tag == "checkbox" &&
                          attr.item_styles.type == "single"
                        ) {
                          attr["value"] = item[item.attribute_id].value;
                        } else {
                          if (
                            typeof item[item.attribute_id].option_id ==
                              "object" &&
                            attr.item_styles.tag == "select" &&
                            attr.item_styles.type == "single"
                          ) {
                            attr["option_id"] =
                              item[item.attribute_id].option_id[0];
                          } else {
                            attr["option_id"] =
                              item[item.attribute_id].option_id;
                          }
                        }
                      }
                    }
                  });
                });
              });
            }
          }

          return res;
        });
    },
    async getPropertyDetailsByType(type: string) {
      return await this.$axios
        .get(`/api/property-detail/type/${type}`, {
          params: { "relations[]": "options" },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.propertyDetailItems = res.data.sort((a: any, b: any) => {
              if (a.sort_order === b.sort_order) return 0;

              if (a.sort_order === null) return 1;

              if (b.sort_order === null) return -1;

              return a.sort_order > b.sort_order ? 1 : -1;
            });
            if (this.properties.property_details != null) {
              this.propertyDetailItems.forEach((attr: any) => {
                this.properties.property_details.forEach((item: any) => {
                  if (attr.id == item.attribute_id) {
                    if (attr.item_styles.tag == "input") {
                      attr["value"] = item[item.attribute_id].value;
                    }
                    if (
                      attr.item_styles.tag == "select" ||
                      attr.item_styles.tag == "radio" ||
                      attr.item_styles.tag == "checkbox"
                    ) {
                      if (
                        attr.item_styles.tag == "checkbox" &&
                        attr.item_styles.type == "single"
                      ) {
                        attr["value"] = item[item.attribute_id].value;
                      } else {
                        if (
                          typeof item[item.attribute_id].option_id ==
                            "object" &&
                          attr.item_styles.tag == "select" &&
                          attr.item_styles.type == "single"
                        ) {
                          attr["option_id"] =
                            item[item.attribute_id].option_id[0];
                        } else {
                          attr["option_id"] = item[item.attribute_id].option_id;
                        }
                      }
                    }
                  }
                });
              });
            }
          }

          return res;
        });
    },
    async updateMultiProperty(data: any) {
      return await this.$axios.post(`/api/property/change/multi`, data);
    },
    async updateFileStore(type: String) {
      return await this.$axios
        .post(`/api/file/store/property-code`, {
          type: type,
          property_type: "project",
          property_code: this.properties.property_code,
        })
        .then((res: any) => {
          if (res.status == "success") {
            if (type == "image") this.properties.images = res.data;
            if (type == "video") this.properties.videos = res.data;
            if (type == "plan") this.properties.plans = res.data;
            if (type == "narration") {
              this.properties.narration = res.data;
            }
          }
        });
    },
    async createTemporaryLink(id: string, date: any) {
      return this.$axios.post(`/api/property/${id}/temporary`, {
        expire_time: date,
      });
    },
  },
});
