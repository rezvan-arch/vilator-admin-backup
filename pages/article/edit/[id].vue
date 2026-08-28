<script setup>
import useStore from "~~/mixins/store";
import ArticleForm from "~~/components/admin/article/ArticleForm.vue";

definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | ویرایش مقاله",
});

const { $toast } = useNuxtApp();
const { articleStore, adminStore } = useStore();
const router = useRouter();
const route = useRoute();
const saving = ref(false);
const loadingData = ref(true);

const form = reactive({
  title: "",
  h1: "",
  full_slug: "",
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

async function loadArticle() {
  await articleStore.getSingle(route.params.id);
  let item = articleStore.single;
  if (!item) {
    loadingData.value = false;
    return;
  }
  form.title = item.title;
  form.h1 = item.h1;
  form.full_slug = item.full_slug ?? "";
  form.summary = item.summary ?? "";
  form.content = item.content ?? "";
  form.type = item.type;
  form.hub = item.hub;
  form.parent_id = item.parent_id;
  form.location_slug = item.location_slug ?? "";
  form.featured_image_id = item.featured_image?.id ?? null;
  form.reading_time = item.reading_time ?? 5;
  form.status = item.status;
  form.published_at = item.published_at
    ? item.published_at.slice(0, 10)
    : "";
  if (item.seo_options) {
    form.seo_options = {
      seo_title: item.seo_options.seo_title ?? "",
      seo_description: item.seo_options.seo_description ?? "",
      canonical_url: item.seo_options.canonical_url ?? "",
      is_indexable: item.seo_options.is_indexable ?? true,
    };
  }
  if (item.location_meta) {
    form.location_meta = {
      average_meter_price: item.location_meta.average_meter_price ?? null,
      distance_to_tehran_km: item.location_meta.distance_to_tehran_km ?? null,
      distance_to_tehran_hours:
        item.location_meta.distance_to_tehran_hours ?? null,
      weather_type: item.location_meta.weather_type ?? null,
      advantages: item.location_meta.advantages ?? [],
      disadvantages: item.location_meta.disadvantages ?? [],
      investment_score: item.location_meta.investment_score ?? null,
    };
  }
  loadingData.value = false;
}

loadArticle();

// دریافت پیلارها برای انتخاب والد کلاستر
articleStore.getAll(1, { type: "pillar", per_page: 200 });
const pillarOptions = computed(() => articleStore.data);

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

function updateArticle() {
  saving.value = true;
  articleStore
    .updateArticle(route.params.id, cleanBody())
    .then((res) => {
      if (res.status == "success") {
        $toast("مقاله با موفقیت به‌روزرسانی شد.", "success", 2000);
        router.push(`/article`);
      }
    })
    .catch((err) => {
      saving.value = false;
      var keys = Object.keys(adminStore.errors);
      if (keys.length > 0) {
        $toast(adminStore.errors[keys[0]][0], "error", 2000);
      } else {
        $toast("به‌روزرسانی مقاله انجام نشد.", "error", 2000);
      }
    });
}
</script>
<template>
  <section class="projects__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">ویرایش مقاله</h4>
      </div>
      <div class="card__body">
        <div v-if="loadingData" class="empty__list">
          <p>درحال بارگذاری اطلاعات...</p>
        </div>
        <div v-else-if="!articleStore.single" class="empty__list">
          <p>مقاله یافت نشد</p>
        </div>
        <ArticleForm
          v-else
          :form="form"
          :pillarOptions="pillarOptions"
          :saving="saving"
          @submit="updateArticle"
        />
      </div>
    </div>
  </section>
</template>
