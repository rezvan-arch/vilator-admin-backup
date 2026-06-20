<script>
import useStore from "~/mixins/store";
import { locationStore } from "~/store/admin/location/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ویرایش لوکیشن ",
    });
    const { indexStore, adminStore } = useStore();
    const store = locationStore();

    return {
      store,
      indexStore,
      adminStore,
    };
  },
  data() {
    return {
      locationTypeOptions: [
        { label: "کشور", value: "country", validParent: [] },
        {
          label: "جهت جغرافیایی",
          value: "direction",
          validParent: ["country"],
        },
        {
          label: "استان",
          value: "province",
          validParent: ["country", "direction"],
        },
        {
          label: "شهرستان",
          value: "township",
          validParent: ["country", "direction", "province"],
        },
        {
          label: "بخش",
          value: "district",
          validParent: ["country", "direction", "province", "township"],
        },
        {
          label: "شهر",
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
          label: "دهستان",
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
          label: "مرکز شهر",
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
          label: "حومه شهر",
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
          label: "منطقه‌بندی شهرداری",
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
          label: "روستا",
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
          label: "محله",
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
          label: "بلوار / خیابان اصلی",
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
          label: "کوچه / خیابان فرعی",
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
          label: "شهرک",
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
          label: "مجتمع",
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
      trashConfirmDialog: false,
      debounce: null,
      loading: false,
      trashLoading: false,
      parentLoading: false,
    };
  },
  async created() {
    await this.store.getLocation(this.$route.params.id).then((res) => {
      if (res.status == "success") {
        this.store.singleData = res.data;
        if (this.store.singleData.description == null) {
          this.store.singleData.description = "";
        }
        if (this.store.singleData.short_description == null) {
          this.store.singleData.short_description = "";
        }
      }
      this.store.createLoading = false;
    });
    this.store.getLocationsSearch();
  },
  methods: {
    async doTrashLocation() {
      this.trashConfirmDialog = false;
      this.trashLoading = true;
      await this.store
        .trashLocation(this.store.singleData.id)
        .then(() => {
          this.$router.push(`/locations`);
          this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          this.trashLoading = false;
        })
        .catch((err) => {
          this.store.loading = false;
          this.trashLoading = false;
        });
    },
    doUpdate() {
      if (this.store.singleData.title == "") {
        this.$toast("عنوان الزامی است!", "error", 2000);
        return;
      }
      if (this.store.singleData.type == "") {
        this.$toast("نوع لوکیشن الزامی است!", "error", 2000);
        return;
      }
      this.loading = true;

      this.store
        .updateLocation(this.store.singleData.id, {
          title: this.store.singleData.title,
          slug: this.store.singleData.slug,
          manual_slug: this.store.singleData.manual_slug,
          parent_id: this.store.singleData.parent
            ? this.store.singleData.parent.id
            : null,
          type: this.store.singleData.type,
          status: this.store.singleData.status,
          short_description: this.store.singleData.short_description,
          description: this.store.singleData.description,
          thumbnail_id: this.store.singleData.thumbnail_id,
          lat: this.store.singleData.lat,
          long: this.store.singleData.long,
          // related_location: this.store.singleData.related_location
          //   ? this.store.singleData.related_location.map((item) => item.id)
          //   : [],
        })
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          } else {
            this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
          }
          this.loading = false;
        })
        .catch((err) => {
          var keys = Object.keys(this.adminStore.errors);
          this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          this.loading = false;
        });
    },
    galleryEvent(data) {
      if (data.type != "image" && data.type != "plan") {
        this.$toast("تصویرشاخص انتخابی نامعتبر می باشد!", "error", 2000);
        return;
      }
      this.thumbnailDetails = data;
      this.store.singleData.thumbnail_id = data.id;
      this.galleryPopup = false;
      this.indexStore.showModalFn(false);
    },
    setThumbnail() {
      this.indexStore.showModalFn(true);
      this.galleryPopup = true;
    },
    clearThumbnail() {
      this.thumbnailDetails = null;
      this.store.singleData.thumbnail = null;
      this.store.singleData.thumbnail_id = null;
    },
    debounceSearch(data) {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.search(data);
      }, 600);
    },
    search(data) {
      this.store.getLocationsSearch(
        data,
        this.newLocForm.type == "city" ? "province" : "city"
      );
    },

    debounceSearchLocation(data) {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.searchLocation(data);
      }, 600);
    },
    searchLocation(data) {
      this.store.getLocationsSearch(data);
    },
  },
  computed: {
    type() {
      return this.store.singleData.type;
    },
    filterType() {
      let array = [];
      if (this.store.singleData.parent) {
        switch (this.store.singleData.parent.type) {
          case "suburb":
            array = [
              { label: "شهرک", value: "suburb" },
              { label: "مجتمع", value: "complex" },
            ];
            break;
          case "complex":
            array = [
              { label: "شهرک", value: "suburb" },
              { label: "مجتمع", value: "complex" },
            ];
            break;
          case "rural_district":
            array = [{ label: "روستا", value: "village" }];
            break;
          default:
            // const addressKeys = this.locationTypeOptions.map(
            //   (item) => item.value
            // );
            // array = this.locationTypeOptions.slice(
            //   addressKeys.indexOf(this.newLocForm.parent.type) + 1
            // );
            array = this.locationTypeOptions.filter((item) => {
              if (item.validParent) {
                return item.validParent.includes(
                  this.store.singleData.parent.type
                );
              } else return false;
            });
        }
      } else {
        array = this.locationTypeOptions.slice(1);
      }
      return array;
    },
  },
  watch: {
    // type(val) {
    //   if (val != "province") {
    //     this.parentLoading = true;
    //     let type;
    //     if (val == "city") type = "province";
    //     if (val == "district" || val == "suburb") type = "city";
    //     this.store.getLocationsSearch("", type).then((res) => {
    //       if (res.status == "success") {
    //         this.parentLoading = false;
    //       }
    //     });
    //   }
    // },
  },
};
</script>
<template>
  <section class="location__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title" v-if="!store.createLoading">
          ویرایش لوکیشن: {{ store.singleData.title }}
        </h4>
        <h4 class="heading__title" v-else>درحال بارگزاری...</h4>
        <div class="heading__actions">
          <nuxt-link to="/locations/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            لوکیشن جدید
          </nuxt-link>
          <button
            :disabled="trashLoading"
            @click="trashConfirmDialog = true"
            class="btn btn-danger w-[120px]"
          >
            <template v-if="trashLoading">
              <i
                class="fa-solid fa-spinner text-white text-xl animate-spin"
              ></i>
            </template>
            <template v-else>
              <i class="fa-regular fa-trash"></i>
              حذف لوکیشن
            </template>
          </button>
          <nuxt-link to="/locations" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div class="card__body" v-if="!store.createLoading">
        <div v-if="store.singleData.parent" class="row">
          <div class="controls w-1/5">
            <label for="">لوکیشن مادر</label>
            <span>
              {{
                locationTypeOptions.find(
                  (item) => item.value == store.singleData.parent.type
                ).label
              }}
              {{ store.singleData.parent.title }}</span
            >
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              name="title"
              label="عنوان"
              v-model="store.singleData.title"
              rules="min:3|required"
            />
            <FormInputShowError errorKey="title" />
          </div>
          <div class="controls w-1/2">
            <FormTextInput
              name="automatic_title"
              label="عنوان اصلی ( اتوماتیک )"
              v-model="store.singleData.automatic_title"
              rules="min:3|required"
            />
            <FormInputShowError errorKey="automatic_title" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              name="slug"
              label="اسلاگ اولیه"
              v-model="store.singleData.manual_slug"
              rules="min:3"
              :ltr="true"
            />
            <FormInputShowError errorKey="slug" />
          </div>
          <div class="controls w-1/2">
            <FormTextInput
              name="slug"
              label="اسلاگ اصلی ( اتوماتیک )"
              v-model="store.singleData.slug"
              rules="min:3"
              :ltr="true"
              :disabled="true"
            />
            <FormInputShowError errorKey="slug" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/3">
            <label for="type">نوع لوکیشن</label>
            <v-select
              v-model="store.singleData.type"
              id="type"
              :reduce="(option) => option.value"
              :options="filterType"
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
          <div class="controls w-1/3">
            <label for="type">لوکیشن مادر</label>
            <v-select
              v-model="store.singleData.parent"
              label="title"
              :options="store.searchLoc"
              @search="debounceSearch"
              :placeholder="parentLoading ? 'درحال دریافت' : ''"
              :disabled="true"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <FormInputShowError errorKey="parent" />
          </div>
          <div class="controls w-1/3">
            <label for="status">وضعیت</label>
            <v-select
              v-model="store.singleData.status"
              :reduce="(option) => option.value"
              id="status"
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
          
          <div class="controls w-1/5">
            <label for="map_lat">عرض جغرافیایی (lat)</label>
            <input
              v-model="store.singleData.lat"
              type="number"
              id="map_lat"
              class="form-control"
            />
            <FormInputShowError errorKey="lat" />
          </div>
          <div class="controls w-1/5">
            <label for="map_lng">طول جغرافیایی (lng)</label>
            <input
              v-model="store.singleData.long"
              type="number"
              id="map_lng"
              class="form-control"
            />
            <FormInputShowError errorKey="lng" />
          </div>
        </div>

        <div class="row">
          <!-- <div class="controls w-2/4">
            <label for="consultant">لوکیشن های مشابه</label>
            <v-select
              id="consultant"
              v-model="store.singleData.related_location"
              :options="store.searchLoc"
              @search="debounceSearchLocation"
              label="title"
              autocomplete="off"
              :filterable="false"
              multiple
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
              <template #selected-option="{ title, type }">
                <div style="display: flex">
                  <em style="margin-left: 0.5rem; font-size: 12px; opacity: 0.5"
                    >{{
                      locationTypeOptions.find((item) => item.value == type)
                        .label
                    }}
                    :</em
                  >
                  <strong>{{ title }}</strong>
                </div>
              </template>
              <template #option="{ title, type }">
                <div style="display: flex">
                  <em style="margin-left: 0.5rem"
                    >{{
                      locationTypeOptions.find((item) => item.value == type)
                        .label
                    }}
                    :</em
                  >
                  <strong>{{ title }}</strong>
                </div>
              </template>
            </v-select>
            <FormInputShowError errorKey="consultant" />
          </div> -->
        </div>
        <div class="row">
          <div class="controls w-full">
            <label for="short_description">توضیحات کوتاه</label>
            <textarea
              v-model="store.singleData.short_description"
              type="text"
              id="seo_description"
              class="form-control form-textarea"
              maxlength="250"
              rows="3"
            ></textarea>
            <FormInputShowError errorKey="short_description" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <label for="description">توضیحات</label>
            <rich-editor v-model="store.singleData.description" />
            <FormInputShowError errorKey="description" />
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
                  thumbnailDetails != null || store.singleData.thumbnail != null
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
                v-else-if="store.singleData.thumbnail != null"
                :src="store.singleData.thumbnail.get_url"
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
        <div class="row">
          <div class="controls w-full">
            <button
              :disabled="loading"
              class="btn btn-primary w-[110px]"
              @click="doUpdate"
            >
              <template v-if="loading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else> بروزرسانی </template>
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
    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="trashConfirmDialog"
        msg="آیا از انتقال این لوکیشن به سطل زباله اطمینان دارید؟"
        @confirm="doTrashLocation()"
        @closeModal="trashConfirmDialog = false"
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
</style>
