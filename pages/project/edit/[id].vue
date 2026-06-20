<script>
import moment from "jalali-moment";
import "jalali-moment";
import useStore from "~~/mixins/store";
import MapPopup from "@/components/admin/property/MapPopup.vue";
import Sortable from "@/components/admin/property/Sortable.vue";

export default {
  components: { MapPopup, Sortable },
  data() {
    return {
      currencyOption: {
        locale: "fa-IR",
        currency: "IRR",
        currencyDisplay: "hidden",
        hideCurrencySymbolOnFocus: true,
        hideGroupingSeparatorOnFocus: false,
        hideNegligibleDecimalDigitsOnFocus: true,
        autoDecimalDigits: false,
        useGrouping: true,
        accountingSign: false,
      },
      mapModal: false,
      editSlug: false,
      fileTab: "pictures",
      calcPrice: true,
      priceHistory: false,
      statusOption: [
        {
          label: "عمومی",
          value: "public",
        },
        {
          label: "خصوصی",
          value: "private",
        },
        {
          label: "پیش نویس",
          value: "draft",
        },
      ],
      propertyStatusOption: [
        {
          label: "برای فروش",
          value: "sell",
        },
        {
          label: "فروخته شده",
          value: "sold",
        },
      ],
      verifySlug: false,
      loadingSlug: false,
      locLoading: false,
      galleryPopup: false,
      thumbnailDetails: null,
      debounce: null,

      updateLoading: false,
      submitLoading: false,
      draftLoading: false,
      galleryJustImage: false,
      galleryType: "",
      ownerPopup: false,
      ownerLoading: false,
    };
  },
  async setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: " پنل مدیریت | پروژه",
    });
    // variables
    const {
      projectStore,
      adminStore,
      categoryStore,
      userStore,
      locationStore,
      errorsStore,
      indexStore,
    } = useStore();

    const route = useRoute();
    const oldSlug = ref("");
    const newSlug = ref("");
    const vrLink = ref("");
    const locSlugList = [
      "country",
      "direction",
      "province",
      "township",
      "district",
      "city",
      "rural_district",
      "downtown",
      "suburbs",
      "municipal_zoning",
      "highway",
      "village",
      "neighbourhood",
      "avenue",
      "alley",
      "suburb",
      "complex",
    ];
    const addressSlugs = reactive({
      country: "", // کشور
      direction: "", // منطقه جغرافیایی
      province: "", // استان
      township: "", // شهرستان
      district: "", //بخش
      city: "", // شهر
      rural_district: "", // دهستان
      downtown: "", // مرکز شهر
      suburbs: "", // حومه شهر
      municipal_zoning: "", // منطقه‌بندی شهرداری
      highway: "", // جاده/بزرگراه/اتوبان/آزادراه
      village: "", // روستا
      neighbourhood: "", // محله
      avenue: "", // بلوار / خیابان اصلی
      alley: "", // کوچه / خیابان فرعی
      suburb: "", // شهرک
      complex: "", // مجتمع
    });

    // fetch
    projectStore.getSingleProperty(route.params.id).then(async (res) => {
      if (res.status == "success") {
        if (projectStore.properties.description == null) {
          projectStore.properties.description = "";
        }

        if (projectStore.properties.property_status == null) {
          projectStore.properties.property_status = "sell";
        }

        locSlugList.forEach((item) => {
          if (projectStore.properties[item] != null) {
            changeLocation(item, projectStore.properties[item].id);
          }
        });

        projectStore.attributes_json = [];
        if (projectStore.properties.attributes_json != null) {
          projectStore.properties.attributes_json.forEach((item) => {
            projectStore.attributes_json.push(item);
          });
        }

        projectStore.property_details = [];
        if (projectStore.properties.property_details != null) {
          projectStore.properties.property_details.forEach((item) => {
            projectStore.property_details.push(item);
          });
        }

        projectStore.properties.is_not_used =
          projectStore.properties.is_not_used == 1 ? true : false;

        projectStore.properties.is_luxury =
          projectStore.properties.is_luxury == 1 ? true : false;

        projectStore.properties.is_special =
          projectStore.properties.is_special == 1 ? true : false;

        oldSlug.value = projectStore.properties.slug;
        newSlug.value = projectStore.properties.slug;

        await projectStore.getPropertyDetailsByType(
          projectStore.properties.type.id
        );
        await projectStore.getAttrGroupsByType(projectStore.properties.type.id);

        if (projectStore.properties.images == null) {
          projectStore.updateFileStore("image");
        }

        if (projectStore.properties.vr_tour_url != null) {
          vrLink.value = projectStore.properties.vr_tour_url;
        }

        if (projectStore.properties.seo_option == null) {
          projectStore.properties.seo_option = {
            seo_title: "",
            seo_description: "",
          };
        }
        if (projectStore.properties.price == null) {
          projectStore.properties.price =
            projectStore.properties.property_owner_price;
        }

        projectStore.loading = false;
      }
    });

    userStore.getUserSelect("consultant");
    userStore.getUserSelect("owner_house");

    locationStore.getLocationsSelect("", "country").then((res) => {});

    function changeLocation(locSlug, data) {
      if (!data) return;
      if (locSlug !== "suburb" && locSlug !== "complex") {
        locationStore.locationLoading = true;

        locSlugList.slice(locSlugList.indexOf(locSlug) + 1).forEach((item) => {
          locationStore.getLocationsSelect("", item, data).then((res) => {
            locationStore.locationLoading = false;
          });
        });
      }

      if (projectStore.properties[locSlug]) {
        addressSlugs[locSlug] = projectStore.properties[locSlug].slug;

        if (projectStore.properties[locSlug].related_location) {
          projectStore.properties[locSlug].related_location.forEach((item) => {
            if (
              projectStore.properties[item.type] == undefined ||
              projectStore.properties[item.type] == null
            ) {
              projectStore.properties[item.type] = item;
              addressSlugs[item.type] = item.slug;
            }
          });
        }
      }
    }

    function resetAddress(type) {
      locSlugList.slice(locSlugList.indexOf(type) + 1).forEach((item) => {
        projectStore.properties[item] = null;
      });
    }

    // seo
    watch(
      () => projectStore.loading,
      () => {
        if (projectStore.properties.seo_option) {
          if (
            projectStore.properties.seo_option.seo_title == "" ||
            projectStore.properties.seo_option.seo_title == null
          ) {
            projectStore.properties.seo_option.seo_title =
              projectStore.properties.title;
          }
        }
      }
    );

    return {
      adminStore,
      projectStore,
      categoryStore,
      userStore,
      indexStore,
      errorsStore,
      locationStore,
      newSlug,
      oldSlug,
      vrLink,
      locSlugList,
      addressSlugs,
      changeLocation,
      resetAddress,
    };
  },
  methods: {
    calcFinalPrice() {
      if (this.calcPrice) {
        const owner = +this.projectStore.properties.property_owner_price,
          rate = +this.projectStore.properties.commission;
        this.projectStore.properties.price = owner + (rate / 100) * owner;
      }
    },
    setLoc(data) {
      this.projectStore.properties.lat = data.loc.lat;
      this.projectStore.properties.lng = data.loc.lng;
      if (
        this.projectStore.properties.address == null &&
        this.projectStore.properties.address != "" &&
        data.address != ""
      )
        this.projectStore.properties.address = data.address;
      this.mapModal = false;
    },
    submit(draft) {
      if (
        this.projectStore.properties.category.length > 0 &&
        this.projectStore.properties.primary_category &&
        this.projectStore.properties.category.find(
          (cat) => cat.id == this.projectStore.properties.primary_category.id
        ) == undefined
      ) {
        this.$toast(
          "لطفا صفت ملک مشابه را از میان صفت های انتخاب شده، انتخاب کنید",
          "error",
          5000
        );

        return;
      }

      if (!draft) this.submitLoading = true;
      if (draft) {
        this.draftLoading = true;
        this.projectStore.properties.status = "draft";
      }

      if (this.projectStore.properties.auction_date != null) {
        this.projectStore.properties.auction_date = this.convertDate(
          this.projectStore.properties.auction_date,
          true,
          false,
          "en"
        );
      }
      if (this.projectStore.properties.publishing_date != null) {
        this.projectStore.properties.publishing_date = this.convertDate(
          this.projectStore.properties.publishing_date,
          true,
          false,
          "en"
        );
      }

      this.projectStore
        .updateProperty(this.projectStore.properties.id)
        .then((res) => {
          this.submitLoading = false;
          this.draftLoading = false;
          if (res.status == "success") {
            this.$toast(res.message, "success", 2000);
          }
          if (res.status == "error") {
            this.$toast(res.message, "error", 2000);
          }
        })
        .catch((err) => {
          let list = Object.keys(this.adminStore.errors);
          console.log(list, err);
          this.$toast(this.adminStore.errors[list[0]][0], "error", 2000);
          this.draftLoading = false;
          this.submitLoading = false;
        });
    },
    checkSlug() {
      this.loadingSlug = true;
      this.verifySlug = false;
      this.projectStore.slugExist(this.newSlug).then((res) => {
        if (res.status == "success") {
          this.verifySlug = !res.data;
          this.loadingSlug = false;

          if (
            res.data &&
            this.projectStore.properties.slug != this.newSlug &&
            this.newSlug != this.oldSlug
          ) {
            this.$toast("این اسلاگ وجود دارد", "error", 3000);
          }

          if (this.newSlug == this.oldSlug) {
            this.verifySlug = true;
          }
        }
      });
    },
    checkAttribute(data, item, groupSlug) {
      if (
        this.projectStore.attributes_json.some(
          (e) => e.attribute_id === item.id
        )
      ) {
        // update obj data
        if (data == "" || data.length == 0) {
          this.projectStore.attributes_json =
            this.projectStore.attributes_json.filter(
              (e) => e.attribute_id != item.id
            );
        } else {
          this.projectStore.attributes_json.forEach((e) => {
            if (e.attribute_id === item.id) {
              if (item.item_styles.tag == "input") {
                e[item.id].value = `${data}`;
                if (item.item_styles.type == "text") {
                  e[item.id].value = String(data);
                } else if (item.item_styles.type == "number") {
                  e[item.id].value = Number(data);
                }
              }
              if (
                item.item_styles.tag == "select" ||
                item.item_styles.tag == "radio" ||
                item.item_styles.tag == "checkbox"
              ) {
                if (
                  item.item_styles.tag == "checkbox" &&
                  item.item_styles.type == "single"
                ) {
                  e[item.id].value = true;
                } else {
                  e[item.id].option_id = data;
                }
              }
            }
          });
        }
      } else {
        // create new obj
        const id = item.id;
        const obj = {};
        if (item.item_styles.tag == "input") {
          if (item.item_styles.type == "text") {
            obj[id] = {
              value: String(data),
            };
          } else if (item.item_styles.type == "number") {
            obj[id] = {
              value: Number(data),
            };
          }
        }
        if (
          item.item_styles.tag == "select" ||
          item.item_styles.tag == "radio" ||
          item.item_styles.tag == "checkbox"
        ) {
          if (
            item.item_styles.tag == "checkbox" &&
            item.item_styles.type == "single"
          ) {
            obj[id] = {
              value: true,
            };
          } else {
            obj[id] = {
              option_id: data,
            };
          }
        }
        this.projectStore.attributes_json.push({ ...obj, attribute_id: id });
      }

      this.projectStore.attributeGroupItems.forEach((attrGroup) => {
        if (attrGroup.slug == groupSlug) {
          attrGroup.attributes.forEach((details) => {
            if (details.id == item.id) {
              if (details.item_styles.tag == "input") {
                if (details.item_styles.type == "text") {
                  details.value = String(data);
                } else if (details.item_styles.type == "number") {
                  details.value = data != 0 ? Number(data) : null;
                }
              }
            }
          });
        }
      });
    },
    checkPropertyDetails(data, item) {
      if (
        this.projectStore.property_details.some(
          (e) => e.attribute_id === item.id
        )
      ) {
        // update obj data
        if (data == "" || data.length == 0) {
          this.projectStore.property_details =
            this.projectStore.property_details.filter(
              (e) => e.attribute_id != item.id
            );
        } else {
          this.projectStore.property_details.forEach((e) => {
            if (e.attribute_id === item.id) {
              if (item.item_styles.tag == "input") {
                e[item.id].value = `${data}`;
                if (item.item_styles.type == "text") {
                  e[item.id].value = String(data);
                } else if (item.item_styles.type == "number") {
                  e[item.id].value = Number(data);
                }
              }
              if (
                item.item_styles.tag == "select" ||
                item.item_styles.tag == "radio" ||
                item.item_styles.tag == "checkbox"
              ) {
                if (
                  item.item_styles.tag == "checkbox" &&
                  item.item_styles.type == "single"
                ) {
                  e[item.id].value = true;
                } else {
                  e[item.id].option_id = data;
                }
              }
            }
          });
        }
      } else {
        // create new obj
        const id = item.id;
        const obj = {};
        if (item.item_styles.tag == "input") {
          if (item.item_styles.type == "text") {
            obj[id] = {
              value: String(data),
            };
          } else if (item.item_styles.type == "number") {
            obj[id] = {
              value: Number(data),
            };
          }
        }
        if (
          item.item_styles.tag == "select" ||
          item.item_styles.tag == "radio" ||
          item.item_styles.tag == "checkbox"
        ) {
          if (
            item.item_styles.tag == "checkbox" &&
            item.item_styles.type == "single"
          ) {
            obj[id] = {
              value: true,
            };
          } else {
            obj[id] = {
              option_id: data,
            };
          }
        }

        this.projectStore.property_details.push({ ...obj, attribute_id: id });
      }

      this.projectStore.propertyDetailItems.forEach((details) => {
        if (details.id == item.id) {
          if (details.item_styles.tag == "input") {
            if (details.item_styles.type == "text") {
              details.value = String(data);
            } else if (details.item_styles.type == "number") {
              details.value = data != 0 ? Number(data) : null;
            }
          }
        }
      });
    },
    setThumbnail() {
      this.galleryType = "thumbnail";
      this.indexStore.showModalFn(true);
      this.galleryJustImage = true;
      this.galleryPopup = true;
    },
    galleryEvent(media) {
      if (this.galleryType == "thumbnail") {
        this.thumbnailDetails = media;
        this.projectStore.properties.thumbnail = media.id;
        this.galleryJustImage = false;
      } else {
        media.forEach((data) => {
          if (this.galleryType == "image" && data.format == "image") {
            const filteredImage = this.projectStore.properties.images.filter(
              (item) => item.id == data.id
            );

            if (!filteredImage.length > 0) {
              this.projectStore.properties.images = [
                ...this.projectStore.properties.images,
                { ...data, order: this.projectStore.properties.images.length },
              ];

              if (this.projectStore.properties.hasOwnProperty("images_ids")) {
                this.projectStore.properties["images_ids"].push({
                  id: data.id,
                  sort_order: this.projectStore.properties["images_ids"].length,
                });
              }
            }
          }
          if (this.galleryType == "video" && data.format == "video") {
            const filteredVideo = this.projectStore.properties.videos.filter(
              (item) => item.id == data.id
            );

            if (!filteredVideo.length > 0) {
              this.projectStore.properties.videos = [
                ...this.projectStore.properties.videos,
                { ...data, order: this.projectStore.properties.videos.length },
              ];

              if (this.projectStore.properties.hasOwnProperty("videos_ids")) {
                this.projectStore.properties["videos_ids"].push({
                  id: data.id,
                  sort_order: this.projectStore.properties["videos_ids"].length,
                });
              }
            }
          }
          if (this.galleryType == "plan" && data.format == "image") {
            const filteredPlan = this.projectStore.properties.plans.filter(
              (item) => item.id == data.id
            );

            if (!filteredPlan.length > 0) {
              this.projectStore.properties.plans = [
                ...this.projectStore.properties.plans,
                { ...data, order: this.projectStore.properties.plans.length },
              ];

              if (this.projectStore.properties.hasOwnProperty("plans_ids")) {
                this.projectStore.properties["plans_ids"].push({
                  id: data.id,
                  sort_order: this.projectStore.properties["plans_ids"].length,
                });
              }
            }
          }
          if (this.galleryType == "audio" && data.type == "narration") {
            this.projectStore.properties.narration = data;
          }
        });
      }

      this.galleryPopup = false;
      this.indexStore.showModalFn(false);
    },
    updateFileStore(type) {
      this.updateLoading = true;
      this.projectStore
        .updateFileStore(type)
        .then((res) => {
          this.updateLoading = false;
        })
        .catch((err) => {
          this.updateLoading = false;
        });
    },
    debounceSearchMedia() {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.checkSlug();
      }, 600);
    },
    showGallery(type) {
      this.galleryType = type;
      this.indexStore.showModalFn(true);
      this.galleryPopup = true;
    },
    changeSort(type, data) {
      const array = [];
      data.forEach((item, index) => {
        array.push({
          id: item.id,
          sort_order: index,
          is_main: item.is_main,
        });
      });

      if (type == "image") {
        this.projectStore.properties.images = data;

        this.projectStore.properties["images_ids"] = array;
      }
      if (type == "video") {
        this.projectStore.properties.videos = data;

        this.projectStore.properties["videos_ids"] = array;
      }
      if (type == "plan") {
        this.projectStore.properties.plans = data;

        this.projectStore.properties["plans_ids"] = array;
      }
    },
    debounceSearchOwnerHouse(data) {
      this.ownerLoading = true;
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.searchOwnerHouse(data);
      }, 600);
    },
    searchOwnerHouse(data) {
      this.userStore.getUserSelect("owner_house", data).then((res) => {
        this.ownerLoading = false;
      });
    },
    debounceSearchConsultant(data) {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.searchConsultant(data);
      }, 600);
    },
    searchConsultant(data) {
      this.userStore.getUserSelect("consultant", data);
    },
    debounceSearchDirection(data) {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.searchDirection(data);
      }, 600);
    },
    searchDirection(data) {
      this.locationStore.getLocationsSelect(data, "direction");
    },
    debounceSearchLocation(slug, data) {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.searchLocation(slug, data);
      }, 600);
    },
    searchLocation(slug, data) {
      this.locationStore.getLocationsSelect(data, slug);
    },
    clearThumbnail() {
      this.projectStore.properties.thumbnail = null;
      this.thumbnailDetails = null;
    },
    changeCat(data) {
      if (
        this.projectStore.properties.primary_category &&
        this.projectStore.properties.primary_category.slug == data.slug
      ) {
        this.projectStore.properties.primary_category = null;
      }
    },
    submitUser(data) {
      this.ownerPopup = false;
      this.indexStore.showModalFn(false);
      this.projectStore.properties.property_owner = data;
    },
    
    checkAddress() {
      if (this.projectStore.properties.city == null) {
        this.$toast("لطفا شهر را انتخاب کنید", "error", 5000);
        return;
      }
      this.locLoading = true;
      const data = {};
      const addressKeys = Object.keys(this.addressSlugs);
      addressKeys.forEach((key) => {
        data[key] = {
          title: this.projectStore.properties[key]
            ? this.projectStore.properties[key].title
            : null,
          slug: this.addressSlugs[key],
          id: null,
          type: key,
        };

        if (
          this.projectStore.properties[key] &&
          this.projectStore.properties[key].id
        ) {
          data[key].id = this.projectStore.properties[key].id;
        }
        if (
          this.projectStore.properties[key] &&
          this.projectStore.properties[key].slug
        ) {
          data[key].slug = this.projectStore.properties[key].slug;
        }
      });

      this.locationStore
        .multiStore({
          location: Object.values(data).filter((item) => item.title != null),
        })
        .then((res) => {
          if (res.status == "success") {
            res.data.forEach((item) => {
              this.projectStore.properties[item.location.type] = item.location;
              this.projectStore.properties[item.location.type].slug =
                item.slug;
            });
          }
          this.locLoading = false;
        })
        .catch((e) => {
          this.locLoading = false;
        });
    },
    getParent(data) {
      let filterParents;

      filterParents = this.locSlugList
        .slice(
          0,
          data == "complex"
            ? this.locSlugList.indexOf(data) - 1
            : this.locSlugList.indexOf(data)
        )
        .reverse();

      let parent = null;
      filterParents.forEach((item) => {
        if (
          parent == null &&
          this.projectStore.properties[item] &&
          this.projectStore.properties[item].id
        ) {
          parent = this.projectStore.properties[item].id;
        }
      });

      return parent;
    },
  },
  computed: {
    images() {
      return this.projectStore.properties.images;
    },
  },
  watch: {
    calcPrice(val) {
      if (val) this.calcFinalPrice();
    },
  },
  unmounted() {
    this.projectStore.attributeItems = [];
    this.projectStore.propertyDetailItems = [];
    this.projectStore.attributes_json = [];
    this.projectStore.property_details = [];
    this.projectStore.imageFileStore = [];
  },
};
</script>
<template>
  <section class="projects__new">
    <template v-if="!projectStore.loading">
      <!-- main -->
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">بخش فیلد های اصلی</h4>
          <button
            class="btn btn-primary"
            @click="
              priceHistory = true;
              indexStore.showModalFn(true);
            "
          >
            ثبت قیمت های گذشته
          </button>
        </div>
        <div class="card__body">
          <div class="row">
            <div class="controls w-full">
              <label for="title">عنوان</label>
              <input
                v-model="projectStore.properties.title"
                type="text"
                id="title"
                class="form-control"
              />
              <FormInputShowError errorKey="title" />
              <div class="c-slug">
                <p>اسلاگ:</p>
                <div class="left">
                  <div>
                    http://vilator.com/
                    <span v-if="!editSlug">
                      {{ projectStore.properties.slug }}
                    </span>
                  </div>
                  <input
                    v-if="editSlug"
                    type="text"
                    class="slug__update__input"
                    :class="{
                      verify: verifySlug,
                      error: !verifySlug && !loadingSlug && oldSlug != newSlug,
                    }"
                    id="slug__update__input"
                    v-model="newSlug"
                    @input="
                      debounceSearchMedia();
                      loadingSlug = true;
                    "
                  />
                  <button
                    v-if="!editSlug"
                    class="slug__update__btn"
                    type="button"
                    @click="editSlug = true"
                  >
                    ویرایش
                  </button>
                  <button
                    v-if="editSlug"
                    class="slug__update__submit disabled:opacity-30"
                    type="button"
                    @click="
                      editSlug = false;
                      projectStore.properties.slug = newSlug;
                    "
                    :disabled="loadingSlug || !verifySlug"
                  >
                    باشه
                  </button>
                  <button
                    v-if="editSlug"
                    class="slug__update__cancel"
                    type="button"
                    @click="
                      editSlug = false;
                      newSlug = projectStore.properties.slug;
                    "
                  >
                    لغو
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="controls w-2/12">
              <label for="type">نوع ملک</label>
              <input
                v-model="projectStore.properties.type.title"
                type="text"
                id="type"
                class="form-control"
                disabled
              />
            </div>
            <div class="controls w-2/12">
              <label for="property_code">کدملک</label>
              <input
                v-model="projectStore.properties.property_code"
                type="text"
                id="property_code"
                class="form-control"
                disabled
              />
            </div>
            <div class="controls w-2/12">
              <label for="built_year">تاریخ ساخت</label>
              <input
                type="text"
                class="custom-built_year form-control c-number"
                :value="
                  projectStore.properties.built_year != null
                    ? convertDate(projectStore.properties.built_year).slice(
                        0,
                        4
                      )
                    : ''
                "
              />
              <date-picker
                v-model="projectStore.properties.built_year"
                format="YYYY"
                displayFormat="jYYYY"
                type="year"
                simple
                custom-input=".custom-built_year"
              />
              <FormInputShowError errorKey="built_year" />
            </div>
            <div class="controls w-3/12">
              <label class="owner_label" for="owner">
                مالک
                <button
                  class="btn btn-outline-primary"
                  @click="
                    ownerPopup = true;
                    indexStore.showModalFn(true);
                  "
                >
                  <i class="fa-regular fa-plus"></i>
                </button>
              </label>
              <v-select
                id="owner"
                v-model="projectStore.properties.property_owner"
                :options="userStore.ownerHouse"
                @search="debounceSearchOwnerHouse"
                label="name"
                autocomplete="off"
                :filterable="false"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template #selected-option="{ name, mobile }">
                  <div style="display: flex; flex-direction: column">
                    <strong>{{ name }}</strong>
                    <em style="margin-left: 0.5rem">{{ mobile }}</em>
                  </div>
                </template>

                <template #option="{ name, mobile }">
                  <div style="display: flex; flex-direction: column">
                    <strong>{{ name }}</strong>
                    <em style="margin-left: 0.5rem">{{ mobile }}</em>
                  </div>
                </template>
              </v-select>
              <FormInputShowError errorKey="property_owner" />
            </div>
            <div class="controls w-3/12">
              <label for="consultant">مشاور</label>
              <v-select
                id="consultant"
                v-model="projectStore.properties.consultant"
                :options="userStore.consultant"
                @search="debounceSearchConsultant"
                label="name"
                autocomplete="off"
                :filterable="false"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template #selected-option="{ name, mobile }">
                  <div style="display: flex; flex-direction: column">
                    <strong>{{ name }}</strong>
                    <em style="margin-left: 0.5rem">{{ mobile }}</em>
                  </div>
                </template>
                <template #option="{ name, mobile }">
                  <div style="display: flex; flex-direction: column">
                    <strong>{{ name }}</strong>
                    <em style="margin-left: 0.5rem">{{ mobile }}</em>
                  </div>
                </template>
              </v-select>
              <FormInputShowError errorKey="consultant" />
            </div>
          </div>
          <div class="row price__box">
            <div class="controls w-4/12">
              <label for="owner_price">قیمت مالک</label>
              <FormCurrencyInput
                v-model="projectStore.properties.property_owner_price"
                id="owner_price"
                class="form-control c-number"
                :options="currencyOption"
                @keyup="calcFinalPrice"
              />
              <FormInputShowError errorKey="property_owner_price" />
            </div>
            <div class="controls w-2/12">
              <label for="interest_rates">درصد سود</label>
              <input
                v-model="projectStore.properties.commission"
                type="number"
                id="interest_rates"
                class="form-control c-number"
                @input="calcFinalPrice"
              />
              <FormInputShowError errorKey="commission" />
            </div>
            <div class="controls w-1/12 c-chain">
              <button
                class="form-control"
                :class="{ active: calcPrice }"
                @click="calcPrice = !calcPrice"
                type="button"
              >
                <i class="fa-solid fa-link-horizontal"></i>
              </button>
            </div>
            <div class="controls w-5/12">
              <label for="sale_price">قیمت فروش در سایت</label>
              <FormCurrencyInput
                v-model="projectStore.properties.price"
                id="sale_price"
                class="form-control c-number"
                :options="currencyOption"
                :watchValue="true"
                :disabled="calcPrice"
              />
              <FormInputShowError errorKey="price" />
            </div>
          </div>
        </div>
      </div>

      <!-- property details -->
      <div class="card" v-if="projectStore.propertyDetailItems.length > 0">
        <div class="card__header">
          <h4 class="heading__title">مشخصات ملک</h4>
        </div>
        <div class="card__body grid grid-cols-2 gap-x-2">
          <AdminPropertyAttributeItem
            v-for="(item, index) in projectStore.propertyDetailItems"
            :key="index"
            :item="item"
            @changeItem="checkPropertyDetails($event, item)"
            class="pb-4"
          />
        </div>
      </div>

      <!-- address -->
      <div class="card address__card">
        <div class="card__header">
          <h4 class="heading__title">آدرس ملک</h4>

          <div class="header__action">
            <button
              :disabled="locLoading"
              class="btn btn-success w-[100px]"
              @click="checkAddress"
            >
              <template v-if="locLoading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else>ذخیره</template>
            </button>
          </div>
        </div>
        <div class="card__body">
          <div
            class="row border border-[#babfc7] rounded-lg px-3 py-3 pb-4 bg-[#f5f5f5]"
          >
            <div class="controls w-1/4">
              <label for="country">کشور</label>
              <v-select
                v-model="projectStore.properties.country"
                id="country"
                @option:selected="
                  changeLocation('country', $event.id);
                  resetAddress('country');
                "
                label="title"
                @search="debounceSearchLocation('country', $event)"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="country" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.country"
                />
              </span>
            </div>
            <div class="controls w-1/4">
              <label for="direction">جهت جغرافیایی</label>
              <v-select
                v-model="projectStore.properties.direction"
                id="direction"
                :options="locationStore.directionList"
                @option:selected="
                  changeLocation('direction', $event.id);
                  resetAddress('direction');
                "
                label="title"
                @search="debounceSearchLocation('direction', $event)"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="province" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.direction"
                />
              </span>
            </div>
            <div class="controls w-1/4">
              <label for="province">استان</label>
              <v-select
                v-model="projectStore.properties.province"
                id="province"
                :options="locationStore.provinceList"
                @option:selected="
                  changeLocation('province', $event.id);
                  resetAddress('province');
                "
                label="title"
                @search="debounceSearchLocation('province', $event)"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="province" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.province"
                />
              </span>
            </div>
            <div class="controls w-1/4">
              <label for="township">شهرستان</label>

              <v-select
                v-model="projectStore.properties.township"
                id="township"
                label="title"
                @search="debounceSearchLocation('township', $event)"
                @option:selected="
                  changeLocation('township', $event.id);
                  resetAddress('township');
                "
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="township" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.township"
                />
              </span>
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/4">
              <label for="district">بخش</label>

              <v-select
                v-model="projectStore.properties.district"
                id="district"
                :options="locationStore.districtList"
                label="title"
                @search="debounceSearchLocation('district', $event)"
                @option:selected="
                  changeLocation('district', $event.id);
                  resetAddress('district');
                "
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="district" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.district"
                />
              </span>
            </div>
            <div class="controls w-1/4">
              <label for="city">شهر</label>
              <v-select
                v-model="projectStore.properties.city"
                id="city"
                :options="locationStore.cityList"
                @option:selected="
                  changeLocation('city', $event.id);
                  resetAddress('city');
                "
                label="title"
                @search="debounceSearchLocation('city', $event)"
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="city" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.city"
                />
              </span>
            </div>
            <div class="controls w-1/4">
              <label for="rural_district">دهستان</label>

              <v-select
                v-model="projectStore.properties.rural_district"
                id="rural_district"
                label="title"
                @search="debounceSearchLocation('rural_district', $event)"
                @option:selected="
                  changeLocation('rural_district', $event.id);
                  resetAddress('rural_district');
                "
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="rural_district" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.rural_district"
                />
              </span>
            </div>
          </div>
          <div
            class="row border border-[#babfc7] rounded-lg px-3 py-3 pb-4 bg-[#f5f5f5]"
          >
            <div class="controls w-1/3">
              <label for="highway">جاده/بزرگراه/اتوبان/آزادراه</label>

              <v-select
                v-model="projectStore.properties.highway"
                id="highway"
                label="title"
                @search="debounceSearchLocation('highway', $event)"
                @option:selected="
                  changeLocation('highway', $event.id);
                  resetAddress('highway');
                "
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="highway" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.highway"
                />
              </span>
            </div>
            <div class="controls w-1/3">
              <label for="downtown">مرکز شهر</label>

              <v-select
                v-model="projectStore.properties.downtown"
                id="downtown"
                label="title"
                @search="debounceSearchLocation('downtown', $event)"
                @option:selected="
                  changeLocation('downtown', $event.id);
                  resetAddress('downtown');
                "
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="downtown" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.downtown"
                />
              </span>
            </div>
            <div class="controls w-1/3">
              <label for="suburbs">حومه شهر</label>

              <v-select
                v-model="projectStore.properties.suburbs"
                id="suburbs"
                label="title"
                @search="debounceSearchLocation('suburbs', $event)"
                @option:selected="
                  changeLocation('suburbs', $event.id);
                  resetAddress('suburbs');
                "
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="suburbs" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.suburbs"
                />
              </span>
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/4">
              <label for="municipal_zoning">منطقه‌بندی شهرداری</label>

              <v-select
                v-model="projectStore.properties.municipal_zoning"
                id="municipal_zoning"
                label="title"
                @search="debounceSearchLocation('municipal_zoning', $event)"
                @option:selected="
                  changeLocation('municipal_zoning', $event.id);
                  resetAddress('municipal_zoning');
                "
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="municipal_zoning" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.municipal_zoning"
                />
              </span>
            </div>
            <div class="controls w-1/4">
              <label for="village">روستا</label>

              <v-select
                v-model="projectStore.properties.village"
                id="village"
                label="title"
                @search="debounceSearchLocation('village', $event)"
                @option:selected="
                  changeLocation('village', $event.id);
                  resetAddress('village');
                "
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="village" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.village"
                />
              </span>
            </div>
            <div class="controls w-1/4">
              <label for="neighbourhood">محله</label>

              <v-select
                v-model="projectStore.properties.neighbourhood"
                id="neighbourhood"
                label="title"
                @search="debounceSearchLocation('neighbourhood', $event)"
                @option:selected="
                  changeLocation('neighbourhood', $event.id);
                  resetAddress('neighbourhood');
                "
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="neighbourhood" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.neighbourhood"
                />
              </span>
            </div>
            <div class="controls w-1/4">
              <label for="avenue">بلوار / خیابان اصلی</label>

              <v-select
                v-model="projectStore.properties.avenue"
                id="avenue"
                label="title"
                @search="debounceSearchLocation('avenue', $event)"
                @option:selected="
                  changeLocation('avenue', $event.id);
                  resetAddress('avenue');
                "
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="avenue" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.avenue"
                />
              </span>
            </div>
          </div>
          <div
            class="row border border-[#babfc7] rounded-lg px-3 py-3 pb-4 bg-[#f5f5f5]"
          >
            <div class="controls w-1/4">
              <label for="alley"> کوچه / خیابان فرعی</label>

              <v-select
                v-model="projectStore.properties.alley"
                id="alley"
                label="title"
                @search="debounceSearchLocation('alley', $event)"
                @option:selected="
                  changeLocation('alley', $event.id);
                  resetAddress('alley');
                "
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="alley" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.alley"
                />
              </span>
            </div>
            <div class="controls w-1/4">
              <label for="suburb">شهرک</label>
              <v-select
                v-model="projectStore.properties.suburb"
                id="suburb"
                :options="locationStore.suburbList"
                label="title"
                @search="debounceSearchLocation('suburb', $event)"
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="suburb" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.suburb"
                />
              </span>
            </div>
            <div class="controls w-1/4">
              <label for="complex">مجتمع</label>
              <v-select
                v-model="projectStore.properties.complex"
                id="complex"
                :options="locationStore.complexList"
                label="title"
                @search="debounceSearchLocation('complex', $event)"
                :disabled="locationStore.provinceLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                  })
                "
                :class="{
                  error:
                    projectStore.properties.township &&
                    projectStore.properties.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="complex" />

              <span class="block mt-1">
                <FormTextInput
                  name="اسلاگ"
                  :ltr="true"
                  placeholder="اسلاگ"
                  v-model="addressSlugs.complex"
                />
              </span>
            </div>
          </div>
          <div class="row pt-3">
            <div class="controls w-1/4">
              <label for="unit">واحد</label>
              <input
                v-model="projectStore.properties.unit"
                type="number"
                id="unit"
                class="form-control"
              />
              <FormInputShowError errorKey="unit" />
            </div>
            <div class="controls w-1/4">
              <label for="plaque">پلاک</label>
              <input
                v-model="projectStore.properties.plaque"
                type="number"
                id="plaque"
                class="form-control"
              />
              <FormInputShowError errorKey="plaque" />
            </div>
            <div class="controls w-1/4">
              <label for="postal_code">کد پستی</label>
              <input
                v-model="projectStore.properties.postal_code"
                type="number"
                id="postal_code"
                class="form-control"
              />
              <FormInputShowError errorKey="postal_code" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <button
                class="btn btn-outline-primary"
                style="border-radius: 50px"
                @click="mapModal = true"
              >
                انتخاب آدرس روی نقشه
              </button>
              <MapPopup
                v-if="mapModal"
                @closeMap="mapModal = false"
                @set-loc="setLoc"
                :location="{
                  lat: projectStore.properties.lat,
                  lng: projectStore.properties.lng,
                }"
                :province="projectStore.properties.province"
                :city="projectStore.properties.city"
                :suburb="projectStore.properties.suburb"
                :village="projectStore.properties.village"
              />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/4">
              <label for="map_lat">عرض جغرافیایی (lat)</label>
              <input
                v-model="projectStore.properties.lat"
                type="number"
                id="map_lat"
                class="form-control"
              />
              <FormInputShowError errorKey="lat" />
            </div>
            <div class="controls w-1/4">
              <label for="map_lng">طول جغرافیایی (lng)</label>
              <input
                v-model="projectStore.properties.lng"
                type="number"
                id="map_lng"
                class="form-control"
              />
              <FormInputShowError errorKey="lng" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <label for="address">آدرس دقیق</label>
              <textarea
                v-model="projectStore.properties.address"
                type="text"
                id="address"
                class="form-control form-textarea"
                maxlength="250"
                rows="3"
              ></textarea>
              <FormInputShowError errorKey="address" />
            </div>
          </div>
        </div>
      </div>

      <!-- files -->
      <div class="card">
        <div class="card_body tabs">
          <div class="myTab">
            <ul id="myTab" data-tabs-toggle="#myTabContent" role="tablist">
              <li class="ml-2">
                <button
                  :class="{ active: fileTab == 'pictures' }"
                  id="pictures-tab"
                  type="button"
                  @click="fileTab = 'pictures'"
                >
                  تصاویر
                </button>
              </li>
              <li class="ml-2">
                <button
                  :class="{ active: fileTab == 'video' }"
                  id="video-tab"
                  type="button"
                  @click="fileTab = 'video'"
                >
                  ویدیو
                </button>
              </li>
              <li class="ml-2">
                <button
                  :class="{ active: fileTab == 'plan' }"
                  class=""
                  id="plan-tab"
                  type="button"
                  @click="fileTab = 'plan'"
                >
                  پلان
                </button>
              </li>
              <li class="ml-2">
                <button
                  :class="{ active: fileTab == 'podcast' }"
                  class=""
                  id="podcast-tab"
                  type="button"
                  @click="fileTab = 'podcast'"
                >
                  پادکست
                </button>
              </li>
              <li>
                <button
                  :class="{ active: fileTab == 'tour' }"
                  class=""
                  id="tour-tab"
                  type="button"
                  @click="fileTab = 'tour'"
                >
                  تور مجازی
                </button>
              </li>
            </ul>
          </div>
          <div id="myTabContent">
            <transition mode="out-in" name="fade">
              <div v-if="fileTab == 'pictures'" class="tab__content">
                <div class="update">
                  <button
                    type="button"
                    class="btn btn-success"
                    @click="updateFileStore('image')"
                    :disabled="updateLoading"
                  >
                    <i
                      class="fa-regular fa-arrows-rotate"
                      :class="{ 'animate-spin': updateLoading }"
                    ></i>
                    بروزرسانی
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary"
                    @click="showGallery('image')"
                    :disabled="updateLoading"
                  >
                    <i class="fa-solid fa-photo-film-music"></i>
                    گالری
                  </button>
                </div>
                <div
                  class="preview"
                  :class="{
                    'flex items-center justify-center':
                      images.length < 1 &&
                      projectStore.imageFileStore.length < 1,
                  }"
                >
                  <div
                    v-if="
                      images.length < 1 &&
                      projectStore.imageFileStore.length < 1
                    "
                    class="error"
                  >
                    <p>هنوز تصویری برای این ملک ثبت نشده است</p>
                    <p>لطفا بروزرسانی کنید</p>
                  </div>
                  <Sortable
                    v-if="
                      images.length > 0 &&
                      projectStore.imageFileStore.length < 1
                    "
                    :items="images"
                    @changeFiles="changeSort('image', $event)"
                  />
                </div>
              </div>
              <div v-else-if="fileTab == 'video'" class="tab__content">
                <div class="update">
                  <button
                    type="button"
                    class="btn btn-success"
                    @click="updateFileStore('video')"
                    :disabled="updateLoading"
                  >
                    <i
                      class="fa-regular fa-arrows-rotate"
                      :class="{ 'animate-spin': updateLoading }"
                    ></i>
                    بروزرسانی
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary"
                    @click="showGallery('video')"
                    :disabled="updateLoading"
                  >
                    <i class="fa-solid fa-photo-film-music"></i>
                    گالری
                  </button>
                </div>
                <div
                  class="preview"
                  :class="{
                    'flex items-center justify-center':
                      projectStore.properties.videos.length < 1 &&
                      projectStore.videoFileStore.length < 1,
                  }"
                >
                  <div
                    v-if="
                      projectStore.properties.videos.length < 1 &&
                      projectStore.videoFileStore.length < 1
                    "
                    class="error"
                  >
                    <p>هنوز تصویری برای این ملک ثبت نشده است</p>
                    <p>لطفا بروزرسانی کنید</p>
                  </div>
                  <Sortable
                    v-if="
                      projectStore.properties.videos.length > 0 &&
                      projectStore.videoFileStore.length < 1
                    "
                    :items="projectStore.properties.videos"
                    @changeFiles="changeSort('video', $event)"
                  />
                </div>
              </div>
              <div v-else-if="fileTab == 'plan'" class="tab__content">
                <div class="update">
                  <button
                    type="button"
                    class="btn btn-success"
                    @click="updateFileStore('plan')"
                    :disabled="updateLoading"
                  >
                    <i
                      class="fa-regular fa-arrows-rotate"
                      :class="{ 'animate-spin': updateLoading }"
                    ></i>
                    بروزرسانی
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary"
                    @click="showGallery('plan')"
                    :disabled="updateLoading"
                  >
                    <i class="fa-solid fa-photo-film-music"></i>
                    گالری
                  </button>
                </div>
                <div
                  class="preview"
                  :class="{
                    'flex items-center justify-center':
                      projectStore.properties.plans.length < 1 &&
                      projectStore.planFileStore.length < 1,
                  }"
                >
                  <div
                    v-if="
                      projectStore.properties.plans.length < 1 &&
                      projectStore.planFileStore.length < 1
                    "
                    class="error"
                  >
                    <p>هنوز تصویری برای این ملک ثبت نشده است</p>
                    <p>لطفا بروزرسانی کنید</p>
                  </div>

                  <Sortable
                    v-if="
                      projectStore.properties.plans.length > 0 &&
                      projectStore.planFileStore.length < 1
                    "
                    :items="projectStore.properties.plans"
                    @changeFiles="changeSort('plan', $event)"
                  />
                </div>
              </div>
              <div v-else-if="fileTab == 'podcast'" class="tab__content">
                <div class="update">
                  <button
                    type="button"
                    class="btn btn-success"
                    @click="updateFileStore('narration')"
                    :disabled="updateLoading"
                  >
                    <i
                      class="fa-regular fa-arrows-rotate"
                      :class="{ 'animate-spin': updateLoading }"
                    ></i>
                    بروزرسانی
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary"
                    @click="showGallery('audio')"
                    :disabled="updateLoading"
                  >
                    <i class="fa-solid fa-photo-film-music"></i>
                    گالری
                  </button>
                </div>
                <div
                  class="preview podcast"
                  :class="{
                    'flex items-center justify-center':
                      projectStore.properties.narration == null ||
                      projectStore.properties.narration.length == 0,
                  }"
                >
                  <div
                    v-if="
                      projectStore.properties.narration == null ||
                      projectStore.properties.narration.length == 0
                    "
                    class="error"
                  >
                    <p>هنوز تصویری برای این ملک ثبت نشده است</p>
                    <p>لطفا بروزرسانی کنید</p>
                  </div>
                  <Narration
                    v-else
                    :src="projectStore.properties.narration.get_url"
                  />
                </div>
              </div>
              <div v-else-if="fileTab == 'tour'" class="tab__content">
                <div class="update update_tour">
                  <button
                    type="button"
                    class="btn btn-success"
                    @click="projectStore.properties.vr_tour_url = vrLink"
                  >
                    ثبت
                  </button>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="link...."
                    v-model="vrLink"
                  />
                </div>
                <div
                  class="preview"
                  :class="{
                    'flex items-center justify-center':
                      projectStore.properties.vr_tour_url == null,
                  }"
                >
                  <div
                    v-if="projectStore.properties.vr_tour_url == null"
                    class="error"
                  >
                    <p>هنوز تور مجازی برای این ملک ثبت نشده است</p>
                  </div>
                  <iframe
                    v-else
                    :src="projectStore.properties.vr_tour_url"
                    frameborder="0"
                  ></iframe>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- attributes -->
      <template v-if="projectStore.attributeGroupItems.length > 0">
        <div
          class="card"
          v-for="(attrGroup, index) in projectStore.attributeGroupItems"
          :key="index"
        >
          <div class="card__header">
            <h4 class="heading__title">{{ attrGroup.title }}</h4>
          </div>
          <div class="card__body">
            <div
              class="border-b last:border-b-0 py-8 first:pt-0 last:pb-0 flex flex-wrap gap-y-5"
            >
              <AdminPropertyAttributeItem
                v-for="(item, index) in attrGroup.attributes"
                :key="index"
                :item="item"
                :groupSlug="attrGroup.slug"
                @changeItem="checkAttribute($event, item, attrGroup.slug)"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- info -->
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">توضیحات ملک</h4>
        </div>
        <div class="card__body">
          <div class="row">
            <div class="controls w-full">
              <rich-editor v-model="projectStore.properties.description" />
              <FormInputShowError errorKey="description" />
            </div>
          </div>
          <div class="row p-4">
            <div class="controls w-full thumbnail_box">
              <button class="btn btn-primary" @click="setThumbnail">
                انتخاب تصویر شاخص
              </button>
              <div class="thumbnail">
                <div
                  class="delete"
                  @click="clearThumbnail"
                  v-if="
                    projectStore.properties.thumbnail != null ||
                    thumbnailDetails != null
                  "
                >
                  <i class="fa-regular fa-circle-xmark"></i>
                </div>
                <img
                  v-if="thumbnailDetails != null"
                  :src="thumbnailDetails.get_url"
                  alt=""
                  loading="lazy"
                  format="webp"
                />
                <img
                  v-else-if="projectStore.properties.thumbnail != null"
                  :src="projectStore.properties.thumbnail.get_url"
                  alt=""
                  loading="lazy"
                  format="webp"
                />
                <img
                  v-else
                  src="/images/no-photo-available.png"
                  alt=""
                  loading="lazy"
                  format="webp"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- publish setting -->
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">تنظیمات انتشار</h4>
        </div>
        <div class="card__body">
          <div class="row">
            <div class="controls w-1/3">
              <label for="property_status">وضعیت ملک</label>
              <v-select
                v-model="projectStore.properties.property_status"
                id="property_status"
                :options="propertyStatusOption"
                :reduce="(option) => option.value"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="property_status" />
            </div>
            <div class="controls w-1/3">
              <label for="publishing_date">تاریخ انتشار</label>
              <div class="date__input">
                <input
                  type="text"
                  class="custom-publishing_date form-control c-number"
                  :value="
                    projectStore.properties.publishing_date != null
                      ? convertDate(
                          projectStore.properties.publishing_date,
                          true
                        )
                      : ''
                  "
                />
                <date-picker
                  v-model="projectStore.properties.publishing_date"
                  format="YYYY-MM-DD HH:mm"
                  type="datetime"
                  displayFormat="jYYYY/jMM/jDD HH:mm"
                  simple
                  custom-input=".custom-publishing_date"
                />

                <button
                  v-if="projectStore.properties.publishing_date != null"
                  class="delete"
                  type="button"
                  @click="projectStore.properties.publishing_date = null"
                >
                  <i class="fa-regular fa-xmark"></i>
                </button>
              </div>
              <FormInputShowError errorKey="publishing_date" />
            </div>
            <div class="controls w-1/3">
              <label for="auction_date">تاریخ مزایده</label>
              <div class="date__input">
                <input
                  type="text"
                  class="custom-auction_date form-control c-number"
                  :value="
                    projectStore.properties.auction_date != null
                      ? convertDate(projectStore.properties.auction_date, true)
                      : ''
                  "
                />
                <!-- convertDate(projectStore.properties.auction_date) -->
                <date-picker
                  v-model="projectStore.properties.auction_date"
                  format="YYYY-MM-DD HH:mm"
                  type="datetime"
                  displayFormat="jYYYY/jMM/jDD HH:mm"
                  simple
                  custom-input=".custom-auction_date"
                />
                <button
                  v-if="projectStore.properties.auction_date != null"
                  class="delete"
                  type="button"
                  @click="projectStore.properties.auction_date = null"
                >
                  <i class="fa-regular fa-xmark"></i>
                </button>
              </div>
              <FormInputShowError errorKey="auction_date" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/2 check_control">
              <div class="flex flex-col">
                <div class="flex items-center mb-4">
                  <input
                    v-model="projectStore.properties.is_not_used"
                    id="is_used"
                    type="checkbox"
                    value="is_used"
                    class=""
                  />
                  <label for="is_used" class="checkbox_label">
                    کلید نخورده
                  </label>
                </div>
                <div class="flex items-center mb-4">
                  <input
                    v-model="projectStore.properties.is_special"
                    id="is_special"
                    type="checkbox"
                    value="is_special"
                    class=""
                  />
                  <label for="is_special" class="checkbox_label"> ویژه </label>
                </div>
                <div class="flex items-center mb-4">
                  <input
                    v-model="projectStore.properties.is_luxury"
                    id="is_luxury"
                    type="checkbox"
                    value="is_luxury"
                    class=""
                  />
                  <label for="is_luxury" class="checkbox_label"> لوکس </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- seo option -->
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">بخش تنظیمات سئو</h4>
        </div>
        <div class="card__body">
          <div class="row">
            <div
              v-if="projectStore.properties.seo_option"
              class="controls w-1/2"
            >
              <label for="seo_title">عنوان سئو</label>
              <input
                v-model="projectStore.properties.seo_option.seo_title"
                type="text"
                id="seo_title"
                class="form-control"
              />
              <FormInputShowError errorKey="seo_title" />
            </div>
          </div>
          <div class="row">
            <div
              v-if="projectStore.properties.seo_option"
              class="controls w-full"
            >
              <div class="flex items-center justify-between">
                <label for="seo_description">توضیح سئو</label>
                <span
                  v-if="projectStore.properties.seo_option.seo_description"
                  class="opacity-60"
                >
                  {{
                    projectStore.properties.seo_option.seo_description.length
                  }}
                </span>
              </div>
              <textarea
                v-model="projectStore.properties.seo_option.seo_description"
                type="text"
                id="seo_description"
                class="form-control form-textarea"
                maxlength="250"
                rows="3"
              ></textarea>
              <FormInputShowError errorKey="seo_description" />
            </div>
          </div>
        </div>
      </div>

      <!-- publish -->
      <div class="card">
        <div class="card__body">
          <div class="row">
            <div class="controls w-1/2">
              <FormTextInput
                v-model="projectStore.properties.old_url"
                label="لینک قدیمی"
                name="old_url"
              />
            </div>
            <div class="controls w-1/3">
              <label for="status">وضعیت</label>
              <v-select
                v-model="projectStore.properties.status"
                id="status"
                :options="statusOption"
                :reduce="(option) => option.value"
                :clearable="false"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="status" />
            </div>
          </div>
        </div>
      </div>
      <div class="card sticky bottom-0 z-30">
        <div class="card__body">
          <div class="row px-4 gap-2">
            <button
              class="btn btn-primary w-[110px]"
              @click="submit(false)"
              :disabled="submitLoading"
            >
              <template v-if="submitLoading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else> بروزرسانی </template>
            </button>
            <button
              class="btn btn-warning w-[110px]"
              @click="submit(true)"
              :disabled="draftLoading"
            >
              <template v-if="draftLoading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else> پیش نویس </template>
            </button>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="card">
        <div class="card__body">
          <div>درحال بارگذاری...</div>
        </div>
      </div>
    </template>
  </section>

  <teleport to="body">
    <transition name="translate">
      <AdminPropertyPriceHistory
        v-if="priceHistory"
        :id="projectStore.properties.id"
        @closeModal="
          priceHistory = false;
          indexStore.showModalFn(false);
        "
      />
    </transition>
    <transition name="translate">
      <AdminMediaMediaImportModal
        v-if="galleryPopup"
        :just-image="galleryJustImage"
        :galleryType="galleryType == 'plan' ? 'image' : galleryType"
        :multiple="galleryJustImage ? false : true"
        @closeModal="
          galleryPopup = false;
          galleryJustImage = false;
          indexStore.showModalFn(false);
        "
        @chooseMedia="galleryEvent"
      />
    </transition>
    <transition name="translate">
      <AdminPropertyFormModal
        v-if="ownerPopup"
        @closeModal="
          ownerPopup = false;
          indexStore.showModalFn(false);
        "
        @submitUser="submitUser"
      />
    </transition>
  </teleport>
</template>
<style lang="scss" scoped>
.controls label {
  @apply text-sm text-[#2B335E] mb-2 block;
}

select {
  @apply bg-white w-full rounded-[4px];
}

.controls input[type="checkbox"] {
  @apply w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 focus:ring-offset-1;
}

.checkbox_label {
  margin-bottom: 0 !important;
  @apply inline-block mr-2 text-sm font-medium text-gray-900;
}

.check_control {
  @apply flex items-center pt-6;
}

.c-slug {
  @apply flex justify-between items-center pt-3 pb-5 mb-5 border-b border-[#cacfe7];

  .left {
    @apply flex  items-center gap-2;
  }

  p {
    @apply mb-0 text-sm font-semibold;
  }

  div {
    direction: ltr;
    @apply mb-0 text-sm text-[#1e9ff2];

    span {
      @apply font-semibold;

      &.hide {
        @apply hidden;
      }
    }
  }

  .slug__update__btn,
  .slug__update__submit,
  .slug__update__cancel {
    @apply text-[#1e9ff2] border border-[#1e9ff2] rounded-md py-1 px-2 text-xs outline-none bg-white;

    &.hide {
      @apply hidden;
    }
  }

  .slug__update__cancel {
    @apply border-none rounded-none underline;
  }

  .slug__update__input {
    direction: ltr;

    @apply block text-left border border-[#1e9ff2] rounded-md py-1 px-2 text-xs outline-none;

    &.verify {
      @apply border-[#28D094];
    }
    &.error {
      @apply border-[#FF4961];
    }
  }
}

.c-chain {
  @apply flex items-end;

  button {
    @apply flex items-center justify-center;

    i {
      @apply rotate-90 text-xl;
    }

    &.active {
      @apply text-blue-700;
    }
  }
}

.price__box {
  @apply py-[30px] px-3 rounded-md p-5 flex bg-[#fbfbfb] border border-[#cacfe7] mx-0 gap-2;
}

.tabs {
  @apply p-5;

  .myTab {
    @apply mb-4 border-b border-[#babfc7];
    ul {
      @apply flex flex-wrap -mb-px text-sm font-medium text-center;

      button {
        @apply text-[#495057] opacity-80 hover:opacity-100 inline-block p-4 rounded-t-lg border-b-2 border-transparent transition-colors duration-300;

        &.active {
          @apply text-[#0d6efd] border-b-[#0d6efd] opacity-100;
        }
      }
    }
  }

  #myTabContent {
    .tab__content {
      .update {
        @apply w-full gap-5 flex;

        button {
          @apply py-2 px-5 m-0 text-[15px] rounded-md text-white cursor-pointer h-10;

          i {
            @apply align-middle;
          }
        }

        input {
          direction: ltr;
        }
      }
      .update_tour {
        @apply justify-between;

        input {
          @apply w-2/3;
        }

        button {
          @apply w-[150px] h-[48px];
        }
      }
      .preview {
        @apply border border-[#cacfe7] rounded-sm w-full min-h-[200px] mt-3 p-3;

        .error {
          @apply w-full h-full flex flex-col items-center justify-center gap-2;

          p {
            @apply text-[13px] mb-0 tracking-normal;
          }
        }

        &.podcast {
          @apply flex items-center justify-center;
          .audio__box {
            @apply m-0;
          }
        }

        iframe {
          @apply w-full h-[300px];
        }
      }
    }
  }
}

.thumbnail {
  @apply relative;
  img {
    @apply w-[200px] h-[140px] object-cover;
  }

  .delete {
    @apply text-red-500 bg-white absolute -top-2 -left-2 cursor-pointer h-5 w-5 flex items-center justify-center rounded-full border-black;

    i {
      @apply text-base;
    }
  }
}

.thumbnail_box {
  @apply flex items-center rounded-md justify-between bg-[#f7f7f7] border border-[#cacfe7] py-[20px] px-3;
}

.owner_label {
  display: flex !important;
  @apply items-center justify-between;

  button {
    @apply w-5 h-5 p-0 inline-flex items-center justify-center text-[13px];
  }
}

.date__input {
  @apply relative flex items-center;

  .delete {
    @apply absolute right-2 flex p-[5px] text-[#babfc7] transition-colors duration-300;

    &:hover {
      @apply text-[#66686b];
    }
  }
}
</style>
<style lang="scss">
.address__card {
  .ui-form-input {
    height: 26px !important;
    padding: 0px 4px !important;
    font-size: 14px !important;
  }

  .v-select {
    @apply bg-white;
  }

  .controls label {
    @apply mb-[2px] opacity-70;
  }
}
</style>
