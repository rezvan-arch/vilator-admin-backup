<script setup>
import useStore from "~~/mixins/store";
import ServiceForm from "~~/components/admin/construction/ServiceForm.vue";

definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | ساخت خدمت جدید",
});

const { $toast } = useNuxtApp();
const { constructionStore, adminStore } = useStore();
const router = useRouter();
const saving = ref(false);

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

function saveService() {
  saving.value = true;
  constructionStore
    .createService(cleanBody())
    .then((res) => {
      if (res.status == "success") {
        $toast("خدمت با موفقیت ثبت شد.", "success", 2000);
        router.push(`/construction/services`);
      }
    })
    .catch((err) => {
      saving.value = false;
      var keys = Object.keys(adminStore.errors);
      if (keys.length > 0) {
        $toast(adminStore.errors[keys[0]][0], "error", 2000);
      } else {
        $toast("ثبت خدمت انجام نشد.", "error", 2000);
      }
    });
}
</script>
<template>
  <section class="projects__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">ساخت خدمت جدید</h4>
      </div>
      <div class="card__body">
        <ServiceForm :form="form" :saving="saving" @submit="saveService" />
      </div>
    </div>
  </section>
</template>
