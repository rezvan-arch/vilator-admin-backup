<script>
import useStore from "~/mixins/store";
import { testimonialStore } from "~/store/admin/testimonial/index";

// فرم مشترک ساخت/ویرایش نظر — new (بدون id) و edit/[id]
export default {
  setup(props) {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | نظر مشتری",
    });
    const store = testimonialStore();
    const { adminStore } = useStore();
    const route = useRoute();

    return {
      store,
      adminStore,
      route,
    };
  },
  data() {
    return {
      form: {
        name: "",
        city: "",
        text: "",
        rating: 5,
        property_code: "",
        is_active: true,
        sort: 0,
      },
      ratingOption: [5, 4, 3, 2, 1].map((v) => ({
        label: `${v} ستاره`,
        value: v,
      })),
      loading: false,
      isEdit: false,
      singleId: "",
    };
  },
  created() {
    // /testimonials/new → ساخت | /testimonials/edit/{id} → ویرایش
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
              name: res.data.name ?? "",
              city: res.data.city ?? "",
              text: res.data.text ?? "",
              rating: res.data.rating ?? 5,
              property_code: res.data.property_code ?? "",
              is_active: res.data.is_active ?? true,
              sort: res.data.sort ?? 0,
            };
          }
          this.store.loading = false;
        })
        .catch(() => {
          this.store.loading = false;
        });
    },
    async submit() {
      if (this.form.name.trim() == "") {
        this.$toast("نام مشتری وارد نشده است!", "error", 2000);
        return;
      }
      if (this.form.text.trim() == "") {
        this.$toast("متن نظر وارد نشده است!", "error", 2000);
        return;
      }
      this.loading = true;

      const payload = {
        name: this.form.name.trim(),
        city: this.form.city.trim() || null,
        text: this.form.text.trim(),
        rating: this.form.rating,
        is_active: this.form.is_active,
        sort: Number(this.form.sort) || 0,
        // کد ملک اختیاری است؛ خالی = بدون لینک ملک
        property_code: this.form.property_code.trim(),
      };

      try {
        const res = this.isEdit
          ? await this.store.update(this.singleId, payload)
          : await this.store.create(payload);

        if (res.status == "success") {
          this.$toast(
            this.isEdit ? "نظر بروزرسانی شد!" : "نظر ثبت شد!",
            "success",
            2000
          );
          this.$router.push("/testimonials");
        } else {
          this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ??
          err?.response?.data?.errors?.property_code?.[0] ??
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
  <section class="testimonial__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">
          {{ isEdit ? "ویرایش نظر" : "اضافه کردن نظر مشتری" }}
        </h4>
        <div class="heading__actions"></div>
      </div>
      <div class="card__body">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="row">
            <div class="controls w-1/2">
              <FormTextInput
                v-model="form.name"
                label="نام مشتری *"
                name="name"
                :errors="errors['نام مشتری *']"
              />
            </div>
            <div class="controls w-1/2">
              <FormTextInput
                v-model="form.city"
                label="شهر (اختیاری)"
                name="city"
                :errors="errors['شهر (اختیاری)']"
              />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <label for="testimonial__text">متن نظر *</label>
              <textarea
                id="testimonial__text"
                v-model="form.text"
                rows="4"
                class="w-full"
                maxlength="1000"
              ></textarea>
            </div>
          </div>
          <div class="row">
            <div class="controls w-1/3">
              <label for="testimonial__rating">امتیاز</label>
              <v-select
                v-model="form.rating"
                id="testimonial__rating"
                :options="ratingOption"
                :clearable="false"
                :reduce="(options) => options.value"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
            </div>
            <div class="controls w-1/3">
              <FormTextInput
                v-model="form.property_code"
                label="کد ملک (اختیاری — مثلا 628)"
                name="property_code"
                :ltr="true"
                :errors="errors['کد ملک (اختیاری — مثلا 628)']"
              />
            </div>
            <div class="controls w-1/3">
              <FormTextInput
                v-model="form.sort"
                label="ترتیب نمایش"
                name="sort"
                :ltr="true"
                :errors="errors['ترتیب نمایش']"
              />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full flex items-center gap-2">
              <input
                id="testimonial__active"
                v-model="form.is_active"
                type="checkbox"
              />
              <label for="testimonial__active">
                فعال باشد (در سایت نمایش داده شود)
              </label>
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <button
                class="btn btn-primary w-[110px]"
                :disabled="loading"
                @click="handleSubmit(submit)"
              >
                <template v-if="loading">
                  <i
                    class="fa-solid fa-spinner text-white text-xl animate-spin"
                  ></i>
                </template>
                <template v-else>
                  {{ isEdit ? "ذخیره" : "اضافه کردن" }}
                </template>
              </button>
            </div>
          </div>
        </vForm>
      </div>
    </div>
  </section>
</template>
