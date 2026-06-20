<script setup>
import Media from "./media.vue";
import Upload from "./upload.vue";
const props = defineProps({
  multiple: {
    type: Boolean,
    default: true,
  },
  mediaAction: {
    type: Object,
    default: {},
  },
  galleryType: {
    type: String,
    default: "",
  },
  justImage: {
    type: Boolean,
    default: false,
  },
});

// variables
const modalType = ref("media");
</script>
<template>
  <div
    @click.self="$emit('closeModal')"
    class="modal__media__container"
    id="modal__media__container"
  >
    <div class="modal__content">
      <div class="modal__header">
        <div class="main">
          <ul class="">
            <li class="">
              <button
                @click="modalType = 'upload'"
                :class="{ active: modalType == 'upload' }"
              >
                افزودن رسانه
              </button>
            </li>
            <li class="mr-2">
              <button
                @click="modalType = 'media'"
                :class="{ active: modalType == 'media' }"
                aria-current="page"
              >
                انتخاب فایل رسانه ای
              </button>
            </li>
          </ul>
        </div>
        <button class="close__btn" type="button" @click="$emit('closeModal')">
          <i class="fa-regular fa-xmark"></i>
        </button>
      </div>
      <Media
        v-if="modalType == 'media'"
        :multiple="props.multiple"
        :mediaAction="props.mediaAction"
        :galleryType="props.galleryType"
        :justImage="props.justImage"
        @chooseMedia="$emit('chooseMedia', $event)"
      />
      <Upload
        v-if="modalType == 'upload'"
        @closeModal="$emit('closeModal')"
        @uploadSuccess="modalType = 'media'"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
#modal__media__container {
  @apply fixed top-0 left-0 w-full h-full z-[60] flex items-center justify-center;

  .modal__content {
    @apply bg-white h-[90%] w-[90%] rounded-lg overflow-hidden flex flex-col;

    .modal__header {
      @apply flex gap-4 px-5 relative text-sm font-medium text-center text-gray-500 border-b border-gray-200;
      .main {
        @apply w-2/3 flex items-center justify-between;

        ul {
          @apply flex flex-wrap -mb-px;

          li {
            @apply mr-2 last:mr-0;

            button {
              @apply inline-block p-4 text-xs border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300;

              &.active {
                @apply text-blue-600 border-blue-600;
              }
            }
          }
        }

        .search__box {
          @apply py-2;

          input {
            @apply h-[38px];
          }
        }
      }

      .close__btn {
        @apply absolute left-2 top-2 h-6 w-6 border border-[#a6aab4] rounded-md px-2 flex items-center text-xs text-black;
      }
    }
  }
}
</style>
