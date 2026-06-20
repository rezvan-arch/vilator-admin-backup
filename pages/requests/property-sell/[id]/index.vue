<script>
import { requestPropertySaleStore } from "~/store/admin/request/property-sell/index";
import { fullscreenStore } from "~/store/admin/fullscreen";
import FullscreenModal from "~~/components/admin/modals/FullscreenModal.vue";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | درخواست فروش",
    });
    const store = requestPropertySaleStore();
    const fullscreenS = fullscreenStore();
    const route = useRoute();
    store.getSinglePropertySale(route.params.id);
    return {
      store,
      fullscreenS,
    };
  },
  data() {
    return {
      validFormat: ["jpg", "jpeg", "png"],
      loading: false,
    };
  },
  computed: {
    refactorImageData() {
      let imageData = [];
      this.store.data.images.forEach((image, index) => {
        if (this.checkFormat(image.get_url)) {
          let checkImage = imageData.findIndex((c, ci) => ci == index);
          if (checkImage == -1) {
            let data = {
              resourceImages: [],
            };
            let sum = 0;
            Object.entries(image.meta_value).map((mv) => {
              if (this.checkFormat(mv[1].get_url)) {
                let mvc = data.resourceImages.findIndex(
                  (ir, iri) => iri == sum
                );
                if (mvc == -1) {
                  data.resourceImages.push({
                    size: mv[1].width,
                    src: mv[1].get_url,
                  });
                  sum = +1;
                }
              }
            });
            data.image = image.original_size.get_url;
            imageData.push(data);
          }
        }
      });
      return imageData;
    },
  },
  methods: {
    async doUpdate() {
      if (this.store.data.id == undefined) return;
      this.loading = true;

      this.store
        .updateSingle(this.store.data.id, {
          is_reviewed: this.store.data.reviewed_date != null ? 0 : 1,
        })
        .then((res) => {
          if (res.status == "success") {
            this.store.getSinglePropertySale(this.store.data.id);
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          }
          this.loading = false;
        })
        .catch(() => {
          this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
          this.loading = false;
        });
    },
    showFullscreen(index) {
      this.fullscreenS.setFullscreenItems(this.refactorImageData);
      this.fullscreenS.setFullscreenActive(index);
      this.fullscreenS.showModal(true);
    },
    checkFormat(link) {
      let linkS = link.split(".");
      return this.validFormat.includes(linkS[linkS.length - 1]);
    },
  },
  components: { FullscreenModal },
};
</script>
<template>
  <section class="visit__edit">
    <div class="card">
      <div class="card__header">
        <h4 v-if="store.loading" class="heading__title">
          درحال بارگزاری اطلاعات...
        </h4>
        <h4 v-else class="heading__title">نمایش درخواست فروش ملک</h4>
        <div class="heading__actions">
          <button
            class="btn w-[150px]"
            :class="[
              store.data.reviewed_date == null ? 'btn-success' : 'btn-danger',
            ]"
            @click="doUpdate()"
            :disabled="loading"
          >
            <template v-if="loading">
              <i
                class="fa-solid fa-spinner text-white text-xl animate-spin"
              ></i>
            </template>
            <template v-else>
              {{
                store.data.reviewed_date != null
                  ? "تغییر به دیده نشده"
                  : "تغییر به دیده شده"
              }}
            </template>
          </button>
          <nuxt-link to="/requests/property-sell" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div
        v-if="!store.loading"
        class="card__body border border-b border-t-0 border-l-0 border-r-0 border-[#0000001a]"
      >
        <div class="row">
          <div class="controls w-1/3">
            <label for="user_name">شناسه</label>
            <div v-if="store.data.id">{{ store.data.id }}</div>
            <div v-else>-</div>
          </div>
          <div class="controls w-1/4">
            <label for="user_name">نام کاربر</label>
            <nuxt-link
              v-if="store.data.user.name"
              :to="`/user/${store.data.user.id}`"
            >
              {{ store.data.user.name }}
            </nuxt-link>
            <div v-else>-</div>
          </div>
          <div class="controls w-1/4">
            <label for="user_name">شماره موبایل</label>
            <div v-if="store.data.user">
              {{ store.data.user.mobile }}
            </div>
            <div v-else>-</div>
          </div>
          <div class="controls w-1/4">
            <label for="property_name">قیمت</label>
            <div v-if="store.data.price">
              {{ separateNumber(store.data.price) }} <span>تومان</span>
            </div>
            <div v-else>-</div>
          </div>
        </div>

        <div class="row">
          <div class="controls w-1/3">
            <label for="name">وضعیت</label>
            <span
              v-if="store.data.viewer"
              class="badge badge-pill badge-success"
            >
              دیده شده
            </span>
            <span v-else class="badge badge-pill badge-primary">دیده نشده</span>
          </div>
          <div class="controls w-1/3">
            <label for="email">دیده شده توسط</label>
            <nuxt-link
              :to="`/user/${store.data.viewer.id}`"
              v-if="store.data.viewer"
            >
              {{ store.data.viewer.name }}
            </nuxt-link>
            <span v-else>-</span>
          </div>
          <div class="controls w-1/3">
            <label for="email">دیده شده در</label>
            <div
              v-if="
                store.data.reviewed_date &&
                typeof store.data.reviewed_date == 'string'
              "
            >
              {{ convertDate(store.data.reviewed_date) }}
            </div>
            <div v-else>-</div>
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <label for="description">آدرس</label>
            <div v-if="store.data.address">{{ store.data.address }}</div>
            <div v-else>-</div>
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <label for="description">توضیحات</label>
            <div
              v-if="store.data.description"
              v-html="store.data.description"
            ></div>
            <div v-else>-</div>
          </div>
        </div>
        <div v-if="store.data.images.length" class="row">
          <div class="preview">
            <ul class="list-group">
              <li
                v-for="(item, index) in store.data.images"
                :key="index"
                class="list-group-item"
                @click="showFullscreen(index)"
              >
                <img :src="item.get_url" alt="" loading="lazy" format="webp" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
  <teleport to="body" v-if="!store.loading">
    <FullscreenModal v-if="fullscreenS.fullscreenModal" />
  </teleport>
</template>
<style lang="scss" scoped>
.controls label {
  @apply text-sm text-[#2B335E] mb-2 block;
}

select {
  @apply bg-white w-full rounded-[4px];
}

.controls input[type="checkbox"] {
  @apply w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 focus:ring-offset-1;
}

.preview {
  @apply border border-[#cacfe7] rounded-sm w-full min-h-[120px] mt-3 p-3;

  .list-group {
    min-height: 20px;
    direction: ltr;
    @apply flex flex-wrap gap-5 list-none;
  }
  .list-group-item {
    @apply w-[150px] h-[100px] relative;

    img {
      @apply object-cover h-full w-full rounded-sm bg-gray-100;
    }
  }
}
</style>
