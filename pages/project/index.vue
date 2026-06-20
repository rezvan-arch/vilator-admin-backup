<script setup>
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
import useStore from "~/mixins/store";
import CurrencyInput from "~~/components/form/CurrencyInput.vue";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | پروژه ها",
});

// variables
const {
  projectStore,
  userStore,
  typesStore,
  categoryStore,
  locationStore,
  linkStore,
} = useStore();
const { $toast } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const trashConfirm = ref(false);
const showFilter = ref(false);
const filterBody = ref(null);
const categoriesList = ref([]);
const debounce = ref(null);
const option = {
  locale: "fa-IR",
  currency: "IRR",
  currencyDisplay: "hidden",
  hideCurrencySymbolOnFocus: true,
  hideGroupingSeparatorOnFocus: false,
  hideNegligibleDecimalDigitsOnFocus: true,
  autoDecimalDigits: false,
  useGrouping: true,
  accountingSign: false,
};

if (route.query.page) {
  currentPage.value = route.query.page;
}

projectStore.getProperty(currentPage.value);
function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    projectStore.getProperty(page);
  }
}

function trashPropertyConfirm(propertyId) {
  projectStore.actionPropertyId = propertyId;
  trashConfirm.value = true;
}

function trashProperty() {
  if (projectStore.actionPropertyId != "") {
    $toast("منتظر بمانید...", "info", 2000);
    trashConfirm.value = false;
    projectStore.trashProperty().then((res) => {
      projectStore.actionPropertyId = "";
      projectStore.properties = [];
      projectStore.getProperty(currentPage.value);
    });
  }
}

function collapseFilter() {
  showFilter.value = !showFilter.value;
  if (showFilter.value) {
    filterBody.value.style.maxHeight =
      filterBody.value.scrollHeight + 48 + "px";
    filterBody.value.style.padding = "1.5rem";
    filterBody.value.style.opacity = "1";
  } else {
    filterBody.value.style.maxHeight = null;
    filterBody.value.style.padding = null;
    filterBody.value.style.opacity = null;
  }
}

// get consultant list

userStore.getUserSelect("consultant");

// get type list
typesStore.getAllType();

const typeList = computed(() => {
  return typesStore.allTypes.map((item) => {
    return {
      label: item.title,
      slug: item.slug,
      id: item.id,
    };
  });
});

// property status list
const propertyStatusOption = [
  {
    label: "برای فروش",
    value: "sell",
  },
  {
    label: "فروخته شده",
    value: "sold",
  },
];

// get category
// categoryStore.getCategories(1).then((res) => {
//   if (res.status == "success") {
//     res.data.forEach((item) => {
//       categoriesList.value.push({
//         label: item.title,
//         slug: item.slug,
//         value: item.id,
//       });
//     });
//   }
// });

// get city
locationStore.getLocationsSelect("", "city").then((res) => {});

function changeCity(data) {
  locationStore
    .getLocationsSelect("", "suburb", data[data.length - 1].value)
    .then((res) => {
      locationStore.provinceLoading = false;
    });
  locationStore
    .getLocationsSelect("", "district", data[data.length - 1].value)
    .then((res) => {
      locationStore.provinceLoading = false;
    });
}

function debounceSearchCity(data) {
  clearTimeout(debounce.value);
  debounce.value = setTimeout(() => {
    searchCity(data);
  }, 600);
}
function searchCity(data) {
  locationStore.getLocationsSelect(
    data,
    "city",
    projectStore.properties.province.value
  );
}
function debounceSearchSuburb(data) {
  clearTimeout(debounce.value);
  debounce.value = setTimeout(() => {
    searchSuburb(data);
  }, 600);
}
function searchSuburb(data) {
  locationStore.getLocationsSelect(
    data,
    "suburb",
    projectStore.properties.city.value
  );
}
function debounceSearchDistrict(data) {
  clearTimeout(debounce.value);
  debounce.value = setTimeout(() => {
    searchDistrict(data);
  }, 600);
}
function searchDistrict(data) {
  locationStore.getLocationsSelect(
    data,
    "district",
    projectStore.properties.city.value
  );
}

function debounceSearchCategory(data) {
  clearTimeout(debounce.value);
  debounce.value = setTimeout(() => {
    searchCategory(data);
  }, 600);
}
function searchCategory(data) {
  categoryStore.getCategories(1, data).then((res) => {
    if (res.status == "success") {
      categoriesList.value = [];
      res.data.forEach((item) => {
        categoriesList.value.push({
          label: item.title,
          slug: item.slug,
          value: item.id,
        });
      });
    }
  });
}

const filterForm = reactive({
  type: null,
  category: null,
  propertyStatus: null,
  city: null,
  suburb: null,
  district: null,
  land_area: "",
  building_area: "",
  property_code: "",
  view: "",
  room: "",
  bath: "",
  toilet: "",
  parking: "",
  elevator: "",
  store: "",
  corner: "",
  document: "",
  building_direction: "",
  unit_direction: "",
  build_year: "",
  price: null,
  classes: "",
  every_floor: "",
  floor: "",
  postal_code: "",
});

// multi update variable adn func
const selected = ref([]);
const selectAll = ref(false);
const selectFn = () => {
  selected.value = [];
  if (!selectAll.value) {
    projectStore.properties.forEach((item) => {
      selected.value.push(item.id);
    });
  }
};
watch(selected, () => {
  selectAll.value =
    selected.value.length == projectStore.properties.length ? true : false;
});

const form = reactive({
  price: null,
  built_year: "",
  consultant_id: "",
});

function multiUpdate() {
  projectStore
    .updateMultiProperty({
      ...form,
      property_ids: selected.value,
    })
    .then((res) => {
      if (res.status == "success") {
        $toast("درخواست شما با موفقیت انجام شد", "success", 5000);
      }
    });
}

function createTemporaryLink(id) {
  const today = new Date();
  let tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let day = tomorrow.getDate();
  let month = tomorrow.getMonth() + 1;
  let year = tomorrow.getFullYear();
  let hour = tomorrow.getHours();
  let minutes = tomorrow.getMinutes();
  tomorrow = `${year}-${month}-${day} ${hour}:${minutes}`;

  linkStore.addLink({ property_id: id, expire_time: tomorrow }).then((res) => {
    if (res.status == "success") {
      $toast("لینک موقت شما با موفقیت ساخته و کپی شد", "success", 5000);
      navigator.clipboard.writeText(res.data.token).then(() => {});
    } else {
      $toast("درخواست شما با خطا مواجه شد", "error", 5000);
    }
  });
}

function setReqBody() {
  let head = Object.fromEntries(
    Object.entries(projectStore.filterHead).filter(
      ([_, v]) => v != "" || v.length != 0
    )
  );

  projectStore.requestBody = { ...head };

  projectStore.staticFilter.forEach((item) => {
    if (item.value != "") {
      projectStore.requestBody[item.slug] =
        item.options.mode == "string"
          ? String(item.value)
          : item.options.mode == "array"
          ? [String(item.value)]
          : { min: String(item.value) };
    }
  });
  projectStore.filtersData.forEach((item) => {
    if (item.value != "") {
      projectStore.requestBody[item.slug] =
        item.options.mode == "string"
          ? String(item.value)
          : item.options.mode == "array"
          ? [String(item.value)]
          : { min: String(item.value) };
    }
  });
}

function submitFilter() {
  setReqBody();
  projectStore.getProperty(1);
}

function debounceSearchConsultant(data) {
  clearTimeout(debounce.value);
  debounce.value = setTimeout(() => {
    searchConsultant(data);
  }, 600);
}
function searchConsultant(data) {
  userStore.getUserSelect("consultant", data);
}
</script>
<template>
  <section class="properties__list">
    <div class="card filter__box">
      <div class="card__header collapse__header" @click="collapseFilter">
        <h4 class="heading__title">فیلتر</h4>
        <span class="collapse__icon" :class="{ rotate: showFilter }">
          <i class="fa-regular fa-chevron-down"></i>
        </span>
      </div>
      <div class="card__body collapse__body" ref="filterBody">
        <div class="row">
          <div class="controls w-1/2">
            <label for="owner">تایپ</label>
            <v-select
              v-model="projectStore.filterHead.type"
              id="owner"
              :options="typeList"
              multiple
              :closeOnSelect="false"
              :reduce="(option) => option.slug"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
          </div>
          <!-- <div class="controls w-1/2">
            <label for="category">صفت</label>
            <v-select
              v-model="projectStore.filterHead.category"
              id="category"
              :options="categoriesList"
              :reduce="(option) => option.slug"
              multiple
              :closeOnSelect="false"
              autocomplete="off"
              @search="debounceSearchCategory"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
          </div> -->
        </div>
        <div class="row">
          <div class="controls w-1/4">
            <label for="owner">وضعیت پروژه</label>
            <v-select
              v-model="projectStore.filterHead.property_status"
              id="owner"
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
          </div>
          <div class="controls w-1/4">
            <label for="city">شهر</label>
            <v-select
              v-model="projectStore.filterHead.city"
              :reduce="(option) => option.slug"
              id="city"
              :options="locationStore.cityList"
              multiple
              :closeOnSelect="false"
              @option:selected="changeCity"
              label="title"
              @search="debounceSearchCity"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
          </div>
          <div class="controls w-1/4">
            <label for="suburb">شهرک</label>
            <v-select
              v-model="projectStore.filterHead.suburb"
              :reduce="(option) => option.slug"
              id="suburb"
              :options="locationStore.suburbList"
              multiple
              :closeOnSelect="false"
              label="title"
              @search="debounceSearchSuburb"
              :disabled="
                locationStore.provinceLoading ||
                projectStore.filterHead.city == null
              "
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
          </div>
          <div class="controls w-1/4">
            <label for="district">روستا/محله</label>
            <v-select
              v-model="projectStore.filterHead.district"
              :reduce="(option) => option.slug"
              id="district"
              :options="locationStore.districtList"
              multiple
              :closeOnSelect="false"
              label="title"
              @search="debounceSearchDistrict"
              :disabled="
                locationStore.provinceLoading ||
                projectStore.filterHead.city == null
              "
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
          </div>
        </div>
        <div class="row flex-wrap">
          <div
            v-for="(item, index) in projectStore.staticFilter"
            :key="index"
            class="controls w-1/4 mb-5"
          >
            <template v-if="item.slug == 'price'">
              <label :for="item.slug">{{ item.title }}</label>
              <CurrencyInput
                v-model="item.value"
                :options="option"
                class="form-control"
              />
            </template>
            <template v-else>
              <label :for="item.slug">{{ item.title }}</label>
              <input
                v-model="item.value"
                :type="item.options.type"
                :id="item.item"
                class="form-control"
                @input="setReqBody"
              />
            </template>
          </div>
          <div
            v-for="(item, index) in projectStore.getFilteredData"
            :key="index"
            class="controls w-1/4 mb-5"
          >
            <template v-if="item.slug == 'built_year'">
              <label :for="item.slug">{{ item.title }}</label>
              <input
                type="text"
                class="custom-built_year form-control c-number"
                :value="
                  item.value != ''
                    ? convertDate(`${item.value}/05/10`).slice(0, 4)
                    : ''
                "
              />
              <date-picker
                v-model="item.value"
                format="YYYY"
                displayFormat="jYYYY"
                type="year"
                simple
                custom-input=".custom-built_year"
              />
            </template>
            <template v-else>
              <label :for="item.slug">{{ item.title }}</label>
              <input
                v-model="item.value"
                :type="item.options.type"
                :id="item.item"
                class="form-control"
                @input="setReqBody"
              />
            </template>
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/4" @click="submitFilter">
            <button class="btn btn-primary">جستجو</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست پروژه ها</h4>
        <div class="heading__actions">
          <nuxt-link to="/project/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            پروژه جدید
          </nuxt-link>
          <nuxt-link to="/project/trash" class="btn btn-danger">
            <i class="fa-regular fa-trash"></i>
            سطل زباله
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!projectStore.loading">
          <div v-if="selected.length > 0" class="row">
            <div class="controls w-3/12">
              <label for="price">قیمت</label>
              <FormCurrencyInput
                v-model="form.price"
                :options="option"
                type="text"
                class="form-control c-number"
                inputmode="decimal"
              />
            </div>
            <div class="controls w-3/12">
              <label for="date">سال ساخت</label>
              <date-picker
                v-model="form.built_year"
                type="year"
                format="YYYY"
                displayFormat="jYYYY"
                simple
              />
            </div>
            <div class="controls w-4/12">
              <label for="consultant">مشاور</label>
              <v-select
                id="consultant"
                v-model="form.consultant_id"
                :options="userStore.consultant"
                @search="debounceSearchConsultant"
                :reduce="(option) => option.id"
                label="name"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
            </div>
            <div class="controls w-2/12 action">
              <button class="btn btn-outline-primary" @click="multiUpdate">
                آپدیت
              </button>
            </div>
          </div>
          <div v-if="projectStore.properties.length > 0">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      v-model="selectAll"
                      @click="selectFn"
                    />
                  </th>
                  <th>عنوان</th>
                  <th>کد پروژه</th>
                  <th>اسلاگ</th>
                  <th>نوع تایپ</th>
                  <th>بازدید</th>
                  <th>قیمت</th>
                  <th>وضعیت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in projectStore.properties"
                  :key="index"
                >
                  <td>
                    <input
                      type="checkbox"
                      v-model="selected"
                      :value="item.id"
                    />
                  </td>
                  <td>{{ item.title }}</td>
                  <td>
                    {{ item.property_code }}
                  </td>
                  <td>
                    {{ item.slug }}
                  </td>
                  <td>
                    <template v-if="item.type != null">
                      {{ item.type.title }}
                    </template>
                    <template v-else> - </template>
                  </td>
                  <td>
                    <template v-if="item.view != null">
                      {{ item.view }}
                    </template>
                    <template v-else> - </template>
                  </td>
                  <td>
                    <template v-if="item.price != null">
                      {{ separateNumber(item.price) }}
                    </template>
                    <template v-else> - </template>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <span
                        v-if="item.status == 'private'"
                        class="badge badge-pill badge-primary"
                      >
                        خصوصی
                      </span>
                      <span
                        v-if="item.status == 'public'"
                        class="badge badge-pill badge-success"
                      >
                        عمومی
                      </span>
                      <span
                        v-if="item.status == 'draft'"
                        class="badge badge-pill badge-warning"
                      >
                        پیش نویس
                      </span>
                    </div>
                  </td>
                  <td class="setting">
                    <div class="actions">
                      <nuxt-link
                        :to="`/project/edit/${item.id}`"
                        title="ویرایش پروژه"
                        class="edit__action"
                      >
                        <i class="fa-regular fa-pen-to-square"></i>
                      </nuxt-link>

                      <nuxt-link
                        v-if="item.status == 'draft'"
                        :to="`/project/${item.slug}?preview=true`"
                        target="_blank"
                        title="نمایش پروژه"
                        class="see__action"
                      >
                        <i class="fa-regular fa-eye"></i>
                      </nuxt-link>
                      <nuxt-link
                        v-else
                        :to="`/project/${item.slug}`"
                        target="_blank"
                        title="نمایش پروژه"
                        class="see__action"
                      >
                        <i class="fa-regular fa-eye"></i>
                      </nuxt-link>
                      <!-- <nuxt-link
                        :to="`/project/${item.id}`"
                        class="see__action"
                      >
                        <i class="fa-regular fa-eye"></i>
                      </nuxt-link> -->
                      <button
                        class="text-amber-700 disabled:opacity-25"
                        :disabled="item.status != 'private'"
                        @click="createTemporaryLink(item.id)"
                        title="لینک موقت پروژه"
                      >
                        <i class="fa-regular fa-key"></i>
                      </button>
                      <button
                        class="delete__action"
                        @click="trashPropertyConfirm(item.id)"
                        title="حذف پروژه"
                      >
                        <i class="fa-regular fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <AdminPagination
              v-if="
                projectStore.pagination && projectStore.pagination.last_page > 1
              "
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="projectStore.pagination.last_page"
            />
          </div>
          <div v-else class="empty__list">
            <p>موردی برای نمایش وجود ندارد</p>
          </div>
        </div>

        <div v-else class="empty__list">
          <p>درحال بارگذاری اطلاعات...</p>
        </div>
      </div>
    </div>
  </section>

  <ConfirmModal
    v-if="trashConfirm"
    msg="آیا از انتقال این پروژه به سطل زباله اطمینان دارید؟"
    @confirm="trashProperty"
    @closeModal="trashConfirm = false"
  />
</template>
<style lang="scss" scoped>
.filter__box {
  @apply pb-4;
}

label {
  @apply text-sm text-[#2B335E] mb-2 block;
}

.controls.action {
  @apply flex items-end;

  .btn {
    @apply h-[46px] pt-0 pb-0;
  }
}

.collapse__header {
  @apply cursor-pointer;
  .collapse__icon {
    @apply transition-transform duration-700;

    &.rotate {
      @apply rotate-180;
    }
  }
}
.collapse__body {
  padding: 0 1.5rem !important;
  @apply max-h-0 overflow-hidden transition-all duration-700 opacity-0;
}
</style>
