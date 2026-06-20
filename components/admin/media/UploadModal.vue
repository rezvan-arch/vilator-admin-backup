<script>
import useStore from "~~/mixins/store";
export default {
  data() {
    return {
      file: null,
      previewFile: null,
      fileSize: null,
      type: "images",
      uploadLoading: false,
    };
  },
  setup() {
    const { mediaStore } = useStore();

    return {
      mediaStore,
    };
  },
  methods: {
    chooseFile() {
      this.type = this.$refs.file.files[0].type.split("/")[0];
      this.file = this.$refs.file.files[0];
      this.fileSize = this.formatBytes(this.file.size);
      const reader = new FileReader();
      reader.readAsDataURL(this.file);
      reader.onload = (e) => {
        this.previewFile = e.target.result;
      };
    },
    formatBytes(bytes, decimals = 2) {
      if (!+bytes) return "0 Bytes";

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    },
    upload() {
      this.uploadLoading = true;
      const formData = new FormData();
      formData.append("file", this.file);
      formData.append("type", this.type == "audio" ? "narration" : this.type);

      this.mediaStore
        .uploadFile(formData)
        .then((res) => {
          if (res.status == "success") {
            this.$toast("فایل شما با موفقیت آپلود شد.", "success", 5000);
            this.mediaStore.getAllFiles(1, {
              valid_format: true,
            });
            this.$emit("closeModal");
          }
          this.uploadLoading = false;
        })
        .catch((err) => {
          this.$toast(err, "error", 5000);
          this.uploadLoading = false;
        });
    },
  },
};
</script>
<template>
  <div @click.self="$emit('closeModal')" class="upload__modal">
    <div class="modal__base">
      <div class="modal__header">
        <h2>آپلود فایل</h2>

        <button class="close__btn" type="button" @click="$emit('closeModal')">
          <i class="fa-regular fa-xmark"></i>
        </button>
      </div>
      <div class="modal__body">
        <div class="choose__file">
          <div class="upload__btn">
            <label for="image__upload">انتخاب فایل</label>
            <input
              type="file"
              ref="file"
              id="image__upload"
              :accept="getInputAccept"
              @change="chooseFile"
            />
          </div>
        </div>
        <div v-if="file" class="file__info">
          <div class="right">
            <div class="name">
              <input type="text" v-if="file" :value="file.name" disabled />
            </div>
            <div class="size">
              <span v-if="file">{{ fileSize }}</span>
            </div>
          </div>
          <div class="left">
            <img  
              v-if="type == 'image' && previewFile != null"
              :src="previewFile"
              alt="" loading="lazy" format="webp"
            />
            <video
              v-else-if="type == 'video' && previewFile != null"
              :src="previewFile"
              alt=""
            />
            <img  
              v-else-if="type == 'audio' && previewFile != null"
              src="/images/podcast.jpg"
              alt="" loading="lazy" format="webp"
            />
            <div v-if="uploadLoading" class="upload__loading">
              <AnimationSpinner />
              <span>در حال بارگذاری</span>
            </div>
          </div>
        </div>
        <div class="file__action">
          <button
            class="btn btn-success ml-2"
            :disabled="file == null || uploadLoading"
            @click="upload"
          >
            آپلود
          </button>
          <button
            class="btn btn-elevated"
            :disabled="uploadLoading"
            @click="$emit('closeModal')"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.upload__modal {
  @apply fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center;

  .modal__base {
    box-shadow: 0 2px 18px 1px rgb(49 53 72 / 10%);
    @apply rounded-lg bg-white w-[600px] overflow-hidden;

    .modal__header {
      @apply flex py-[10px] px-5  relative border-b bg-gray-200;

      h2 {
        @apply text-base font-bold px-4 py-3;
      }
      button {
        @apply absolute left-2 top-2 h-6 w-6 border border-[#a6aab4] rounded-md px-2 flex items-center text-xs text-black;
      }
    }
    .modal__body {
      @apply px-4 py-3 bg-white;
      .choose__file {
        @apply pb-4;

        .choose__type {
          @apply grid w-full grid-cols-4 gap-x-2 rounded-xl bg-gray-200 p-2 mb-4;

          input {
            @apply hidden;
          }

          label {
            @apply block cursor-pointer select-none rounded-xl p-2 text-center transition-colors duration-300;
          }
        }

        .upload__btn {
          @apply my-[30px];

          input {
            @apply hidden;
          }

          label {
            @apply inline-block py-2 px-5 m-0 text-[15px] rounded-md bg-gray-500 text-white cursor-pointer;
          }

          span {
            @apply text-red-500 text-sm mr-4;
          }
        }
      }

      .file__info {
        @apply flex flex-row-reverse justify-between gap-4 pb-4;

        .left {
          @apply w-1/3 relative;

          img,
          video {
            @apply w-full h-[120px] object-cover;
          }

          .upload__loading {
            @apply absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col gap-2 bg-black bg-opacity-60;

            span {
              @apply text-white text-sm;
            }
          }
        }

        .right {
          @apply w-2/3 flex flex-col gap-2;

          div {
            @apply text-sm opacity-70 flex justify-end gap-2;

            span {
              @apply opacity-100;
            }

            input {
              direction: ltr;
              @apply bg-transparent border-none;
            }

            &.name {
              @apply w-full;

              input {
                @apply grow;
              }
            }
          }
        }
      }

      .file__action {
        @apply pt-3 flex items-center justify-end gap-2 border-t;

        button {
          @apply h-[38px] py-0 disabled:opacity-50;
        }
      }
    }
  }
}
</style>
