<script setup>
import useStore from "~~/mixins/store";
import ProjectForm from "~~/components/admin/construction/ProjectForm.vue";

definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | ساخت پروژه جدید",
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

function saveProject() {
  saving.value = true;
  constructionStore
    .createProject(cleanBody())
    .then((res) => {
      if (res.status == "success") {
        $toast("پروژه با موفقیت ثبت شد.", "success", 2000);
        router.push(`/construction/projects`);
      }
    })
    .catch((err) => {
      saving.value = false;
      var keys = Object.keys(adminStore.errors);
      if (keys.length > 0) {
        $toast(adminStore.errors[keys[0]][0], "error", 2000);
      } else {
        $toast("ثبت پروژه انجام نشد.", "error", 2000);
      }
    });
}
</script>
<template>
  <section class="projects__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">ساخت پروژه جدید</h4>
      </div>
      <div class="card__body">
        <ProjectForm :form="form" :saving="saving" @submit="saveProject" />
      </div>
    </div>
  </section>
</template>
