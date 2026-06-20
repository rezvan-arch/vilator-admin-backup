<script>
import { propertyPriceStore } from "~/store/admin/price-history/index";
import useStore from "~~/mixins/store";

export default {
  setup() {
    definePageMeta({ layout: "admin" });
    useHead({
      title: "پنل مدیریت | تاریخچه قیمت ",
    });
    const store = propertyPriceStore();
    const { adminStore } = useStore();

    return {
      store,
      adminStore,
    };
  },
  data() {
    return {
      PriceAndDate: [],
      deleteDate: null,
      deleteDateConfirmDialog: false,
      updateDate: null,
      updatePrice: null,
      updateConfirmDialog: false,
      newPrice: {
        date: null,
        price: null,
      },
      option: {
        locale: "fa-IR",
        currency: "IRR",
        currencyDisplay: "hidden",
        hideCurrencySymbolOnFocus: true,
        hideGroupingSeparatorOnFocus: false,
        hideNegligibleDecimalDigitsOnFocus: true,
        autoDecimalDigits: false,
        useGrouping: true,
        accountingSign: false,
      },
      deleteConfirmDialog: false,
      loading: false,
      deleteLoading: false,
      updateLoading: false,
      trashLoading: false,
    };
  },
  created() {
    this.getLatest();
  },
  methods: {
    deletePriceHistory() {
      this.deleteConfirmDialog = false;
      this.trashLoading = true;
      this.store.deleteSingle(this.store.data.id).then((res) => {
        if (res.status == "success") {
          this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          this.$router.push(`/price-history`);
        } else {
          this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
        }
        this.store.loading = true;
        this.trashLoading = false;
      });
    },
    async getLatest() {
      this.PriceAndDate = [];
      await this.store
        .getSingle(this.$route.params.id)
        .then((res) => {
          if (res.status == "success") {
            Object.entries(res.data.property_price_value).map((data) => {
              this.PriceAndDate.push({
                date: data[0],
                price: data[1],
              });
            });

            this.store.data = res.data;
            this.store.loading = false;
          }
        })
        .catch(() => {
          this.store.loading = false;
        });
    },
    doInsertPrice() {
      if (!this.store.data.property) {
        this.$toast("ملک یافت نشد، امکان ثبت قیمت وجود ندارد!", "error", 2000);
        return;
      }

      if (this.newPrice.date == null) {
        this.$toast("تاریخ الزامی می باشند!", "error", 2000);
        return;
      }

      if (this.newPrice.price == null) {
        this.$toast("قیمت الزامی می باشند!", "error", 2000);
        return;
      }
      this.loading = true;

      this.store
        .insertSingleDatePrice({
          property_id: this.store.data.property.id,
          date: this.newPrice.date,
          price: this.newPrice.price,
        })
        .then((res) => {
          this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
          this.PriceAndDate.push({
            date: this.newPrice.date,
            price: this.newPrice.price,
          });
          this.newPrice.date = null;
          this.newPrice.price = null;
          this.loading = false;
        })
        .catch((err) => {
          if (this.adminStore.errors) {
            this.$toast(this.adminStore.errors, "error", 2000);
          }
          this.loading = false;
        });
    },
    updateDateConfirm(date, price) {
      this.updateDate = date;
      this.updatePrice = price;
      this.updateConfirmDialog = true;
    },
    doUpdatePrice() {
      if (this.updatePrice == null) {
        this.$toast("قیمت الزامی می باشند!", "error", 2000);
        return;
      }

      this.updateLoading = true;
      this.store
        .updateSingleDatePrice(this.store.data.id, {
          date: this.updateDate,
          price: this.updatePrice,
        })
        .then((res) => {
          if (res.status == "success") {
            this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
            this.PriceAndDate.forEach((item) => {
              if (item.date == this.updateDate) {
                item.price = this.updatePrice;
              }
            });

            this.updateLoading = false;
            this.updateDate = null;
            this.updatePrice = null;
            this.updateConfirmDialog = false;
          } else {
            this.updateLoading = false;
            this.updateConfirmDialog = false;
            if (this.adminStore.errors) {
              this.$toast(this.adminStore.errors, "error", 2000);
            }
          }
        })
        .catch((err) => {
          this.getLatest();
        });
    },
    deleteDateConfirm(date) {
      this.deleteDate = date;
      this.deleteDateConfirmDialog = true;
    },
    doDateDelete() {
      if (this.deleteDate != null) {
        this.deleteLoading = this.deleteDate;
        this.deleteDateConfirmDialog = false;
        this.store
          .deleteSingleDate(this.store.data.id, this.deleteDate)
          .then((res) => {
            if (res.status == "success") {
              this.$toast("درخواست با موفقیت انجام شد!", "success", 2000);
              this.PriceAndDate = this.PriceAndDate.filter(
                (item) => item.date != this.deleteLoading
              );

              this.deleteLoading = null;
              this.deleteDate = null;
            } else {
              this.$toast("درخواست با خطا مواجه شد!", "error", 2000);
              this.deleteLoading = null;
            }
          })
          .catch((err) => {
            this.getLatest();
            this.trashLoading = false;
          });
      }
    },
  },
};
</script>
<template>
  <div>
    <section class="projects__new">
      <div class="card">
        <div class="card__header">
          <h4 class="heading__title" v-if="!store.loading">
            <span v-if="store.data.property">{{
              store.data.property.title
            }}</span>
            <span v-else>مشاهده تاریخچه قیمت</span>
          </h4>
          <h4 class="heading__title" v-else>درحال دریافت اطلاعات...</h4>
          <div class="heading__actions">
            <button
              :disabled="trashLoading"
              @click="deleteConfirmDialog = true"
              class="btn btn-danger w-[155px]"
            >
              <template v-if="trashLoading">
                <i
                  class="fa-solid fa-spinner text-white text-xl animate-spin"
                ></i>
              </template>
              <template v-else>
                <i class="fa-regular fa-trash"></i>
                حذف تاریخچه قیمت
              </template>
            </button>
            <nuxt-link to="/price-history" class="btn btn-primary">
              <i class="fa-regular fa-list"></i>
              لیست تاریخچه قیمت
            </nuxt-link>
          </div>
        </div>
        <div class="card__body" v-if="!store.loading">
          <div class="row" v-if="store.data.property">
            <div class="controls w-1/4">
              <label for="name">شناسه ملک</label>
              <div class="tincolor" v-if="store.data.property.id">
                {{ store.data.property.id }}
              </div>
              <span v-else>-</span>
            </div>
            <div class="controls w-1/4">
              <label for="name">نام ملک</label>
              <nuxt-link
                :to="`/property/${store.data.property.id}`"
                v-if="store.data.property"
              >
                {{ store.data.property.title }}
              </nuxt-link>
              <span v-else>-</span>
            </div>
            <div class="controls w-1/4">
              <label for="name">نوع ملک</label>
              <div class="tincolor" v-if="store.data.property">
                <span v-if="store.data.property.type">{{
                  store.data.property.type.title
                }}</span>
                <span v-else>-</span>
              </div>
              <span v-else>-</span>
            </div>
            <div class="controls w-1/4">
              <label for="name">قیمت ملک</label>
              <div class="tincolor" v-if="store.data.property.price">
                {{ separateNumber(store.data.property.price) }}
              </div>
              <span v-else>-</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="card" v-if="!store.loading">
      <div class="row">
        <div class="controls w-2/5">
          <div class="card__header">
            <h4 class="heading__title">افزودن قیمت جدید</h4>
          </div>
          <div class="card__body">
            <div class="row">
              <div class="controls w-full">
                <label for="type">تاریخ</label>
                <datePicker
                  v-model="newPrice.date"
                  format="YYYY-MM-DD"
                  displayFormat="jYYYY/jMM/jDD"
                  simple
                />
              </div>
            </div>
            <div class="row">
              <div class="controls w-full">
                <label for="type">قیمت</label>
                <FormCurrencyInput
                  v-model="newPrice.price"
                  :options="option"
                  type="text"
                  class="form-control"
                  placeholder="قیمت"
                  inputmode="decimal"
                />
              </div>
            </div>
            <div class="row">
              <div class="controls w-full">
                <button
                  :disabled="loading"
                  class="btn btn-primary w-[110px]"
                  @click="doInsertPrice()"
                >
                  <template v-if="loading">
                    <i
                      class="fa-solid fa-spinner text-white text-xl animate-spin"
                    ></i>
                  </template>
                  <template v-else> افزودن </template>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="controls w-3/5 border-r">
          <div class="card__header">
            <h4 class="heading__title">لیست قیمت های ثبت شده</h4>
          </div>
          <div class="card__body" v-if="PriceAndDate.length">
            <table>
              <thead>
                <tr>
                  <th>تاریخ</th>
                  <th>قیمت</th>
                  <th style="text-align: left">تنظیمات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="priceItem in PriceAndDate" :key="priceItem.date">
                  <td>
                    <span v-if="priceItem.date">{{
                      convertDate(priceItem.date)
                    }}</span>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <span v-if="priceItem.price">{{
                      separateNumber(priceItem.price)
                    }}</span>
                    <span v-else>-</span>
                  </td>
                  <td class="setting">
                    <div class="actions flex justify-end">
                      <button
                        title="بروزرسانی"
                        @click="
                          updateDateConfirm(priceItem.date, priceItem.price)
                        "
                        class="edit__action"
                      >
                        <i class="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button
                        title="حذف"
                        class="delete__action"
                        @click="deleteDateConfirm(priceItem.date)"
                        :disabled="deleteLoading == priceItem.date"
                      >
                        <template v-if="deleteLoading == priceItem.date">
                          <i
                            class="fa-solid fa-spinner text-xl animate-spin"
                          ></i>
                        </template>
                        <template v-else>
                          <i class="fa-regular fa-trash"></i>
                        </template>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <AdminModalsConfirmModal
        v-if="deleteDateConfirmDialog"
        msg="آیا از حذف این تاریخ اطمینان دارید؟"
        @confirm="doDateDelete"
        @closeModal="deleteDateConfirmDialog = false"
      />
    </transition>

    <div class="fp_popup_overlay" v-if="updateConfirmDialog">
      <div class="popup_base">
        <div class="popup_heading">ویرایش قیمت</div>
        <div class="popup_body d-flex flex-col">
          <div class="row">
            <div class="controls w-full">
              <label for="type">تاریخ</label>
              <datePicker
                v-model="updateDate"
                format="YYYY-MM-DD"
                displayFormat="jYYYY/jMM/jDD"
                simple
                disabled
              />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <label for="type">قیمت</label>
              <FormCurrencyInput
                v-model="updatePrice"
                :options="option"
                type="text"
                class="form-control"
                placeholder="قیمت"
                inputmode="decimal"
              />
            </div>
          </div>
          <div class="row">
            <div class="controls w-full">
              <div style="text-align: left">
                <button
                  class="btn btn-success ml-2 w-[120px]"
                  @click="doUpdatePrice()"
                  :disabled="updateLoading"
                >
                  <template v-if="updateLoading">
                    <i
                      class="fa-solid fa-spinner text-white text-xl animate-spin"
                    ></i>
                  </template>
                  <template v-else> بروزرسانی </template>
                </button>
                <button
                  class="btn btn-elevated"
                  @click="updateConfirmDialog = false"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <transition name="fade">
    <AdminModalsConfirmModal
      v-if="deleteConfirmDialog"
      msg="آیا از حذف این تاریخچه اطمینان دارید؟"
      @confirm="deletePriceHistory()"
      @closeModal="deleteConfirmDialog = false"
    />
  </transition>
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

.check_control {
  @apply flex items-center pt-6;
}

.actions {
  @apply flex items-center gap-2;

  a,
  button {
    @apply text-base p-1;
  }

  .edit__action {
    @apply text-[#666EE8] hover:text-[#232FDE];
  }

  .see__action {
    @apply text-[#6B6F82] hover:text-[#484B58];
  }

  .delete__action {
    @apply text-[#FF4961];
  }

  .notification__action {
    @apply text-[#FF9149] hover:text-[#FC6300];
  }
}
</style>
