<script setup>
import useStore from "~~/mixins/store";
import ServiceForm from "~~/components/admin/construction/ServiceForm.vue";

definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | ویرایش خدمت",
});

const { $toast } = useNuxtApp();
const { constructionStore, adminStore } = useStore();
const router = useRouter();
const route = useRoute();
const saving = ref(false);
const loadingData = ref(true);

const form = reactive({
  title: "",
  h1: "",
  short_description: "",
  content: "",
  service_type: "contracting",
  packages: [],
  faqs: [],
  status: "draft",
  published_at: "",
  seo_options: {
    seo_title: "",
    seo_description: "",
    canonical_url: "",
    is_indexable: true,
  },
});

async function loadService() {
  await constructionStore.getSingleService(route.params.id);
  let item = constructionStore.single;
  if (!item) {
    loadingData.value = false;
    return;
  }
  form.title = item.title;
  form.h1 = item.h1 ?? "";
  form.short_description = item.short_description ?? "";
  form.content = item.content ?? "";
  form.service_type = item.service_type;
  form.packages = (item.packages ?? []).map((pkg) => ({
    ...pkg,
    featuresText: (pkg.features ?? []).join("\n"),
  }));
  form.faqs = (item.faqs ?? []).map((faq) => ({ ...faq }));
  form.status = item.status;
  form.published_at = item.published_at ? item.published_at.slice(0, 10) : "";
  if (item.seo_options) {
    form.seo_options = {
      seo_title: item.seo_options.seo_title ?? "",
      seo_description: item.seo_options.seo_description ?? "",
      canonical_url: item.seo_options.canonical_url ?? "",
      is_indexable: item.seo_options.is_indexable ?? true,
    };
  }
  loadingData.value = false;
}

loadService();

function cleanBody() {
  let body = { ...form, seo_options: { ...form.seo_options } };
  body.h1 = body.h1 || body.title;
  body.packages = form.packages
    .filter((pkg) => pkg.title && pkg.title.trim() != "")
    .map((pkg) => ({
      title: pkg.title.trim(),
      description: pkg.description ?? "",
      price: pkg.price ? Number(pkg.price) : null,
      features: (pkg.featuresText || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    }));
  body.faqs = form.faqs.filter(
    (faq) => faq.question && faq.question.trim() != ""
  );
  if (body.published_at === "") {
    delete body.published_at;
  }
  return body;
}

function updateService() {
  saving.value = true;
  constructionStore
    .updateService(route.params.id, cleanBody())
    .then((res) => {
      if (res.status == "success") {
        $toast("خدمت با موفقیت به‌روزرسانی شد.", "success", 2000);
        router.push(`/construction/services`);
      }
    })
    .catch((err) => {
      saving.value = false;
      var keys = Object.keys(adminStore.errors);
      if (keys.length > 0) {
        $toast(adminStore.errors[keys[0]][0], "error", 2000);
      } else {
        $toast("به‌روزرسانی خدمت انجام نشد.", "error", 2000);
      }
    });
}
</script>
<template>
  <section class="projects__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">ویرایش خدمت</h4>
      </div>
      <div class="card__body">
        <div v-if="loadingData" class="empty__list">
          <p>درحال بارگذاری اطلاعات...</p>
        </div>
        <div v-else-if="!constructionStore.single" class="empty__list">
          <p>خدمت یافت نشد</p>
        </div>
        <ServiceForm
          v-else
          :form="form"
          :saving="saving"
          @submit="updateService"
        />
      </div>
    </div>
  </section>
</template>
