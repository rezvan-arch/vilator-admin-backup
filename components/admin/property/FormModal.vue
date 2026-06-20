<script>
import useStore from "~~/mixins/store";
export default {
  data() {
    return {
      form: {
        name: "",
        mobile: "",
        status: "active",
        type: ["owner_house"],
        email: "",
        password: "",
      },
      loading: false,
    };
  },
  setup() {
    const { userStore, adminStore } = useStore();

    return {
      userStore,
      adminStore,
    };
  },
  methods: {
    addOwnerHouse() {
      if (this.form.name == "") {
        this.$toast("نام و نام خانوادگی وارد نشده است!", "error", 2000);
        return;
      }

      if (this.form.mobile == "" && this.form.email == "") {
        this.$toast("ایمیل یا شماره همراه الزامی می باشد!", "error", 2000);
        return;
      }

      if (this.form.mobile != "") {
        let phoneNumber = this.form.mobile;

        if (phoneNumber.length != "11") {
          this.$toast("شماره همراه صحیح نمی باشد!", "error", 2000);
          return;
        }
      }
      this.loading = true;

      this.userStore
        .addUser(this.form)
        .then((res) => {
          if (res.status == "success") {
            this.form = { title: "", slug: "", status: "active", group_id: "" };
            this.$emit("submitUser", {
              ...res.data,
              id: res.data.id ? res.data.id : res.data._id,
            });
            this.$toast("مالک با موفقیت اضافه شد", "success", 5000);
            this.loading = false;
          }
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        });
    },
  },
};
</script>
<template>
  <div @click.self="$emit('closeModal')" class="upload__modal">
    <div class="modal__base">
      <div class="modal__header">
        <h2>اضافه کردن مالک</h2>

        <button class="close__btn" type="button" @click="$emit('closeModal')">
          <i class="fa-regular fa-xmark"></i>
        </button>
      </div>
      <div class="modal__body">
        <vForm v-slot="{ errors, handleSubmit }" as="">
          <form @submit.prevent="handleSubmit(editTag)" autocomplete="off">
            <div class="form">
              <div class="row">
                <div class="controls w-1/2">
                  <FormTextInput
                    name="name"
                    label="نام و نام خانوادگی"
                    v-model="form.name"
                    rules="min:3|required"
                    :errors="errors['نام و نام خانوادگی']"
                  />
                  <FormInputShowError errorKey="name" />
                </div>
                <div class="controls w-1/2">
                  <FormTextInput
                    name="mobile"
                    type="text"
                    label="شماره همراه"
                    v-model="form.mobile"
                    rules="numeric|min:11|max:11"
                    :limitNumber="11"
                  />
                  <FormInputShowError errorKey="mobile" />
                </div>
              </div>
              <div class="row">
                <div class="controls w-1/2">
                  <FormTextInput
                    name="c-email"
                    type="email"
                    label="ایمیل"
                    v-model="form.email"
                  />
                  <FormInputShowError errorKey="email" />
                </div>
                <div class="controls w-1/2">
                  <FormTextInput
                    name="c-password"
                    type="password"
                    label="رمز عبور"
                    v-model="form.password"
                    rules="min:8"
                    :errors="errors['رمز عبور']"
                  />
                  <FormInputShowError errorKey="password" />
                </div>
              </div>
            </div>
            <div class="action">
              <button
                class="btn btn-success ml-2 w-[120px]"
                :disabled="form.title == '' || loading"
                @click="addOwnerHouse"
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
                :disabled="loading"
                @click="$emit('closeModal')"
              >
                انصراف
              </button>
            </div>
          </form>
        </vForm>
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
