<script>
import useStore from "~/mixins/store";
import MediaModal from "~~/components/admin/media/MediaModal.vue";

export default {
  data() {
    return {
      popup: false,
      uploadPopup: false,
      selectedId: null,
      selectedItem: {},
      file: null,
      mediaType: null,
      orderBy: "desc",
      searchInput: "",
      debounce: null,
    };
  },
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | مدیا ",
    });
    const { mediaStore, indexStore } = useStore();
    const route = useRoute();
    const router = useRouter();
    const currentPage = ref(1);

    if (route.query.page) {
      currentPage.value = route.query.page;
    }
    mediaStore.getAllFiles(currentPage.value, {
      valid_format: true,
    });

    return {
      currentPage,
      mediaStore,
      indexStore,
    };
  },
  created() {
    this.orderBy = this.$route.query.orderBy || "desc";
    // this.mediaType = this.$route.query.mediaType || ;
  },
  methods: {
    selectItem(item) {
      this.selectedItem = item;
      this.selectedId = item.id;
      this.mediaStore.getSingleFile(item.id).then((res) => {
        if (res.status == "success") {
          this.indexStore.showModalFn(true);
          this.popup = true;
        }
      });
    },
    searchMedia() {
      let type = this.mediaType;
      if (this.mediaType == "all-image") {
        type = ["image", "plan"];
      }
      if (this.mediaType == null) {
        type = "";
      }
      this.mediaStore.getAllFiles(1, {
        valid_format: true,
        "type[]": type ? type : undefined,
        name: this.searchInput ? this.searchInput : undefined,
        default_size: true,
        order_by: this.orderBy,
        page: this.currentPage,
      });
    },
    debounceSearchMedia() {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.searchMedia();
      }, 600);
    },
    pagination(page = 1) {
      if (this.currentPage.value != page) {
        this.$router.push({
          query: {
            page,
            orderBy: this.orderBy || undefined,
            mediaType: this.mediaType || undefined,
          },
        });
        this.currentPage = page;
        this.searchMedia();
      }
    },
  },
  components: { MediaModal },
  watch: {
    mediaType() {
      this.$router.push({
        query: {
          orderBy: this.orderBy === "desc" ? undefined : this.orderBy,
          mediaType: this.mediaType === null ? undefined : this.mediaType,
        },
      });
      this.currentPage = 1;
      this.searchMedia();
    },
    orderBy() {
      this.$router.push({
        query: {
          orderBy: this.orderBy === "desc" ? undefined : this.orderBy,
          mediaType: this.mediaType === null ? undefined : this.mediaType,
        },
      });
      this.currentPage = 1;
      this.searchMedia();
    },
  },
};
</script>

<template>
  <div class="container_media" id="media">
    <div class="card">
      <div class="card__header">
        <button
          @click="
            indexStore.showModalFn(true);
            uploadPopup = true;
          "
        >
          <i class="fa-regular fa-plus"></i>
          آپلود
        </button>
      </div>

      <div class="card__body">
        <div class="body__head">
          <div class="head__right">
            <v-select
              class="modal w-3/5"
              style="min-width: auto !important"
              :options="[
                {
                  label: 'همه موارد رسانه ای',
                  value: null,
                },
                {
                  label: 'تمام عکس ها',
                  value: 'all-image',
                },
                {
                  label: 'عکس',
                  value: 'image',
                },
                {
                  label: 'فیلم',
                  value: 'video',
                },
                {
                  label: 'پلان',
                  value: 'plan',
                },
                {
                  label: 'پادکست',
                  value: 'narration',
                },
              ]"
              :reduce="(option) => option.value"
              v-model="mediaType"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
            <v-select
              class="modal w-2/5"
              style="min-width: auto !important"
              :clearable="false"
              :options="[
                {
                  label: 'جدید ترین',
                  value: 'desc',
                },
                {
                  label: 'قدیمی ترین',
                  value: 'asc',
                },
              ]"
              placeholder="مرتب سازی"
              :reduce="(option) => option.value"
              v-model="orderBy"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
          </div>
          <div class="head__left">
            <input
              type="text"
              class="form-control"
              id="search"
              placeholder="جستجو ..."
              @input="debounceSearchMedia"
              v-model="searchInput"
            />
          </div>
        </div>

        <div v-if="!mediaStore.loading">
          <div v-if="mediaStore.files.length > 0">
            <div class="body__content">
              <template v-for="(item, index) in mediaStore.files" :key="index">
                <div
                  class="content__img"
                  :class="{
                    active: selectedId == item.id,
                    'animate-basePulse':
                      selectedId == item.id && mediaStore.singleLoading,
                  }"
                  @click="selectItem(item)"
                >
                  <img
                    v-if="
                      item.type == 'image' ||
                      item.type == 'plan' ||
                      item.type == 'avatar'
                    "
                    :src="
                      item.meta_value.thumbnail
                        ? item.meta_value.thumbnail.get_url
                        : item.meta_value.main.get_url
                    "
                    alt=""
                    loading="lazy"
                    format="webp"
                  />
                  <img
                    v-else-if="
                      item.type == 'video' && item.meta_value.thumbnail
                    "
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
                  <div
                    v-if="item.type == 'narration' || item.type == 'video'"
                    class="title"
                  >
                    <template v-if="item.type == 'narration'">
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
            <AdminPagination
              v-if="
                mediaStore.pagination && mediaStore.pagination.last_page > 1
              "
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="mediaStore.pagination.last_page"
            />
          </div>
          <div v-else class="empty__list">
            <p>موردی برای نمایش وجود ندارد</p>
          </div>
        </div>
        <div v-else class="empty__list">
          <p>درحال بارگذاری اطلاعات...</p>
        </div>
      </div>
    </div>
  </div>

  <teleport to="body">
    <transition name="translate">
      <MediaModal
        v-if="popup"
        @closeModal="
          popup = false;
          indexStore.showModalFn(false);
        "
        @searchAll="searchMedia"
        :item="selectedItem"
        :itemId="selectedId"
      />
    </transition>
  </teleport>
  <teleport to="body">
    <transition name="translate">
      <AdminMediaUploadModal
        v-if="uploadPopup"
        @closeModal="
          uploadPopup = false;
          indexStore.showModalFn(false);
        "
      />
    </transition>
  </teleport>
</template>

<style lang="scss" scoped>
.card__header {
  @apply p-6;

  label {
    @apply block w-fit;
  }
}
#media {
  .card__header {
    input {
      @apply hidden;
    }

    button {
      @apply flex items-center py-2 px-5 m-0 text-[15px] rounded-md bg-gray-500 text-white cursor-pointer;

      i {
        @apply text-sm ml-2;
      }
    }
  }

  .card__body {
    @apply w-full pb-6;

    .body__head {
      @apply flex justify-between items-center border-t border-b border-[#acb2b8] py-3 mb-5;

      .head__right {
        @apply flex gap-3 w-[50%];

        select {
          @apply w-1/2;

          &::after {
            @apply left-[50px];
          }
        }

        @media (max-width: 370px) {
          @apply flex-col gap-4;
        }
      }

      .head__left {
        input {
          @apply h-[calc(1.25em+1rem+2px)];
        }
      }

      @media (max-width: 850px) {
        @apply items-start flex-col gap-4;
      }
    }

    .body__content {
      @apply grid grid-cols-5 gap-5 py-0 px-6;

      .content__img {
        transition: border 0.5s, box-shadow 0.5s;
        box-shadow: 0px 0px 10px transparent;
        @apply rounded-sm overflow-hidden cursor-pointer h-[150px] bg-gray-100 relative;

        img,
        video {
          @apply w-full object-cover h-full;
        }

        &.active {
          box-shadow: 0px 0px 10px #00afff;
        }

        .title {
          @apply absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center text-white;

          i {
            @apply text-5xl;
          }
        }
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
}
</style>
