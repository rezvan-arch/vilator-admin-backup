<script>
import { landingContentStore } from "~/store/admin/landing-content/index";

// فرم مشترک ساخت/ویرایش محتوای لندینگ — new (بدون id) و edit/[id]
// لیستهای داینامیک: intro (پاراگرافها) / faqs (سوال-جواب) / links (لیبل-مسیر)
export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | محتوای لندینگ",
    });
    const store = landingContentStore();
    const route = useRoute();

    return {
      store,
      route,
    };
  },
  data() {
    return {
      form: {
        segment_key: "",
        heading: "",
        intro: [],
        faqs: [],
        links: [],
        is_active: true,
      },
      loading: false,
      isEdit: false,
      singleId: "",
    };
  },
  created() {
    // /landing-content/form/new → ساخت | /landing-content/form/{id} → ویرایش
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
              segment_key: res.data.segment_key ?? "",
              heading: res.data.heading ?? "",
              intro: (res.data.intro ?? []).map((t) => t),
              faqs: (res.data.faqs ?? []).map((f) => ({ q: f.q, a: f.a })),
              links: (res.data.links ?? []).map((l) => ({
                label: l.label,
                to: l.to,
              })),
              is_active: res.data.is_active ?? true,
            };
          }
          this.store.loading = false;
        })
        .catch(() => {
          this.store.loading = false;
        });
    },
    addIntro() {
      if (this.form.intro.length < 5) this.form.intro.push("");
    },
    removeIntro(i) {
      this.form.intro.splice(i, 1);
    },
    addFaq() {
      if (this.form.faqs.length < 8) this.form.faqs.push({ q: "", a: "" });
    },
    removeFaq(i) {
      this.form.faqs.splice(i, 1);
    },
    addLink() {
      if (this.form.links.length < 8) this.form.links.push({ label: "", to: "" });
    },
    removeLink(i) {
      this.form.links.splice(i, 1);
    },
    cleanList(list) {
      return list
        .map((item) =>
          typeof item === "string"
            ? item.trim()
            : {
                q: (item.q || "").trim(),
                a: (item.a || "").trim(),
                label: (item.label || "").trim(),
                to: (item.to || "").trim(),
              }
        )
        .filter((item) =>
          typeof item === "string" ? item !== "" : item.q !== "" || item.a !== "" || item.label !== "" || item.to !== ""
        );
    },
    async submit() {
      if (this.form.segment_key.trim() == "") {
        this.$toast("سگمنت (کلید URL) وارد نشده است!", "error", 2000);
        return;
      }
      if (this.form.heading.trim() == "") {
        this.$toast("تیتر وارد نشده است!", "error", 2000);
        return;
      }
      this.loading = true;

      const payload = {
        segment_key: this.form.segment_key.trim(),
        heading: this.form.heading.trim(),
        intro: this.cleanList(this.form.intro),
        faqs: this.cleanList(this.form.faqs),
        links: this.cleanList(this.form.links),
        is_active: this.form.is_active,
      };

      try {
        const res = this.isEdit
          ? await this.store.update(this.singleId, payload)
          : await this.store.create(payload);

        if (res.status == "success") {
          this.$toast(
            this.isEdit ? "محتوا بروزرسانی شد!" : "محتوا ثبت شد!",
            "success",
            2000
          );
          this.$router.push("/landing-content");
        } else {
          this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ??
          err?.response?.data?.errors?.segment_key?.[0] ??
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
  <section class="landing-content__form">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">
          {{ isEdit ? "ویرایش محتوای لندینگ" : "محتوای جدید لندینگ" }}
        </h4>
      </div>
      <div class="card__body">
        <div class="row">
          <div class="controls w-1/2">
            <FormTextInput
              v-model="form.segment_key"
              label="سگمنت (کلید URL) * — مثل price-na-1000000000 یا valueRange-installment_based"
              name="segment_key"
              :ltr="true"
            />
          </div>
          <div class="controls w-1/2">
            <FormTextInput
              v-model="form.heading"
              label="تیتر بلاک محتوا *"
              name="heading"
            />
          </div>
        </div>

        <!-- پاراگرافهای معرفی -->
        <div class="row">
          <div class="controls w-full">
            <div class="flex items-center justify-between mb-2">
              <label>پاراگرافهای معرفی (حداکثر ۵)</label>
              <button
                type="button"
                class="btn btn-primary py-1 px-3 text-sm"
                :disabled="form.intro.length >= 5"
                @click="addIntro()"
              >
                <i class="fa-regular fa-plus"></i> پاراگراف
              </button>
            </div>
            <div
              v-for="(p, i) in form.intro"
              :key="`intro-${i}`"
              class="flex items-start gap-2 mb-2"
            >
              <textarea v-model="form.intro[i]" rows="3" class="w-full"></textarea>
              <button
                type="button"
                class="btn btn-danger py-1 px-2"
                @click="removeIntro(i)"
                title="حذف پاراگراف"
              >
                <i class="fa-regular fa-trash"></i>
              </button>
            </div>
            <p v-if="form.intro.length == 0" class="text-xs opacity-60">
              پاراگرافی ثبت نشده — «پاراگراف» را بزنید.
            </p>
          </div>
        </div>

        <!-- سوالات متداول -->
        <div class="row">
          <div class="controls w-full">
            <div class="flex items-center justify-between mb-2">
              <label>سوالات متداول (حداکثر ۸ — با اسکیمای FAQPage)</label>
              <button
                type="button"
                class="btn btn-primary py-1 px-3 text-sm"
                :disabled="form.faqs.length >= 8"
                @click="addFaq()"
              >
                <i class="fa-regular fa-plus"></i> سوال
              </button>
            </div>
            <div
              v-for="(faq, i) in form.faqs"
              :key="`faq-${i}`"
              class="rounded-lg border border-gray-200 dark:border-baseBlack-200 p-3 mb-2"
            >
              <div class="flex items-center gap-2 mb-2">
                <input
                  v-model="faq.q"
                  type="text"
                  class="w-full"
                  placeholder="سوال"
                />
                <button
                  type="button"
                  class="btn btn-danger py-1 px-2"
                  @click="removeFaq(i)"
                  title="حذف سوال"
                >
                  <i class="fa-regular fa-trash"></i>
                </button>
              </div>
              <textarea
                v-model="faq.a"
                rows="2"
                class="w-full"
                placeholder="جواب"
              ></textarea>
            </div>
            <p v-if="form.faqs.length == 0" class="text-xs opacity-60">
              سوالاتی ثبت نشده — «سوال» را بزنید.
            </p>
          </div>
        </div>

        <!-- لینکسازی داخلی -->
        <div class="row">
          <div class="controls w-full">
            <div class="flex items-center justify-between mb-2">
              <label>لینکهای داخلی (حداکثر ۸)</label>
              <button
                type="button"
                class="btn btn-primary py-1 px-3 text-sm"
                :disabled="form.links.length >= 8"
                @click="addLink()"
              >
                <i class="fa-regular fa-plus"></i> لینک
              </button>
            </div>
            <div
              v-for="(link, i) in form.links"
              :key="`link-${i}`"
              class="flex items-center gap-2 mb-2"
            >
              <input
                v-model="link.label"
                type="text"
                class="w-1/3"
                placeholder="عنوان لینک"
              />
              <input
                v-model="link.to"
                type="text"
                dir="ltr"
                class="w-full font-mono text-xs"
                placeholder="/mag/... یا /property/..."
              />
              <button
                type="button"
                class="btn btn-danger py-1 px-2"
                @click="removeLink(i)"
                title="حذف لینک"
              >
                <i class="fa-regular fa-trash"></i>
              </button>
            </div>
            <p v-if="form.links.length == 0" class="text-xs opacity-60">
              لینکی ثبت نشده — «لینک» را بزنید.
            </p>
          </div>
        </div>

        <div class="row">
          <div class="controls w-full flex items-center gap-2">
            <input id="lc__active" v-model="form.is_active" type="checkbox" />
            <label for="lc__active">
              فعال باشد (در سایت نمایش داده شود — غیرفعال = محتوای پیشفرض کد)
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
