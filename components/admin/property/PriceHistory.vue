<script>
import { propertyPriceStore } from "~/store/admin/price-history/index";
import { adminStore } from "~/store/admin/index";
import CurrencyInput from "~/components/form/CurrencyInput.vue";
export default {
  components: {
    CurrencyInput,
  },
  props: ["id"],
  data() {
    return {
      form: {
        price: null,
        date: "",
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
      isUpdate: false,
    };
  },
  setup(props) {
    const store = propertyPriceStore();
    const aStore = adminStore();
    const history = reactive(new Array());
    const recordId = ref("");

    store.getSingleByProperty(props.id).then((res) => {
      if (res.status == "success") {
        recordId.value = res.data.id;
        const key = Object.keys(res.data.property_price_value);
        const value = Object.values(res.data.property_price_value);

        key.forEach((item, index) => {
          history.push({
            price: value[index],
            date: key[index],
          });
        });
      }
    });

    return {
      store,
      aStore,
      history,
      recordId,
    };
  },
  computed: {
    sortHistory() {
      return this.history.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    },
  },
  methods: {
    async submitPrice() {
      if (this.form.date != "" && this.price != "") {
        this.history.push({
          price: this.form.price,
          date: this.form.date,
        });

        await this.store
          .insertSingleDatePrice({
            property_id: this.id,
            price: this.form.price,
            date: this.form.date,
          })
          .then((res) => {
            if (res.status == "success") {
              this.$toast(
                "قیمت مورد نظر با موفقیت اضافه شد",
                "success",
                5000
              );

              this.form.price = "";
              this.form.date = "";
            }
            this.store.loading = false;
          })
          .catch((err) => {
            this.$toast(this.aStore.errors, "error", 5000);
            this.store.loading = false;
          });
      }
    },
    separate(number) {
      number = String(number).replace(/\D/g, "");
      if (number > 16) number = +String(number).slice(0, 16);
      number += "";
      let x = number.split(".");
      let y = x[0];
      let z = x.length > 1 ? "." + x[1] : "";
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(y)) y = y.replace(rgx, "$1" + "," + "$2");

      return y + z;
    },
    updatePrice(item) {
      this.isUpdate = true;
      this.form.date = item.date;
      this.form.price = item.price;
    },
    cancelUpdate() {
      this.isUpdate = false;
      this.form.date = "";
      this.form.price = "";
    },
    async update() {
      await this.store
        .updateSingleDatePrice(this.recordId, {
          price: this.form.price,
          date: this.form.date,
        })
        .then((res) => {
          if (res.status == "success") {
            this.$toast(
              "قیمت مورد نظر با موفقیت ویرایش شد",
              "success",
              5000
            );
            this.history.forEach((item) => {
              if (this.form.date == item.date) {
                item.price = this.form.price;
              }
            });

            this.form.price = "";
            this.form.date = "";
          }

          this.isUpdate = false;
          this.store.loading = false;
        })
        .catch((err) => {
          this.store.loading = false;
        });
    },
  },
};
</script>
<template>
  <div class="price__history">
    <div class="modal__content">
      <div class="modal">
        <div class="modal__header">
          <h3>تاریخچه قیمت</h3>
          <button class="modal__btn__close" @click="$emit('closeModal')">
            <i class="fa-regular fa-xmark"></i>
          </button>
        </div>
        <div class="price__box">
          <div class="row">
            <div class="controls" :class="[isUpdate ? 'w-2/6' : 'w-2/5']">
              <label for="production_date">تاریخ</label>
              <date-picker
                v-model="form.date"
                format="YYYY-MM-DD"
                displayFormat="jYYYY/jMM/jDD"
                simple
                :disabled="isUpdate"
              />
            </div>
            <div class="controls" :class="[isUpdate ? 'w-2/6' : 'w-2/5']">
              <label for="price">قیمت</label>
              <CurrencyInput
                v-model="form.price"
                :placeholder="''"
                :options="option"
                class="form-control c-number"
              />
            </div>
            <div
              class="controls submit"
              :class="[isUpdate ? 'w-2/6' : 'w-1/5']"
            >
              <template v-if="!isUpdate">
                <button class="btn btn-primary" @click="submitPrice">
                  ثبت
                </button>
              </template>
              <template v-else>
                <button class="btn btn-success" @click="update">ویرایش</button>
                <button class="btn btn-danger" @click="cancelUpdate">
                  انصراف
                </button>
              </template>
            </div>
          </div>
        </div>
        <div v-if="!store.loading" class="px-2">
          <div v-if="history.length > 0" class="modal__table">
            <table>
              <thead>
                <tr>
                  <th>تاریخ</th>
                  <th>قیمت</th>
                  <th class="px-5">آپدیت</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in sortHistory"
                  :key="index"
                  :class="{ edit: isUpdate && item.date == form.date }"
                >
                  <td>{{ convertDate(item.date) }}</td>
                  <td>{{ separateNumber(item.price) }}</td>
                  <th>
                    <button
                      class="text-[#666EE8] hover:text-[#232FDE]"
                      @click="updatePrice(item)"
                    >
                      <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                  </th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else>
          <div class="modal__table">
            <div>درحال بارگذاری...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.price__history {
  @apply fixed top-0 left-0 w-full h-full bg-transparent lg:flex items-end 2sm:items-center justify-center z-[150] transition-all duration-300 ease-in-out;

  .modal__content {
    @apply flex bg-white min-w-full 2sm:min-w-[785px] rounded-t-lg 2sm:rounded-lg transition-all duration-300 ease-in-out;

    .modal {
      @apply w-full;
      .modal__header {
        @apply flex items-center justify-between mb-5 px-3 2sm:px-6 pt-5;

        h3 {
          @apply font-semibold text-xl;
        }

        button {
          @apply h-8 w-8 border border-[#dde2ed] rounded-md px-3 flex items-center text-xs text-[#708097];
        }
      }

      .modal__info {
        @apply px-3 2sm:px-6 mb-7;

        p {
          @apply text-sm text-[#9A9B9D];
        }
      }

      .price__box {
        @apply w-full mb-6 px-3 2sm:px-6;

        .row {
          @apply gap-4;
        }

        .controls {
          @apply px-0;
        }

        .controls label {
          @apply text-sm text-[#2B335E] mb-2 block;
        }

        .controls.submit {
          display: flex !important;
          @apply gap-2;

          button {
            @apply w-full h-[46px] py-0 mt-auto;
          }
        }
      }

      .modal__table {
        @apply mt-2 px-4 mb-5 max-h-[300px] overflow-auto;

        h3 {
          @apply text-center;
        }

        table {
          @apply w-full mt-1;

          &,
          th,
          td {
            @apply border border-[#E3EBF3] border-collapse;
          }

          th,
          td {
            @apply w-1/2 text-center py-2;
          }

          tr {
            @apply even:bg-[#dbeaff80];

            &.edit {
              @apply bg-[#ff92497b];
            }
          }

          .scroll {
            @apply w-full max-h-[300px] overflow-auto;
          }
        }

        &::-webkit-scrollbar {
          @apply w-1;
        }

        &::-webkit-scrollbar-track {
          @apply bg-transparent;
        }

        &::-webkit-scrollbar-thumb {
          @apply rounded-md border-[#dddddd] bg-[#666EE8];
        }
      }
    }
  }
}
</style>
