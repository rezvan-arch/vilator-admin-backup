<script setup>
import { Field, ErrorMessage } from "vee-validate";

defineEmits(["update:modelValue"]);
const props = defineProps({
  label: {
    require: false,
    default: "",
  },
  placeholder: {
    require: false,
    default: "",
  },
  name: {
    require: true,
    default: "input",
  },
  type: {
    require: true,
    default: "text",
  },
  rules: {
    require: true,
    default: "",
  },
  modelValue: {
    require: true,
    default: "",
  },
  errors: {
    require: true,
    default: {},
  },
  ltr: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const value = ref("");
value.value = props.modelValue;

watch(
  () => props.modelValue,
  () => {
    value.value = props.modelValue;
  }
);
</script>

<template>
  <label
    v-if="props.label != ''"
    :for="props.name"
    :class="{ 'label-error': Object.keys(errors).length > 0 }"
  >
    {{ props.label }}
  </label>
  <Field
    :name="props.label"
    :id="props.name"
    :type="props.type"
    :rules="props.rules"
    :placeholder="props.placeholder"
    :disabled="disabled"
    class="form-control ui-form-input"
    :class="{ 'input-error': Object.keys(errors).length > 0, ltr: ltr }"
    v-model="value"
    @input="$emit('update:modelValue', $event.target.value)"
    autocomplete="new-password"
  />
  <ErrorMessage :name="props.label" class="error" />
</template>

<style lang="scss" scoped>
.error {
  @apply text-[#ef1e1e] mt-1 text-xs;
}

.input-error {
  @apply border-[#ef1e1e];

  &:focus {
    @apply border-[#ef1e1e];
  }
}

.label-error {
  @apply text-[#ef1e1e];
}

.ltr {
  direction: ltr;
  @apply placeholder:text-right;
}
</style>
