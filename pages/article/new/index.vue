<script setup>
import useStore from "~~/mixins/store";
import ArticleForm from "~~/components/admin/article/ArticleForm.vue";

definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | ساخت مقاله جدید",
});

const { $toast } = useNuxtApp();
const { articleStore, adminStore } = useStore();
const router = useRouter();
const saving = ref(false);

// دریافت پیلارها برای انتخاب والد کلاستر
articleStore.getAll(1, { type: "pillar", per_page: 200 });
const pillarOptions = computed(() => articleStore.data);

const form = reactive({
  title: "",
  h1: "",
  summary: "",
  content: "",
  type: "cluster",
  hub: "buying_guide",
  parent_id: null,
  location_slug: "",
  featured_image_id: null,
  reading_time: 5,
  status: "draft",
  published_at: "",
  seo_options: {
    seo_title: "",
    seo_description: "",
    canonical_url: "",
    is_indexable: true,
  },
  location_meta: {
    average_meter_price: null,
    distance_to_tehran_km: null,
    distance_to_tehran_hours: null,
    weather_type: null,
    advantages: [],
    disadvantages: [],
    investment_score: null,
  },
});

function cleanBody() {
  let body = { ...form, seo_options: { ...form.seo_options } };
  if (body.type != "location_hub") {
    delete body.location_meta;
    delete body.location_slug;
  }
  if (body.type != "cluster") {
    delete body.parent_id;
  }
  if (body.published_at === "") {
    delete body.published_at;
  }
  body.reading_time = Number(body.reading_time) || 5;
  return body;
}

function saveArticle() {
  saving.value = true;
  articleStore
    .createArticle(cleanBody())
    .then((res) => {
      if (res.status == "success") {
        $toast("مقاله با موفقیت ثبت شد.", "success", 2000);
        router.push(`/article`);
      }
    })
    .catch((err) => {
      saving.value = false;
      var keys = Object.keys(adminStore.errors);
      if (keys.length > 0) {
        $toast(adminStore.errors[keys[0]][0], "error", 2000);
      } else {
        $toast("ثبت مقاله انجام نشد.", "error", 2000);
      }
    });
}
</script>
<template>
  <section class="projects__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">ساخت مقاله جدید</h4>
      </div>
      <div class="card__body">
        <ArticleForm
          :form="form"
          :pillarOptions="pillarOptions"
          :saving="saving"
          @submit="saveArticle"
        />
      </div>
    </div>
  </section>
</template>
