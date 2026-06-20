<template>
  <input
    ref="inputRef"
    type="text"
    inputmode="decimal"
    :placeholder="placeholder"
  />
</template>

<script>
import { useCurrencyInput } from "vue-currency-input";

export default {
  name: "CurrencyInput",
  props: {
    modelValue: Number,
    options: Object,
    placeholder: String,
    watchValue: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { inputRef, setOptions, setValue } = useCurrencyInput(props.options)

    watch(
      () => props.modelValue, // Vue 2: props.value
      (value) => {
        setValue(value)
      }
    )


    return { inputRef };
  },
};
</script>
