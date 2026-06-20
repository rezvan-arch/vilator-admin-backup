<script>
import { AdminSettingsStore } from "~/store/admin/settings/index";
import useStore from "~~/mixins/store";
import moment from "jalali-moment";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | تنظیمات",
    });
    const { adminStore, indexStore } = useStore();
    const momenT = moment();
    const store = AdminSettingsStore();
    const { $toast } = useNuxtApp();
    const form = {
      name: "",
      site_title: "",
      site_seo_description: "",
      index_seo_content: "",
      about_us: "",
      slogan: "",
      address: "",
      phone_number: null,
      email: "",
      header_tags: "",
      social_media: "",
      e_symbol: "",
      working_hours: "",
      whatsApp_support_number: null,
      telegram_supporting_number: null,
      sms_support_number: null,
    };

    store.getSettings().then((res) => {
      if (res.status == "success") {
        const formValues = [
          "name",
          "site_title",
          "site_seo_description",
          "about_us",
          "index_seo_content",
          "slogan",
          "address",
          "phone_number",
          "email",
          "header_tags",
          "working_hours",
          "whatsApp_support_number",
          "telegram_supporting_number",
          "sms_support_number",
          "discord_in_point",
          "map_radius",
          "zoom_map",
        ];

        res.data.map((setting) => {
          if (setting["key"] == "social_media") {
            if (setting["value"] != "") {
              store.socialMedias = [];
              let sm = JSON.parse(setting["value"]);
              if (sm != undefined && sm.length) {
                store.socialMedias.splice(0, 1);
                sm.forEach((e) => {
                  if (e != null) {
                    store.socialMedias.push({
                      id: e.id,
                      name: e.name,
                      link: e.link,
                      icon: e.icon,
                      enName: e.enName,
                      username: e.username,
                    });
                  }
                });
              }
            }
          }
          if (setting["key"] == "e_symbol") {
            if (setting["value"] != "") {
              store.eSymbols = [];
              let sm = JSON.parse(setting["value"]);
              if (sm != undefined && sm.length) {
                store.eSymbols.splice(0, 1);
                sm.forEach((e) => {
                  if (e != null) {
                    store.eSymbols.push({
                      id: e.id,
                      name: e.name,
                      script: e.script,
                    });
                  }
                });
              }
            }
          }

          if (setting["key"] == "property_price_range") {
            if (setting["value"] != "") {
              store.property_price_range = [];
              let sm = setting["value"];

              store.property_price_range = sm;
            }
          }

          if (setting["key"] == "price_percent") {
            if (setting["value"] != "") {
              store.price_percent = [];
              let sm = setting["value"];

              store.price_percent = sm;
            }
          }

          if (setting["key"] == "discord_in_point") {
            if (setting["value"] != "") {
              store.discord_in_point = [];
              let sm = setting["value"];

              store.discord_in_point = sm;
            }
          }

          if (setting["key"] == "zoom_map") {
            if (setting["value"] != "") {
              store.zoom_map = [];
              let sm = setting["value"];

              store.zoom_map = sm;
            }
          }

          if (setting["key"] == "map_radius") {
            if (setting["value"] != "") {
              store.map_radius = [];
              let sm = setting["value"];

              store.map_radius = sm;
            }
          }

          let settings = formValues.find((val) => val == setting["key"]);
          if (settings != undefined) {
            if (setting["key"] == "header_tags") {
              form[settings] = JSON.parse(setting["value"]);
            } else {
              form[settings] = setting["value"];
            }
          }
        });

        if (form.slogan == null) form.slogan = "";

        store.loading = false;
      } else {
        $toast("درخواست با خطا مواجه شد!", "error", 2000);
      }
    });

    store.getSettingsIconLogo().then((res) => {
      if (res.status == "success") {
        res.data.map((setting) => {
          if (setting["key"] == "logo") {
            if (setting["value"] != null) {
              store.thumbnailDetailsLogo = setting["value"];
            }
          }
          if (setting["key"] == "icon") {
            if (setting["value"] != null) {
              store.thumbnailDetailsIcon = setting["value"];
            }
          }
        });
        store.loading = false;
      } else {
        $toast("درخواست با خطا مواجه شد!", "error", 2000);
      }
    });

    store.getImageTags();

    return {
      momenT,
      form,
      store,
      adminStore,
      indexStore,
    };
  },
  data() {
    return {
      socialMediasIcons: [
        {
          label: "فیس بوک",
          icon: "fa-brands fa-facebook-f",
        },
        {
          label: "توییتر",
          icon: "fa-brands fa-twitter",
        },
        {
          label: "اینستاگرام",
          icon: "fa-brands fa-instagram",
        },
        {
          label: "تلگرام",
          icon: "fa-brands fa-telegram",
        },
        {
          label: "یوتیوب",
          icon: "fa-brands fa-youtube",
        },
        {
          label: "لینکدین",
          icon: "fa-brands fa-linkedin",
        },
        {
          label: "بدون آیکون",
          icon: "none",
        },
      ],
      galleryPopup: false,
      thumbnailDetailsType: "logo",
      loading: false,
    };
  },
  methods: {
    async doUpdate() {
      this.loading = true;
      this.store
        .updateSettings(this.form)
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          }
          this.loading = false;
        })
        .catch(() => {
          this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
          this.loading = false;
        });
    },
    galleryEvent(data) {
      if (data.type != "image" && data.type != "plan") {
        this.$toast("تصویرشاخص انتخابی نامعتبر می باشد!", "error", 2000);
        return;
      }

      if (this.thumbnailDetailsType == "logo") {
        this.store.thumbnailDetailsLogo = data;
        this.store.settingLogoId = data.id;
      } else if (this.thumbnailDetailsType == "icon") {
        this.store.thumbnailDetailsIcon = data;
        this.store.settingIconId = data.id;
      }

      this.galleryPopup = false;
      this.store.loading = false;
      this.indexStore.showModalFn(false);
    },
    setThumbnail(type) {
      this.thumbnailDetailsType = type;
      this.indexStore.showModalFn(true);
      this.galleryPopup = true;
    },
    clearThumbnail(type) {
      if (type == "logo") {
        this.store.thumbnailDetailsLogo = null;
        this.store.settingLogoId = "";
      }
      if (type == "icon") {
        this.store.thumbnailDetailsIcon = null;
        this.store.settingIconId = "";
      }
    },
    changeSocial(data, id) {
      this.store.socialMedias.forEach((item) => {
        if (item.id == id && data != "none") {
          item["enName"] = data.split(" ")[1].split("-")[1];
        } else if (item.id == id && data == "none") {
          item["enName"] = "";
        }
      });
    },
  },
};
</script>
<template>
  <section class="settings__list" v-if="!store.loading">
    <!-- seo settings -->
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">تنظیمات سئو</h4>
      </div>
      <div class="card__body">
        <div
          class="flex flex-col w-full p-3 mb-3 border-r-4 border-red-400 rounded-md font-light bg-gray-50"
          v-if="Object.entries(adminStore.errors).length"
        >
          <p class="flex w-full mb-2">لطفا خطاهای فرم را بررسی کنید:</p>
          <ul class="flex flex-col w-full gap-2">
            <li
              v-for="(err, ind) in adminStore.errors"
              :key="ind"
              class="text-red-500 text-sm"
            >
              <i class="ml-2 fa-solid fa-exclamation"></i>
              {{ err[0] }}
            </li>
          </ul>
        </div>
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              name="name"
              label="نام سایت"
              v-model="form.name"
              rules="min:3|required"
            />
          </div>
          <div class="controls w-1/2">
            <FormTextInput
              name="site_title"
              label="عنوان سایت"
              v-model="form.site_title"
              rules="min:3|required"
            />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <label for="site_seo_description">توضیحات سئو سایت :</label>
            <textarea
              class="form-control min-h-[150px]"
              id="site_seo_description"
              v-model="form.site_seo_description"
              rows="10"
            ></textarea>
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <label for="slogan">شعار سازمانی :</label>

            <textarea
              class="form-control min-h-[150px]"
              id="slogan"
              v-model="form.slogan"
              rows="10"
            ></textarea>
          </div>
        </div>

        <div class="row">
          <div class="controls w-full">
            <label for="index_seo_content">محتوای سئو صفحه اول :</label>
            <ckeditor :gallery="false" v-model="form.index_seo_content" />
          </div>
        </div>

        <div class="row">
          <div class="controls w-full">
            <label for="about_us">درباره ما :</label>

            <textarea
              class="form-control min-h-[150px]"
              id="about_us"
              v-model="form.about_us"
              rows="10"
            ></textarea>
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              name="address"
              label="آدرس"
              v-model="form.address"
              rules="min:3|required"
            />
          </div>
          <div class="controls w-1/2">
            <FormTextInput
              name="phone_number"
              label="شماره تلفن"
              v-model="form.phone_number"
              rules="numeric|min:3|required"
              class="form-control c-number"
              :ltr="true"
              @input="
                (event) =>
                  (form.phone_number = $checkNumber(event.target.value, 11))
              "
            />
            <FormInputShowError errorKey="phone_number" />
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              name="email"
              label="ایمیل"
              v-model="form.email"
              rules="min:3|required"
            />
            <span
              v-if="adminStore.errors.email"
              class="text-red-500 text-sm mt-2 block"
            >
              {{ adminStore.errors.email[0] }}
            </span>
          </div>
          <div class="controls w-1/2">
            <FormTextInput
              name="working_hours"
              label="ساعات کاری"
              v-model="form.working_hours"
              rules="min:3|required"
            />
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              name="whatsApp_support_number"
              label="شماره پشتیبانی واتساپ"
              v-model="form.whatsApp_support_number"
              rules="numeric|min:3|required"
              class="form-control c-number"
              :ltr="true"
            />
          </div>
          <div class="controls w-1/2">
            <FormTextInput
              name="telegram_supporting_number"
              label="شماره پشتیبانی تلگرام"
              v-model="form.telegram_supporting_number"
              rules="numeric|min:3|required"
              class="form-control c-number"
              :ltr="true"
            />
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              name="sms_support_number"
              label="شماره پشتیبانی پیامکی"
              v-model="form.sms_support_number"
              rules="numeric|min:3|required"
              class="form-control c-number"
              :ltr="true"
            />
          </div>
        </div>
        <div class="row">
          <div class="controls w-full">
            <label for="header_tags">اسکریپت های هدر سایت:</label>
            <textarea
              id="header_tags"
              class="form-control w-full h-32"
              style="min-height: 100px; direction: ltr"
              v-model="form.header_tags"
              rows="10"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- more settings -->
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">تنظیمات بیشتر</h4>
      </div>
      <div class="card__body">
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              name="price_percent"
              label="اعمال تغییر بروی قیمت جستجو (بدون درصد وارد شود)"
              v-model="store.price_percent"
              type="number"
            />
          </div>
        </div>
        <div class="row">
          <div class="controls w-1/4">
            <FormTextInput
              name="discord_in_point"
              type="number"
              label="اختلاف مختصات جغرافیایی"
              v-model="store.discord_in_point"
            />
          </div>
          <div class="controls w-1/4">
            <FormTextInput
              name="map_radius"
              type="number"
              label="شعاع"
              v-model="store.map_radius"
            />
          </div>
          <div class="controls w-1/4">
            <FormTextInput
              name="zoom_map"
              type="number"
              label="زوم مپ"
              v-model="store.zoom_map"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- social -->
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">شبکه های اجتماعی</h4>
        <button class="btn btn-primary" @click="store.addSocialMedia()">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
      <div class="card__body" v-if="store.socialMedias.length">
        <div class="row" v-for="social in store.socialMedias" :key="social.id">
          <div class="controls w-1/12 actions">
            <button
              class="btn btn-outline-danger"
              @click="store.removeSocialMedia(social.id)"
            >
              <i class="fa-regular fa-trash"></i>
            </button>
          </div>
          <div class="controls w-1/5">
            <FormTextInput
              v-model="social.name"
              name="name"
              label="عنوان"
              rules="min:3|required"
            />
          </div>
          <div class="controls w-1/5">
            <FormTextInput
              v-model="social.enName"
              name="enName"
              label="عنوان انگلیسی"
              rules="min:3|required"
              :ltr="true"
              class="form-control c-number"
            />
          </div>
          <div class="controls w-1/5">
            <label :for="`icon-${social.id}`">آیکون</label>
            <v-select
              v-model="social.icon"
              :id="`icon-${social.id}`"
              :reduce="(option) => option.icon"
              :options="socialMediasIcons"
              :clearable="false"
              @option:selected="changeSocial(social.icon, social.id)"
              autocomplete="off"
            >
              <template #no-options>
                <p class="text-sm opacity-60 text-center">
                  گزینه مورد نظر پیدا نشد
                </p>
              </template>
            </v-select>
          </div>
          <div class="controls w-1/5">
            <FormTextInput
              v-model="social.link"
              name="link"
              label="لینک"
              rules="min:3|required"
              :ltr="true"
            />
          </div>
          <div class="controls w-1/5">
            <FormTextInput
              v-model="social.username"
              name="link"
              label="نام کاربری"
              rules="min:3|required"
              :ltr="true"
            />
          </div>
        </div>
      </div>
      <div class="card__body" v-else>
        <p class="text-center text-stone-600 font-semibold">
          آیتمی برای نمایش وجود ندارد!
        </p>
      </div>
    </div>

    <!-- enamad -->
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">نمادهای الکترونیکی</h4>
        <button class="btn btn-primary" @click="store.add_eSymbol()">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
      <div class="card__body" v-if="store.eSymbols.length">
        <div class="row" v-for="symbol in store.eSymbols" :key="symbol.id">
          <div class="controls w-1/12 actions">
            <button
              class="btn btn-outline-danger"
              @click="store.remove_eSymbol(symbol.id)"
            >
              <i class="fa-regular fa-trash"></i>
            </button>
          </div>
          <div class="controls w-full">
            <label :for="`icon-${symbol.id}`">اسکریپت</label>
            <textarea
              :id="`icon-${symbol.id}`"
              class="form-control w-full h-32"
              style="min-height: 100px; direction: ltr"
              v-model="symbol.script"
              rows="10"
            ></textarea>
          </div>
        </div>
      </div>
      <div class="card__body" v-else>
        <p class="text-center text-stone-600 font-semibold">
          آیتمی برای نمایش وجود ندارد!
        </p>
      </div>
    </div>

    <!-- logo -->
    <div class="card">
      <div class="card__body">
        <div class="row p-4 gap-5">
          <div class="controls w-1/2 thumbnail_box">
            <button class="btn btn-primary" @click="setThumbnail('logo')">
              انتخاب لوگو
            </button>
            <div class="thumbnail relative">
              <div
                class="delete"
                @click="clearThumbnail('logo')"
                v-if="store.thumbnailDetailsLogo != null"
              >
                <i class="fa-regular fa-circle-xmark"></i>
              </div>
              <img
                v-if="store.thumbnailDetailsLogo != null"
                :src="
                  store.thumbnailDetailsLogo.meta_value.thumbnail
                    ? store.thumbnailDetailsLogo.meta_value.thumbnail.get_url
                    : store.thumbnailDetailsLogo.meta_value.main.get_url
                "
                alt=""
                loading="lazy"
                format="webp"
              />
              <img
                v-else
                src="/images/no-photo-available.png"
                alt=""
                loading="lazy"
                format="webp"
              />
            </div>
          </div>
          <div class="controls w-1/2 thumbnail_box">
            <button class="btn btn-primary" @click="setThumbnail('icon')">
              انتخاب آیکون
            </button>
            <div class="thumbnail relative">
              <div
                class="delete"
                @click="clearThumbnail('icon')"
                v-if="store.thumbnailDetailsIcon != null"
              >
                <i class="fa-regular fa-circle-xmark"></i>
              </div>
              <img
                v-if="store.thumbnailDetailsIcon != null"
                :src="
                  store.thumbnailDetailsLogo.meta_value.thumbnail
                    ? store.thumbnailDetailsLogo.meta_value.thumbnail.get_url
                    : store.thumbnailDetailsLogo.meta_value.main.get_url
                "
                alt=""
                loading="lazy"
                format="webp"
              />
              <img
                v-else
                src="/images/no-photo-available.png"
                alt=""
                loading="lazy"
                format="webp"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card__body">
        <div class="row">
          <div class="controls w-full">
            <button
              :disabled="loading"
              class="btn btn-primary w-[110px]"
              @click="doUpdate()"
            >
              <template v-if="loading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else> بروزرسانی </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section v-else>
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">درحال بارگزاری اطلاعات...</h4>
      </div>
    </div>
  </section>
  <teleport to="body">
    <transition name="translate">
      <AdminMediaMediaImportModal
        v-if="galleryPopup"
        galleryType="image"
        :justImage="true"
        :multiple="false"
        @closeModal="
          galleryPopup = false;
          indexStore.showModalFn(false);
        "
        @chooseMedia="galleryEvent"
      />
    </transition>
  </teleport>
</template>

<style lang="scss" scoped>
.controls label {
  @apply text-sm text-[#2B335E] mb-2 block;
}
.actions {
  display: flex !important;
  @apply items-end;

  button {
    @apply h-[46px] py-0;
  }
}

select {
  @apply bg-white w-full rounded-[4px];
}

.thumbnail {
  img {
    @apply rounded-md  w-[200px] h-[140px] object-cover;
  }
}

.thumbnail_box {
  @apply flex items-center rounded-md justify-between bg-[#f7f7f7] border border-[#cacfe7] py-[20px] px-3;

  input {
    @apply hidden;
  }
}

.delete {
  @apply text-red-500 bg-white absolute -top-2 -left-2 cursor-pointer h-5 w-5 flex items-center justify-center rounded-full border-black;

  i {
    @apply text-base;
  }
}

.media__body {
  @apply max-h-[400px] overflow-auto;

  &::-webkit-scrollbar {
    @apply w-1;
  }

  &::-webkit-scrollbar-track {
    @apply bg-transparent;
  }

  &::-webkit-scrollbar-thumb {
    @apply rounded-md border-[#dddddd] bg-[#666EE8];
  }
}
</style>
