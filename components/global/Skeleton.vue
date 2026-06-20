<script>
export default {
  props: ["type"],
  data() {
    return {

    };
  },
  methods: {

  },
};
</script>

<template>
  <div v-if="type == 'property-box'" class="list__item">
    <div class="item__img">
      <div class="w-full h-64 bg-slate-200 dark:bg-[#3b3f4a] rounded-md animate-basePulse"></div>
    </div>
    <div class="item__body">
      <div class="body__header mb-5">
        <div class="row">
          <h3 class="w-32 h-5 bg-slate-200 dark:bg-[#3b3f4a] rounded-md animate-basePulse"></h3>
          <p class="w-32 h-5 bg-slate-200 dark:bg-[#3b3f4a] rounded-md animate-basePulse"></p>
        </div>
        <div class="row">
          <div class="item__location">
            <div
              class="w-32 h-5 bg-slate-200 dark:bg-[#3b3f4a] rounded-md animate-basePulse"
            ></div>
          </div>
        </div>
        <div class="row">
          <div
            class="w-32 h-5 bg-slate-200 dark:bg-[#3b3f4a] rounded-md animate-basePulse"
          ></div>
        </div>
      </div>
      <div class="row">
        <div class="item__specifications">
          <div class="item__rooms">
            <div
              class="w-10 h-5 bg-slate-200 dark:bg-[#3b3f4a] rounded-md animate-basePulse"
            ></div>
          </div>
          <div class="item__earth">
            <div
              class="w-10 h-5 bg-slate-200 dark:bg-[#3b3f4a] rounded-md animate-basePulse"
            ></div>
          </div>
          <div class="item__building">
            <div
              class="w-10 h-5 bg-slate-200 dark:bg-[#3b3f4a] rounded-md animate-basePulse"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="type == 'property-list'" class="list__list__item">
    <div class="item__img">
      <button class="option__bookmark">
        <i class="fa-regular fa-bookmark"></i>
      </button>
      <div class="thumbnail-skeleton" style="border-radius: 5px;"></div>
      <div class="swiper-pagination similar-gallery-pagination"></div>
    </div>
    <div class="item__body">
      <div class="body__header">
        <div class="row">
          <nuxt-link class="item__name">
            <h3 class="w-64 h-5 bg-slate-200 dark:bg-[#23262F] dark:bg-[#23262F]" style="border-radius: 5px;"></h3>
          </nuxt-link>
          <div class="item__price mobile">
            <h3 class="w-64 h-5 bg-slate-200 dark:bg-[#23262F]" style="border-radius: 5px;"></h3>
          </div>
        </div>
        <div class="row">
          <div class="item__price">
            <h3 class="w-52 h-5 bg-slate-200 dark:bg-[#23262F]" style="border-radius: 5px;"></h3>
          </div>
        </div>
        <div class="row">
          <h3 class="w-32 h-5 bg-slate-200 dark:bg-[#23262F]" style="border-radius: 5px;"></h3>
        </div>
      </div>
      <div class="row">
        <div class="row gap-1">
          <div class="item__rooms">
            <div class="w-14 h-5 bg-slate-200 dark:bg-[#23262F]" style="border-radius: 5px;"></div>
          </div>
          <div class="item__earth">
            <div class="w-14 h-5 bg-slate-200 dark:bg-[#23262F]" style="border-radius: 5px;"></div>
          </div>
          <div class="item__building">
            <div class="w-14 h-5 bg-slate-200 dark:bg-[#23262F]" style="border-radius: 5px;"></div>
          </div>
        </div>
        <nuxt-link class="w-24 h-11 bg-slate-200 dark:bg-[#23262F]" style="border-radius: 25px;"></nuxt-link>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.list__item {
  @apply z-20 rounded-md overflow-hidden flex-col p-0 justify-between w-full border border-[#dde2ed] dark:border-[#353945] bg-white dark:bg-[#23262F];
  
  .item__img {
    @apply overflow-hidden w-full h-auto;
  }

  .item__body {
    @apply grow px-4 pt-5 pb-7;

    .body__header {
      @apply w-full;
    }

    .row {
      @apply first:mb-3 mb-4 last:mb-0 flex items-center justify-between;

      .item__name {
        @apply text-black dark:text-white text-base lg:text-lg font-semibold transition-colors duration-300 ease-in-out;

        &:hover {
          @apply text-baseBlue-500 dark:text-baseBlue-500;
        }
      }

      .option__bookmark {
        @apply z-10 w-8 h-8 rounded-md dark:text-white bg-white dark:bg-[#23262F] bg-opacity-50 flex items-center justify-center border border-white dark:border-[#353945] transition-colors duration-300 ease-in-out;

        &:hover {
          @apply bg-opacity-100 text-baseBlue-500;
        }
      }

      .item__price {
        @apply block text-lg font-bold text-baseBlue-500;

        span {
          @apply text-sm text-[#687389] dark:text-[#777E90] font-medium;
        }
      }

      .item__location {
        @apply text-[#687389] dark:text-[#777E90] text-sm lg:text-base;

        i {
          @apply align-middle ml-1;
        }
      }

      .item__specifications {
        @apply flex items-center gap-3;

        .item__rooms,
        .item__earth,
        .item__building {
          @apply text-xs 1lg:text-sm font-semibold text-black dark:text-white;

          i {
            @apply text-[#687389] dark:text-[#777E90] align-middle ml-1;
          }
        }
      }
    }
  }
}

.list__list__item {
  @apply max-w-[340px] lg:max-w-none z-20 rounded-md overflow-hidden flex flex-col lg:flex-row lg:gap-7 lg:py-5 lg:pr-4 lg:pl-6 w-full border border-[#ECEDF1] dark:border-[#353945] bg-white dark:bg-[#1d1f25];
  .item__img {
    @apply h-auto w-full lg:w-[230px] 2xl:w-[280px] overflow-hidden relative;

    .similar-gallery-swiper {
      @apply h-full;
    }

    .thumbnail-skeleton {
      @apply w-full h-40 bg-slate-200 dark:bg-[#23262F]
    }

    img {
      @apply w-full h-full object-contain rounded-t-md lg:rounded-md;
    }

    .swiper-pagination-bullet {
      @apply bg-white opacity-40;
    }

    .swiper-pagination-bullet-active {
      @apply opacity-100;
    }

    .swiper-pagination {
      @apply text-center lg:text-right bottom-[14px] px-4;
    }

    .similar-gallery-swiper-next,
    .similar-gallery-swiper-prev {
      width: 28px !important;
      height: 28px !important;
      color: white !important;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      border: 2px solid #fff;
      top: 55% !important;

      &::after {
        content: "" !important;
      }
    }

    .swiper-swiper-next {
      @apply left-4;
    }

    .swiper-swiper-prev {
      @apply left-4;
    }

    .swiper-button-disabled {
      transform: scale(1) !important;
    }

    .option__special {
      @apply absolute top-[18px] right-4 z-10 rounded-full bg-white dark:bg-[#23262F] border border-white dark:border-[#353945] px-2 py-1 text-xs text-[#242424] dark:text-white;

      i {
        @apply align-middle text-base ml-1 text-baseBlue-500;
      }
    }

    .option__bookmark {
      @apply lg:hidden flex absolute top-[18px] left-[18px] z-10 w-8 h-8 rounded-md dark:text-white bg-white dark:bg-[#23262F] bg-opacity-50 items-center justify-center border border-white dark:border-[#353945] transition-colors duration-300 ease-in-out;

      &:hover {
        @apply bg-opacity-100 text-baseBlue-500;
      }
    }

    .img__options__bottom {
      @apply absolute w-full bottom-[14px] px-4 flex items-center justify-end gap-3 z-10 text-white opacity-75;

      i {
        @apply align-middle;
      }
    }
  }

  .item__body {
    @apply grow px-4 pt-5 pb-7 lg:px-0 lg:pt-0 lg:pb-0;

    .body__header {
      @apply lg:border-b border-[#ECEDF1] dark:border-[#353945] w-full lg:flex lg:flex-col lg:grow lg:mb-3 lg:pb-1 2xl:mb-4 2xl:pb-4;
    }

    .row {
      @apply mb-1 last:mb-0 flex items-center justify-between;

      .item__name {
        @apply text-black dark:text-white text-base lg:text-lg font-semibold transition-colors duration-300 ease-in-out;

        &:hover {
          @apply text-baseBlue-500 dark:text-baseBlue-500;
        }
      }

      .option__bookmark {
        @apply hidden lg:flex w-9 h-9 rounded-md text-[#687389] dark:text-[#777E90] items-center justify-center border border-[#ECEDF1] dark:border-[#353945] transition-colors duration-300 ease-in-out;

        &:hover {
          @apply text-baseBlue-500;
        }
      }

      .item__price {
        @apply hidden lg:block text-lg font-bold text-baseBlue-500;

        span {
          @apply text-sm text-[#687389] dark:text-[#777E90] font-medium;
        }

        &.mobile {
          @apply block lg:hidden;
        }
      }

      .item__location {
        @apply text-[#687389] dark:text-[#777E90] text-sm lg:text-base;

        i {
          @apply align-middle ml-1;
        }
      }

      .item__specifications {
        @apply flex items-center gap-3;

        .item__rooms,
        .item__earth,
        .item__building {
          @apply text-xs 1lg:text-sm text-black dark:text-white;

          i {
            @apply text-[#687389] dark:text-[#777E90] align-middle ml-1;
          }
        }
      }

      .item__btn {
        @apply hidden lg:block px-4 py-2 rounded-full bg-baseBlue-500 text-white;
      }
    }
  }
}
</style>
