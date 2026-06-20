import "pinia";
import { AxiosInstance } from "axios";
import { createToastInterface } from "vue-toastification";

declare module "pinia" {
  export interface PiniaCustomProperties {
    $axios: AxiosInstance;
    $toast: createToastInterface;
  }
}
