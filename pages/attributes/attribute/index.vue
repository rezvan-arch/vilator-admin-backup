<script setup>
import useStore from "~/mixins/store";
import ConfirmModal from "~~/components/admin/modals/ConfirmModal.vue";
definePageMeta({ layout: "admin" });
useHead({
  title: "پنل مدیریت | مشخصه ها ",
});

const { attributeStore } = useStore();
const route = useRoute();
const router = useRouter();
const currentPage = ref(1);
const trashConfirm = ref(false);
const loading = ref(null);
const { $toast } = useNuxtApp();

if (route.query.page) {
  currentPage.value = route.query.page;
}

attributeStore.getAttributes(currentPage.value);

function pagination(page = 1) {
  if (currentPage.value != page) {
    router.push({ query: { page } });
    currentPage.value = page;
    attributeStore.getAttributes(page);
  }
}

function trashAttrConfirm(attrId) {
  attributeStore.actionAttrId = attrId;
  trashConfirm.value = true;
}

function trashAttribute() {
  if (attributeStore.actionAttrId != "") {
    trashConfirm.value = false;
    loading.value = attributeStore.actionAttrId;
    attributeStore
      .trashAttribute()
      .then((res) => {
        $toast("درخواست شما با موفقیت انجام شد", "success", 2000);
        attributeStore.attributes = attributeStore.attributes.filter(
          (item) => item.id != attributeStore.actionAttrId
        );
        attributeStore.actionAttrId = "";
        loading.value = null;
      })
      .catch((err) => {
        attributeStore.actionAttrId = "";
        loading.value = null;
        $toast(err.message, "error", 2000);
      });
  }
}

function checkTag(tag) {
  let val;
  switch (tag) {
    case "input":
      val = "اینپوت (input)";
      break;
    case "checkbox":
      val = "اینپوت چند انتخابی (checkbox)";
      break;
    case "radio":
      val = "دکمه رادیویی (Radio button)";
      break;
    case "select":
      val = "لیست کشویی (select)";
      break;
  }
  return val;
}
</script>
<template>
  <section class="properties__list">
    <div class="card">
      <div class="card__header">
        <h4 class="heading__title">لیست مشخصه ها</h4>
        <div class="heading__actions">
          <nuxt-link
            to="/attributes/attribute/new"
            class="btn btn-primary"
          >
            <i class="fa-regular fa-plus"></i>
            مشخصه جدید
          </nuxt-link>
          <nuxt-link
            to="/attributes/attribute/trash"
            class="btn btn-danger"
          >
            <i class="fa-regular fa-trash"></i>
            سطل زباله
          </nuxt-link>
        </div>
      </div>
      <div class="card__body table">
        <div v-if="!attributeStore.loading">
          <div v-if="attributeStore.attributes.length > 0">
            <table v-if="attributeStore.attributes.length > 0">
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>اسلاگ</th>
                  <th>گروه مشخصه</th>
                  <th>نوع مشخصه</th>
                  <th>وضعیت</th>
                  <th>تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in attributeStore.attributes"
                  :key="index"
                >
                  <td>{{ item.title }}</td>
                  <td>
                    {{ item.slug }}
                  </td>
                  <td>
                    <template v-if="item.attribute_group.length != 0">
                      {{
                        item.attribute_group.map((item) => item.title).join(",")
                      }}
                    </template>
                    <template v-else> - </template>
                  </td>
                  <td>
                    <template v-if="item.item_styles != null">
                      {{ checkTag(item.item_styles.tag) }}
                    </template>
                    <template v-else> - </template>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <span
                        v-if="item.status == 'active'"
                        class="badge badge-pill badge-success"
                      >
                        فعال
                      </span>
                      <span v-else class="badge badge-pill badge-primary">
                        غیر فعال
                      </span>
                    </div>
                  </td>
                  <td class="setting">
                    <div class="actions">
                      <nuxt-link
                        :to="`/attributes/attribute/edit/${item.id}`"
                        class="edit__action"
                      >
                        <i class="fa-regular fa-pen-to-square"></i>
                      </nuxt-link>
                      <button
                        class="delete__action"
                        @click="trashAttrConfirm(item.id)"
                        :disabled="loading == item.id"
                      >
                        <template v-if="loading == item.id">
                          <i
                            class="fa-solid fa-spinner text-xl animate-spin"
                          ></i>
                        </template>
                        <template v-else>
                          <i class="fa-regular fa-trash"></i
                        ></template>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <AdminPagination
              v-if="
                attributeStore.pagination &&
                attributeStore.pagination.last_page > 1
              "
              @onChange="pagination"
              :currentPage="currentPage"
              :lastPage="attributeStore.pagination.last_page"
            />
          </div>
          <div v-else class="empty__list">
            <p>موردی برای نمایش وجود ندارد</p>
          </div>
        </div>
        <div v-else class="empty__list">
          <p>درحال بارگذاری اطلاعات...</p>
        </div>
      </div>
    </div>
  </section>

  <ConfirmModal
    v-if="trashConfirm"
    msg="آیا از انتقال این مشخصه به سطل زباله اطمینان دارید؟"
    @confirm="trashAttribute"
    @closeModal="trashConfirm = false"
  />
</template>
<style lang="scss" scoped>
.filter__box .card__body {
  @apply flex items-center justify-between;
}
</style>
