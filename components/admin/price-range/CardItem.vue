<script>
import CurrencyInput from "~/components/form/CurrencyInput.vue";
export default {
  props: ["data"],
  components: {
    CurrencyInput,
  },
  data() {
    return {
      option: {
        locale: "fa-IR",
        currency: "IRR",
        currencyDisplay: "hidden",
        hideCurrencySymbolOnFocus: true,
        hideGroupingSeparatorOnFocus: false,
        hideNegligibleDecimalDigitsOnFocus: true,
        autoDecimalDigits: false,
        useGrouping: true,
        accountingSign: false,
      },
    };
  },
};
</script>
<template>
  <div class="row">
    <div class="controls w-1/4">
      <label for="street">حداقل</label>
      <CurrencyInput
        v-model="data.min"
        :placeholder="''"
        :options="option"
        class="form-control"
      />
    </div>
    <div class="controls w-1/4">
      <label for="street">حداکثر</label>
      <CurrencyInput
        v-model="data.max"
        :placeholder="''"
        :options="option"
        class="form-control"
      />
    </div>
    <div class="controls w-1/4">
      <FormTextInput
        name="displayText"
        label="متن نمایشی"
        v-model="data.text"
        rules="min:3|required"
      />
    </div>
    <div class="controls w-1/12 actions">
      <button
        class="btn btn-outline-danger"
        @click="$emit('deleteItem', data.id)"
      >
        <i class="fa-regular fa-trash"></i>
      </button>
    </div>
  </div>
</template>
<style lang="scss">
.actions {
  display: flex !important;
  @apply items-end;

  button {
    @apply h-[46px] py-0;
  }
}
</style>
