<script>
import useStore from "~~/mixins/store";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ساخت صفحه فرود ",
    });
    const { indexStore, adminStore, landingPage, locationStore } = useStore();
    const { $toast } = useNuxtApp();
    landingPage.actionId = "";
    landingPage.loading = true;

    landingPage.getTypes().then((res) => {
      if (res.status == "success") {
        applyPrefill();
      }
    });
    landingPage.getSearchLocationCities();
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
    const form = reactive({
      title: "",
      query_url: "",
      description: "",
      heading: "",
      intro: [],
      faqs: [],
      links: [],
      is_indexable: true,
      query: {
        type: null,
        country: null, // کشور
        direction: null, // منطقه جغرافیایی
        province: null, // استان
        township: null, // شهرستان
        district: null, //بخش
        city: null, // شهر
        rural_district: null, // دهستان
        downtown: null, // مرکز شهر
        suburbs: null, // حومه شهر
        municipal_zoning: null, // منطقه‌بندی شهرداری
        highway: null, // جاده/بزرگراه/اتوبان/آزادراه
        village: null, // روستا
        neighbourhood: null, // محله
        avenue: null, // بلوار / خیابان اصلی
        alley: null, // کوچه / خیابان فرعی
        suburb: null, // شهرک
        complex: null, // مجتمع
      },
      seo_option: {
        seo_title: "",
        seo_description: "",
      },
      image_id: "",
      status: "active",
      display_index: false,
    });
    // landingPage.getSearchCategory();

    locationStore.getLocationsSelect("", "direction");
    locationStore.getLocationsSelect("", "province");
    locationStore.getLocationsSelect("", "city");
    locationStore.getLocationsSelect("", "district");
    locationStore.getLocationsSelect("", "village");
    locationStore.getLocationsSelect("", "avenue");
    locationStore.getLocationsSelect("", "alley");
    locationStore.getLocationsSelect("", "suburb");
    locationStore.getLocationsSelect("", "complex");

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

      if (form.query[locSlug] && form.query[locSlug].related_location) {
        form.query[locSlug].related_location.forEach((item) => {
          if (
            form.query[item.type] == undefined ||
            form.query[item.type] == null
          ) {
            form.query[item.type] = item;
          }
        });
      }
    }

    // پیشپر کردن فرم از کاندید انتخابشده در لیست صفحه فرود
    // (لینک استاندارد کاندید در «لینک صفحه فرود» قرار میگیرد — لینک الویت دارد)
    function applyPrefill() {
      const prefill = landingPage.prefill;
      if (!prefill) return;

      form.query_url = prefill.path;
      if (prefill.type_slug) {
        const type = landingPage.types.find(
          (item) => item.slug == prefill.type_slug
        );
        if (type) {
          form.query.type = type;
        }
      }

      landingPage.prefill = null;
      $toast(
        "مسیر کاندید در لینک صفحه فرود قرار گرفت — در صورت نیاز لوکیشن را نیز انتخاب کنید.",
        "info",
        4000
      );
    }

    return {
      landingPage,
      indexStore,
      adminStore,
      locationStore,
      locSlugList,
      form,
      changeLocation,
    };
  },
  data() {
    return {
      galleryPopup: false,
      thumbnailDetails: null,
      statusOptions: [
        {
          label: "فعال",
          value: "active",
        },
        {
          label: "غیرفعال",
          value: "de_active",
        },
      ],
      debounce: null,
      debounceCategory: null,
      loading: false,
    };
  },
  methods: {
    async addSearchResult() {
      const newLink = this.createLink();
      if (this.form.query_url == "" || this.form.query_url == null) {
        this.form.query_url = newLink;
      }

      const queryKeys = Object.keys(this.form.query);
      const newQueryData = {};
      queryKeys.forEach((item) => {
        if (
          this.form.query[item] != undefined &&
          this.form.query[item] != null
        ) {
          newQueryData[item] = [this.form.query[item].slug];
        } else {
          newQueryData[item] = [];
        }
      });

      
      this.loading = true;
      this.landingPage
        .addNewSearch({
          ...this.form,
          query_url: decodeURI(this.form.query_url),
          query: newQueryData,
          display_index: this.form.display_index == true ? 1 : 0,
          heading: this.form.heading.trim(),
          intro: this.cleanList(this.form.intro),
          faqs: this.cleanList(this.form.faqs),
          links: this.cleanList(this.form.links),
          is_indexable: this.form.is_indexable == true,
        })
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
            this.$router.push("/landing-page");
            this.loading = false;
          }
        })
        .catch((err) => {
          this.loading = false;
          if (this.adminStore.errors["slug"]) {
            this.$toast(this.adminStore.errors["slug"][0], "error", 2000);
          } else {
            var keys = Object.keys(this.adminStore.errors);
            this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          }
        });
    },

    createLink() {
      const order = [
        "type",
        "category",
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

      let link = "";

      order.reverse().forEach((item) => {
        if (this.form.query[item] && this.form.query[item].id) {
          if (link === "") {
            link =
              "/location-" + this.form.query[item].slug.replaceAll("-", "_");
          }
        }
      });

      return `/search${
        this.form.query["type"] != null
          ? "/type-" + this.form.query["type"].slug.replaceAll("-", "_")
          : ""
      }${link}`;
    },
    galleryEvent(data) {
      if (data.type != "image" && data.type != "plan") {
        this.$toast("تصویرشاخص انتخابی نامعتبر می باشد!", "error", 2000);
        return;
      }
      this.thumbnailDetails = data;
      this.form.image_id = data.id;
      this.galleryPopup = false;
      this.indexStore.showModalFn(false);
    },
    setThumbnail() {
      this.indexStore.showModalFn(true);
      this.galleryPopup = true;
    },
    clearThumbnail() {
      this.thumbnailDetails = null;
      this.form.image_id = null;
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
    resetAddress(type) {
      this.locSlugList
        .slice(this.locSlugList.indexOf(type) + 1)
        .forEach((item) => {
          this.form.query[item] = null;
        });
    },
    addIntro() {
      if (this.form.intro.length < 5) this.form.intro.push("");
    },
    removeIntro(i) {
      this.form.intro.splice(i, 1);
    },
    addFaq() {
      if (this.form.faqs.length < 8)
        this.form.faqs.push({ question: "", answer: "" });
    },
    removeFaq(i) {
      this.form.faqs.splice(i, 1);
    },
    addLink() {
      if (this.form.links.length < 8)
        this.form.links.push({ label: "", to: "" });
    },
    removeLink(i) {
      this.form.links.splice(i, 1);
    },
    // حذف ردیفهای خالی قبل از ارسال (بکاند آیتمهای خالی را قبول نمیکند)
    cleanList(list) {
      return list
        .map((item) =>
          typeof item === "string"
            ? item.trim()
            : {
                question: (item.question || "").trim(),
                answer: (item.answer || "").trim(),
                label: (item.label || "").trim(),
                to: (item.to || "").trim(),
              }
        )
        .filter((item) =>
          typeof item === "string"
            ? item !== ""
            : item.question !== "" ||
              item.answer !== "" ||
              item.label !== "" ||
              item.to !== ""
        );
    },
    getParent(data) {
      const list = [
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

      let filterParents;
      if (data == "complex") {
        filterParents = list.slice(0, list.indexOf(data) - 1).reverse();
      } else {
        filterParents = list.slice(0, list.indexOf(data)).reverse();
      }

      let parent = null;
      filterParents.forEach((item) => {
        if (
          parent == null &&
          this.form.query[item] &&
          this.form.query[item].length > 0
        ) {
          parent = this.form.query[item].map((item) => item.id);
        }
      });

      return parent;
    },
  },
};
</script>
<template>
  <section class="category__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">اضافه کردن صفحه فرود</h4>
        <div class="heading__actions">
          <nuxt-link to="/landing-page" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div class="card__body">
        <div class="row">
          <div class="controls w-full">
            <div
              class="bg-orange-100 border-t-4 border-orange-500 rounded-b text-orange-900 px-4 py-3 shadow-md mb-4"
              role="alert"
            >
              <div class="flex items-center">
                <div class="py-1">
                  <i
                    class="fa-regular fa-triangle-exclamation fill-current h-6 w-6 text-orange-500 ml-4 text-2xl"
                  ></i>
                </div>
                <div>
                  <!-- <p class="font-bold">Our privacy policy has changed</p> -->
                  <p class="text-sm font-semibold">
                    در این بخش درصورت وارد کردن لینک ، الویت با لینک می باشد.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <label for="link">لینک صفحه فرود</label>
            <textarea
              v-model="form.query_url"
              type="text"
              id="link"
              class="form-control form-textarea text-left"
              rows="3"
              style="direction: ltr"
            ></textarea>
            <FormInputShowError errorKey="link" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/3">
            <label for="type">نوع تایپ</label>
            <v-select
              v-model="form.query.type"
              id="type"
              label="title"
              :options="landingPage.types"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <FormInputShowError errorKey="type" />
          </div>
        </div>
        <div class="row land__address__card">
          <div class="controls w-1/3">
            <label for="country">کشور</label>
            <v-select
              v-model="form.query.country"
              id="country"
              :options="locationStore.selectOptions['country']"
              @option:selected="
                changeLocation('country', $event.id);
                resetAddress('country');
              "
              label="title"
              @search="debounceSearchLocation('country', $event)"
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('country', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.country" class="show__slug">
              {{ form.query.country.slug }}
            </div>
            <FormInputShowError errorKey="country" />
          </div>
          <div class="controls w-1/3">
            <label for="direction">جهت جغرافیایی</label>
            <v-select
              v-model="form.query.direction"
              id="direction"
              :options="locationStore.selectOptions['direction']"
              @option:selected="
                changeLocation('direction', $event.id);
                resetAddress('direction');
              "
              label="title"
              @search="debounceSearchLocation('direction', $event)"
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('direction', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>

            <div v-if="form.query.direction" class="show__slug">
              {{ form.query.direction.slug }}
            </div>
            <FormInputShowError errorKey="province" />
          </div>
          <div class="controls w-1/3">
            <label for="province">استان</label>
            <v-select
              v-model="form.query.province"
              id="province"
              :options="locationStore.selectOptions['province']"
              @option:selected="
                changeLocation('province', $event.id);
                resetAddress('province');
              "
              label="title"
              @search="debounceSearchLocation('province', $event)"
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('province', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.province" class="show__slug">
              {{ form.query.province.slug }}
            </div>
            <FormInputShowError errorKey="province" />
          </div>
        </div>
        <div class="row land__address__card">
          <div class="controls w-1/4">
            <label for="township">شهرستان</label>

            <v-select
              v-model="form.query.township"
              id="township"
              label="title"
              :options="locationStore.selectOptions['township']"
              @search="debounceSearchLocation('township', $event)"
              @option:selected="
                changeLocation('township', $event.id);
                resetAddress('township');
              "
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('township', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.township" class="show__slug">
              {{ form.query.township.slug }}
            </div>
            <FormInputShowError errorKey="township" />
          </div>
          <div class="controls w-1/4">
            <label for="district">بخش</label>

            <v-select
              v-model="form.query.district"
              id="district"
              :options="locationStore.selectOptions['district']"
              label="title"
              @search="debounceSearchLocation('district', $event)"
              @option:selected="
                changeLocation('district', $event.id);
                resetAddress('district');
              "
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('district', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.district" class="show__slug">
              {{ form.query.district.slug }}
            </div>
            <FormInputShowError errorKey="district" />
          </div>
          <div class="controls w-1/4">
            <label for="city">شهر</label>
            <v-select
              v-model="form.query.city"
              id="city"
              :options="locationStore.selectOptions['city']"
              @option:selected="
                changeLocation('city', $event.id);
                resetAddress('city');
              "
              label="title"
              @search="debounceSearchLocation('city', $event)"
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('city', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.city" class="show__slug">
              {{ form.query.city.slug }}
            </div>
            <FormInputShowError errorKey="city" />
          </div>
          <div class="controls w-1/4">
            <label for="rural_district">دهستان</label>

            <v-select
              v-model="form.query.rural_district"
              id="rural_district"
              label="title"
              :options="locationStore.selectOptions['rural_district']"
              @search="debounceSearchLocation('rural_district', $event)"
              @option:selected="
                changeLocation('rural_district', $event.id);
                resetAddress('rural_district');
              "
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('rural_district', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.rural_district" class="show__slug">
              {{ form.query.rural_district.slug }}
            </div>
            <FormInputShowError errorKey="rural_district" />
          </div>
        </div>
        <div
          class="row land__address__card border border-[#babfc7] rounded-lg px-3 py-3 pb-4 bg-[#f5f5f5]"
        >
          <div class="controls w-1/3">
            <label for="highway">جاده/بزرگراه/اتوبان/آزادراه</label>

            <v-select
              v-model="form.query.highway"
              id="highway"
              label="title"
              :options="locationStore.selectOptions['highway']"
              @search="debounceSearchLocation('highway', $event)"
              @option:selected="
                changeLocation('highway', $event.id);
                resetAddress('highway');
              "
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('highway', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.highway" class="show__slug">
              {{ form.query.highway.slug }}
            </div>
            <FormInputShowError errorKey="highway" />
          </div>
          <div class="controls w-1/3">
            <label for="downtown">مرکز شهر</label>

            <v-select
              v-model="form.query.downtown"
              id="downtown"
              label="title"
              :options="locationStore.selectOptions['downtown']"
              @search="debounceSearchLocation('downtown', $event)"
              @option:selected="
                changeLocation('downtown', $event.id);
                resetAddress('downtown');
              "
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('downtown', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.downtown" class="show__slug !bg-white">
              {{ form.query.downtown.slug }}
            </div>
            <FormInputShowError errorKey="downtown" />
          </div>
          <div class="controls w-1/3">
            <label for="suburbs">حومه شهر</label>

            <v-select
              v-model="form.query.suburbs"
              id="suburbs"
              label="title"
              :options="locationStore.selectOptions['suburbs']"
              @search="debounceSearchLocation('suburbs', $event)"
              @option:selected="
                changeLocation('suburbs', $event.id);
                resetAddress('suburbs');
              "
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('suburbs', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.suburbs" class="show__slug">
              {{ form.query.suburbs.slug }}
            </div>
            <FormInputShowError errorKey="suburbs" />
          </div>
        </div>
        <div class="row land__address__card">
          <div class="controls w-1/3">
            <label for="municipal_zoning">منطقه‌بندی شهرداری</label>

            <v-select
              v-model="form.query.municipal_zoning"
              id="municipal_zoning"
              label="title"
              :options="locationStore.selectOptions['municipal_zoning']"
              @search="debounceSearchLocation('municipal_zoning', $event)"
              @option:selected="
                changeLocation('municipal_zoning', $event.id);
                resetAddress('municipal_zoning');
              "
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('municipal_zoning', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.municipal_zoning" class="show__slug">
              {{ form.query.municipal_zoning.slug }}
            </div>
            <FormInputShowError errorKey="municipal_zoning" />
          </div>
          <div class="controls w-1/3">
            <label for="village">روستا</label>

            <v-select
              v-model="form.query.village"
              id="village"
              label="title"
              :options="locationStore.selectOptions['village']"
              @search="debounceSearchLocation('village', $event)"
              @option:selected="
                changeLocation('village', $event.id);
                resetAddress('village');
              "
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('village', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.village" class="show__slug">
              {{ form.query.village.slug }}
            </div>
            <FormInputShowError errorKey="village" />
          </div>
          <div class="controls w-1/3">
            <label for="neighbourhood">محله</label>

            <v-select
              v-model="form.query.neighbourhood"
              id="neighbourhood"
              label="title"
              :options="locationStore.selectOptions['neighbourhood']"
              @search="debounceSearchLocation('neighbourhood', $event)"
              @option:selected="
                changeLocation('neighbourhood', $event.id);
                resetAddress('neighbourhood');
              "
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('neighbourhood', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.neighbourhood" class="show__slug">
              {{ form.query.neighbourhood.slug }}
            </div>
            <FormInputShowError errorKey="neighbourhood" />
          </div>
        </div>
        <div class="row land__address__card">
          <div class="controls w-1/4">
            <label for="avenue">بلوار / خیابان اصلی</label>

            <v-select
              v-model="form.query.avenue"
              id="avenue"
              label="title"
              :options="locationStore.selectOptions['avenue']"
              @search="debounceSearchLocation('avenue', $event)"
              @option:selected="
                changeLocation('avenue', $event.id);
                resetAddress('avenue');
              "
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('avenue', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.avenue" class="show__slug">
              {{ form.query.avenue.slug }}
            </div>
            <FormInputShowError errorKey="avenue" />
          </div>
          <div class="controls w-1/4">
            <label for="alley"> کوچه / خیابان فرعی</label>

            <v-select
              v-model="form.query.alley"
              id="alley"
              label="title"
              :options="locationStore.selectOptions['alley']"
              @search="debounceSearchLocation('alley', $event)"
              @option:selected="
                changeLocation('alley', $event.id);
                resetAddress('alley');
              "
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('alley', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.alley" class="show__slug">
              {{ form.query.alley.slug }}
            </div>
            <FormInputShowError errorKey="alley" />
          </div>
          <div class="controls w-1/4">
            <label for="suburb">شهرک</label>
            <v-select
              v-model="form.query.suburb"
              id="suburb"
              :options="locationStore.selectOptions['suburb']"
              label="title"
              @search="debounceSearchLocation('suburb', $event)"
              @option:selected="changeLocation('suburb', $event.id)"
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('suburb', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.suburb" class="show__slug">
              {{ form.query.suburb.slug }}
            </div>
            <FormInputShowError errorKey="suburb" />
          </div>
          <div class="controls w-1/4">
            <label for="complex">مجتمع</label>
            <v-select
              v-model="form.query.complex"
              id="complex"
              :options="locationStore.selectOptions['complex']"
              label="title"
              @search="debounceSearchLocation('complex', $event)"
              @option:selected="changeLocation('complex', $event.id)"
              :disabled="locationStore.locationLoading"
              autocomplete="off"
              @option:deselected="searchLocation('complex', '')"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <div v-if="form.query.complex" class="show__slug">
              {{ form.query.complex.slug }}
            </div>
            <FormInputShowError errorKey="complex" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-2/3">
            <FormTextInput
              name="title"
              label="عنوان"
              v-model="form.title"
              rules="min:3|required"
            />
            <FormInputShowError errorKey="title" />
          </div>
          <div class="controls w-1/3">
            <label for="status">وضعیت</label>
            <v-select
              v-model="form.status"
              id="status"
              :reduce="(option) => option.value"
              :options="statusOptions"
              :clearable="false"
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

        <div class="row">
          <div class="controls w-full">
            <label for="full_description">توضیحات کامل</label>
            <rich-editor v-model="form.description" />
            <FormInputShowError errorKey="description" />
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">محتوای لندینگ</h4>
      </div>
      <div class="card__body">
        <div class="row">
          <div class="controls w-full">
            <div
              class="bg-blue-50 border-t-4 border-blue-500 rounded-b text-blue-900 px-4 py-3 shadow-md mb-4"
              role="alert"
            >
              <p class="text-sm font-semibold">
                فیلدهای خالی = مقدار خودکار؛ عنوان خالی از روی فیلترها ساخته
                میشود.
              </p>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              v-model="form.heading"
              name="lp_heading"
              label="تیتر (H1) — خالی = خودکار"
            />
          </div>
        </div>

        <!-- پاراگرافهای معرفی -->
        <div class="row">
          <div class="controls w-full">
            <div class="flex items-center justify-between mb-2">
              <label>پاراگرافهای معرفی (حداکثر ۵)</label>
              <button
                type="button"
                class="btn btn-primary py-1 px-3 text-sm"
                :disabled="form.intro.length >= 5"
                @click="addIntro()"
              >
                <i class="fa-regular fa-plus"></i> پاراگراف
              </button>
            </div>
            <div
              v-for="(p, i) in form.intro"
              :key="`intro-${i}`"
              class="flex items-start gap-2 mb-2"
            >
              <textarea v-model="form.intro[i]" rows="3" class="w-full"></textarea>
              <button
                type="button"
                class="btn btn-danger py-1 px-2"
                @click="removeIntro(i)"
                title="حذف پاراگراف"
              >
                <i class="fa-regular fa-trash"></i>
              </button>
            </div>
            <p v-if="form.intro.length == 0" class="text-xs opacity-60">
              پاراگرافی ثبت نشده — «پاراگراف» را بزنید.
            </p>
          </div>
        </div>

        <!-- سوالات متداول -->
        <div class="row">
          <div class="controls w-full">
            <div class="flex items-center justify-between mb-2">
              <label>سوالات متداول (حداکثر ۸ — با اسکیمای FAQPage)</label>
              <button
                type="button"
                class="btn btn-primary py-1 px-3 text-sm"
                :disabled="form.faqs.length >= 8"
                @click="addFaq()"
              >
                <i class="fa-regular fa-plus"></i> سوال
              </button>
            </div>
            <div
              v-for="(faq, i) in form.faqs"
              :key="`faq-${i}`"
              class="rounded-lg border border-gray-200 dark:border-baseBlack-200 p-3 mb-2"
            >
              <div class="flex items-center gap-2 mb-2">
                <input
                  v-model="faq.question"
                  type="text"
                  class="w-full"
                  placeholder="سوال"
                />
                <button
                  type="button"
                  class="btn btn-danger py-1 px-2"
                  @click="removeFaq(i)"
                  title="حذف سوال"
                >
                  <i class="fa-regular fa-trash"></i>
                </button>
              </div>
              <textarea
                v-model="faq.answer"
                rows="2"
                class="w-full"
                placeholder="جواب"
              ></textarea>
            </div>
            <p v-if="form.faqs.length == 0" class="text-xs opacity-60">
              سوالی ثبت نشده — «سوال» را بزنید.
            </p>
          </div>
        </div>

        <!-- لینکسازی داخلی -->
        <div class="row">
          <div class="controls w-full">
            <div class="flex items-center justify-between mb-2">
              <label>لینکهای داخلی (حداکثر ۸)</label>
              <button
                type="button"
                class="btn btn-primary py-1 px-3 text-sm"
                :disabled="form.links.length >= 8"
                @click="addLink()"
              >
                <i class="fa-regular fa-plus"></i> لینک
              </button>
            </div>
            <div
              v-for="(link, i) in form.links"
              :key="`link-${i}`"
              class="flex items-center gap-2 mb-2"
            >
              <input
                v-model="link.label"
                type="text"
                class="w-1/3"
                placeholder="عنوان لینک"
              />
              <input
                v-model="link.to"
                type="text"
                dir="ltr"
                class="w-full font-mono text-xs"
                placeholder="/mag/... یا /property/..."
              />
              <button
                type="button"
                class="btn btn-danger py-1 px-2"
                @click="removeLink(i)"
                title="حذف لینک"
              >
                <i class="fa-regular fa-trash"></i>
              </button>
            </div>
            <p v-if="form.links.length == 0" class="text-xs opacity-60">
              لینکی ثبت نشده — «لینک» را بزنید.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">بخش تنظیمات سئو</h4>
      </div>
      <div class="card__body">
        <div class="row">
          <div class="controls w-1/2">
            <label for="seo_title">عنوان سئو</label>
            <input
              v-model="form.seo_option.seo_title"
              type="text"
              id="seo_title"
              class="form-control"
            />
            <FormInputShowError errorKey="seo_title" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <div class="flex items-center justify-between">
              <label for="seo_description">توضیح سئو</label>
              <span v-if="form.seo_option.seo_option" class="opacity-60">
                {{ form.seo_option.seo_option.seo_description.length }}
              </span>
            </div>
            <textarea
              v-model="form.seo_option.seo_description"
              type="text"
              id="seo_description"
              class="form-control form-textarea"
              maxlength="250"
              rows="3"
            ></textarea>
            <FormInputShowError errorKey="seo_description" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full flex items-center gap-2">
            <input id="lp__indexable" v-model="form.is_indexable" type="checkbox" />
            <label for="lp__indexable" class="checkbox_label">
              اجازه ایندکس در موتورهای جستجو
            </label>
          </div>
        </div>
        <div class="row p-4">
          <div class="controls w-full thumbnail_box">
            <button class="btn btn-primary" @click="setThumbnail">
              انتخاب تصویر شاخص
            </button>
            <div class="thumbnail relative">
              <div
                class="delete"
                @click="clearThumbnail()"
                v-if="thumbnailDetails != null || form.thumbnail_id != null"
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
    <div class="card">
      <div class="card__body">
        <div class="row px-4">
          <div class="flex items-center mb-4">
            <input
              v-model="form.display_index"
              id="display_index"
              type="checkbox"
              value="display_index"
              class=""
            />
            <label for="display_index" class="checkbox_label">
              نمایش در صفحه اول
            </label>
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <button
              class="btn btn-primary w-[110px]"
              @click="addSearchResult()"
              :disabled="loading"
            >
              <template v-if="loading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else> اضافه کردن </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
  <teleport to="body">
    <transition name="translate">
      <AdminMediaMediaImportModal
        v-if="galleryPopup"
        galleryType="image"
        :justImage="true"
        :multiple="false"
        @closeModal="
          galleryPopup = false;
          indexStore.showModalFn(false);
        "
        @chooseMedia="galleryEvent"
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

.thumbnail {
  img {
    @apply w-[200px] h-[140px] object-cover;
  }
}

.thumbnail_box {
  @apply flex items-center rounded-md justify-between bg-[#f7f7f7] border border-[#cacfe7] py-[20px] px-3;
}

.delete {
  @apply text-red-500 bg-white absolute -top-2 -left-2 cursor-pointer h-5 w-5 flex items-center justify-center rounded-full border-black;

  i {
    @apply text-base;
  }
}
.checkbox_label {
  margin-bottom: 0 !important;
  @apply inline-block mr-2 text-sm font-medium text-gray-900;
}
.land__address__card {
  .controls label {
    @apply mb-[2px] opacity-70;
  }

  .show__slug {
    @apply bg-[#F3F3F3] px-2 py-1 rounded-md text-xs mt-1 text-left;
  }
}
</style>
