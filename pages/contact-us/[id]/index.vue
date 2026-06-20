<script>
import { contactUsStore } from "~/store/admin/contact-us/index";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ارتباط باما ",
    });
    const store = contactUsStore();
    const route = useRoute();

    store.getSingle(route.params.id);

    return {
      store,
    };
  },
  data() {
    return {
      loading: false,
    };
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
            this.store.getSingle(this.store.data.id);
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          }
          this.loading = false;
        })
        .catch(() => {
          this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
          this.loading = false;
        });
    },
    downloadMe(url, name) {
      $fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          const blobURL = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobURL;
          a.style = "display: none";

          if (name && name.length) a.download = name;
          document.body.appendChild(a);
          a.click();
        })
        .catch(() => {});
    },
  },
};
</script>
<template>
  <section class="contact__list">
    <div class="card">
      <div class="card__header">
        <h4 v-if="!store.loading" class="heading__title">
          <span>موضوع: {{ store.data.subject }}</span>
        </h4>
        <h4 v-else class="heading__title">درحال دریافت اطلاعات...</h4>
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
          <nuxt-link to="/contact-us" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div class="card__body" v-if="!store.loading">
        <div class="row">
          <div class="controls w-1/3">
            <label for="name">نام و نام خانوادگی</label>
            <div class="tincolor" v-if="store.data.full_name">
              {{ store.data.full_name }}
            </div>
            <div class="tincolor" v-else>-</div>
          </div>
          <div class="controls w-1/3">
            <label for="email">ایمیل</label>
            <div v-if="store.data.email">{{ store.data.email }}</div>
            <div v-else>-</div>
          </div>
          <div class="controls w-1/3">
            <label for="email">شماره تماس</label>
            <div v-if="store.data.mobile">{{ store.data.mobile }}</div>
            <div v-else>-</div>
          </div>
          <div class="controls w-1/3">
            <label for="email">تاریخ درخواست</label>
            <div v-if="store.data.created_at" style="direction: ltr; text-align: right;">
              {{ convertDate(store.data.created_at, true) }}
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
              >دیده شده</span
            >
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
          <div class="controls w-1/3 file">
            <label for="file">فایل پیوست</label>
            <div v-if="store.data.file">
              <template v-if="store.data.file.type == 'image'">
                <img
                  :src="store.data.file.get_url"
                  :alt="store.data.file.name"
                  loading="lazy"
                  format="webp"
                />
              </template>

              <template v-else>
                <a
                  class="btn btn-success"
                  :href="store.data.file.get_url"
                  rel="nofollow"
                  download=""
                  target="_blank"
                >
                  دانلود فایل
                </a>
              </template>
            </div>
            <div v-else>-</div>
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/1">
            <label for="number">توضیحات</label>
            <div
              v-if="store.data.description"
              v-html="store.data.description"
            ></div>
            <div v-else>-</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}

.notification_off {
  @apply text-[#FF4961] text-2xl;
}

.notification_on {
  @apply text-[#28D094] text-2xl;
}

.file {
  img {
    @apply h-[100px] w-[150px] rounded-[0.125rem] bg-[#f3f4f6] object-cover;
  }
}
</style>
