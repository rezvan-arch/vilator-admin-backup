import {CkeditorPlugin} from "@ckeditor/ckeditor5-vue";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Editor from "~/lib/CustomEditor";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(CkeditorPlugin);
  return {
    provide: {
      ckeditor: {
        customEditor: Editor,
        // classicEditor: ClassicEditor,
      },
    },
  };
});
