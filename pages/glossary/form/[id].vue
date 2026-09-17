<script>
import { glossaryStore } from "~/store/admin/glossary/index";

// فرم مشترک ساخت/ویرایش واژه واژهنامه — new (بدون id) و edit/[id]
// مقصد لینک فقط URL داخلی است؛ از پیشنهادهای گروهبندیشده هم میتوان انتخاب کرد
export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | واژهنامه لینکدهی",
    });
    const store = glossaryStore();
    const route = useRoute();

    return {
      store,
      route,
    };
  },
  data() {
    return {
      form: {
        keyword: "",
        target_url: "",
        description: "",
        category: "other",
        priority: 1,
        anchor_variants: [],
        exclude_urls: "",
        is_active: true,
      },
      categories: [
        { value: "deed", label: "سند" },
        { value: "legal", label: "حقوقی" },
        { value: "rent", label: "اجاره" },
        { value: "price", label: "قیمت/بازار" },
        { value: "feature", label: "ویژگی" },
        { value: "city", label: "شهر" },
        { value: "property_type", label: "نوع ملک" },
        { value: "construction", label: "ساخت" },
        { value: "other", label: "سایر" },
      ],
      priorities: [
        { value: 0, label: "عادی" },
        { value: 1, label: "متوسط" },
        { value: 2, label: "مهم" },
        { value: 3, label: "حیاتی" },
      ],
      suggestions: null,
      loading: false,
      isEdit: false,
      singleId: "",
    };
  },
  created() {
    // /glossary/form/new → ساخت | /glossary/form/{id} → ویرایش
    if (this.route.params.id && this.route.params.id !== "new") {
      this.isEdit = true;
      this.singleId = this.route.params.id;
      this.loadSingle();
    } else {
      // موج GSC: پیشنهادها با ?keyword=&target_url= به فرم میان (ادمین بازبینی میکند و ثبت)
      if (this.route.query.keyword) {
        this.form.keyword = String(this.route.query.keyword);
      }
      if (this.route.query.target_url) {
        this.form.target_url = String(this.route.query.target_url);
      }
    }
    this.loadSuggestions();
  },
  methods: {
    async loadSingle() {
      this.store.loading = true;
      await this.store
        .getSingle(this.singleId)
        .then((res) => {
          if (res.status == "success" && res.data) {
            this.form = {
              keyword: res.data.keyword ?? "",
              target_url: res.data.target_url ?? "",
              description: res.data.description ?? "",
              category: res.data.category ?? "other",
              priority: res.data.priority ?? 1,
              anchor_variants: (res.data.anchor_variants ?? []).map((v) => v),
              exclude_urls: (res.data.exclude_urls ?? []).join("\n"),
              is_active: res.data.is_active ?? true,
            };
          }
          this.store.loading = false;
        })
        .catch(() => {
          this.store.loading = false;
        });
    },
    async loadSuggestions() {
      try {
        this.suggestions = await this.store.getUrlSuggestions();
      } catch (err) {
        // پیشنهادها اختیاریاند — خطا فرم را نمیشکند
        this.suggestions = null;
      }
    },
    applySuggestion() {
      // select پیشنهادها فقط ورودی را پُر میکند (قابل ویرایش میماند)
      const select = this.$refs.suggestionSelect;
      if (select && select.value) {
        this.form.target_url = select.value;
        select.value = "";
      }
    },
    addVariant() {
      if (this.form.anchor_variants.length < 5) this.form.anchor_variants.push("");
    },
    removeVariant(i) {
      this.form.anchor_variants.splice(i, 1);
    },
    async submit() {
      if (this.form.keyword.trim() == "") {
        this.$toast("واژه (کلیدواژه) وارد نشده است!", "error", 2000);
        return;
      }
      if (this.form.target_url.trim() == "") {
        this.$toast("مقصد لینک وارد نشده است!", "error", 2000);
        return;
      }
      this.loading = true;

      const payload = {
        keyword: this.form.keyword.trim(),
        target_url: this.form.target_url.trim(),
        description: this.form.description.trim(),
        category: this.form.category,
        priority: Number(this.form.priority),
        anchor_variants: this.form.anchor_variants
          .map((v) => (v || "").trim())
          .filter((v) => v !== ""),
        // هر خط textarea = یک URL استثنا (مسیر جاری == آن مسیر یا زیرمسیرش → لینک نمیشود)
        exclude_urls: this.form.exclude_urls
          .split(/\n+/)
          .map((t) => t.trim())
          .filter((t) => t !== ""),
        is_active: this.form.is_active,
      };

      try {
        const res = this.isEdit
          ? await this.store.update(this.singleId, payload)
          : await this.store.create(payload);

        if (res.status == "success") {
          this.$toast(
            this.isEdit ? "واژه بروزرسانی شد!" : "واژه ثبت شد!",
            "success",
            2000
          );
          this.$router.push("/glossary");
        } else {
          this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ??
          err?.response?.data?.errors?.keyword?.[0] ??
          err?.response?.data?.errors?.target_url?.[0] ??
          err?.response?.data?.errors?.["exclude_urls.0"]?.[0] ??
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
  <section class="glossary__form">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">
          {{ isEdit ? "ویرایش واژه" : "واژه جدید واژهنامه" }}
        </h4>
      </div>
      <div class="card__body">
        <div class="row">
          <div class="controls w-1/2">
            <label>واژه (کلیدواژه) * — در متن صفحات به همین واژه لینک داده میشود</label>
            <input
              v-model="form.keyword"
              type="text"
              class="w-full"
              placeholder="مثلاً: سند تک‌برگ"
            />
          </div>
          <div class="controls w-1/2">
            <label>مقصد لینک * — فقط مسیر داخلی (با / شروع شود)</label>
            <input
              v-model="form.target_url"
              type="text"
              dir="ltr"
              class="w-full font-mono text-xs"
              placeholder="/property/type-villa/location-amol"
            />
          </div>
        </div>

        <div class="row">
          <div class="controls w-full">
            <label>انتخاب سریع مقصد از پیشنهادها (اختیاری)</label>
            <select
              ref="suggestionSelect"
              class="w-full"
              @change="applySuggestion()"
            >
              <option value="">— انتخاب کنید تا در فیلد بالا بنشیند —</option>
              <template v-if="suggestions">
                <optgroup
                  v-for="(items, group) in suggestions"
                  :key="group"
                  :label="{
                    landing_pages: 'لندینگهای فروش',
                    types: 'تایپهای ملک',
                    locations: 'شهرها',
                    articles: 'مقالات مجله',
                    construction: 'ساخت و ساز',
                    site: 'صفحات ثابت',
                  }[group] || group"
                >
                  <option v-for="(item, i) in items" :key="`${group}-${i}`" :value="item.url">
                    {{ item.title }} — {{ item.url }}
                  </option>
                </optgroup>
              </template>
            </select>
            <p class="text-xs opacity-60 mt-1">
              پیشنهادها: لندینگهای فروش ثبتشده، تایپها، شهرها، مقالات مجله، خدمات/پروژههای ساخت و صفحات ثابت
            </p>
          </div>
        </div>

        <div class="row">
          <div class="controls w-1/2">
            <label>توضیح (بهعنوان tooltip روی لینک در سایت)</label>
            <input
              v-model="form.description"
              type="text"
              class="w-full"
              placeholder="توضیح کوتاه برای نمایش در hover"
            />
          </div>
          <div class="controls w-1/4">
            <label>دسته</label>
            <select v-model="form.category" class="w-full">
              <option v-for="c in categories" :key="c.value" :value="c.value">
                {{ c.label }}
              </option>
            </select>
          </div>
          <div class="controls w-1/4">
            <label>اولویت (در رقابت واژهها، بالاتر برنده است)</label>
            <select v-model="form.priority" class="w-full">
              <option v-for="p in priorities" :key="p.value" :value="p.value">
                {{ p.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="controls w-full">
            <div class="flex items-center justify-between mb-2">
              <label>وریشنهای متن انکر (حداکثر ۵ — اختیاری)</label>
              <button
                type="button"
                class="btn btn-primary py-1 px-3 text-sm"
                :disabled="form.anchor_variants.length >= 5"
                @click="addVariant()"
              >
                <i class="fa-regular fa-plus"></i> وریشن
              </button>
            </div>
            <div
              v-for="(v, i) in form.anchor_variants"
              :key="`variant-${i}`"
              class="flex items-center gap-2 mb-2"
            >
              <input
                v-model="form.anchor_variants[i]"
                type="text"
                class="w-full"
                placeholder="متن جایگزین لینک در برخی صفحات — مثلاً: خرید ویلا در شمال"
              />
              <button
                type="button"
                class="btn btn-danger py-1 px-2"
                @click="removeVariant(i)"
                title="حذف وریشن"
              >
                <i class="fa-regular fa-trash"></i>
              </button>
            </div>
            <p v-if="form.anchor_variants.length == 0" class="text-xs opacity-60">
              ثبت نشده — لینک همیشه با متن واقعی واژه در صفحه ساخته میشود. با وریشن، هر صفحه بهطور
              پایدار یکی از این متنها را برای لینک انتخاب میکند (تنوع طبیعی سئو).
            </p>
          </div>
        </div>

        <div class="row">
          <div class="controls w-full">
            <label>صفحات استثنا (اختیاری — هر خط یک مسیر داخلی)</label>
            <textarea
              v-model="form.exclude_urls"
              dir="ltr"
              rows="3"
              class="w-full font-mono text-xs"
              placeholder="/mag/guide-buy/villa-saheli&#10;/construction/renovation"
            ></textarea>
            <p class="text-xs opacity-60 mt-1">
              این واژه در آن صفحهها و زیرصفحههایشان لینک نمیشود — مثلاً واژه «دفترخانه» را در
              خودِ مقالهی دفترخانه لینک نده. مسیر والد، همهی زیرمسیرها را هم میپوشاند
              (/construction یعنی کل بخش ساخت).
            </p>
          </div>
        </div>

        <div class="row">
          <div class="controls w-full flex items-center gap-2">
            <input id="glossary__active" v-model="form.is_active" type="checkbox" />
            <label for="glossary__active">
              فعال باشد (غیرفعال = این واژه در هیچ صفحه لینک نمیشود)
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
