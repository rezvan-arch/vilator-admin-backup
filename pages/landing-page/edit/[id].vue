<script>
import useStore from "~/mixins/store";

export default {
  async setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ویرایش صفحه فرود ",
    });
    const { indexStore, adminStore, landingPage, locationStore } = useStore();
    const route = useRoute();

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

    function changeLocation(locSlug, data) {
      if (!data) return;
      locationStore.locationLoading = true;

      locSlugList.slice(locSlugList.indexOf(locSlug) + 1).forEach((item) => {
        locationStore.getLocationsSelect("", item, data).then((res) => {
          locationStore.locationLoading = false;
        });
      });
    }
    return {
      landingPage,
      indexStore,
      adminStore,
      locationStore,
      locSlugList,
      changeLocation,
    };
  },
  async created() {
    await this.landingPage
      .getSearch(this.$route.params.id)
      .then(async (res) => {
        if (res.status == "success") {
          this.locSlugList.forEach(async (slugItem, index) => {
            await this.locationStore
              .getLocationsSelect("", slugItem)
              .then(async (res) => {
                if (res.status == "success") {
                  if (this.landingPage.searches.query[slugItem] != undefined) {
                    const data = res.data.find((lItem) =>
                      this.landingPage.searches.query[slugItem].includes(
                        lItem.slug
                      )
                    );
                    this.landingPage.searches.query[slugItem] = data;
                  }
                }

                if (index + 1 === this.locSlugList.length) {
                  this.landingPage.loading = false;
                }
              });
          });
        }
      });

    this.landingPage.getTypes().then((res) => {
      if (res.status == "success") {
        this.landingPage.searches.query["type"] = res.data.find((item) =>
          this.landingPage.searches.query["type"].includes(item.slug)
        );
      }
    });
  },
  data() {
    return {
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
      galleryPopup: false,
      thumbnailDetails: null,
      debounce: null,
      trashConfirm: false,
      loading: false,
      trashLoading: false,

      locSlug: [
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
      ],
    };
  },
  methods: {
    deleteSearch() {
      this.trashConfirm = false;
      this.landingPage.actionId = this.landingPage.searches.id;
      this.trashLoading = true;
      this.landingPage
        .deleteSearch()
        .then(() => {
          this.landingPage.actionId = "";
          this.$router.push(`/landing-page`);
          this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          this.trashLoading = false;
        })
        .catch((err) => {
          this.landingPage.actionId = "";
          this.trashLoading = false;
        });
    },
    async editSearch() {
      if (this.landingPage.searches.title == "") {
        this.$toast("عنوان الزامی است!", "error", 2000);
        return;
      }

      const newLink = this.createLink();
      if (
        this.landingPage.searches.query_url == "" ||
        this.landingPage.searches.query_url == null
      ) {
        this.landingPage.searches.query_url = newLink;
      }

      const queryKeys = Object.keys(this.landingPage.searches.query);
      const newQueryData = {};
      queryKeys.forEach((item) => {
        if (
          this.landingPage.searches.query[item] != undefined &&
          this.landingPage.searches.query[item] != null
        ) {
          newQueryData[item] = [this.landingPage.searches.query[item].slug];
        } else {
          newQueryData[item] = [];
        }
      });

      this.loading = true;
      this.landingPage
        .editSearch(
          {
            ...this.landingPage.searches,
            query_url: decodeURI(this.landingPage.searches.query_url),
            query: newQueryData,

            display_index:
              this.landingPage.searches.display_index == true ? 1 : 0,
          },
          this.landingPage.searches.id
        )
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
            // this.$router.push("/landing-page");
            this.loading = false;
          }
        })
        .catch((err) => {
          this.loading = false;
          let list = Object.keys(this.adminStore.errors);
          this.$toast(this.adminStore.errors[list[0]][0], "error", 2000);
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
        if (
          this.landingPage.searches.query[item] &&
          this.landingPage.searches.query[item].id
        ) {
          if (link === "") {
            link =
              "/location-" +
              this.landingPage.searches.query[item].slug.replaceAll("-", "_");
          }
        }
      });

      return `/search${
        this.landingPage.searches.query["type"] != null
          ? "/type-" +
            this.landingPage.searches.query["type"].slug.replaceAll("-", "_")
          : ""
      }${link}`;
    },
    galleryEvent(data) {
      if (data.type != "image" && data.type != "plan") {
        this.$toast("تصویرشاخص انتخابی نامعتبر می باشد!", "error", 2000);
        return;
      }
      this.thumbnailDetails = data;
      this.landingPage.searches.image = data.get_url;
      this.landingPage.searches.image_id = data.id;
      this.galleryPopup = false;
      this.indexStore.showModalFn(false);
    },
    setThumbnail() {
      this.indexStore.showModalFn(true);
      this.galleryPopup = true;
    },
    clearThumbnail() {
      this.thumbnailDetails = null;
      this.landingPage.searches.image = null;
      this.landingPage.searches.image_id = null;
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
          this.landingPage.searches.query[item] = null;
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
          this.landingPage.searches.query[item] &&
          this.landingPage.searches.query[item].length > 0
        ) {
          parent = this.landingPage.searches.query[item].map((item) => item.id);
        }
      });

      return parent;
    },
  },
};
</script>

<template>
  <section class="category__new">
    <template v-if="!landingPage.loading">
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title">ویرایش صفحه فرود</h4>
          <div class="heading__actions">
            <button
              :disabled="trashLoading"
              @click="trashConfirm = true"
              class="btn btn-danger w-[110px]"
            >
              <template v-if="trashLoading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else>
                <i class="fa-regular fa-trash"></i>
                حذف نتیجه
              </template>
            </button>
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
                v-model="landingPage.searches.query_url"
                type="text"
                id="link"
                class="form-control form-textarea text-left"
                rows="3"
                style="direction: ltr"
              ></textarea>
              <FormInputShowError errorKey="link" />
            </div>
          </div>
          <div v-if="landingPage.searches.query" class="row">
            <div class="controls w-1/2">
              <label for="type">نوع تایپ</label>
              <v-select
                v-model="landingPage.searches.query['type']"
                id="type"
                label="title"
                :options="landingPage.types"
                :closeOnSelect="false"
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
          <div
            v-if="landingPage.searches.query"
            class="row land__address__card"
          >
            <div class="controls w-1/3">
              <label for="country">کشور</label>
              <v-select
                v-model="landingPage.searches.query['country']"
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
              <div
                v-if="landingPage.searches.query['country']"
                class="show__slug"
              >
                {{ landingPage.searches.query["country"].slug }}
              </div>
              <FormInputShowError errorKey="country" />
            </div>
            <div class="controls w-1/3">
              <label for="direction">جهت جغرافیایی</label>
              <v-select
                v-model="landingPage.searches.query['direction']"
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

              <div
                v-if="landingPage.searches.query['direction']"
                class="show__slug"
              >
                {{ landingPage.searches.query["direction"].slug }}
              </div>
              <FormInputShowError errorKey="province" />
            </div>
            <div class="controls w-1/3">
              <label for="province">استان</label>
              <v-select
                v-model="landingPage.searches.query['province']"
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
              <div
                v-if="landingPage.searches.query['province']"
                class="show__slug"
              >
                {{ landingPage.searches.query["province"].slug }}
              </div>
              <FormInputShowError errorKey="province" />
            </div>
          </div>
          <div
            v-if="landingPage.searches.query"
            class="row land__address__card"
          >
            <div class="controls w-1/3">
              <label for="township">شهرستان</label>

              <v-select
                v-model="landingPage.searches.query['township']"
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
              <div
                v-if="landingPage.searches.query['township']"
                class="show__slug"
              >
                {{ landingPage.searches.query["township"].slug }}
              </div>
              <FormInputShowError errorKey="township" />
            </div>
            <div class="controls w-1/3">
              <label for="district">بخش</label>

              <v-select
                v-model="landingPage.searches.query['district']"
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
              <div
                v-if="landingPage.searches.query['district']"
                class="show__slug"
              >
                {{ landingPage.searches.query["district"].slug }}
              </div>
              <FormInputShowError errorKey="district" />
            </div>
            <div class="controls w-1/3">
              <label for="city">شهر</label>
              <v-select
                v-model="landingPage.searches.query['city']"
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
              <div v-if="landingPage.searches.query['city']" class="show__slug">
                {{ landingPage.searches.query["city"].slug }}
              </div>
              <FormInputShowError errorKey="city" />
            </div>
          </div>
          <div
            v-if="landingPage.searches.query"
            class="row land__address__card"
          >
            <div class="controls w-1/3">
              <label for="rural_district">دهستان</label>

              <v-select
                v-model="landingPage.searches.query['rural_district']"
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
              <div
                v-if="landingPage.searches.query['rural_district']"
                class="show__slug"
              >
                {{ landingPage.searches.query["rural_district"].slug }}
              </div>
              <FormInputShowError errorKey="rural_district" />
            </div>
          </div>
          <div
            v-if="landingPage.searches.query"
            class="row land__address__card border border-[#babfc7] rounded-lg px-3 py-3 pb-4 bg-[#f5f5f5]"
          >
            <div class="controls w-1/3">
              <label for="highway">جاده/بزرگراه/اتوبان/آزادراه</label>

              <v-select
                v-model="landingPage.searches.query['highway']"
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
              <div
                v-if="landingPage.searches.query['highway']"
                class="show__slug"
              >
                {{ landingPage.searches.query["highway"].slug }}
              </div>
              <FormInputShowError errorKey="highway" />
            </div>
            <div class="controls w-1/3">
              <label for="downtown">مرکز شهر</label>

              <v-select
                v-model="landingPage.searches.query['downtown']"
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
              <div
                v-if="landingPage.searches.query['downtown']"
                class="show__slug"
              >
                {{ landingPage.searches.query["downtown"].slug }}
              </div>
              <FormInputShowError errorKey="downtown" />
            </div>
            <div class="controls w-1/3">
              <label for="suburbs">حومه شهر</label>

              <v-select
                v-model="landingPage.searches.query['suburbs']"
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
              <div
                v-if="landingPage.searches.query['suburbs']"
                class="show__slug"
              >
                {{ landingPage.searches.query["suburbs"].slug }}
              </div>
              <FormInputShowError errorKey="suburbs" />
            </div>
          </div>
          <div
            v-if="landingPage.searches.query"
            class="row land__address__card"
          >
            <div class="controls w-1/3">
              <label for="municipal_zoning">منطقه‌بندی شهرداری</label>

              <v-select
                v-model="landingPage.searches.query['municipal_zoning']"
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
              <div
                v-if="landingPage.searches.query['municipal_zoning']"
                class="show__slug"
              >
                {{ landingPage.searches.query["municipal_zoning"].slug }}
              </div>
              <FormInputShowError errorKey="municipal_zoning" />
            </div>
            <div class="controls w-1/3">
              <label for="village">روستا</label>

              <v-select
                v-model="landingPage.searches.query['village']"
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
              <div
                v-if="landingPage.searches.query['village']"
                class="show__slug"
              >
                {{ landingPage.searches.query["village"].slug }}
              </div>
              <FormInputShowError errorKey="village" />
            </div>
          </div>
          <div
            v-if="landingPage.searches.query"
            class="row land__address__card"
          >
            <div class="controls w-1/3">
              <label for="neighbourhood">محله</label>

              <v-select
                v-model="landingPage.searches.query['neighbourhood']"
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
              <div
                v-if="landingPage.searches.query['neighbourhood']"
                class="show__slug"
              >
                {{ landingPage.searches.query["neighbourhood"].slug }}
              </div>
              <FormInputShowError errorKey="neighbourhood" />
            </div>
            <div class="controls w-1/3">
              <label for="avenue">بلوار / خیابان اصلی</label>

              <v-select
                v-model="landingPage.searches.query['avenue']"
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
              <div
                v-if="landingPage.searches.query['avenue']"
                class="show__slug"
              >
                {{ landingPage.searches.query["avenue"].slug }}
              </div>
              <FormInputShowError errorKey="avenue" />
            </div>
            <div class="controls w-1/3">
              <label for="alley"> کوچه / خیابان فرعی</label>

              <v-select
                v-model="landingPage.searches.query['alley']"
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
              <div
                v-if="landingPage.searches.query['alley']"
                class="show__slug"
              >
                {{ landingPage.searches.query["alley"].slug }}
              </div>
              <FormInputShowError errorKey="alley" />
            </div>
          </div>
          <div
            v-if="landingPage.searches.query"
            class="row land__address__card"
          >
            <div class="controls w-1/3">
              <label for="suburb">شهرک</label>
              <v-select
                v-model="landingPage.searches.query['suburb']"
                id="suburb"
                :options="locationStore.selectOptions['suburb']"
                label="title"
                @search="debounceSearchLocation('suburb', $event)"
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
              <div
                v-if="landingPage.searches.query['suburb']"
                class="show__slug"
              >
                {{ landingPage.searches.query["suburb"].slug }}
              </div>
              <FormInputShowError errorKey="suburb" />
            </div>
            <div class="controls w-1/3">
              <label for="complex">مجتمع</label>
              <v-select
                v-model="landingPage.searches.query['complex']"
                id="complex"
                :options="locationStore.selectOptions['complex']"
                label="title"
                @search="debounceSearchLocation('complex', $event)"
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
              <div
                v-if="landingPage.searches.query['complex']"
                class="show__slug"
              >
                {{ landingPage.searches.query["complex"].slug }}
              </div>
              <FormInputShowError errorKey="complex" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-2/3">
              <FormTextInput
                name="title"
                label="عنوان"
                v-model="landingPage.searches.title"
                rules="min:3|required"
              />
              <FormInputShowError errorKey="title" />
            </div>
            <div class="controls w-1/3">
              <label for="status">وضعیت</label>
              <v-select
                v-model="landingPage.searches.status"
                id="status"
                :reduce="(option) => option.value"
                :options="statusOptions"
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
          <div class="row">
            <div class="controls w-full">
              <label for="full_description">توضیحات کامل</label>
              <rich-editor v-model="landingPage.searches.description" />
              <FormInputShowError errorKey="description" />
            </div>
          </div>
        </div>
      </div>
      <div v-if="landingPage.searches.seo_option != null" class="card">
        <div class="card__header">
          <h4 class="heading__title">بخش تنظیمات سئو</h4>
        </div>
        <div class="card__body">
          <div class="row">
            <div class="controls w-1/2">
              <label for="seo_title">عنوان سئو</label>
              <input
                v-model="landingPage.searches.seo_option.seo_title"
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
                <span
                  v-if="landingPage.searches.seo_option.seo_description"
                  class="opacity-60"
                >
                  {{ landingPage.searches.seo_option.seo_description.length }}
                </span>
              </div>
              <textarea
                v-model="landingPage.searches.seo_option.seo_description"
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
                  v-if="
                    thumbnailDetails != null ||
                    landingPage.searches.image != null
                  "
                >
                  <i class="fa-regular fa-circle-xmark"></i>
                </div>
                <img
                  v-if="
                    thumbnailDetails != null ||
                    landingPage.searches.image != null
                  "
                  :src="
                    thumbnailDetails
                      ? thumbnailDetails.meta_value.main.get_url
                      : landingPage.searches.image.get_url
                  "
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
          <div class="row">
            <div class="flex items-center mb-4">
              <input
                v-model="landingPage.searches.display_index"
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
                :disabled="loading"
                class="btn btn-primary w-[110px]"
                @click="editSearch()"
              >
                <template v-if="loading">
                  <i
                    class="fa-solid fa-spinner text-white text-xl animate-spin"
                  ></i>
                </template>
                <template v-else> ویرایش </template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="card">
        <div class="card__body">
          <p>درحال بارگذاری اطلاعات...</p>
        </div>
      </div>
    </template>
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
    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="trashConfirm"
        msg="آیا از انتقال این صفت به سطل زباله اطمینان دارید؟"
        @confirm="deleteSearch()"
        @closeModal="trashConfirm = false"
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
