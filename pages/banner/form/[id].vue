<script>
import { bannerStore } from "~/store/admin/banner/index";
import BannerPreview from "~/components/BannerPreview.vue";

// فرم مشترک ساخت/ویرایش بنر «کارت بومی» — new (بدون id) و edit/[id]
// placement = جایگاه نمایش در سایت (فعلاً: landing برای صفحات فرود /property)
export default {
  components: {
    BannerPreview,
  },
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | بنر صفحات فرود",
    });
    const store = bannerStore();
    const route = useRoute();

    return {
      store,
      route,
    };
  },
  data() {
    return {
      form: {
        placement: "landing",
        title: "",
        description: "",
        button_text: "",
        button_link: "",
        sort_order: 0,
        is_active: true,
        starts_at: "",
        ends_at: "",
      },
      loading: false,
      isEdit: false,
      singleId: "",
    };
  },
  created() {
    // /banner/form/new → ساخت | /banner/form/{id} → ویرایش
    if (this.route.params.id && this.route.params.id !== "new") {
      this.isEdit = true;
      this.singleId = this.route.params.id;
      this.loadSingle();
    }
  },
  methods: {
    async loadSingle() {
      this.store.loading = true;
      await this.store
        .getSingle(this.singleId)
        .then((res) => {
          if (res.status == "success" && res.data) {
            this.form = {
              placement: res.data.placement ?? "landing",
              title: res.data.title ?? "",
              description: res.data.description ?? "",
              button_text: res.data.button_text ?? "",
              button_link: res.data.button_link ?? "",
              sort_order: res.data.sort_order ?? 0,
              is_active: res.data.is_active ?? true,
              starts_at: res.data.starts_at ?? "",
              ends_at: res.data.ends_at ?? "",
            };
          }
          this.store.loading = false;
        })
        .catch(() => {
          this.store.loading = false;
        });
    },
    async submit() {
      if (this.form.placement.trim() == "") {
        this.$toast("جایگاه (placement) وارد نشده است!", "error", 2000);
        return;
      }
      if (this.form.title.trim() == "") {
        this.$toast("تیتر وارد نشده است!", "error", 2000);
        return;
      }
      if (this.form.starts_at && this.form.ends_at) {
        const startDate = new Date(this.form.starts_at);
        const endDate = new Date(this.form.ends_at);
        if (endDate <= startDate) {
          this.$toast("زمان پایان باید بعد از زمان شروع باشد!", "error", 2500);
          return;
        }
      }
      this.loading = true;

      const payload = {
        placement: this.form.placement.trim(),
        title: this.form.title.trim(),
        description: this.form.description.trim(),
        button_text: this.form.button_text.trim(),
        button_link: this.form.button_link.trim(),
        sort_order: Number(this.form.sort_order) || 0,
        is_active: this.form.is_active,
        starts_at: this.form.starts_at || null,
        ends_at: this.form.ends_at || null,
      };

      try {
        const res = this.isEdit
          ? await this.store.update(this.singleId, payload)
          : await this.store.create(payload);

        if (res.status == "success") {
          this.$toast(
            this.isEdit ? "بنر بروزرسانی شد!" : "بنر ثبت شد!",
            "success",
            2000
          );
          this.$router.push("/banner");
        } else {
          this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ??
          err?.response?.data?.errors?.placement?.[0] ??
          "درخواست با خطا مواجه شد!";
        this.$toast(msg, "error", 2500);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
<template>
  <section class="banner__form">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">
          {{ isEdit ? "ویرایش بنر" : "بنر جدید صفحات فرود" }}
        </h4>
      </div>
      <div class="card__body">
        <BannerPreview
          v-if="!loading"
          :placement="form.placement"
          :title="form.title"
          :description="form.description"
          :button_text="form.button_text"
          :button_link="form.button_link"
          :is_active="form.is_active"
        />

        <div class="row">
          <div class="controls w-1/2">
            <label>جایگاه (placement) *</label>
            <select v-model="form.placement" class="w-full">
              <option value="landing">landing — همه صفحات فرود /property</option>
              <option value="landing-type-villa">landing-type-villa — فقط ویلا</option>
              <option value="landing-type-apartment">landing-type-apartment — فقط آپارتمان</option>
              <option value="landing-type-house">landing-type-house — فقط خانه</option>
              <option value="landing-type-land">landing-type-land — فقط زمین</option>
              <option value="landing-type-commercial">landing-type-commercial — فقط تجاری</option>
              <option value="landing-bottom">landing-bottom — انتهای لیست نتایج (چند بنر فعال = چرخش A/B)</option>
            </select>
          </div>
          <div class="controls w-1/2">
            <FormTextInput
              v-model="form.title"
              label="تیتر کارت * — مثل: قصد فروش ملک خود را دارید؟"
              name="title"
            />
          </div>
        </div>

        <div class="row">
          <div class="controls w-full">
            <label>توضیح کارت</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full"
              placeholder="متن کوتاه زیر تیتر کارت"
            ></textarea>
          </div>
        </div>

        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              v-model="form.button_text"
              label="متن دکمه — مثل: ثبت رایگان ملک"
              name="button_text"
            />
          </div>
          <div class="controls w-1/2">
            <FormTextInput
              v-model="form.button_link"
              label="مسیر دکمه (لینک داخلی سایت)"
              name="button_link"
              :ltr="true"
            />
          </div>
        </div>

        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              v-model="form.sort_order"
              label="ترتیب نمایش (عدد کوچکتر = جلوتر — وقتی چند بنر فعال برای یک جایگاه باشد)"
              name="sort_order"
              type="number"
            />
          </div>
          <div class="controls w-1/2">
            <label>زمان شروع نمایش</label>
            <input
              v-model="form.starts_at"
              type="datetime-local"
              class="w-full"
            />
          </div>
        </div>

        <div class="row">
          <div class="controls w-1/2">
            <label>زمان پایان نمایش</label>
            <input
              v-model="form.ends_at"
              type="datetime-local"
              class="w-full"
            />
          </div>
          <div class="controls w-1/2 flex items-center gap-2">
            <input id="banner__active" v-model="form.is_active" type="checkbox" />
            <label for="banner__active">
              فعال باشد (در سایت نمایش داده شود)
            </label>
          </div>
        </div>

        <div class="row">
          <div class="controls w-full">
            <button
              class="btn btn-primary w-[110px]"
              :disabled="loading"
              @click="submit"
            >
              <template v-if="loading">
                <i class="fa-solid fa-spinner text-white text-xl animate-spin"></i>
              </template>
              <template v-else>
                {{ isEdit ? "ذخیره" : "اضافه کردن" }}
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
