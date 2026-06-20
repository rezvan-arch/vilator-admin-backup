<script>
import useStore from "~~/mixins/store";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ساخت صفحه فرود ",
    });
    const { indexStore, adminStore, landingPage, locationStore } = useStore();
    landingPage.actionId = "";
    landingPage.loading = true;

    landingPage.getTypes();
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
