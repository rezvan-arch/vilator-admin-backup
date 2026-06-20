import axios from "axios";
import useStore from "~/mixins/store";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  //   create new axios instance
  const myAxios = axios.create({
    baseURL: config.public.API_BASE_URL || "https://api.vilator.com",
    headers: {
      Accept: "application/json",
    },
  });

  // get toast
  const $pinia = nuxtApp.vueApp.config.globalProperties.$pinia;
  const $router = nuxtApp.vueApp.config.globalProperties.$router;

  // check api request
  myAxios.interceptors.request.use(
    function (config) {
      const { meStore } = useStore();
      if (meStore.token) {
        config.headers.Authorization = `Bearer ${meStore.token}`;
      }
      return config;
    },
    function (err) {
      return Promise.reject(err);
    }
  );

  // check api response
  myAxios.interceptors.response.use(
    function (response) {
      return response.data;
    },
    function (err) {
      const $toast = nuxtApp.vueApp.config.globalProperties.$toast;
      const { adminStore } = useStore();

      const code = parseInt(err.response && err.response.status);
      if (!err.response) {
        // $toast("امکان اتصال به اینترنت وجود ندارد.", "info", 10000);
      } else if (code === 422) {
        // $toast("برخی از فیلدها ضروری هستند و باید حتما پر شوند.", "error");
        adminStore.errors = err.response.data.message;
      } else if (code === 401) {
        const url = err.request.responseURL.split("/");
        if (url[url.length - 1] != "login") {
          $toast("لطفا وارد حساب کاربری خود شوید", "error");
          $cookies.remove("JWT");
          $router.push("/auth");
        }
      } else if (code === 404) {
        $toast(
          "صفحه درخواستی شما وجود ندارد، لطفا مجددا تلاش نمایید .",
          "error"
        );
      } else if (code === 500) {
        $toast(
          "خطایی غیر منتظره‌ای رخ داده است، لطفا دقایقی دیگر مجددا امتحان نمایید .",
          "error"
        );
      }
      if (code === 400 && err.errors) {
        for (let index = 0; index < err.errors.length; index++) {
          $toast(err.errors[index].message, "error");
        }
      }

      if (err.response && err.response.data) {
        return Promise.reject(err.response.data);
      }
      return Promise.reject(err);
    }
  );

  nuxtApp.vueApp.config.globalProperties.$axios = myAxios;
  nuxtApp.provide("axios", myAxios);
  $pinia.use(({ store }) => {
    store.$axios = myAxios;
  });
});
