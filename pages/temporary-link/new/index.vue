<script>
import useStore from "~/mixins/store";
import moment from "jalali-moment";
import "jalali-moment";
export default {
  data() {
    return {
      form: {
        title: "",
        status: "active",
        property_id: "",
        expire_count: null,
        expire_time: null,
      },
      options: [
        {
          label: "فعال",
          value: "active",
        },
        { label: "غیرفعال", value: "de_active" },
      ],
      loading: false,
      debounce: null,
      today: "",
    };
  },
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | ساخت لینک موقت جدید",
    });
    const { linkStore } = useStore();

    return {
      linkStore,
    };
  },
  methods: {
    async addLink() {
      if (this.form.property_id == "") {
        this.$toast("لطفا ملک مورد نظر را انتخاب کنید", "error", 2000);
        return;
      }
      this.loading = true;

      this.linkStore
        .addLink({ ...this.form, expire_count: Number(this.form.expire_count) })
        .then((res) => {
          if (res.status == "success") {
            this.$router.push("/temporary-link");
            this.loading = false;
          }
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    debounceSearch(data) {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.search(data);
      }, 600);
    },
    search(data) {
      this.linkStore.getPropertyList(data);
    },
  },
  computed: {
    checkDate() {
      if (this.form.expire_time == null) return this.today;

      return new Date(this.form.expire_time) < new Date(this.today)
        ? this.form.expire_time
        : this.today;
    },
  },
  mounted() {
    var d = new Date();
    this.today =
      [d.getFullYear(), d.getMonth() + 1, d.getDate()].join("-") +
      " " +
      [d.getHours(), d.getMinutes()].join(":");
  },
  beforeUnmount() {
    this.linkStore.propertyList = [];
  },
};
</script>
<template>
  <section class="type__new">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">اضافه کردن لینک</h4>
        <div class="heading__actions">
          <nuxt-link to="/temporary-link/new" class="btn btn-primary">
            <i class="fa-regular fa-plus"></i>
            لینک جدید
          </nuxt-link>
          <nuxt-link to="/temporary-link" class="btn btn-primary">
            <i class="fa-regular fa-list"></i>
            لیست
          </nuxt-link>
        </div>
      </div>
      <div class="card__body">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <div class="row">
            <div class="controls w-1/3">
              <label for="property_id">ملک</label>
              <v-select
                v-model="form.property_id"
                id="property_id"
                label="title"
                :options="linkStore.propertyList"
                :reduce="(option) => option.id"
                @search="debounceSearch"
                autocomplete="off"
              >
                <template #no-options>
                  <p class="text-sm opacity-60 text-center">
                    گزینه مورد نظر پیدا نشد
                  </p>
                </template>
              </v-select>
              <FormInputShowError errorKey="property_id" />
            </div>
            <div class="controls w-1/3">
              <FormTextInput
                v-model="form.title"
                label="عنوان"
                type="type"
                name="title"
              />
              <FormInputShowError errorKey="title" />
            </div>
            <div class="controls w-1/3">
              <label for="status">وضعیت</label>
              <v-select
                v-model="form.status"
                id="status"
                :options="options"
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
            <div class="controls w-1/3">
              <FormTextInput
                v-model="form.expire_count"
                label="تعداد استفاده"
                type="number"
                name="count"
              />
              <FormInputShowError errorKey="expire_count" />
            </div>
            <div class="controls w-1/3">
              <label for="status">تاریخ انقضاء</label>
              <input
                type="text"
                class="custom-expire_time form-control c-number"
                :value="
                  form.expire_time != null
                    ? convertDate(form.expire_time, true)
                    : ''
                "
              />
              <date-picker
                v-model="form.expire_time"
                type="datetime"
                format="YYYY-MM-DD HH:mm"
                displayFormat="jYYYY/jMM/jDD HH:mm"
                simple
                :min="checkDate"
                custom-input=".custom-expire_time"
              />

              <FormInputShowError errorKey="expire_time" />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <button
                class="btn btn-primary w-[120px] h-[46px]"
                @click="handleSubmit(addLink)"
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
<style lang="scss" scoped>
.controls label {
  @apply text-sm text-[#2B335E] mb-2 block;
}

select {
  @apply bg-white w-full rounded-[4px];
}

.controls input[type="checkbox"] {
  @apply w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 focus:ring-offset-1;
}

.thumbnail {
  img {
    @apply w-[200px] h-[140px] object-cover;
  }
}

.thumbnail_box {
  @apply flex items-center rounded-md justify-between bg-[#f7f7f7] border border-[#cacfe7] py-[20px] px-3;
}

.delete {
  @apply text-red-500 bg-white absolute -top-2 -left-2 cursor-pointer h-5 w-5 flex items-center justify-center rounded-full border-black;

  i {
    @apply text-base;
  }
}
</style>
