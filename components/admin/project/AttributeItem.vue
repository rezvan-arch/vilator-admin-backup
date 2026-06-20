<script>
export default {
  props: ["item", "groupSlug"],
  data() {
    return {
      options: [],
      select: "",
      radioValue: "",
      checkboxValue: [],
      singleCheckboxValue: false,
    };
  },
  created() {
    if (this.item.item_styles && this.item.item_styles.tag == "select") {
      this.item.options.forEach((item) => {
        this.options.push({
          label: item.title,
          value: item.id,
        });
      });
    }
    if (
      this.item.item_styles &&
      this.item.item_styles.tag == "select" &&
      this.item.option_id
    ) {
      this.select = this.item.option_id;
    }
    if (
      this.item.item_styles &&
      this.item.item_styles.tag == "checkbox" &&
      this.item.option_id
    ) {
      this.checkboxValue = [this.item.option_id].flat();
    } else if (
      this.item.item_styles &&
      this.item.item_styles.tag == "checkbox" &&
      this.item.item_styles.type == "single"
    ) {
      this.singleCheckboxValue = this.item.value;
    }
    if (
      this.item.item_styles &&
      this.item.item_styles.tag == "radio" &&
      this.item.option_id
    ) {
      this.radioValue = this.item.option_id;
    }
  },
};
</script>
<template>
  <div
    class="controls w-full"
    :class="{
      'col-span-1':
        (item.item_styles &&
          item.item_styles.admin_panel_item_width == 'w-1/2') ||
        (item.item_styles &&
          item.item_styles.admin_panel_item_width == undefined),
      'col-span-2':
        item.item_styles && item.item_styles.admin_panel_item_width == 'w-full',
    }"
  >
    <label :for="item.slug">{{ item.title }}</label>
    <template v-if="item.item_styles && item.item_styles.tag == 'input'">
      <input
        :type="item.item_styles && item.item_styles.type"
        :id="item.slug"
        :value="item.value"
        @input="$emit('changeItem', $event.target.value)"
        class="form-control"
      />
    </template>
    <template v-else-if="item.item_styles && item.item_styles.tag == 'select'">
      <v-select
        :id="item.slug"
        :options="options"
        :reduce="(option) => option.value"
        :multiple="item.item_styles && item.item_styles.type == 'multi'"
        :closeOnSelect="item.item_styles && item.item_styles.type != 'multi'"
        v-model="select"
        @option:selected="$emit('changeItem', select)"
        @option:deselected="$emit('changeItem', select)"
        autocomplete="off"
      >
        <template #no-options>
          <p class="text-sm opacity-60 text-center">گزینه مورد نظر پیدا نشد</p>
        </template>
      </v-select>
    </template>
    <template
      v-else-if="item.item_styles && item.item_styles.tag == 'checkbox'"
    >
      <template v-if="item.item_styles.type == 'multi'">
        <ul
          class="checkbox__container"
          :class="{
            'grid-cols-3':
              item.item_styles && item.item_styles.grid_column_count == 3,
            'grid-cols-4':
              item.item_styles && item.item_styles.grid_column_count == 4,
            'grid-cols-5':
              item.item_styles && item.item_styles.grid_column_count == 5,
            'grid-cols-6':
              item.item_styles && item.item_styles.grid_column_count == 6,
          }"
        >
          <li v-for="(option, index) in item.options" :key="index">
            <label class="">
              <input
                type="checkbox"
                :name="item.slug"
                :value="option.id"
                v-model="checkboxValue"
                @change="$emit('changeItem', checkboxValue)"
              />
              <span v-if="item.options" class="checkmark"></span>
              {{ option.title }}
            </label>
          </li>
        </ul>
      </template>
      <template v-else-if="item.item_styles.type == 'single'">
        <div>
          <label class="switch">
            <input
              type="checkbox"
              :name="item.slug"
              :value="item.id"
              v-model="singleCheckboxValue"
              @change="$emit('changeItem', singleCheckboxValue)"
            />
            <span class="slider round"></span>
          </label>
        </div>
      </template>
    </template>
    <template v-else-if="item.item_styles && item.item_styles.tag == 'radio'">
      <ul class="checkbox__container">
        <li
          v-for="(item, index) in item.options"
          :key="index"
          class="body__item radio"
        >
          <label class="">
            <input
              type="radio"
              v-model="radioValue"
              :value="item.id"
              :name="`radio-${groupSlug}`"
              @change="$emit('changeItem', radioValue)"
            />
            <span class="checkmark"></span>
            {{ item.title }}
          </label>
        </li>
      </ul>
    </template>
  </div>
</template>
<style lang="scss" scoped>
.checkbox__container {
  @apply grid gap-x-3  items-center;

  label {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    @apply w-full relative pr-7 lg:pr-[25px] py-2 flex items-center cursor-pointer text-xs lg:text-sm font-semibold;

    /* Hide the browser's default checkbox */
    input {
      @apply absolute opacity-0 h-0 w-0 cursor-pointer;
    }

    /* Create a custom checkbox */
    .checkmark {
      @apply absolute right-0 border border-[#dde2ed] dark:border-[#4D515D] w-4 h-4 rounded;
    }

    /* When the checkbox is checked, add a blue background */
    input:checked ~ .checkmark {
      @apply bg-baseBlue-500;
    }

    /* Create the checkmark/indicator (hidden when not checked) */
    .checkmark:after {
      content: "";
      @apply hidden absolute;
    }

    /* Show the checkmark when checked */
    input:checked ~ .checkmark:after {
      @apply block;
    }

    /* Style the checkmark/indicator */
    .checkmark:after {
      border: solid white;
      border-width: 0 3px 3px 0;
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      transform: rotate(45deg);
      @apply left-[5px] top-[3px] w-[4px] h-[8px];
    }
  }
}

.radio {
  label {
    input:checked ~ .checkmark:after {
      @apply hidden;
    }

    .checkmark {
      @apply rounded-full w-3 h-3;
    }

    input:checked ~ .checkmark {
      @apply ring-2 ring-offset-1 ring-baseBlue-500;
    }
  }
}

.switch {
  @apply relative inline-block w-[50px] h-[26px];

  input {
    @apply w-0 h-0 opacity-0;

    &:checked + .slider {
      @apply bg-[#DEEFF6];
    }

    &:checked + .slider:before {
      @apply bg-baseBlue-500 -translate-x-[22px];
    }
  }
}

.slider {
  @apply absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#e3ebfb]  duration-500 rounded-full;

  &:before {
    content: "";
    @apply absolute h-[20px] w-[20px]  right-[4px] bottom-[3px] bg-[#9CA8B8] duration-500 rounded-full;
  }
}
</style>
