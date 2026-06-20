<script>
import useStore from "~~/mixins/store";
export default {
  props: ["edit"],
  data() {
    return {
      form: {
        title: "",
        slug: "",
        status: "active",
      },
      loading: false,
      editModal: false,
      statusOptions: [
        {
          label: "فعال",
          value: "active",
        },
        {
          label: "غیرفعال",
          value: "de_active",
        },
      ],
    };
  },
  setup() {
    const { tagGroupStore, adminStore } = useStore();

    return {
      tagGroupStore,
      adminStore,
    };
  },
  methods: {
    addGroup() {
      if (this.form.title == "") {
        this.$toast("لطفا تمامی موارد را وارد کنید", "error", 5000);
        return;
      }
      this.loading = true;

      this.tagGroupStore
        .addNewGroup(this.form)
        .then((res) => {
          if (res.status == "success") {
            this.form = { title: "", slug: "", status: "active" };
            this.$emit("closeModal");
            this.$toast("گروه تگ با موفقیت اضافه شد", "success", 5000);
            this.loading = false;
          }
        })
        .catch((err) => {
          var keys = Object.keys(this.adminStore.errors);
          this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          this.loading = false;
        });
    },
    editGroup() {
      if (this.form.title == "") {
        this.$toast("لطفا عنوان را وارد کنید", "error", 5000);
        return;
      }
      this.loading = true;

      this.tagGroupStore
        .editGroup(this.form)
        .then((res) => {
          if (res.status == "success") {
            this.form = { title: "", slug: "", status: "active" };
            this.$emit("closeModal");
            this.$toast("گروه تگ با موفقیت ویرایش شد", "success", 5000);
            this.loading = false;
          }
        })
        .catch((err) => {
          var keys = Object.keys(this.adminStore.errors);
          this.$toast(this.adminStore.errors[keys[0]][0], "error", 2000);
          this.loading = false;
        });
    },
  },
  created() {
    if (this.edit != null) {
      this.editModal = true;
      this.form = JSON.parse(JSON.stringify(this.edit));
    }
  },
};
</script>
<template>
  <div @click.self="$emit('closeModal')" class="upload__modal">
    <div class="modal__base">
      <div class="modal__header">
        <h2 v-if="editModal">ویرایش گروه تگ</h2>
        <h2 v-else>اضافه کردن گروه تگ</h2>

        <button class="close__btn" type="button" @click="$emit('closeModal')">
          <i class="fa-regular fa-xmark"></i>
        </button>
      </div>
      <div class="modal__body">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <form @submit.prevent="handleSubmit(editGroup)">
            <div class="form">
              <div class="row">
                <div class="controls w-1/2">
                  <FormTextInput
                    v-model="form.title"
                    name="link"
                    label="عنوان"
                    rules="min:3|required"
                    :errors="errors['عنوان']"
                  />
                  <FormInputShowError errorKey="title" />
                </div>
                <div class="controls w-1/2">
                  <FormTextInput
                    v-model="form.slug"
                    name="slug"
                    label="اسلاگ"
                    rules="min:3"
                    :errors="errors['اسلاگ']"
                  />
                  <FormInputShowError errorKey="slug" />
                </div>
              </div>
              <div class="row">
                <div class="controls w-1/2">
                  <label for="status">وضعیت</label>
                  <v-select
                    v-model="form.status"
                    :reduce="(option) => option.value"
                    id="status"
                    :options="statusOptions"
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
            </div>
            <div class="action">
              <button
                v-if="editModal"
                class="btn btn-success ml-2 w-[120px]"
                :disabled="form.title == '' || loading"
                type="submit"
              >
                <template v-if="loading">
                  <i
                    class="fa-solid fa-spinner text-white text-xl animate-spin"
                  ></i>
                </template>
                <template v-else> ویرایش </template>
              </button>
              <button
                v-else
                class="btn btn-success ml-2 w-[120px]"
                :disabled="form.title == '' || loading"
                @click="addGroup"
              >
                <template v-if="loading">
                  <i
                    class="fa-solid fa-spinner text-white text-xl animate-spin"
                  ></i>
                </template>
                <template v-else> اضافه کردن </template>
              </button>
              <button
                class="btn btn-elevated"
                type="button"
                :disabled="loading"
                @click="$emit('closeModal')"
              >
                انصراف
              </button>
            </div>
          </form></vForm
        >
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.upload__modal {
  @apply fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center;

  .modal__base {
    box-shadow: 0 2px 18px 1px rgb(49 53 72 / 10%);
    @apply rounded-lg bg-white w-[600px] overflow-hidden;

    .modal__header {
      @apply flex py-[10px] px-4  relative border-b bg-gray-200;

      h2 {
        @apply text-base font-bold py-1;
      }
      button {
        @apply absolute left-2 top-2 h-6 w-6 border border-[#a6aab4] rounded-md px-2 flex items-center text-xs text-black;
      }
    }

    .form {
      @apply py-4;
    }

    .action {
      @apply pt-3 pb-4 px-4 flex items-center justify-end gap-2 border-t;

      button {
        @apply h-[38px] py-0 disabled:opacity-75 flex items-center justify-center;
      }
    }
  }
}
</style>
