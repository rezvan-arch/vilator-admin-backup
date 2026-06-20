import { defineStore } from "pinia";

export const linksStore = defineStore({
  id: "links",
  state: () => {
    return {
      links: [],
      allLinks: [],
      trashLinks: [],
      loading: true,
      error: [],
      pagination: [],
      propertyList: [],
      actionLinkId: "",
    };
  },
  actions: {
    async getLinks(pageNum: number | string) {
      this.loading = true;

      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
      };

      this.$axios
        .get(`/api/temporary-link`, {
          params: params,
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.links = res.data;
            this.pagination = res.meta;
            this.loading = false;
          }
        });
    },
    async getPropertyList(search: any = "") {
      this.$axios
        .get(`/api/property/filter/status?status=private`, {
          params: {
            "search[title]": search,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.propertyList = res.data;
          }
        });
    },
    async getSingleLink(id: string) {
      this.loading = true;

      this.$axios
        .get(`/api/temporary-link/show/${id}`, {
          params: { "relations[]": "property" },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.links = res.data;
            this.loading = false;
          }
        });
    },
    async addLink(form: any) {
      return await this.$axios.post(`/api/temporary-link/create`, form);
    },
    async deleteLink() {
      return await this.$axios.delete(
        `/api/temporary-link/delete/${this.actionLinkId}`
      );
    },
    async editLink(body: any, id: string) {
      return await this.$axios.put(`/api/temporary-link/edit/${id}`, body);
    },
  },
});
