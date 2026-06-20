import { defineStore } from "pinia";

export const locationStore = defineStore({
  id: "location",
  state: () => {
    return {
      loading: true,
      createLoading: false,
      data: [],
      searchLoc: [],
      meta: [],
      singleData: [],
      editFormParentId: "",
      locationLoading: false,
      selectOptions: {} as any,
    };
  },
  actions: {
    async getLocation(id: string) {
      this.createLoading = true;
      return this.$axios.get(`/api/location/${id}`, {
        params: {
          "relations[]": [
            "parent",
            "relatedLocation",
            "relatedLocation.relatedLocation",
          ],
        },
      });
    },
    async getLocations(pageNum: any, data: any) {
      this.loading = true;
      return await this.$axios
        .get(`/api/location`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
            "relations[]": ["children", "parent"],
            "search[title]": data.title,
            "search[parent_id]": data.parent,
            "search[type]": data.type,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.data = res.data;
            // this.searchLoc = res.data;
            this.meta = res.meta;
          }
          this.loading = false;
          return res;
        });
    },
    async getLocationsSearch(search: any, type: any, parent_id: any = null) {
      return await this.$axios
        .get(`/api/location`, {
          params: {
            "search[title]": search,
            "search[type]": type,
            "search[parent_id]": parent_id,

            // per_page: 1
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.searchLoc = res.data;
          }
          return res;
        });
    },
    async getLocationsSelect(
      search: any,
      type: any,
      parent_id: any = null,
      parentObj: object = {}
    ) {
      return await this.$axios
        .get(`/api/location`, {
          params: {
            "search[title]": search,
            "search[type]": type,
            "search[parent_id][]": parent_id,
            "relations[]": ["relatedLocation"],
            ...parentObj,
            // per_page: 1
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.searchLoc = res.data;

            this.selectOptions[type] = res.data;
          }
          return res;
        });
    },
    async getHighwaySelect(search: any, parent_id: any = null) {
      return await this.$axios
        .get(`/api/location/highway/list`, {
          params: {
            "search[title]": search,
            "search[related_location][]": parent_id,
            "relations[]": ["relatedLocation"],
            // per_page: 1
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.searchLoc = res.data;

            this.selectOptions["highway"] = res.data;
          }
          return res;
        });
    },
    async getTrashedLocations(pageNum: any) {
      this.loading = true;
      await this.$axios
        .get(`/api/location/trash/list`, {
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
    async trashLocation(id: string) {
      return await this.$axios.delete(`/api/location/${id}`, {});
    },
    async deleteLocation(id: string) {
      this.loading = true;
      return await this.$axios
        .delete(`/api/location/trash/delete/${id}`)
        .then((res: any) => {
          if (res.status == "success") {
            this.loading = false;
          }
        });
    },
    async restoreLocation(id: string) {
      this.loading = true;
      return await this.$axios.post(`/api/location/trash/restore/${id}`);
    },
    async multiStore(data: string) {
      return await this.$axios.post(`/api/location/multi/store`, data);
    },
    async createLocation(data: any) {
      return await this.$axios.post(`/api/location`, data);
    },
    async updateLocation(id: string, data: any) {
      return await this.$axios.put(`/api/location/${id}`, data);
    },
    async getProvinceData(id: string = "", type: string = "") {
      let url;
      if (id != "") {
        url = `/api/public/location/type/${id}?type=${type}`;
      } else {
        url = `/api/public/location/type/province`;
      }
      return await this.$axios.get(url).then((res) => {
        return res;
      });
    },

    async createSingleHighway(data: any) {
      return await this.$axios.post(`/api/location/highway/store`, data);
    },
    async updateSingleHighway(id: string, data: any) {
      return await this.$axios.put(`/api/location/highway/${id}`, data);
    },
    async getAllHighway(pageNum: any, data: any) {
      this.loading = true;
      return await this.$axios
        .get(`/api/location/highway/list`, {
          params: {
            page: !isNaN(pageNum) ? Number(pageNum) : 1,
            "relations[]": ["relatedLocation"],
            "search[related_location][]": data.related_location,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.data = res.data;
            // this.searchLoc = res.data;
            this.meta = res.meta;
          }
          this.loading = false;
          return res;
        });
    },
  },
});
