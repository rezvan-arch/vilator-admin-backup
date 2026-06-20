import { defineStore } from "pinia";

export const mediaStore = defineStore({
  id: "media",
  state: () => {
    return {
      files: [] as any,
      singleFile: {} as any,
      loading: false,
      singleLoading: false,
      pagination: [] as any,
      image_size: {} as any,
      valid_format: {} as any,
    };
  },
  actions: {
    async getAllFiles(
      pageNum: number | string,

      data: any,
      infinitePage: boolean = false
    ) {
      if (!infinitePage) this.loading = true;

      let params = {
        page: pageNum != "" ? Number(pageNum) : 1,
        is_temporary: false,
        ...data,
      };

      return await this.$axios
        .get(`/api/file`, {
          params: { order_by: "desc", ...params, per_page: 30 },
        })
        .then((res: any) => {
          if (res.status == "success") {
            if (infinitePage) {
              this.files = [...this.files, ...res.data];
            } else {
              this.files = res.data;
            }
            this.pagination = res.meta;
            this.valid_format = res.valid_format;
            this.image_size = res.image_default_size;
            this.loading = false;
          }
          return res;
        });
    },
    async getSingleFile(id: string) {
      this.singleLoading = true;
      return this.$axios.get(`/api/file/${id}`).then((res: any) => {
        if (res.status == "success") {
          this.singleFile = res.data;
          this.image_size = res.image_default_size;
          this.singleLoading = false;
        }

        return res;
      });
    },
    async updateSingleSize(id: string, data: any) {
      return this.$axios
        .post(`/api/file/update/${id}`, data)
        .then((res: any) => {
          if (res.status == "success") {
          }
          return res;
        });
    },
    async deleteFile(id: string) {
      return this.$axios
        .delete(`/api/file/delete`, {
          params: {
            id,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            this.files = this.files.filter((item: any) => item.id != id);
          }

          return res;
        });
    },
    async deleteSingleSize(id: string, size: number | string) {
      return this.$axios
        .delete(`/api/file/delete`, {
          params: {
            id,
            size,
          },
        })
        .then((res: any) => {
          if (res.status == "success") {
            delete this.singleFile.meta_value[size];
          }

          return res;
        });
    },
    async uploadFile(file: any) {
      return await this.$axios.post(`/api/file/store/file`, file, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    async updateFile(id: string, data: any) {
      return await this.$axios.post(`/api/file/${id}/edit`, {
        ...data,
      });
    },
    async updateTags(id: string) {
      return await this.$axios.get(`/api/image-tag/create`).then((res: any) => {
        if (res.status == "success") {
        }
      });
    },
    async createTags(data: any) {
      return await this.$axios.post(`/api/image-tag/create`, {
        items: data,
      });
    },
  },
});
