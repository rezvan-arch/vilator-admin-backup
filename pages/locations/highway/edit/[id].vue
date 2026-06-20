<script>
import useStore from "~/mixins/store";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ویرایش لوکیشن ",
    });
    const { indexStore, adminStore, locationStore } = useStore();

    return {
      locationStore,
      indexStore,
      adminStore,
    };
  },
  data() {
    return {
      locationTypeOptions: [
        { label: "جاده/بزرگراه/اتوبان/آزادراه", value: "highway" },
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
      trashConfirmDialog: false,
      debounce: null,
      loading: false,
      trashLoading: false,
      parentLoading: false,
      type: "highway",
      locSlug: ["province", "township", "city"],
      firstParent: {
        province: null,
        township: null,
        city: null,
      },
      secondParent: {
        province: null,
        township: null,
        city: null,
      },
    };
  },
  async created() {
    await this.locationStore.getLocation(this.$route.params.id).then((res) => {
      if (res.status == "success") {
        this.locationStore.singleData = res.data;
        if (res.data.related_location) {
          const firstItem = res.data.related_location[0];
          if (firstItem) {
            this.firstParent[firstItem.type] = firstItem;
            this.firstParent[firstItem.type].related_location.forEach(
              (item) => (this.firstParent[item.type] = item)
            );
          }
          const secondItem = res.data.related_location[1];
          if (secondItem) {
            this.secondParent[secondItem.type] = secondItem;
            this.secondParent[secondItem.type].related_location.forEach(
              (item) => (this.secondParent[item.type] = item)
            );
          }
        }
      }
      this.locationStore.createLoading = false;
    });
    this.locSlug.forEach((item) => {
      this.locationStore.getLocationsSelect("", item);
    });
  },
  methods: {
    async doTrashLocation() {
      this.trashConfirmDialog = false;
      this.trashLoading = true;
      await this.locationStore
        .deleteLocation(this.locationStore.singleData.id)
        .then(() => {
          this.$router.push(`/locations/highway`);
          this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          this.trashLoading = false;
        })
        .catch((err) => {
          this.locationStore.loading = false;
          this.trashLoading = false;
        });
    },
    doUpdate() {
      if (this.locationStore.singleData.title == "") {
        this.$toast("عنوان الزامی است!", "error", 2000);
        return;
      }

      this.loading = true;
      const related_location = [];
      const reverseSlug = JSON.parse(JSON.stringify(this.locSlug)).reverse();
      let fParentAdded = false,
        sParentAdded = false;
      reverseSlug.forEach((item) => {
        if (this.firstParent[item] != null && !fParentAdded) {
          fParentAdded = true;
          related_location.push(this.firstParent[item].id);
        }
        if (this.secondParent[item] != null && !sParentAdded) {
          sParentAdded = true;
          related_location.push(this.secondParent[item].id);
        }
      });

      this.locationStore
        .updateSingleHighway(this.locationStore.singleData.id, {
          title: this.locationStore.singleData.title,
          slug: this.locationStore.singleData.slug,
          manual_slug: this.locationStore.singleData.manual_slug,
          status: this.locationStore.singleData.status,
          related_location: related_location,
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
    debounceSearch(data) {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.search(data);
      }, 600);
    },
    search(data) {
      this.locationStore.getLocationsSearch(
        data,
        this.locationStore.singleData.type == "city" ? "province" : "city"
      );
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
    changeLocation(parentNum, dataLocSlug, data) {
      if (!data) return;
      this.locationStore.locationLoading = true;

      this.locSlug
        .slice(this.locSlug.indexOf(dataLocSlug) + 1)
        .forEach((type) => {
          let locSearch = {};
          locSearch[`search[${type}_id]`] = data;
          this.locationStore
            .getLocationsSelect("", type, null, locSearch)
            .then((res) => {
              this.locationStore.locationLoading = false;
            });
        });

      if (parentNum === "first") {
        if (
          this.firstParent[dataLocSlug] &&
          this.firstParent[dataLocSlug].related_location
        ) {
          this.firstParent[dataLocSlug].related_location.forEach((item) => {
            if (
              this.firstParent[item.type] == undefined ||
              this.firstParent[item.type] == null
            ) {
              this.firstParent[item.type] = item;
            }
          });
        }
      } else {
        if (
          this.secondParent[dataLocSlug] &&
          this.secondParent[dataLocSlug].related_location
        ) {
          this.secondParent[dataLocSlug].related_location.forEach((item) => {
            if (
              this.secondParent[item.type] == undefined ||
              this.secondParent[item.type] == null
            ) {
              this.secondParent[item.type] = item;
            }
          });
        }
      }
      this.locationStore.locationLoading = false;
    },
  },
};
</script>
<template>
  <section class="location__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title" v-if="!locationStore.createLoading">
          ویرایش لوکیشن: {{ locationStore.singleData.title }}
        </h4>
        <h4 class="heading__title" v-else>درحال بارگزاری...</h4>
        <div class="heading__actions">
          <nuxt-link to="/locations/highway/new" class="btn btn-primary">
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
          <nuxt-link to="/locations/highway" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div class="card__body" v-if="!locationStore.createLoading">
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              name="title"
              label="عنوان"
              v-model="locationStore.singleData.title"
              rules="min:3|required"
            />
            <FormInputShowError errorKey="title" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              name="manual_slug"
              label="اسلاگ اولیه"
              v-model="locationStore.singleData.manual_slug"
              rules="min:3"
              :ltr="true"
            />
            <FormInputShowError errorKey="manual_slug" />
          </div>
          <div class="controls w-1/2">
            <FormTextInput
              name="slug"
              label="اسلاگ اصلی ( اتوماتیک )"
              v-model="locationStore.singleData.slug"
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
              v-model="type"
              id="type"
              :reduce="(option) => option.value"
              :options="locationTypeOptions"
              autocomplete="off"
              :clearable="false"
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
            <label for="status">وضعیت</label>
            <v-select
              v-model="locationStore.singleData.status"
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
        <div
          class="row loc__address__card border border-[#babfc7] rounded-lg px-3 py-3 pb-4 bg-[#f5f5f5]"
        >
          <div class="controls w-1/4">
            <label for="province">استان</label>
            <v-select
              id="province"
              v-model="firstParent['province']"
              :options="locationStore.selectOptions['province']"
              @option:selected="changeLocation('first', 'province', $event.id)"
              label="title"
              @search="debounceSearchLocation('province', $event)"
              autocomplete="off"
              :disabled="locationStore.locationLoading"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <FormInputShowError errorKey="province" />
          </div>
          <div class="controls w-1/4">
            <label for="township">شهرستان</label>

            <v-select
              id="township"
              v-model="firstParent['township']"
              :options="locationStore.selectOptions['township']"
              label="title"
              @search="debounceSearchLocation('township', $event)"
              @option:selected="changeLocation('first', 'township', $event.id)"
              :disabled="locationStore.locationLoading"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <FormInputShowError errorKey="township" />
          </div>
          <div class="controls w-1/4">
            <label for="city">شهر</label>
            <v-select
              id="city"
              v-model="firstParent['city']"
              :options="locationStore.selectOptions['city']"
              @option:selected="changeLocation('first', 'city', $event.id)"
              label="title"
              @search="debounceSearchLocation('city', $event)"
              :disabled="locationStore.locationLoading"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <FormInputShowError errorKey="city" />
          </div>
        </div>
        <div class="row loc__address__card">
          <div class="controls w-1/4">
            <label for="province">استان</label>
            <v-select
              id="province"
              v-model="secondParent['province']"
              :options="locationStore.selectOptions['province']"
              @option:selected="changeLocation('first', 'province', $event.id)"
              label="title"
              @search="debounceSearchLocation('province', $event)"
              autocomplete="off"
              :disabled="locationStore.locationLoading"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <FormInputShowError errorKey="province" />
          </div>
          <div class="controls w-1/4">
            <label for="township">شهرستان</label>

            <v-select
              id="township"
              v-model="secondParent['township']"
              :options="locationStore.selectOptions['township']"
              label="title"
              @search="debounceSearchLocation('township', $event)"
              @option:selected="changeLocation('first', 'township', $event.id)"
              :disabled="locationStore.locationLoading"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <FormInputShowError errorKey="township" />
          </div>
          <div class="controls w-1/4">
            <label for="city">شهر</label>
            <v-select
              id="city"
              v-model="secondParent['city']"
              :options="locationStore.selectOptions['city']"
              @option:selected="changeLocation('first', 'city', $event.id)"
              label="title"
              @search="debounceSearchLocation('city', $event)"
              :disabled="locationStore.locationLoading"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <FormInputShowError errorKey="city" />
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
        msg="آیا از حذف این لوکیشن اطمینان دارید؟"
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
