<script>
import axios from "axios";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  props: ["location", "province", "city", "village", "district"],
  data() {
    return {
      search: "",
      cityList: [],
      zoom: 10,
      loc: [36.471693869791274, 52.34586377068215],
      iconWidth: 25,
      iconHeight: 40,
      neshanApiKey: "service.79a8ed66f5d244ae8d4e021bb2e8a406",
      loading: false,
    };
  },
  computed: {},
  methods: {
    itemTextFunc(item) {
      if (item.title) {
        return item.region + " " + item.title;
      } else {
        return item.region + " " + item.address;
      }
    },
    clickAddress(data) {
      this.loc = [data.location.y, data.location.x];
      this.cityList = [];
      this.zoom = 15;
    },
    setLoc(data) {
      this.loc = data;
      this.openStreetMap(data);
      // this.getAddress(data);
    },
    getAddress(data) {
      this.loading = true;
      axios
        .get(
          `https://api.neshan.org/v2/reverse?lat=${data.lat}&lng=${data.lng}`,
          {
            headers: {
              "Api-Key": this.neshanApiKey,
            },
          }
        )
        .then((response) => {
          this.search = response.data.formatted_address;
          this.loading = false;
          // this.loc = [data.lat, data.lat];
        });
    },
    getLoc(data) {
      axios
        .get(
          `https://api.neshan.org/v1/search?term=${data}&lat=36.48955348060777&lng=52.34125807925603`,
          {
            headers: {
              "Api-Key": this.neshanApiKey,
            },
          }
        )
        .then((response) => {
          if (response.data.status != "NO_RESULT")
            this.cityList = response.data.items;
        });
    },
    goOnLoc(data) {
      axios
        .get(
          `https://nominatim.openstreetmap.org/search?q=${data}&format=json&polygon=1&addressdetails=1`,
          {
            headers: {
              Authorization: undefined,
              "Accept-Language": "fa",
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            this.loc = [response.data[0].lat, response.data[0].lon];
          }
        });
      // axios
      //   .get(`https://api.neshan.org/v4/geocoding?address=${data}`, {
      //     headers: {
      //       "Api-Key": this.neshanApiKey,
      //     },
      //   })
      //   .then((response) => {
      //     if (response.data.status != "NO_RESULT") console.log(response.data);
      //   });
    },
    zoomHandler(data) {
      this.zoom = data;
    },
    locHandler(data) {
      this.loc = [data.lat, data.lng];
    },
    openStreetMap(data) {
      axios
        .get(
          `https://nominatim.openstreetmap.org/reverse?lat=${data.lat}&lon=${data.lng}&format=json`,
          {
            headers: {
              Authorization: undefined,
              "Accept-Language": "fa",
            },
          }
        )
        .then((res) => {
          this.search = res.data.display_name;
          this.loading = false;
        });
    },
  },
  created() {
    if (
      this.location.lat != null &&
      this.location.lat != "" &&
      this.location.lng != null &&
      this.location.lng != ""
    ) {
      this.loc = [this.location.lat, this.location.lng];
    } else {
      let address = "";
      if (this.province) {
        address += `${
          typeof this.province == "string" ? this.province : this.province.title
        } `;
      }
      if (this.city) {
        address += `${
          typeof this.city == "string" ? this.city : this.city.title
        } `;
      }
      if (this.village) {
        address += `,${
          typeof this.village == "string" ? this.village : this.village.title
        } `;
      }
      if (this.district) {
        address += `,${
          typeof this.district == "string" ? this.district : this.district.title
        } `;
      }
      this.search = address;
      this.goOnLoc(address);
    }
  },
};
</script>
<template>
  <div
    class="property__popup"
    id="property__popup"
    @click.self="$emit('closeMap')"
  >
    <div class="popup__content">
      <div class="controls w-full c-search">
        <label for="search-address"> جستجوی آدرس</label>
        <input
          type="text"
          class="form-control"
          name="search-address"
          id="search-address"
          v-model="search"
          @keyup="getLoc(search)"
        />
        <div v-if="cityList.length > 0" class="city__list">
          <ul>
            <li
              v-for="(item, index) in cityList"
              :key="index"
              @click="clickAddress(item)"
            >
              {{ itemTextFunc(item) }}
            </li>
          </ul>
        </div>
      </div>
      <div class="map mb-2">
        <l-map
          @update:zoom="zoomHandler"
          :zoom="zoom"
          :center="loc"
          :use-global-leaflet="false"
        >
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          ></l-tile-layer>
          <l-marker
            :lat-lng="loc"
            @update:lat-lng="locHandler"
            draggable
            @moveend="setLoc($event.target._latlng)"
          >
          </l-marker>
        </l-map>
      </div>
      <div class="controls w-full actions">
        <button
          type="button"
          class="btn btn-outline-danger mr-1"
          @click.self="$emit('closeMap')"
        >
          بیخیال
        </button>
        <button
          type="button"
          class="btn btn-outline-primary w-[95px]"
          @click.self="$emit('setLoc', { ...loc, address: search })"
          :disabled="loading"
        >
          <template v-if="loading">
            <i class="fa-solid fa-spinner text-xl animate-spin"></i>
          </template>
          <template v-else> ثبت آدرس </template>
        </button>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.c-search {
  @apply mb-3 px-0;

  label {
    @apply block mb-2;
  }
}

.actions {
  @apply px-0 mb-0 flex justify-end gap-2;

  button {
    @apply text-sm;
  }
}
</style>
