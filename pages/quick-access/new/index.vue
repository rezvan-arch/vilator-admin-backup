<script setup>
import useStore from "~~/mixins/store";

definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | ساخت دسترسی سریع جدید",
});

// variables
const { $toast } = useNuxtApp();
const { quickAccessStore, adminStore, typesStore } = useStore();
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const observer = ref(null);
const load = ref(null);
typesStore.getAllType();
quickAccessStore.getSearchAttr();

const attrOptions = computed(() => {
  let array = [];
  quickAccessStore.searchAttr.forEach((item) => {
    array = [...array, item, ...item.options];
  });

  return array.map((item) => {
    if (item.options && item.options.length > 0) {
      return { ...item, type: "parent" };
    } else if (item.item_styles && item.item_styles.type == "single") {
      return { ...item, type: "single" };
    } else {
      return { ...item, type: "child" };
    }
  });
});

const type_select = computed(() => {
  return typesStore.allTypes.map((item) => {
    return {
      label: item.title,
      id: item.id,
      slug: item.slug,
    };
  });
});

const form = reactive({
  sort: "",
  type: [],
  is_active: 1,
  attribute_id: null,
});
const debounceAttr = ref(null);

// computed
const hasNextPage = computed(() => {
  return (
    quickAccessStore.pagination.current_page <
    quickAccessStore.pagination.last_page
  );
});

// methods
function addQuickAccess() {
  if (form.sort == "" || form.attribute_id == null) {
    $toast("لطفا تمامی موارد را پر کنید.", "error", 2000);
    return;
  }
  loading.value = true;

  quickAccessStore
    .addQuickAccess(form)
    .then((res) => {
      if (res.status == "success") {
        $toast("درخواست شما با موفقیت انجام شد.", "success", 2000);
        router.push(`/quick-access`);
        loading.value = false;
      }
    })
    .catch((err) => {
      loading.value = false;
      var keys = Object.keys(adminStore.errors);
      $toast(adminStore.errors[keys[0]][0], "error", 2000);
    });
}

function debounceSearchAttr(data) {
  clearTimeout(debounceAttr.value);
  debounceAttr.value = setTimeout(() => {
    searchAttr(data);
  }, 700);
}
function searchAttr(data) {
  quickAccessStore.getSearchAttr(data);
}

const infiniteScroll = async ([{ isIntersecting, target }]) => {
  if (isIntersecting) {
    const ul = target.offsetParent;
    const scrollTop = target.offsetParent.scrollTop;

    quickAccessStore.getSearchAttr(
      "",
      quickAccessStore.pagination.current_page + 1
    );
    console.log(ul.scrollTop);
    await nextTick();
    setTimeout(() => {
      ul.scrollTop = scrollTop + 10;
    }, 450);
  }
};

const onOpen = async () => {
  if (hasNextPage) {
    await nextTick();
    observer.value.observe(load.value);
  }
};
const onClose = () => {
  observer.value.disconnect();
};

// mounted
onMounted(() => {
  observer.value = new IntersectionObserver(infiniteScroll);
});

// computed
// const priceToWord
</script>
<template>
  <section class="projects__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">اضافه کردن دسترسی سریع</h4>
      </div>
      <div class="card__body">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="row">
            <div class="controls w-1/2">
              <label for="attribute_id">مشخصه </label>
              <v-select
                v-model="form.attribute_id"
                id="attribute_id"
                :options="attrOptions"
                :reduce="(option) => option.id"
                label="title"
                @search="debounceSearchAttr"
                autocomplete="off"
                :selectable="(option) => option.type != 'parent'"
                :filterable="false"
                @open="onOpen"
                @close="onClose"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
                <template #option="{ title, type }">
                  <div
                    v-if="type == 'parent' || type == 'single='"
                    style="display: flex"
                  >
                    <strong>{{ title }}</strong>
                  </div>
                  <div v-if="type == 'child'" style="display: flex">
                    <p>- {{ title }}</p>
                  </div>
                </template>

                <template #list-footer>
                  <li
                    v-show="hasNextPage"
                    ref="load"
                    class="loader text-sm opacity-50 px-5 text-center w-full"
                  >
                    درحال دریافت
                  </li>
                </template>
              </v-select>
              <FormInputShowError errorKey="attribute_id" />
            </div>

            <div class="controls w-1/2">
              <label for="type">تایپ</label>
              <v-select
                v-model="form.type"
                id="type"
                multiple
                :closeOnSelect="false"
                :options="type_select"
                :reduce="(option) => option.slug"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="type_ids" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/4">
              <label for="sort">ترتیب مرتب سازی</label>
              <input
                v-model="form.sort"
                type="number"
                id="sort"
                class="form-control"
              />
              <FormInputShowError errorKey="sort" />
            </div>
            <div class="controls w-1/4">
              <label for="status">وضعیت</label>
              <v-select
                v-model="form.is_active"
                id="status"
                :options="[
                  {
                    label: 'فعال',
                    value: 1,
                  },
                  {
                    label: 'غیرفعال',
                    value: 0,
                  },
                ]"
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
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <button
                class="btn btn-primary w-[120px] h-[46px]"
                @click="handleSubmit(addQuickAccess)"
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
        </vForm>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
label {
  @apply text-sm text-[#2B335E] mb-2 block;
}

select {
  @apply bg-white w-full rounded-[4px];
}

.price__text {
  @apply mt-2 text-sm font-bold;

  span {
    @apply opacity-80 font-medium;
  }
}
</style>
