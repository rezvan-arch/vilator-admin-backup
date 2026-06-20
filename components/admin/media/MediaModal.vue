<script>
import useStore from "~~/mixins/store";
import { createPopper } from "@popperjs/core";
export default {
  props: ["itemId", "item"],
  data() {
    return {
      deleteConfirm: false,
      deleteSize: "",
      copySize:
        this.mediaStore.singleFile.type != "video" ? "thumbnail" : "main",
      uploadSize: null,
      title: "",
      debounce: null,
      titleUpdated: false,
      tagsUpdated: false,
      image: null,
      updateSizeLoading: false,
      deleteSizeLoading: false,
      tags: "",
      tagList: [],
      thumbnailLoading: false,
      thumbnail: null,
      previewFile: null,
    };
  },
  setup() {
    const { mediaStore } = useStore();

    return {
      mediaStore,
    };
  },
  computed: {
    sizeSelectOptions() {
      if (this.mediaStore.singleFile.type == "narration") return;

      if (this.mediaStore.singleFile.meta_value) {
        return Object.keys(this.mediaStore.singleFile.meta_value);
      }
    },
    deleteSizeSelectOptions() {
      if (this.mediaStore.singleFile.type == "narration") return;

      const keys = Object.keys(this.mediaStore.singleFile.meta_value);
      const values = Object.values(this.mediaStore.singleFile.meta_value);
      const indexes = values.map((item, index) => {
        if (item.can_delete == 1) return index;
      });
      return keys.filter((item, index) => {
        if (indexes.includes(index)) return item;
      });
    },
    updateSizeSelect() {
      if (this.mediaStore.singleFile.type == "narration") return;

      const updateSizeSelect = [];
      const sizeKey = Object.keys(this.mediaStore.image_size);
      const sizeValue = Object.values(this.mediaStore.image_size);
      sizeKey.forEach((item, index) => {
        updateSizeSelect.push({
          label: sizeKey[index],
          value: sizeValue[index],
        });
      });
      return updateSizeSelect;
    },
  },
  methods: {
    copyToClipboard(val) {
      navigator.clipboard.writeText(val).then(() => {
        this.$toast("لینک موردنظر با موفقیت کپی شد", "success", 5000);
      });
    },
    deleteFile() {
      this.mediaStore.deleteFile(this.itemId).then((res) => {
        if (res.status == "success") {
          this.$toast("فایل موردنظر با موفقیت حذف شد", "success", 5000);
          this.$emit("closeModal");
          this.$emit("searchAll");
        }
      });
    },
    deleteSingleSize() {
      this.mediaStore
        .deleteSingleSize(this.itemId, this.deleteSize)
        .then((res) => {
          if (res.status == "success") {
            this.$toast("سایز موردنظر با موفقیت حذف شد", "success", 5000);
            this.sizeSelectOptions = this.sizeSelectOptions.filter(
              (item) => item != this.deleteSize
            );
            this.deleteSize = "";
          }
        });
    },
    withPopper(dropdownList, component, { width }) {
      /**
       * We need to explicitly define the dropdown width since
       * it is usually inherited from the parent with CSS.
       */
      dropdownList.style.width = width;

      /**
       * Here we position the dropdownList relative to the $refs.toggle Element.
       *
       * The 'offset' modifier aligns the dropdown so that the $refs.toggle and
       * the dropdownList overlap by 1 pixel.
       *
       * The 'toggleClass' modifier adds a 'drop-up' class to the Vue Select
       * wrapper so that we can set some styles for when the dropdown is placed
       * above.
       */
      const popper = createPopper(component.$refs.toggle, dropdownList, {
        placement: "top",
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, -1],
            },
          },
          {
            name: "toggleClass",
            enabled: true,
            phase: "write",
            fn({ state }) {
              component.$el.classList.toggle(
                "drop-up",
                state.placement === "top"
              );
            },
          },
        ],
      });

      /**
       * To prevent memory leaks Popper needs to be destroyed.
       * If you return function, it will be called just before dropdown is removed from DOM.
       */
      return () => popper.destroy();
    },
    getSizeUrl(size) {
      if (
        size != "" &&
        this.mediaStore.singleFile.media_section != "avatar" &&
        this.mediaStore.singleFile.type != "narration" &&
        this.mediaStore.singleFile.meta_value[size]
      ) {
        return this.mediaStore.singleFile.meta_value[size].get_url;
      } else {
        return this.mediaStore.singleFile.get_url;
      }
    },
    updateSingleSize() {
      this.updateSizeLoading = true;
      const formData = new FormData();
      formData.append("file", this.image);
      formData.append("size", this.uploadSize);
      formData.append("_method", "PUT");
      this.mediaStore
        .updateSingleSize(this.itemId, formData)
        .then((res) => {
          if (res.status == "success") {
            this.$toast("عکس شما با موفقیت آپلود شد.", "success", 5000);
            this.mediaStore.getSingleFile(this.itemId);
            this.$emit("searchAll");
            this.uploadSize = "";
            this.image = null;
            this.$refs.singleSizeFile.value = "";
            this.updateSizeLoading = false;
          }
        })
        .catch((err) => {
          this.updateSizeLoading = false;
        });
    },
    debounceUpdateFile(mode) {
      if (mode == "title") this.titleUpdated = false;
      if (mode == "tags") this.tagsUpdated = false;
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.updateFile().then((res) => {
          if (res.status == "success") {
            if (mode == "title") this.titleUpdated = true;
            if (mode == "tags") this.tagsUpdated = true;
          }
        });
      }, 600);
    },
    updateFile() {
      return this.mediaStore.updateFile(this.itemId, {
        title: this.mediaStore.singleFile.title,
        tags: this.tagList,
      });
    },
    changeFile() {
      this.image = this.$refs.singleSizeFile.files[0];
    },
    formatBytes(bytes, decimals = 2) {
      if (!+bytes) return "0 Bytes";

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    },
    addTag() {
      if (this.tags != "") {
        this.tagList.push(this.tags);
        this.tags = "";

        this.updateFile().then((res) => {
          if (res.status == "success") {
            this.tagsUpdated = true;
            setTimeout(() => {
              this.tagsUpdated = false;
            }, 3000);
          }
        });
      }
    },
    removeTag(data) {
      this.tagList = this.tagList.filter((item) => item != data);
      this.updateFile();
    },
    chooseThumbnail() {
      this.thumbnail = this.$refs.thumbnail.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(this.thumbnail);
      reader.onload = (e) => {
        this.previewFile = e.target.result;
      };
    },
    updateThumbnail() {
      this.thumbnailLoading = true;
      const formData = new FormData();
      formData.append("file", this.thumbnail);
      formData.append("size", "thumbnail");
      formData.append("_method", "PUT");
      this.mediaStore
        .updateSingleSize(this.itemId, formData)
        .then((res) => {
          if (res.status == "success") {
            this.$toast("کاور شما با موفقیت آپلود شد.", "success", 5000);
            this.mediaStore.getSingleFile(this.itemId);
            this.$emit("searchAll");
            this.uploadSize = "";
            this.thumbnail = null;
            this.$refs.thumbnail.value = "";
            this.previewFile = null;
            this.thumbnailLoading = false;
          }
        })
        .catch((err) => {
          this.thumbnailLoading = false;
        });
    },
  },
  mounted() {
    if (this.mediaStore.singleFile.tags != null) {
      this.tagList = this.mediaStore.singleFile.tags.map((item) => item.title);
    }
  },
};
</script>
<template>
  <div @click.self="$emit('closeModal')" class="popup__media" id="popup__media">
    <div class="popup__content">
      <div class="popup__header">
        <h2>جزئیات فایل</h2>
        <button class="close__btn" type="button" @click="$emit('closeModal')">
          <i class="fa-regular fa-xmark"></i>
        </button>
      </div>
      <div class="popup__main">
        <div class="content__main">
          <div class="content__body">
            <div class="content__media">
              <img
                v-if="
                  mediaStore.singleFile.type == 'image' ||
                  mediaStore.singleFile.type == 'plan' ||
                  mediaStore.singleFile.type == 'avatar'
                "
                :src="mediaStore.singleFile.original_size.get_url"
                alt=""
                loading="lazy"
                format="webp"
              />
              <video
                v-else-if="mediaStore.singleFile.type == 'video'"
                :src="mediaStore.singleFile.original_size.get_url"
                alt=""
                controls
              />
              <Narration
                v-else-if="mediaStore.singleFile.type == 'narration'"
                :src="mediaStore.singleFile.get_url"
              />
            </div>
          </div>
        </div>
        <div class="content__aside">
          <div v-if="itemId" class="media__content">
            <p class="aside__title">جزئیات پیوست</p>
            <div class="media__info">
              <div class="info">
                <div class="right">
                  <img
                    v-if="
                      mediaStore.singleFile.type == 'image' ||
                      mediaStore.singleFile.type == 'plan' ||
                      mediaStore.singleFile.type == 'avatar'
                    "
                    :src="mediaStore.singleFile.get_url"
                    alt=""
                    loading="lazy"
                    format="webp"
                  />
                  <img
                    v-else-if="
                      mediaStore.singleFile.type == 'video' &&
                      mediaStore.singleFile.meta_value.thumbnail
                    "
                    :src="mediaStore.singleFile.meta_value.thumbnail.get_url"
                    alt=""
                    loading="lazy"
                    format="webp"
                  />
                  <img
                    v-else-if="mediaStore.singleFile.type == 'narration'"
                    src="/images/podcast.jpg"
                    alt=""
                    loading="lazy"
                    format="webp"
                  />
                </div>
                <div class="left">
                  <p v-if="mediaStore.singleFile.name" class="media__name">
                    {{ mediaStore.singleFile.name }}
                  </p>
                  <p
                    v-if="mediaStore.singleFile.created_at"
                    class="media__data"
                  >
                    {{ convertDate(mediaStore.singleFile.created_at) }}
                  </p>
                  <p
                    v-if="
                      mediaStore.singleFile.type != 'narration' &&
                      mediaStore.singleFile.original_size
                    "
                    class="media__size"
                  >
                    {{
                      formatBytes(mediaStore.singleFile.original_size.filesize)
                    }}
                  </p>
                  <p
                    v-if="
                      mediaStore.singleFile.type != 'narration' &&
                      mediaStore.singleFile.original_size &&
                      mediaStore.singleFile.original_size.width
                    "
                    class="media__size"
                  >
                    {{ mediaStore.singleFile.original_size.height }} *
                    {{ mediaStore.singleFile.original_size.width }}
                  </p>
                  <button class="delete" @click="deleteConfirm = true">
                    <template v-if="mediaStore.singleFile.type == 'image'">
                      حذف عکس
                    </template>
                    <template v-else-if="mediaStore.singleFile.type == 'video'">
                      حذف ویدیو
                    </template>
                    <template
                      v-else-if="mediaStore.singleFile.type == 'narration'"
                    >
                      حذف پادکست
                    </template>
                    <template v-else> حذف فایل </template>
                  </button>
                </div>
              </div>

              <div class="media__alt">
                <p>
                  <template
                    v-if="
                      mediaStore.singleFile.type == 'image' ||
                      mediaStore.singleFile.type == 'plan' ||
                      mediaStore.singleFile.type == 'avatar'
                    "
                  >
                    عنوان عکس
                  </template>
                  <template v-else-if="mediaStore.singleFile.type == 'video'">
                    عنوان ویدیو
                  </template>
                  <template
                    v-else-if="mediaStore.singleFile.type == 'narration'"
                  >
                    عنوان پادکست
                  </template>
                </p>
                <div class="">
                  <i
                    class="fa-solid fa-circle-check"
                    :class="{ active: titleUpdated }"
                  ></i>
                  <input
                    type="text"
                    v-model="mediaStore.singleFile.title"
                    @input="debounceUpdateFile('title')"
                  />
                </div>
              </div>
              <div
                v-if="
                  mediaStore.singleFile.type != 'narration' &&
                  mediaStore.singleFile.type != 'video'
                "
                class="media__tags"
              >
                <p>تگ های عکس</p>
                <div class="tags__box">
                  <i
                    class="fa-solid fa-circle-check"
                    :class="{ active: tagsUpdated }"
                  ></i>
                  <ul>
                    <li
                      v-for="(item, index) in tagList"
                      :key="index"
                      @click="removeTag(item)"
                      class="tag__item"
                    >
                      {{ item }}
                      <span>x</span>
                    </li>
                    <li class="grow flex">
                      <input type="text" v-model="tags" @keyup.enter="addTag" />
                    </li>
                  </ul>
                  <!-- mediaStore.singleFile.tags -->
                  <!-- debounceUpdateFile('tags') -->
                </div>
              </div>
            </div>
            <div
              v-if="
                mediaStore.singleFile.type != 'narration' &&
                mediaStore.singleFile.type != 'video'
              "
              class="size__update"
            >
              <div class="title">آپدیت سایزها</div>
              <div class="update__body">
                <v-select
                  class="modal w-full"
                  :options="updateSizeSelect"
                  placeholder="انتخاب سایز"
                  :reduce="(option) => option.value"
                  v-model="uploadSize"
                  autocomplete="off"
                >
                  <template #no-options>
                    <p class="text-sm opacity-60 text-center">
                      گزینه مورد نظر پیدا نشد
                    </p>
                  </template>
                </v-select>
                <label for="update__file">choose file</label>
                <input
                  type="file"
                  name=""
                  id="update__file"
                  ref="singleSizeFile"
                  accept="image/*"
                  @change="changeFile"
                />
                <button
                  :disabled="
                    updateSizeLoading || image == null || uploadSize == null
                  "
                  @click="updateSingleSize"
                >
                  <template v-if="updateSizeLoading">
                    <i
                      class="fa-solid fa-spinner text-white text-xl animate-spin"
                    ></i>
                  </template>
                  <template v-else> آپلود </template>
                </button>
              </div>
            </div>
            <div
              v-if="
                mediaStore.singleFile.type != 'narration' &&
                mediaStore.singleFile.type != 'video'
              "
              class="size__delete"
            >
              <div class="title">حذف</div>
              <div class="delete__body">
                <v-select
                  class="modal"
                  :options="deleteSizeSelectOptions"
                  placeholder="انتخاب سایز"
                  v-model="deleteSize"
                  autocomplete="off"
                >
                  <template #no-options>
                    <p class="text-sm opacity-60 text-center">
                      گزینه مورد نظر پیدا نشد
                    </p>
                  </template>
                </v-select>
                <button
                  :disabled="deleteSizeLoading || deleteSize == ''"
                  @click="deleteSingleSize"
                >
                  <template v-if="deleteSizeLoading">
                    <i
                      class="fa-solid fa-spinner text-white text-xl animate-spin"
                    ></i>
                  </template>
                  <template v-else> حذف سایز </template>
                </button>
              </div>
            </div>
            <div
              v-if="mediaStore.singleFile.type == 'video'"
              class="size__update set__thumbnail"
            >
              <div class="title">آپدیت کاور</div>
              <div class="update__body">
                <label for="update__file">choose file</label>
                <input
                  type="file"
                  name=""
                  id="update__file"
                  ref="thumbnail"
                  accept="image/*"
                  @change="chooseThumbnail"
                />
                <button
                  :disabled="thumbnailLoading || thumbnail == null"
                  @click="updateThumbnail"
                >
                  <template v-if="thumbnailLoading">
                    <i
                      class="fa-solid fa-spinner text-white text-xl animate-spin"
                    ></i>
                  </template>
                  <template v-else> آپلود </template>
                </button>
              </div>
              <div class="cover__preview">
                <img
                  v-if="previewFile"
                  :src="previewFile"
                  alt=""
                  loading="lazy"
                  format="webp"
                />
              </div>
            </div>
          </div>
          <template v-if="mediaStore.singleFile.type != 'narration'">
            <div v-if="itemId" class="aside__bottom">
              <v-select
                class="modal w-full mb-4"
                :options="sizeSelectOptions"
                placeholder="انتخاب سایز"
                v-model="copySize"
                append-to-body
                :calculate-position="withPopper"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <div class="img__src">
                <input
                  type="text"
                  readonly
                  :value="getSizeUrl(copySize)"
                  @click="copyToClipboard(getSizeUrl(copySize))"
                />
                <button @click="copyToClipboard(getSizeUrl(copySize))">
                  کپی
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <div v-if="itemId" class="aside__bottom">
              <div class="img__src">
                <input
                  type="text"
                  readonly
                  :value="getSizeUrl(mediaStore.singleFile.get_url)"
                  @click="copyToClipboard(mediaStore.singleFile.get_url)"
                />
                <button @click="copyToClipboard(mediaStore.singleFile.get_url)">
                  کپی
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
  <teleport to="body">
    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="deleteConfirm"
        msg="آیا از حذف این فایل اطمینان دارید؟"
        @confirm="deleteFile"
        @closeModal="deleteConfirm = false"
      />
    </transition>
  </teleport>
</template>
<style lang="scss" scoped>
#popup__media {
  @apply fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center;

  .popup__content {
    @apply bg-white h-[90%] w-[90%] rounded-lg overflow-hidden;

    .popup__header {
      @apply flex py-[10px] px-5 border-b border-[#acb2b8] relative;

      h2 {
        @apply text-lg mb-0 font-bold;
      }

      button {
        @apply absolute left-2 top-2 h-6 w-6 border border-[#a6aab4] rounded-md px-2 flex items-center text-xs text-black;
      }
    }

    .popup__main {
      @apply flex h-[calc(100%-49px)];

      &.c-footer {
        @apply h-[calc(100%-116px)];
      }

      .content__main {
        @apply flex-1 overflow-auto;

        &::-webkit-scrollbar {
          @apply hidden;
        }

        .content__head {
          @apply flex justify-between items-center border-b border-[#acb2b8] py-3 px-6 rounded-none;

          .head__right {
            @apply flex gap-3;

            button {
              @apply outline-none border-none bg-transparent text-[15px] py-2 px-[15px];
            }
          }

          .head__left {
            input {
              @apply py-[5px] px-2 text-[15px] rounded-sm border border-[#acb2b8] outline-none;
            }
          }

          @media (max-width: 850px) {
            @apply items-start flex-col gap-4;
          }
        }

        .content__tags {
          @apply py-[5px] px-0 bg-[#f5f5f5];

          ul {
            @apply flex items-center flex-wrap gap-2 m-0 py-0 px-5;

            li {
              @apply text-base py-2 px-[6px] text-black;
            }
          }
        }

        .content__body {
          height: 100%;
          display: flex;
          justify-content: center;
          padding: 20px;
          // @apply grid grid-cols-6 gap-5 py-5 px-6;

          .content__media {
            transition: border 0.5s, box-shadow 0.5s;
            box-shadow: 0px 0px 10px transparent;
            @apply w-full rounded-sm overflow-hidden relative flex justify-center items-center;

            i {
              transition: opacity 0.5s;
              @apply absolute top-0 left-0 text-white text-3xl bg-[#ff4967] opacity-0;
            }

            img,
            video {
              @apply w-auto object-contain h-full;
            }

            video {
              @apply bg-black;
            }

            &.active {
              box-shadow: 0px 0px 10px #00afff;

              i {
                @apply opacity-100;
              }
            }
          }

          @media (max-width: 1110px) {
            @apply grid-cols-5;
          }
          @media (max-width: 1024px) {
            @apply grid-cols-4;
          }
          @media (max-width: 750px) {
            @apply grid-cols-3;
          }
          @media (max-width: 550px) {
            @apply grid-cols-2;
          }
          @media (max-width: 375px) {
            @apply grid-cols-1;
          }
        }
      }

      .content__aside {
        @apply w-1/3 overflow-auto bg-[#f6f7f7] border-r border-[#acb2b8];

        &::-webkit-scrollbar {
          @apply hidden;
        }

        .media__content {
          @apply p-5 mb-5 border-b border-[#acb2b8];

          .aside__title {
            @apply text-sm text-[#2c343b] mb-3;
          }

          .media__info {
            .info {
              @apply flex gap-5;

              img,
              video {
                @apply w-[100px] h-[85px] rounded-sm object-cover mb-1;
              }

              .media__name {
                direction: ltr !important;
                font-family: sans-serif !important;
                @apply text-base text-black mb-1 break-all;
              }

              .media__size,
              .media__data {
                @apply text-sm text-[#939393] mb-1;
              }

              button.delete {
                @apply py-2 px-0 text-sm text-red-600 bg-transparent border-none outline-none;
              }
            }

            .media__alt {
              @apply border-t border-[#acb2b8] pt-5 mt-5 flex items-center justify-between mb-4;

              p {
                @apply text-[#2c343b] text-sm mb-0 whitespace-nowrap;
              }

              div {
                @apply h-[38px] w-[75%] relative flex items-center;

                i {
                  @apply absolute right-0 opacity-0  text-green-400 text-lg transition-all duration-500;

                  &.active {
                    @apply opacity-100 -right-6;
                  }
                }

                input {
                  @apply border border-[#acb2b8] outline-none text-sm rounded-sm py-1 px-2 w-full h-full z-10;
                }
              }
            }
            .media__tags {
              @apply border-t border-[#acb2b8] pt-5 mt-5 flex justify-between mb-4;

              p {
                @apply text-[#2c343b] text-sm mb-3 whitespace-nowrap;
              }

              .tags__box {
                @apply border border-[#acb2b8] bg-white rounded-sm py-0 px-2 flex flex-wrap text-sm  w-[75%] relative;

                i {
                  @apply absolute right-0 opacity-0  text-green-400 text-lg transition-all duration-500;

                  &.active {
                    @apply opacity-100 -right-6;
                  }
                }

                ul {
                  @apply p-0 m-0 flex flex-wrap;

                  li.tag__item {
                    @apply my-2 mx-[0.2rem] p-1 text-white bg-[#1e87f0] rounded-md cursor-pointer h-[28px];
                  }
                }

                input {
                  @apply px-2 py-1 grow border-none outline-none text-inherit h-[52px] z-10 min-w-[50px];
                }
              }
            }
          }

          .size__update {
            @apply mt-5 pt-5 border-t border-[#acb2b8];

            .title {
              @apply text-base text-[#2c343b] pb-1 mb-2;
            }

            .update__body {
              @apply flex justify-between flex-wrap gap-3;

              select {
                @apply w-full py-[5px] px-2 text-[15px] rounded-sm border border-[#acb2b8] outline-none h-[38px] mb-3;
              }

              input[type="file"] {
                @apply hidden;
              }

              label {
                @apply py-2 px-5 m-0 text-[15px] rounded-md min-w-[112px] bg-[#999] text-white cursor-pointer h-[38px];
              }

              button {
                @apply outline-none border-none bg-[#28d094] text-white w-[100px] py-2 px-0 text-center text-[15px] rounded-md h-[38px] disabled:opacity-50;
              }
            }
          }

          .set__thumbnail {
            .cover__preview {
              @apply flex justify-center pt-4 max-h-[150px];

              img {
                @apply object-contain w-auto;
              }
            }
          }

          .size__delete {
            @apply mt-5 pt-5 border-t border-[#acb2b8];

            .title {
              @apply text-base text-[#2c343b] pb-1 mb-2;
            }

            .delete__body {
              @apply flex justify-between gap-3;

              select {
                @apply w-1/2 py-[5px] px-2 text-[15px] rounded-sm border border-[#acb2b8] outline-none h-[38px] mb-3;
              }

              button {
                @apply outline-none border-none bg-[#ff4961] text-white w-[100px] py-2 px-0 text-center text-[15px] rounded-md h-[38px] disabled:opacity-50;
              }
            }
          }
        }

        .aside__bottom {
          @apply px-5 py-0 pb-5;

          select {
            @apply w-full py-[5px] px-2 text-[15px] rounded-sm border border-[#acb2b8] outline-none h-[38px] mb-3;
          }

          .img__src {
            @apply flex gap-3;

            input {
              @apply border border-[#acb2b8] outline-none rounded-sm py-1 px-2 w-full text-center h-[38px] bg-[#f4f4f4] cursor-pointer;
            }

            button {
              @apply py-2 px-5 m-0 text-[15px] rounded-md min-w-[75px] bg-[#999] text-white outline-none border-none h-[38px];
            }
          }
        }
      }
    }

    .popup__footer {
      @apply py-[10px] px-5 border-t border-[#acb2b8] flex items-center justify-between;

      p {
        @apply mb-0 text-base;
      }

      .action {
        @apply flex items-end;

        .choose {
          @apply outline-none border-none bg-[#666ee8] text-white w-[180px] py-2 px-0 text-center text-[15px] rounded-md h-[50px];
        }
      }
    }
  }
}
</style>
<style>
.v-select.drop-up.vs--open .vs__dropdown-toggle {
  border-radius: 0 0 4px 4px;
  /* border-top-color: transparent;
  border-bottom-color: rgba(60, 60, 60, 0.26); */
}

[data-popper-placement="top"] {
  border-radius: 4px 4px 0 0;
  border-top-style: solid;
  border-bottom-style: none;
  box-shadow: 0 -3px 6px rgba(0, 0, 0, 0.15);
}
</style>
