<script>
import useStore from "~~/mixins/store";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ساخت لوکیشن ",
    });
    const { indexStore, adminStore, locationStore } = useStore();
    const route = useRoute();

    return {
      indexStore,
      adminStore,
      locationStore,
    };
  },
  data() {
    return {
      form: {
        country: null,
        direction: null,
        province: null,
        township: null,
        district: null,
        city: null,
        rural_district: null,
        downtown: null,
        suburbs: null,
        municipal_zoning: null,
        village: null,
        neighbourhood: null,
        avenue: null,
        alley: null,
        suburb: null,
        complex: null,
      },
      addressSlugs: {
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
      },
      locationTypeOptions: [
        { value: "country", validParent: [] },
        {
          value: "direction",
          validParent: ["country"],
        },
        {
          value: "province",
          validParent: ["country", "direction"],
        },
        {
          value: "township",
          validParent: ["country", "direction", "province"],
        },
        {
          value: "district",
          validParent: ["country", "direction", "province", "township"],
        },
        {
          value: "city",
          validParent: [
            "country",
            "direction",
            "province",
            "township",
            "district",
          ],
        },
        {
          value: "rural_district",
          validParent: [
            "country",
            "direction",
            "province",
            "township",
            "district",
          ],
        },
        {
          value: "downtown",
          validParent: [
            "country",
            "direction",
            "province",
            "township",
            "district",
            "city",
          ],
        },
        {
          value: "suburbs",
          validParent: [
            "country",
            "direction",
            "province",
            "township",
            "district",
            "city",
          ],
        },
        {
          value: "municipal_zoning",
          validParent: [
            "country",
            "direction",
            "province",
            "township",
            "district",
            "city",
          ],
        },
        {
          value: "village",
          validParent: [
            "country",
            "direction",
            "province",
            "township",
            "district",
            "rural_district",
          ],
        },
        {
          value: "neighbourhood",
          validParent: [
            "country",
            "direction",
            "province",
            "township",
            "district",
            "city",
          ],
        },
        {
          value: "avenue",
          validParent: [
            "country",
            "direction",
            "province",
            "township",
            "district",
            "city",
            "neighbourhood",
          ],
        },
        {
          value: "alley",
          validParent: [
            "country",
            "direction",
            "province",
            "township",
            "district",
            "city",
            "neighbourhood",
          ],
        },
        {
          value: "suburb",
          validParent: [
            "country",
            "direction",
            "province",
            "township",
            "district",
            "city",
          ],
        },
        {
          value: "complex",
          validParent: [
            "country",
            "direction",
            "province",
            "township",
            "district",
            "city",
          ],
        },
      ],
      searchString: "",
      loading: null,
    };
  },
  async created() {
    const locSlugList = Object.keys(this.addressSlugs);
    locSlugList.forEach((item) => {
      this.locationStore.getLocationsSelect("", item);
    });
    this.locationStore.loading = false;

    if (this.$route.query.parent) {
      this.locationStore.loading = true;
      await this.locationStore
        .getLocation(this.$route.query.parent)
        .then((res) => {
          if (res.status == "success") {
            this.form[res.data.type] = res.data;

            res.data.related_location.forEach((item) => {
              this.form[item.type] = item;
              this.addressSlugs[item.type] = item.slug;
            });
          }
          this.locationStore.loading = false;
          console.log(res);
        })
        .catch((err) => {
          console.log(err);

          this.locationStore.loading = false;
        });
    }
  },
  methods: {
    changeLocation(locSlug, data) {
      const locSlugList = Object.keys(this.addressSlugs);
      if (!data) return;
      if (locSlug !== "suburb" && locSlug !== "complex") {
        this.locationStore.locationLoading = true;

        locSlugList.slice(locSlugList.indexOf(locSlug) + 1).forEach((item) => {
          if (item == "highway") {
            this.locationStore.getHighwaySelect("", data.id).then((res) => {
              this.locationStore.locationLoading = false;
            });
          } else {
            this.locationTypeOptions.forEach((locType) => {
              if (
                locType.value == item &&
                locType.validParent.includes(data.type)
              ) {
                this.locationStore.getLocationsSelect("", item, data.id);
              }
            });
            this.locationStore.locationLoading = false;
          }
        });
      }

      if (this.form[locSlug]) {
        this.addressSlugs[locSlug] = this.form[locSlug].slug;

        if (this.form[locSlug].related_location) {
          this.form[locSlug].related_location.forEach((item) => {
            if (
              this.form[item.type] == undefined ||
              this.form[item.type] == null
            ) {
              this.form[item.type] = item;
              this.addressSlugs[item.type] = item.slug;
            }
          });
        }
      }
    },

    resetAddress(type) {
      const locSlugList = Object.keys(this.addressSlugs);
      locSlugList.slice(locSlugList.indexOf(type) + 1).forEach((item) => {
        this.form[item] = null;
        this.addressSlugs[item] = null;
      });
    },
    debounceSearchLocation(slug, data) {
      this.searchString = data;
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.searchLocation(slug, data);
      }, 600);
    },
    searchLocation(slug, data) {
      let sendRequest = false;

      if (slug === "country") {
        this.locationStore.getLocationsSelect(data, slug);
        return;
      }
      if (slug === "highway") {
        this.locationStore.getHighwaySelect(data);
        return;
      }
      this.locationTypeOptions.forEach((item) => {
        if (item.value === slug) {
          const parentValue = [];
          [...item.validParent].reverse().forEach((parent) => {
            parentValue.push(this.form[parent] != undefined);

            if (this.form[parent] != undefined && !sendRequest) {
              sendRequest = true;
              let locSearch = {};
              locSearch[`search[${this.form[parent].type}_id]`] =
                this.form[parent].id;
              this.locationStore.getLocationsSelect(
                data,
                slug,
                null,
                locSearch
              );
            }

            if (
              parentValue.length == item.validParent.length &&
              !parentValue.includes(true)
            ) {
              sendRequest = true;
              this.locationStore.getLocationsSelect(data, slug);
            }
          });
        }
      });
    },
    deselectedLocation(type) {
      this.addressSlugs[type] = null;
    },
    doCreateLocation() {
      if (this.form["country"] == null) {
        this.$toast("لطفا کشور را انتخاب کنید", "error", 5000);
        return;
      }
      if (this.form["direction"] == null) {
        this.$toast("لطفا جهت جغرافیایی را انتخاب کنید", "error", 5000);
        return;
      }
      if (this.form["province"] == null) {
        this.$toast("لطفا استان را انتخاب کنید", "error", 5000);
        return;
      }
      this.loading = true;
      const data = {};
      const addressKeys = Object.keys(this.addressSlugs);
      addressKeys.forEach((key) => {
        if (key != "highway") {
          data[key] = {
            title: this.form[key] ? this.form[key].title : null,
            manual_slug: this.addressSlugs[key],
            id: null,
            type: key,
          };

          if (this.form[key] && this.form[key].id) {
            data[key].id = this.form[key].id;
          }
          if (this.form[key] && this.form[key].slug) {
            data[key].slug = this.form[key].slug;
          }
        }
      });

      this.locationStore
        .multiStore({
          location: Object.values(data).filter((item) => item.title != null),
        })
        .then((res) => {
          if (res.status == "success") {
            res.data.forEach((item) => {
              this.form[item.type] = item;
              this.addressSlugs[item.type] = item.slug;
            });
            this.$toast(res.message, "success", 5000);
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$toast("درخواست شما با خطا مواجه شد", "error", 5000);
          this.loading = false;
        });
    },
  },
  watch: {
    locationStore: {
      handler(val) {
        if (!val.loading) {
          setTimeout(() => {
            const selects = document.querySelectorAll(".v-select");
            const locSlugList = Object.keys(this.addressSlugs);
            selects.forEach((item) => {
              item.addEventListener("click", (e) => {
                const btn = item.querySelector(".vs__clear");
                if (btn.contains(e.target)) {
                  const itemID = item.getAttribute("id");
                  if (locSlugList.includes(itemID)) {
                    this.addressSlugs[itemID] = "";
                  }
                }
              });
            });
          }, 1500);
        }
      },
      deep: true,
    },
  },
};
</script>
<template>
  <section class="location__new">
    <template v-if="!locationStore.loading">
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">اضافه کردن لوکیشن</h4>
          <div class="heading__actions">
            <nuxt-link to="/locations" class="btn btn-primary">
              <i class="fa-regular fa-list"></i>
              لیست
            </nuxt-link>
          </div>
        </div>
        <div class="card__body">
          <div
            class="row border border-[#babfc7] rounded-lg px-3 py-3 pb-4 bg-[#f5f5f5]"
          >
            <div class="controls w-1/4">
              <label for="country">کشور</label>
              <v-select
                v-model="form.country"
                id="country"
                :options="locationStore.selectOptions['country']"
                @option:selected="
                  changeLocation('country', $event);
                  resetAddress('country');
                "
                @input="deselectedLocation($event)"
                label="title"
                @search="debounceSearchLocation('country', $event)"
                autocomplete="off"
                :disabled="locationStore.locationLoading"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error: form.country && form.country.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
                v-model="form.direction"
                id="direction"
                :options="locationStore.selectOptions['direction']"
                @option:selected="
                  changeLocation('direction', $event);
                  resetAddress('direction');
                "
                @input="addressSlugs.direction = null"
                label="title"
                @search="debounceSearchLocation('direction', $event)"
                autocomplete="off"
                :disabled="locationStore.locationLoading"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error: form.direction && form.direction.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
                v-model="form.province"
                id="province"
                :options="locationStore.selectOptions['province']"
                @option:selected="
                  changeLocation('province', $event);
                  resetAddress('province');
                "
                @input="addressSlugs.province = null"
                label="title"
                @search="debounceSearchLocation('province', $event)"
                autocomplete="off"
                :disabled="locationStore.locationLoading"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error: form.province && form.province.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
                v-model="form.township"
                id="township"
                :options="locationStore.selectOptions['township']"
                label="title"
                @search="debounceSearchLocation('township', $event)"
                @option:selected="
                  changeLocation('township', $event);
                  resetAddress('township');
                "
                @input="addressSlugs.township = null"
                :disabled="locationStore.locationLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error: form.township && form.township.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
                v-model="form.district"
                id="district"
                :options="locationStore.selectOptions['district']"
                label="title"
                @search="debounceSearchLocation('district', $event)"
                @option:selected="
                  changeLocation('district', $event);
                  resetAddress('district');
                "
                @input="addressSlugs.district = null"
                :disabled="locationStore.locationLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error: form.district && form.district.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
                v-model="form.city"
                id="city"
                :options="locationStore.selectOptions['city']"
                @option:selected="
                  changeLocation('city', $event);
                  resetAddress('city');
                "
                @input="addressSlugs.city = null"
                label="title"
                @search="debounceSearchLocation('city', $event)"
                :disabled="locationStore.locationLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error: form.city && form.city.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
                v-model="form.rural_district"
                id="rural_district"
                :options="locationStore.selectOptions['rural_district']"
                label="title"
                @search="debounceSearchLocation('rural_district', $event)"
                @option:selected="
                  changeLocation('rural_district', $event);
                  resetAddress('rural_district');
                "
                @input="addressSlugs.rural_district = null"
                :disabled="locationStore.locationLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error:
                    form.rural_district && form.rural_district.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  <span class="w-full">{{ automatic_title }}</span>
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
            <div class="controls w-1/2">
              <label for="downtown">مرکز شهر</label>

              <v-select
                v-model="form.downtown"
                id="downtown"
                :options="locationStore.selectOptions['downtown']"
                label="title"
                @search="debounceSearchLocation('downtown', $event)"
                @option:selected="
                  changeLocation('downtown', $event);
                  resetAddress('downtown');
                "
                @input="addressSlugs.downtown = null"
                :disabled="locationStore.locationLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error: form.downtown && form.downtown.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
            <div class="controls w-1/2">
              <label for="suburbs">حومه شهر</label>

              <v-select
                v-model="form.suburbs"
                id="suburbs"
                :options="locationStore.selectOptions['suburbs']"
                label="title"
                @search="debounceSearchLocation('suburbs', $event)"
                @option:selected="
                  changeLocation('suburbs', $event);
                  resetAddress('suburbs');
                "
                @input="addressSlugs.suburbs = null"
                :disabled="locationStore.locationLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error: form.suburbs && form.suburbs.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
                v-model="form.municipal_zoning"
                id="municipal_zoning"
                :options="locationStore.selectOptions['municipal_zoning']"
                label="title"
                @search="debounceSearchLocation('municipal_zoning', $event)"
                @option:selected="
                  changeLocation('municipal_zoning', $event);
                  resetAddress('municipal_zoning');
                "
                @input="addressSlugs.municipal_zoning = null"
                :disabled="locationStore.locationLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error:
                    form.municipal_zoning &&
                    form.municipal_zoning.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
                v-model="form.village"
                id="village"
                :options="locationStore.selectOptions['village']"
                label="title"
                @search="debounceSearchLocation('village', $event)"
                @option:selected="
                  changeLocation('village', $event);
                  resetAddress('village');
                "
                @input="addressSlugs.village = null"
                :disabled="locationStore.locationLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error: form.village && form.village.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
                v-model="form.neighbourhood"
                id="neighbourhood"
                :options="locationStore.selectOptions['neighbourhood']"
                label="title"
                @search="debounceSearchLocation('neighbourhood', $event)"
                @option:selected="
                  changeLocation('neighbourhood', $event);
                  resetAddress('neighbourhood');
                "
                @input="addressSlugs.neighbourhood = null"
                :disabled="locationStore.locationLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error:
                    form.neighbourhood && form.neighbourhood.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
                v-model="form.avenue"
                id="avenue"
                :options="locationStore.selectOptions['avenue']"
                label="title"
                @search="debounceSearchLocation('avenue', $event)"
                @option:selected="
                  changeLocation('avenue', $event);
                  resetAddress('avenue');
                "
                @input="addressSlugs.avenue = null"
                :disabled="locationStore.locationLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error: form.avenue && form.avenue.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
                v-model="form.alley"
                id="alley"
                :options="locationStore.selectOptions['alley']"
                label="title"
                @search="debounceSearchLocation('alley', $event)"
                @option:selected="
                  changeLocation('alley', $event);
                  resetAddress('alley');
                "
                @input="addressSlugs.alley = null"
                :disabled="locationStore.locationLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error: form.alley && form.alley.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
                v-model="form.suburb"
                id="suburb"
                :options="locationStore.selectOptions['suburb']"
                label="title"
                @search="debounceSearchLocation('suburb', $event)"
                @option:selected="changeLocation('suburb', $event.id)"
                @input="addressSlugs.suburb = null"
                :disabled="locationStore.locationLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error: form.suburb && form.suburb.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
                v-model="form.complex"
                id="complex"
                :options="locationStore.selectOptions['complex']"
                label="title"
                @search="debounceSearchLocation('complex', $event)"
                @option:selected="changeLocation('complex', $event.id)"
                @input="addressSlugs.complex = null"
                :disabled="locationStore.locationLoading"
                autocomplete="off"
                taggable
                :create-option="
                  (data) => ({
                    title: data,
                    automatic_title: data,
                  })
                "
                :class="{
                  error: form.complex && form.complex.id == undefined,
                }"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template
                  v-if="searchString != ''"
                  #option="{ automatic_title }"
                >
                  {{ automatic_title }}
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
          <div class="row">
            <div class="controls w-full">
              <button
                :disabled="loading"
                class="btn btn-primary w-[100px]"
                @click="doCreateLocation()"
              >
                <template v-if="loading">
                  <i
                    class="fa-solid fa-spinner text-white text-xl animate-spin"
                  ></i>
                </template>
                <template v-else> افزودن </template>
              </button>
            </div>
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

.parent__location {
  @apply flex items-center gap-2 w-full mb-5 pr-5 border-b border-[#666ee8] pb-3;

  label {
    @apply mb-0;
  }
}
</style>
