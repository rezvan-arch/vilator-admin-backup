<script setup>
// import
import Dropzone from "dropzone";
import "dropzone/dist/dropzone.css";
import useStore from "~~/mixins/store";

// data
const { mediaStore } = useStore();
const config = useRuntimeConfig();
const dropRef = ref(null);
let validFormat = [];
if (Object.keys(mediaStore.valid_format).length !== 0) {
  Object.values(mediaStore.valid_format).forEach((format) => {
    format.forEach((value) => validFormat.push(`.${value}`));
  });
}
const customPreview = `
      <div class="dz-preview dz-processing dz-image-preview dz-complete">
        <div class="dz-image">
          <img data-dz-thumbnail loading="lazy">
        </div>
        <div class="dz-details">
          <div class="dz-size"><span data-dz-size></span></div>
            <div class="dz-filename"><span data-dz-name></span></div>
          </div>
          <div class="dz-progress">
            <span class="dz-upload" data-dz-uploadprogress></span>
          </div>
          <div class="dz-error-message"><span data-dz-errormessage></span></div>
          <div class="dz-success-mark">
            <svg width="54" height="54" viewBox="0 0 54 54" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.2071 29.7929L14.2929 25.7071C14.6834 25.3166 15.3166 25.3166 15.7071 25.7071L21.2929 31.2929C21.6834 31.6834 22.3166 31.6834 22.7071 31.2929L38.2929 15.7071C38.6834 15.3166 39.3166 15.3166 39.7071 15.7071L43.7929 19.7929C44.1834 20.1834 44.1834 20.8166 43.7929 21.2071L22.7071 42.2929C22.3166 42.6834 21.6834 42.6834 21.2929 42.2929L10.2071 31.2071C9.81658 30.8166 9.81658 30.1834 10.2071 29.7929Z" />
            </svg>
          </div>
          <div class="dz-error-mark">
            <svg width="54" height="54" viewBox="0 0 54 54" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M26.2929 20.2929L19.2071 13.2071C18.8166 12.8166 18.1834 12.8166 17.7929 13.2071L13.2071 17.7929C12.8166 18.1834 12.8166 18.8166 13.2071 19.2071L20.2929 26.2929C20.6834 26.6834 20.6834 27.3166 20.2929 27.7071L13.2071 34.7929C12.8166 35.1834 12.8166 35.8166 13.2071 36.2071L17.7929 40.7929C18.1834 41.1834 18.8166 41.1834 19.2071 40.7929L26.2929 33.7071C26.6834 33.3166 27.3166 33.3166 27.7071 33.7071L34.7929 40.7929C35.1834 41.1834 35.8166 41.1834 36.2071 40.7929L40.7929 36.2071C41.1834 35.8166 41.1834 35.1834 40.7929 34.7929L33.7071 27.7071C33.3166 27.3166 33.3166 26.6834 33.7071 26.2929L40.7929 19.2071C41.1834 18.8166 41.1834 18.1834 40.7929 17.7929L36.2071 13.2071C35.8166 12.8166 35.1834 12.8166 34.7929 13.2071L27.7071 20.2929C27.3166 20.6834 26.6834 20.6834 26.2929 20.2929Z" />
          </svg>
        </div>
      </div>
    `;

// lifecycle
onMounted(() => {
  if (dropRef.value !== null) {
    new Dropzone(dropRef.value, {
      previewTemplate: customPreview,
      url: config.public.API_BASE_URL + "/api/file/store-multi/file",
      method: "POST",
      uploadMultiple: true,
      paramName: "files",
      acceptedFiles: validFormat.length > 0 ? validFormat.join(",") : "",
      headers: {
        Authorization: `Bearer ${useCookie("JWT").value}`,
      },
      previewsContainer:
        dropRef.value.parentElement.querySelector(".preview-container"),
      init: function () {
        this.on("sending", function (file, xhr, formData) {
          const type = file.type.split("/")[0];
          formData.append("type", type == "audio" ? "narration" : type);
        });
        this.on("errormultiple", function (files, response) {
          const previewList = document.querySelectorAll(".dz-preview");
          previewList.forEach((p) => {
            const fileName = p.querySelector(".dz-filename span").textContent;

            files.forEach((f) => {
              if (f.name == fileName) {
                p.querySelector(".dz-error-message span").innerText =
                  response.message || "شما قادر به اپلود این فایل نیستید";
              }
            });
          });
        });
      },
    });

    if (dropRef.value.querySelector(".dz-default")) {
      dropRef.value.querySelector(".dz-default").innerHTML = `
            <div style="display: flex; justify-content: center;">
                <i class="fa-duotone fa-cloud-arrow-up fa-beat-fade" style="--fa-primary-color: #0083e3; --fa-secondary-color: #86adca;"></i>
            </div>
            <p><strong>فایل های خود را اینجا بکشید</strong></p>
            <button class="btn btn-outline-primary p-[10px]" type="button">یا انتخاب کنید</button>
          `;
    }
  }
});
</script>
<template>
  <div class="dropzone__container">
    <div ref="dropRef" class="dropzone custom__dropzone"></div>
    <div class="dropzone preview-container"></div>
  </div>
</template>
<style lang="scss" scoped>
.dropzone__container {
  @apply w-full h-full;

  &::-webkit-scrollbar {
    @apply hidden;
  }
}
.custom__dropzone {
  border-style: dashed;
  border-width: 3px;
  padding: 20px;
}

.preview-container {
  border: none;
  min-height: 0 !important;
}
</style>
<style lang="scss">
.dropzone .dz-message {
  margin: 0 !important;
}

.dz-default {
  i {
    @apply text-[130px];
  }

  p {
    @apply text-center my-4 opacity-80;
  }

  button {
    @apply border-2 p-[10px] rounded-[5px] font-bold;
  }
}

.dropzone .dz-preview .dz-success-mark,
.dropzone .dz-preview .dz-error-mark {
  @apply left-[25%] top-[25px];

  svg {
    @apply w-7 h-7;
  }
}

.dropzone .dz-preview .dz-image {
  background: linear-gradient(to bottom, #eee, #ddd);
}

.dropzone .dz-preview.dz-success .dz-success-mark {
  background-color: #28D094;
  opacity: 1;
  -webkit-animation: slide-in 3s cubic-bezier(0.77, 0, 0.175, 1);
  -moz-animation: slide-in 3s cubic-bezier(0.77, 0, 0.175, 1);
  -ms-animation: slide-in 3s cubic-bezier(0.77, 0, 0.175, 1);
  -o-animation: slide-in 3s cubic-bezier(0.77, 0, 0.175, 1);
  animation: slide-in 3s cubic-bezier(0.77, 0, 0.175, 1);
}
</style>
