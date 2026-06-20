<script setup>
defineEmits(["confirm", "closeModal"]);
const props = defineProps({
  msg: {
    require: true,
    default: "آیا از انجام این عملیات اطمینان دارید؟",
  },
  isHtml: {
    default: false,
  },
  closeBtnLabel: {
    default: "انصراف",
  },
  hasConfirmBtn: {
    default: true,
  },
});
</script>
<template>
  <div class="fp_popup_overlay">
    <div class="popup_base">
      <div class="popup_heading" v-if="!isHtml">
        {{ props.msg }}
      </div>
      <div class="popup_heading" v-else>
        <div v-html="props.msg"></div>
      </div>
      <div class="popup_body">
        <button class="btn btn-success ml-2" @click="$emit('confirm')" v-if="hasConfirmBtn">
          بله
        </button>
        <button class="btn btn-elevated" @click="$emit('closeModal')">
          {{ closeBtnLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.fp_popup_overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;

  .popup_base {
    box-shadow: 0 2px 18px 1px rgb(49 53 72 / 10%);
    margin-bottom: 1.25rem;
    padding: 1.5rem;
    border-radius: 0.375rem;
    --tw-bg-opacity: 1;
    background-color: rgb(255 255 255 / var(--tw-bg-opacity));
    width: 425px;

    .popup_heading {
      border-bottom: 1px solid rgb(227 235 243 / 0.7);
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }

    .popup_body {
      background-color: #ffffff;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
