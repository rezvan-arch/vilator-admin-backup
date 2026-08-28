<script setup>
import useStore from "~~/mixins/store";
import ProjectForm from "~~/components/admin/construction/ProjectForm.vue";

definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | ویرایش پروژه",
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
  location_title: "",
  area_meters: null,
  floors: 1,
  duration_months: null,
  status: "completed",
  style: "مدرن",
  video_url: "",
  seo_options: {
    seo_title: "",
    seo_description: "",
    is_indexable: true,
  },
});

async function loadProject() {
  await constructionStore.getSingleProject(route.params.id);
  let item = constructionStore.single;
  if (!item) {
    loadingData.value = false;
    return;
  }
  form.title = item.title;
  form.h1 = item.h1 ?? "";
  form.short_description = item.short_description ?? "";
  form.content = item.content ?? "";
  form.location_title = item.location_title ?? "";
  form.area_meters = item.area_meters;
  form.floors = item.floors ?? 1;
  form.duration_months = item.duration_months ?? null;
  form.status = item.status;
  form.style = item.style ?? "مدرن";
  form.video_url = item.video_url ?? "";
  if (item.seo_options) {
    form.seo_options = {
      seo_title: item.seo_options.seo_title ?? "",
      seo_description: item.seo_options.seo_description ?? "",
      is_indexable: item.seo_options.is_indexable ?? true,
    };
  }
  loadingData.value = false;
}

loadProject();

function cleanBody() {
  let body = { ...form, seo_options: { ...form.seo_options } };
  body.h1 = body.h1 || body.title;
  body.area_meters = body.area_meters ? Number(body.area_meters) : null;
  body.floors = body.floors ? Number(body.floors) : 1;
  body.duration_months = body.duration_months
    ? Number(body.duration_months)
    : null;
  if (body.style === "") {
    delete body.style;
  }
  return body;
}

function updateProject() {
  saving.value = true;
  constructionStore
    .updateProject(route.params.id, cleanBody())
    .then((res) => {
      if (res.status == "success") {
        $toast("پروژه با موفقیت به‌روزرسانی شد.", "success", 2000);
        router.push(`/construction/projects`);
      }
    })
    .catch((err) => {
      saving.value = false;
      var keys = Object.keys(adminStore.errors);
      if (keys.length > 0) {
        $toast(adminStore.errors[keys[0]][0], "error", 2000);
      } else {
        $toast("به‌روزرسانی پروژه انجام نشد.", "error", 2000);
      }
    });
}
</script>
<template>
  <section class="projects__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">ویرایش پروژه</h4>
      </div>
      <div class="card__body">
        <div v-if="loadingData" class="empty__list">
          <p>درحال بارگذاری اطلاعات...</p>
        </div>
        <div v-else-if="!constructionStore.single" class="empty__list">
          <p>پروژه یافت نشد</p>
        </div>
        <ProjectForm
          v-else
          :form="form"
          :saving="saving"
          @submit="updateProject"
        />
      </div>
    </div>
  </section>
</template>
