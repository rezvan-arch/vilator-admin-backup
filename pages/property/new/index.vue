<script setup>
import useStore from "~~/mixins/store";
import { numberToWords } from "@persian-tools/persian-tools";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | ساخت ملک جدید",
});

// variables
const { propertyStore, adminStore, typesStore } = useStore();
const router = useRouter();
const loading = ref(false);
typesStore.getAllType();
const type_select = computed(() => {
  return typesStore.allTypes.map((item) => {
    return {
      label: item.title,
      id: item.id,
    };
  });
});
const form = reactive({
  title: "",
  property_owner_price: null,
  property_code: "",
  property_type: "property",
  type_id: "",
});
const options = {
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

// methods
function addProperty() {
  const { $toast } = useNuxtApp();
  if (
    form.title == "" ||
    form.property_owner_price == null ||
    form.property_code == "" ||
    form.type_id == ""
  ) {
    $toast("لطفا تمامی موارد را پر کنید.", "error", 2000);
    return;
  }
  loading.value = true;

  propertyStore
    .addProperty(form)
    .then((res) => {
      if (res.status == "success") {
        $toast(res.message, "success", 2000);
        router.push(`/property/edit/${res.data.id}`);
        loading.value = false;
      }
    })
    .catch((err) => {
      var keys = Object.keys(adminStore.errors);
      $toast(adminStore.errors[keys[0]][0], "error", 2000);
      loading.value = false;
    });
}

// computed
// const priceToWord
</script>
<template>
  <section class="projects__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">اضافه کردن ملک</h4>
      </div>
      <div class="card__body">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="row">
            <div class="controls w-2/3">
              <FormTextInput
                name="title"
                label="عنوان"
                v-model="form.title"
                rules="min:3|required"
                :errors="errors"
              />
              <FormInputShowError errorKey="title" />
            </div>

            <div class="controls w-1/3">
              <FormTextInput
                name="property_code"
                label="کدملک"
                v-model="form.property_code"
                rules="required"
                :errors="errors"
              />
              <FormInputShowError errorKey="property_code" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/3">
              <label for="property_owner_price">قیمت ( مالک )</label>
              <FormCurrencyInput
                v-model="form.property_owner_price"
                :options="options"
                class="form-control c-number"
                :errors="errors"
              />
              <FormInputShowError errorKey="property_owner_price" />
              <p v-if="form.property_owner_price" class="price__text">
                {{ numberToWords(form.property_owner_price) }}
                <span>تومان</span>
              </p>
            </div>
            <div class="controls w-1/3">
              <label for="type">نوع ملک</label>
              <v-select
                v-model="form.type_id"
                id="type"
                :options="type_select"
                :reduce="(option) => option.id"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="type_id" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <button
                class="btn btn-primary w-[120px] h-[46px]"
                @click="handleSubmit(addProperty)"
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
