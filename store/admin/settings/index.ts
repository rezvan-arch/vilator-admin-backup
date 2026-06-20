import { defineStore } from "pinia";
export const AdminSettingsStore = defineStore({
  id: "admin-settings",
  state: () => {
    return {
      loading: true,
      data: [] as any,
      socialMedias: [
        {
          id: Math.random().toString(36).slice(2),
          name: "",
          link: "",
          icon: "",
        },
      ] as any,
      eSymbols: [
        {
          id: Math.random().toString(36).slice(2),
          name: "",
          script: "",
        },
      ] as any,
      mediaTags: [
        {
          id: Math.random().toString(36).slice(2),
          name: "",
          title: "",
        },
      ] as any,
      imageTags: [] as any,
      property_price_range: [] as any,
      price_percent: "",
      discord_in_point: "",
      zoom_map: "",
      map_radius: "",
      settingLogoId: "",
      settingIconId: "",
      thumbnailDetailsLogo: null as any,
      thumbnailDetailsIcon: null as any,
    };
  },
  actions: {
    addSocialMedia() {
      this.socialMedias.push({
        id: Math.random().toString(36).slice(2),
        name: "",
        title: "",
      });
    },
    removeSocialMedia(id: string) {
      if (this.socialMedias.length) {
        let check = this.socialMedias.findIndex((c: any) => c.id == id);
        if (check > -1) {
          this.socialMedias.splice(check, 1);
        }
      }
    },
    addMediaTag() {
      this.mediaTags.push({
        id: Math.random().toString(36).slice(2),
        name: "",
        link: "",
        icon: "",
      });
    },
    removeMediaTag(id: string) {
      if (this.mediaTags.length) {
        let check = this.mediaTags.findIndex((c: any) => c.id == id);
        if (check > -1) {
          this.mediaTags.splice(check, 1);
        }
      }
    },
    add_eSymbol() {
      this.eSymbols.push({
        id: Math.random().toString(36).slice(2),
        name: "",
        script: "",
      });
    },
    remove_eSymbol(id: string) {
      if (this.eSymbols.length) {
        let check = this.eSymbols.findIndex((c: any) => c.id == id);
        if (check > -1) {
          this.eSymbols.splice(check, 1);
        }
      }
    },
    async getSettings() {
      this.loading = true;
      return this.$axios.get(`/api/setting`);
    },
    async getSettingsIconLogo() {
      this.loading = true;
      return this.$axios.get(`/api/setting/public/icon-logo`);
    },
    async updateSettings(settingsData: any) {
      let header_tags;
      if (
        settingsData.header_tags != undefined &&
        settingsData.header_tags != null &&
        settingsData.header_tags != ""
      ) {
        header_tags = JSON.stringify(settingsData.header_tags);
      }

      let social_media = null;
      if (settingsData.social_media != undefined && this.socialMedias.length) {
        social_media = JSON.stringify(this.socialMedias);
      }

      let e_symbol = null;
      if (settingsData.e_symbol != undefined && this.eSymbols.length) {
        e_symbol = JSON.stringify(this.eSymbols);
      }

      return await this.$axios.post(`/api/setting/edit`, {
        public: {
          ...settingsData,
          header_tags,
          social_media,
          e_symbol,
          property_price_range: this.property_price_range,
          logo:
            this.settingLogoId != ""
              ? this.settingLogoId
              : this.thumbnailDetailsLogo != null
              ? this.thumbnailDetailsLogo.id
              : "",
          icon:
            this.settingIconId != ""
              ? this.settingIconId
              : this.thumbnailDetailsIcon != null
              ? this.thumbnailDetailsIcon.id
              : "",
          map_radius: this.map_radius,
          zoom_map: this.zoom_map,
        },
        private: {
          image_tags_filter: this.mediaTags,
          price_percent: this.price_percent,
          discord_in_point: this.discord_in_point,
        },
      });
    },
    async getImageTags() {
      this.$axios.get("/api/image-tag").then((res: any) => {
        if (res.status == "success") {
          this.imageTags = res.data;
        }
      });
    },
  },
});
