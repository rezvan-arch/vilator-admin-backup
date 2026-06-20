<script>
import useStore from "~~/mixins/store";
export default {
  data() {
    return {
      form: {
        title: "",
        slug: "",
        status: "active",
      },
      loading: false,
    };
  },
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ساخت گروه فیلتر ",
    });
    const { filterGroupsStore, adminStore } = useStore();

    return {
      filterGroupsStore,
      adminStore,
    };
  },
  methods: {
    addFilter() {
      if (this.form.title == "" || this.form.status == "") {
        this.$toast("لطفا تمامی موارد را پر کنید.", "error", 2000);
        return;
      }
      this.loading = true;

      this.filterGroupsStore
        .addFilterGroup(this.form)
        .then((res) => {
          if (res.status == "success") {
            this.$toast(res.message, "success", 2000);
            this.$router.push(`/filters/edit/${res.data.id}`);
            this.loading = false;
          }
        })
        .catch((err) => {
          if (this.adminStore.errors["slug"]) {
            this.$toast(this.adminStore.errors["slug"][0], "error", 5000);
          }
          this.loading = false;
        });
    },
  },
};
</script>
<template>
  <section class="group__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">اضافه کردن گروه فیلتر</h4>
      </div>
      <div class="card__body">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="row">
            <div class="controls w-1/3">
              <FormTextInput
                v-model="form.title"
                name="title"
                label="عنوان"
                rules="min:3|required"
                :errors="errors['عنوان']"
              />
              <FormInputShowError errorKey="title" />
            </div>
            <div class="controls w-1/3">
              <FormTextInput
                v-model="form.slug"
                name="slug"
                label="اسلاگ"
                rules="min:3"
                :errors="errors['اسلاگ']"
              />
              <FormInputShowError errorKey="slug" />
            </div>
            <div class="controls w-1/3">
              <label for="status">وضعیت</label>
              <v-select
                v-model="form.status"
                id="status"
                :options="[
                  {
                    label: 'فعال',
                    value: 'active',
                  },
                  {
                    label: 'غیرفعال',
                    value: 'de_active',
                  },
                ]"
                :reduce="(option) => option.value"
                :clearable="false"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="status" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <button
                class="btn btn-primary w-[120px] h-[46px]"
                @click="handleSubmit(addFilter)"
                :disabled="loading"
              >
                <template v-if="loading">
                  <i
                    class="fa-solid fa-spinner text-white text-xl animate-spin"
                  ></i>
                </template>
                <template v-else> اضافه کردن </template>
              </button>
            </div>
          </div>
        </vForm>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped></style>
