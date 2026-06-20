<script setup>
import useStore from "~~/mixins/store";
import { createPopper } from "@popperjs/core";
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
const { $toast } = useNuxtApp();

const emit = defineEmits(["chooseMedia"]);

// variables
const selectedItems = ref(new Array());
const deleteConfirm = ref(false);
const deleteSize = ref("");
const copySize = ref("");
const uploadSize = ref(null);
const debounce = ref(null);
const titleUpdated = ref(false);
const tagsUpdated = ref(false);
const searchInput = ref("");
const mediaType = ref("");
const singleSizeFile = ref(null);
const image = ref(null);
const mediaTag = ref([]);
const thumbnailLoading = ref(false);
const thumbnail = ref(null);
const previewFile = ref(null);
const thumbnailInput = ref(null);
const tagList = reactive(new Array());
const tags = ref("");
const mediaSection = ref("");

const { mediaStore, tagGroupStore, adminStore } = useStore();
const route = useRoute();
const router = useRouter();
let currentPage = 1;
if (route.query.page) {
  currentPage = route.query.page;
}
mediaType.value =
  props.galleryType == "thumbnail" ? "image" : props.galleryType;

if (props.mediaAction.type == "image") {
  mediaStore
    .getAllFiles(1, {
      valid_format: false,
      format: "image",
      name: "",
      default_size: true,
      per_page: 30,
    })
    .then((res) => {});
} else if (props.mediaAction.type == "video") {
  mediaStore
    .getAllFiles(1, {
      valid_format: false,
      format: "video",
      name: "",
      default_size: true,
      per_page: 30,
    })
    .then((res) => {});
} else {
  mediaStore
    .getAllFiles(1, {
      valid_format: false,
      format: mediaType.value,
      name: "",
      default_size: true,
      per_page: 30,
    })
    .then((res) => {});
}

tagGroupStore.getGroupsTag().then((res) => {});

function pagination() {
  currentPage = currentPage + 1;
  mediaStore.getAllFiles(
    currentPage,
    {
      valid_format: false,
      format: mediaType.value ? mediaType.value : undefined,
      media_section: mediaSection.value ? mediaSection.value : undefined,
      search: searchInput.value ? searchInput.value : undefined,
      default_size: true,
      "tag[]": mediaTag.value.length ? mediaTag.value : undefined,
      per_page: 30,
    },
    true
  );
}

// computed
const sizeSelectOptions = computed(() => {
  return Object.keys(
    selectedItems.value[selectedItems.value.length - 1].meta_value
  );
});
const deleteSizeSelectOptions = computed(() => {
  const keys = Object.keys(
    selectedItems.value[selectedItems.value.length - 1].meta_value
  );
  const values = Object.values(
    selectedItems.value[selectedItems.value.length - 1].meta_value
  );
  const indexes = values.map((item, index) => {
    if (item.can_delete == 1) return index;
  });

  return keys.filter((item, index) => {
    if (indexes.includes(index)) return item;
  });
});
const updateSizeSelect = computed(() => {
  const updateSizeSelect = [];
  const sizeKey = Object.keys(mediaStore.image_size);
  const sizeValue = Object.values(mediaStore.image_size);

  sizeKey.forEach((item, index) => {
    updateSizeSelect.push({
      label: sizeKey[index],
      value: sizeValue[index],
    });
  });

  return updateSizeSelect;
});
const lastItemId = computed(() => {
  return selectedItems.value[selectedItems.value.length - 1].id;
});
const files = computed(() => {
  if (props.mediaAction.id) {
    mediaStore.files = mediaStore.files.filter(
      (item) => item.id != props.mediaAction.id
    );

    mediaStore.files.unshift(props.mediaAction);

    if (selectedItems.value.length == 0) {
      selectedItems.value.push(props.mediaAction);
    }

    return mediaStore.files;
  } else {
    return mediaStore.files;
  }
});

// methods
function selectItem(val) {
  titleUpdated.value = false;
  tagsUpdated.value = false;
  val = JSON.parse(JSON.stringify(val));
  if (props.multiple) {
    if (selectedItems.value.find((item) => item.id == val.id) != undefined) {
      selectedItems.value = selectedItems.value.filter(
        (item) => item.id != val.id
      );
    } else {
      selectedItems.value.push(val);
    }
  } else {
    if (selectedItems.value.find((item) => item.id == val.id) != undefined) {
      selectedItems.value = selectedItems.value.filter(
        (item) => item.id != val.id
      );
    } else {
      selectedItems.value[0] = val;
    }
  }

  if (selectedItems.value.length) {
    selectedItems.value[selectedItems.value.length - 1].tags = val.tags.map(
      (item) => item.title
    );
  }
}
function deleteFile() {
  mediaStore.deleteFile(lastItemId.value).then((res) => {
    if (res.status == "success") {
      $toast("فایل موردنظر با موفقیت حذف شد", "success", 5000);
      selectedItems.value = selectedItems.value.filter(
        (item) => item.id != lastItemId.value
      );
      mediaStore.getAllFiles(1, {
        valid_format: false,
        format: mediaType.value ? mediaType.value : undefined,
        media_section: mediaSection.value ? mediaSection.value : undefined,
        name: searchInput.value ? searchInput.value : undefined,
        default_size: true,
        "tag[]": mediaTag.value.length ? mediaTag.value : undefined,
        per_page: 30,
      });
      deleteConfirm.value = false;
    }
  });
}
function deleteSingleSize() {
  mediaStore.deleteSingleSize(lastItemId.value, deleteSize).then((res) => {
    if (res.status == "success") {
      $toast("سایز موردنظر با موفقیت حذف شد", "success", 5000);
      sizeSelectOptions = sizeSelectOptions.filter(
        (item) => item != deleteSize
      );
    }
  });
}
function withPopper(dropdownList, component, { width }) {
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
          component.$el.classList.toggle("drop-up", state.placement === "top");
        },
      },
    ],
  });

  /**
   * To prevent memory leaks Popper needs to be destroyed.
   * If you return function, it will be called just before dropdown is removed from DOM.
   */
  return () => popper.destroy();
}
function updateSingleSize() {
  const formData = new FormData();
  formData.append("file", image.value);
  formData.append("size", uploadSize.value);
  formData.append("_method", "PUT");
  mediaStore.updateSingleSize(lastItemId.value, formData).then((res) => {
    if (res.status == "success") {
      $toast("عکس شما با موفقیت آپلود شد.", "success", 5000);
      mediaStore.getSingleFile(lastItemId.value);
      mediaStore.getAllFiles(1, {
        valid_format: false,
        format: mediaType.value ? mediaType.value : undefined,
        media_section: mediaSection.value ? mediaSection.value : undefined,
        name: searchInput.value ? searchInput.value : undefined,
        default_size: true,
        "tag[]": mediaTag.value.length ? mediaTag.value : undefined,
        per_page: 30,
      });
    }
  });
}
function debounceUpdateFile(mode) {
  if (mode == "title") titleUpdated.value = false;
  if (mode == "tags") tagsUpdated.value = false;
  clearTimeout(debounce.value);
  debounce.value = setTimeout(() => {
    updateFile().then((res) => {
      if (res.status == "success") {
        if (mode == "title") titleUpdated.value = true;
        if (mode == "tags") tagsUpdated.value = true;

        console.log(res);
      }
    });
  }, 600);
}
function debounceSearch() {
  clearTimeout(debounce.value);
  debounce.value = setTimeout(() => {
    searchMedia();
  }, 600);
}
function updateFile() {
  const id = selectedItems.value[selectedItems.value.length - 1].id;
  const title = selectedItems.value[selectedItems.value.length - 1].title;
  const tags = selectedItems.value[selectedItems.value.length - 1].tags;
  return mediaStore.updateFile(id, {
    title,
    tags,
  });
}
function getMedia(type) {
  mediaType.value = type;
  searchInput.value = "";
  mediaSection.value = "";
  mediaTag.value = "";
  searchMedia();
}
function searchMedia() {
  mediaStore.getAllFiles(1, {
    valid_format: false,
    format: mediaType.value ? mediaType.value : undefined,
    media_section: mediaSection.value ? mediaSection.value : undefined,
    search: searchInput.value ? searchInput.value : undefined,
    default_size: true,
    "tag[]": mediaTag.value.length ? mediaTag.value : undefined,
    per_page: 30,
  });
}
function changeFile() {
  image.value = singleSizeFile.value.files[0];
}
function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
function chooseThumbnail(event) {
  thumbnail.value = event.target.files[0];
  const reader = new FileReader();
  reader.readAsDataURL(thumbnail.value);
  reader.onload = (e) => {
    previewFile.value = e.target.result;
  };
}

function updateThumbnail() {
  thumbnailLoading.value = true;
  const formData = new FormData();
  formData.append("file", thumbnail.value.files[0]);
  formData.append("size", "thumbnail");
  formData.append("_method", "PUT");
  mediaStore
    .updateSingleSize(
      selectedItems.value[selectedItems.value.length - 1].id,
      formData
    )
    .then((res) => {
      if (res.status == "success") {
        $toast("کاور شما با موفقیت آپلود شد.", "success", 5000);
        mediaStore.getAllFiles(1, {
          valid_format: false,
          format: mediaType.value ? mediaType.value : undefined,
          media_section: mediaSection.value ? mediaSection.value : undefined,
          name: searchInput.value ? searchInput.value : undefined,
          default_size: true,
          "tag[]": mediaTag.value.length ? mediaTag.value : undefined,
          per_page: 30,
        });
        mediaStore.getSingleFile(selectedItems[0].id);
        thumbnail.value = null;
        $refs.thumbnail.value = "";
        previewFile.value = null;
        thumbnailLoading.value = false;
      }
    })
    .catch((err) => {
      if (adminStore.errors["file"]) {
        $toast(adminStore.errors["file"][1], "error", 5000);
      }
      thumbnailLoading.value = false;
    });
}

function setSection(data) {
  // mediaType.value = data;
  mediaSection.value = mediaSection.value != data ? data : "";
  searchMedia();
}

function removeTag(data) {
  selectedItems.value[selectedItems.value.length - 1].tags = selectedItems[
    selectedItems.length - 1
  ].tags.filter((item) => item != data);
  updateFile();
}
function addTag() {
  selectedItems.value[selectedItems.value.length - 1].tags.push(tags.value);
  tags.value = "";

  updateFile();
}

function selectTag(data) {
  mediaTag.value = [];
  tagGroupStore.groups.forEach((item) => {
    if (item.value) {
      item.value.forEach((tag) => mediaTag.value.push(tag.id));
    }
  });
  searchMedia();
}

function chooseMedia() {
  if (props.multiple) {
    let val = [];
    selectedItems.value.forEach((item) => {
      if (item.format == "image" && copySize.value != "") {
        val.push({
          ...item,
          userChoice: item.meta_value[copySize.value].get_url,
        });
      } else {
        val.push(item);
      }
    });
    emit("chooseMedia", val);
  } else {
    if (
      selectedItems.value[selectedItems.value.length - 1].format == "image" &&
      copySize.value != ""
    ) {
      emit("chooseMedia", {
        ...selectedItems.value[0],
        userChoice:
          selectedItems.value[selectedItems.value.length - 1].meta_value[
            copySize.value
          ].get_url,
      });
    } else {
      emit("chooseMedia", selectedItems.value[0]);
    }
  }
}

// watch
</script>
<template>
  <div class="modal__main" :class="{ 'c-footer': selectedItems[0] }">
    <div class="content__main">
      <div class="content__head">
        <div class="head__right">
          <button
            v-if="!justImage"
            @click="getMedia('')"
            :class="{ active: mediaType == '' }"
          >
            همه
          </button>
          <button
            @click="getMedia('image')"
            :class="{
              active: mediaType == 'image',
            }"
          >
            عکس
          </button>
          <button
            v-if="!justImage"
            @click="getMedia('video')"
            :class="{ active: mediaType == 'video' }"
          >
            ویدیو
          </button>
          <button
            v-if="!justImage"
            @click="getMedia('audio')"
            :class="{ active: mediaType == 'audio' }"
          >
            صوت
          </button>
          <button
            v-if="!justImage"
            @click="getMedia('application')"
            :class="{
              active: mediaType == 'application',
            }"
          >
            فایل
          </button>
        </div>
        <div class="head__left">
          <input
            type="text"
            id="search"
            class="form-control"
            v-model="searchInput"
            @input="debounceSearch"
            placeholder="جستجو ..."
          />
        </div>
      </div>
      <div class="content__group">
        <div class="head__right">
          <button
            v-if="mediaType == 'image' || mediaType == ''"
            @click="setSection('property_image')"
            :class="{
              active: mediaSection == 'property_image',
            }"
          >
            عکس ملک ها
          </button>
          <button
            v-if="!justImage && (mediaType == 'video' || mediaType == '')"
            @click="setSection('property_video')"
            :class="{ active: mediaSection == 'property_video' }"
          >
            ویدیو ملک ها
          </button>
          <button
            v-if="mediaType == 'image' || mediaType == ''"
            @click="setSection('property_plan')"
            :class="{
              active: mediaSection == 'property_plan',
            }"
          >
            پلان ملک ها
          </button>
          <button
            v-if="!justImage && (mediaType == 'audio' || mediaType == '')"
            @click="setSection('property_narration')"
            :class="{ active: mediaSection == 'property_narration' }"
          >
            پادکست ملک ها
          </button>
        </div>
      </div>
      <div
        class="content__tags"
        v-if="
          (mediaType == 'image' || mediaType == 'plan') &&
          tagGroupStore.groups.length > 0
        "
      >
        <ul>
          <li
            v-for="(item, index) in tagGroupStore.groups"
            :key="index"
            class="w-1/5 min-w-[25%]"
          >
            <AdminMediaMediaImportModalSelectCostume
              :data="item"
              :multiSelect="true"
              @selected="
                item['value'] = $event;
                selectTag();
              "
            />
          </li>
        </ul>
      </div>
      <div v-if="!mediaStore.loading">
        <div v-if="files.length > 0">
          <div class="content__body">
            <template v-for="(item, index) in files" :key="index">
              <div
                class="content__img"
                :class="{
                  active: selectedItems.filter((media) => media.id == item.id)
                    .length,
                }"
                @click="selectItem(item)"
              >
                <div
                  class="check"
                  v-if="
                    selectedItems.filter((media) => media.id == item.id).length
                  "
                >
                  <i class="fa-regular fa-circle-check"></i>
                </div>
                <img
                  v-if="
                    item.type == 'image' ||
                    item.type == 'plan' ||
                    item.type == 'avatar'
                  "
                  :src="item.get_url"
                  loading="lazy"
                  alt=""
                  format="webp"
                />

                <img
                  v-else-if="item.type == 'video' && item.meta_value.thumbnail"
                  :src="item.meta_value.thumbnail.get_url"
                  alt=""
                  loading="lazy"
                  format="webp"
                />
                <img
                  v-else-if="item.type == 'narration'"
                  src="/images/podcast.jpg"
                  alt=""
                  loading="lazy"
                  format="webp"
                />
                <img
                  v-else-if="item.type == 'application'"
                  src="/images/pdf.png"
                  alt=""
                  loading="lazy"
                  format="webp"
                />
                <div
                  v-if="item.type == 'narration' || item.type == 'video'"
                  class="title"
                >
                  <template v-if="item.type == 'narration'">
                    <span v-if="item.title">{{ item.title }}</span>
                    <span v-else>{{ item.name }}</span>
                  </template>
                  <template v-if="item.type == 'application'">
                    <span v-if="item.title">{{ item.title }}</span>
                    <span v-else>{{ item.name }}</span>
                  </template>
                  <template v-else>
                    <i class="fa-regular fa-circle-play"></i>
                  </template>
                </div>
              </div>
            </template>
          </div>
          <div
            class="admin__pagination"
            v-if="
              mediaStore.pagination &&
              mediaStore.pagination.current_page <
                mediaStore.pagination.last_page
            "
          >
            <button class="btn btn-primary" @click="pagination">
              نمایش بیشتر
            </button>
          </div>
        </div>
        <div v-else class="empty__list">
          <p>موردی برای نمایش وجود ندارد</p>
        </div>
      </div>
      <div v-else class="empty__list">
        <p>درحال بارگذاری اطلاعات...</p>
      </div>
    </div>
    <div class="content__aside">
      <div v-if="selectedItems[0]" class="media__content">
        <p class="aside__title">جزئیات پیوست</p>
        <div class="media__info">
          <div class="info">
            <div class="right">
              <img
                v-if="
                  selectedItems[selectedItems.length - 1].type == 'image' ||
                  selectedItems[selectedItems.length - 1].type == 'plan'
                "
                :src="selectedItems[selectedItems.length - 1].get_url"
                alt=""
                loading="lazy"
                format="webp"
              />
              <img
                v-else-if="
                  selectedItems[selectedItems.length - 1].type == 'video' &&
                  selectedItems[selectedItems.length - 1].meta_value.thumbnail
                "
                :src="
                  selectedItems[selectedItems.length - 1].meta_value.thumbnail
                    .get_url
                "
                alt=""
                loading="lazy"
                format="webp"
              />
              <img
                v-else-if="
                  selectedItems[selectedItems.length - 1].type == 'narration'
                "
                src="/images/podcast.jpg"
                alt=""
                loading="lazy"
                format="webp"
              />
              <img
                v-else-if="
                  selectedItems[selectedItems.length - 1].type == 'application'
                "
                src="/images/pdf.png"
                alt=""
                loading="lazy"
                format="webp"
              />
              <a
                v-if="selectedItems[selectedItems.length - 1].type == 'video'"
                class="play_video"
                :href="
                  selectedItems[selectedItems.length - 1].meta_value.main
                    .get_url
                "
                target="_blank"
              >
                <i class="fa-solid fa-play"></i>
              </a>
            </div>
            <div class="left">
              <p
                v-if="selectedItems[selectedItems.length - 1].name"
                class="media__name"
              >
                {{ selectedItems[selectedItems.length - 1].name }}
              </p>
              <p
                v-if="selectedItems[selectedItems.length - 1].created_at"
                class="media__data"
              >
                {{
                  convertDate(
                    selectedItems[selectedItems.length - 1].created_at
                  )
                }}
              </p>
              <p
                v-if="
                  selectedItems[selectedItems.length - 1].type != 'narration' &&
                  selectedItems[selectedItems.length - 1].meta_value.main
                "
                class="media__size"
              >
                {{
                  formatBytes(
                    selectedItems[selectedItems.length - 1].meta_value.main
                      .filesize
                  )
                }}
              </p>
              <p
                v-if="
                  selectedItems[selectedItems.length - 1].type != 'narration' &&
                  selectedItems[selectedItems.length - 1].type !=
                    'application' &&
                  selectedItems[selectedItems.length - 1].meta_value.main
                "
                class="media__size"
              >
                {{
                  selectedItems[selectedItems.length - 1].meta_value.main.height
                }}
                *
                {{
                  selectedItems[selectedItems.length - 1].meta_value.main.width
                }}
              </p>
              <button class="delete" @click="deleteConfirm = true">
                <template
                  v-if="selectedItems[selectedItems.length - 1].type == 'image'"
                >
                  حذف عکس
                </template>
                <template
                  v-else-if="
                    selectedItems[selectedItems.length - 1].type == 'video'
                  "
                >
                  حذف ویدیو
                </template>
                <template
                  v-else-if="
                    selectedItems[selectedItems.length - 1].type == 'narration'
                  "
                >
                  حذف پادکست
                </template>
                <template
                  v-else-if="
                    selectedItems[selectedItems.length - 1].type ==
                    'application'
                  "
                >
                  حذف فایل
                </template>
              </button>
            </div>
          </div>

          <div class="media__alt">
            <p>
              <template
                v-if="selectedItems[selectedItems.length - 1].format == 'audio'"
              >
                عنوان پادکست
              </template>
              <template
                v-else-if="
                  selectedItems[selectedItems.length - 1].format == 'image'
                "
              >
                عنوان عکس
              </template>
              <template
                v-else-if="
                  selectedItems[selectedItems.length - 1].format == 'video'
                "
              >
                عنوان ویدیو
              </template>
              <template
                v-else-if="
                  selectedItems[selectedItems.length - 1].format ==
                  'application'
                "
              >
                عنوان فایل
              </template>
            </p>
            <div class="">
              <i
                class="fa-solid fa-circle-check"
                :class="{ active: titleUpdated }"
              ></i>
              <input
                type="text"
                v-model="selectedItems[selectedItems.length - 1].title"
                @input="debounceUpdateFile('title')"
                :class="{ '!border-green-800': titleUpdated }"
              />
            </div>
          </div>
          <div
            v-if="
              selectedItems[selectedItems.length - 1].type != 'video' &&
              selectedItems[selectedItems.length - 1].type != 'narration' &&
              selectedItems[selectedItems.length - 1].type != 'application'
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
                  v-for="(item, index) in selectedItems[
                    selectedItems.length - 1
                  ].tags"
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
            selectedItems[selectedItems.length - 1].type != 'narration' &&
            selectedItems[selectedItems.length - 1].type != 'video' &&
            selectedItems[selectedItems.length - 1].type != 'application'
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
              :disabled="image == null || uploadSize == null"
              @click="updateSingleSize"
            >
              آپلود
            </button>
          </div>
        </div>
        <div
          v-if="
            selectedItems[selectedItems.length - 1].type != 'narration' &&
            selectedItems[selectedItems.length - 1].type != 'video' &&
            selectedItems[selectedItems.length - 1].type != 'application'
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
            <button :disabled="deleteSize == ''" @click="deleteSingleSize">
              حذف سایز
            </button>
          </div>
        </div>

        <div
          v-if="selectedItems[selectedItems.length - 1].type == 'video'"
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
      <div
        v-if="
          selectedItems[selectedItems.length - 1] &&
          selectedItems[selectedItems.length - 1].format == 'image'
        "
        class="aside__bottom"
      >
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
      </div>
    </div>
  </div>
  <div v-if="selectedItems[0]" class="modal__footer">
    <p>{{ selectedItems.length }} مورد انتخاب شده است</p>
    <div class="action">
      <button class="choose" type="button" @click="chooseMedia">
        انتخاب مدیا
      </button>
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
.modal__main {
  display: flex;
  height: calc(100% - 49px);

  &.c-footer {
    height: calc(100% - 116px);
  }

  .content__main {
    flex: 1;
    overflow: auto;
    @apply pb-5;

    &::-webkit-scrollbar {
      display: none;
    }

    .content__head,
    .content__group {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e5e7eb;
      padding: 6px 1.5rem;
      border-radius: 0;

      .head__right {
        display: flex;
        gap: 6px;

        button {
          outline: none;
          border: none;
          background: transparent;
          font-size: 12px;
          padding: 3px 8px;
          @apply rounded-md hover:bg-gray-200 transition-colors duration-300;

          &.active {
            @apply bg-[#666EE8] text-white;
          }
        }
      }

      .head__left {
        @apply w-[110px];
        input {
          @apply h-[calc(1.25em+1rem+2px)] text-[10px];
        }
      }

      @media (max-width: 850px) {
        align-items: flex-start;
        flex-direction: column;
        gap: 16px;
      }
    }

    .content__group {
      .head__right button.active {
        @apply bg-[#e3e3e3] text-black;
      }
    }

    .content__tags {
      padding: 4px 10px;
      background-color: #f5f5f5;

      ul {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
        list-style: none;
        margin: 0;
        padding: 4px 20px;

        li {
          button {
            outline: none;
            border: none;
            background: transparent;
            font-size: 14px;
            padding: 3px 8px;
            @apply rounded-md text-black hover:bg-gray-200 transition-colors duration-300;

            &.active {
              @apply text-[#666EE8];
            }
          }

          .v-select.modal {
            height: auto !important;
          }
        }

        &::-webkit-scrollbar {
          @apply h-1;
        }

        &::-webkit-scrollbar-track {
          @apply bg-transparent;
        }

        &::-webkit-scrollbar-thumb {
          @apply rounded-md border-[#dddddd] bg-[#666EE8];
        }
      }

      .tags__swiper {
        @apply overflow-visible;
      }
    }

    .content__body {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 20px;
      padding: 20px 1.5rem;

      .content__img {
        transition: border 0.5s, box-shadow 0.5s;
        box-shadow: 0px 0px 10px transparent;
        @apply rounded-sm cursor-pointer h-[85px] relative;

        img,
        video {
          @apply w-full object-cover h-full bg-gray-100 rounded-sm;
        }

        &.active {
          box-shadow: 0px 0px 10px #00afff;
        }

        .title {
          @apply absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex flex-col-reverse gap-1 items-center justify-center text-white overflow-hidden rounded-sm;

          i {
            @apply text-5xl;
          }
        }

        .check {
          @apply z-10 text-green-500 bg-white absolute -top-2 -left-2 cursor-pointer h-5 w-5 flex items-center justify-center rounded-full border-black;

          i {
            @apply text-base;
          }
        }
      }

      @media (max-width: 1110px) {
        grid-template-columns: repeat(5, 1fr);
      }
      @media (max-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
      }
      @media (max-width: 750px) {
        grid-template-columns: repeat(3, 1fr);
      }
      @media (max-width: 550px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: 375px) {
        grid-template-columns: repeat(1, 1fr);
      }
    }
  }

  .content__aside {
    @apply w-1/3 overflow-auto bg-[#f6f7f7] border-r border-[#e5e7eb];

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

          img {
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

          .right {
            @apply relative min-w-[100px];

            .play_video {
              @apply absolute top-0 left-0 w-full h-[85px] bg-black bg-opacity-25 flex items-center justify-center p-3 text-white hover:text-[#888dd4] transition-colors duration-500;

              i {
                @apply text-lg;
              }
            }
          }
        }

        .media__alt {
          @apply border-t border-[#acb2b8] pt-5 mt-5 flex items-center justify-between mb-4;

          p {
            @apply text-[#2c343b] text-sm mb-0;
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
            @apply text-[#2c343b] text-sm mb-3;
          }

          .tags__box {
            @apply border border-[#acb2b8] bg-white rounded-sm py-0 px-2 flex flex-wrap text-sm  w-[75%];

            i {
              @apply absolute right-0 opacity-0  text-green-400 text-lg transition-all duration-500;

              &.active {
                @apply opacity-100 -right-6;
              }
            }

            ul {
              @apply p-0 m-0 flex flex-wrap w-full;

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

.modal__footer {
  @apply py-[10px] px-5 border-t border-[#e5e7eb] flex items-center justify-between;

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

.empty__list {
  @apply border-b border-t py-5;

  p {
    @apply text-base text-center text-[#464855];
  }
}
</style>
