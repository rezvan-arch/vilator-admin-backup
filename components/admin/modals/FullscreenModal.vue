<script>
import { mapActions, mapState } from "pinia";
import { fullscreenStore } from "~/store/admin/fullscreen";
import { Navigation, A11y, Pagination, Thumbs, Lazy } from "swiper";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/lazy";

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      fullscreenSwiper: null,
      inZoom: false,
      hideController: false,
      timer: null,
      zoomVal: 1,
      ZOOM_SPEED: 0.1,
      evCache: [],
      prevDiff: -1,
      mousePosition: [],
      offset: [0, 0],
      isDown: false,
      start: {},
      loc: {
        x: 0,
        y: 0,
      },
      imageElementScale: 1,
      touchesStartLength: null,
    };
  },
  computed: {
    ...mapState(fullscreenStore, ["fullscreenItems", "fullscreenActive"]),
  },
  methods: {
    ...mapActions(fullscreenStore, ["closeModal", "setFullscreenActive"]),
    changeSlide() {
      this.zoomOut();
    },
    zoomOut() {
      this.inZoom = false;
      this.imageSwiper.allowTouchMove = true;

      const items = document.querySelectorAll(".fullscreen-swiper img");
      const activeIndex = items[this.imageSwiper.activeIndex];
      activeIndex.style.transitionDuration = "0.3s";
      this.loc.y = 0;
      this.loc.x = 0;
      this.imageElementScale = 1;
      this.zoomVal = 1;
      if (activeIndex) {
        activeIndex.style.transform = "scale(1)";
        // activeIndex.style.left = "50%";
        // activeIndex.style.top = "50%";
      }
    },
    zoomIn() {
      this.inZoom = true;
      this.imageSwiper.allowTouchMove = false;

      const items = document.querySelectorAll(".fullscreen-swiper img");
      const activeIndex = items[this.imageSwiper.activeIndex];

      activeIndex.style.transform = "scale(3)";
      this.imageElementScale = 3;
      this.zoomVal = 3;
    },
    wheel(e) {
      const target = e.target;
      if (e.deltaY > 0) {
        if (this.zoomVal < 3)
          target.style.transform = `translate3d(${this.loc.x}px, ${
            this.loc.y
          }px, 0) scale(${(this.zoomVal += this.ZOOM_SPEED)})`;
      } else {
        if (this.zoomVal > 1)
          target.style.transform = `translate3d(${this.loc.x}px, ${
            this.loc.y
          }px, 0) scale(${(this.zoomVal -= this.ZOOM_SPEED)})`;
      }

      if (this.zoomVal > 1) {
        this.inZoom = true;
        this.imageSwiper.allowTouchMove = false;
      } else if (this.zoomVal === 1) {
        this.zoomOut();
      }
    },
    mousedown(e) {
      const target = e.target;
      this.isDown = true;
      this.offset = [e.clientX, e.clientY];

      const handleMove = (e) => {
        const target = e.target;
        if (this.inZoom) {
          target.style.transitionDuration = "0s";
          this.mousePosition = {
            x: e.clientX,
            y: e.clientY,
          };

          const deltaX = this.offset[0] - this.mousePosition.x;
          const deltaY = this.offset[1] - this.mousePosition.y;

          this.loc.x = this.loc.x - deltaX;
          this.loc.y = this.loc.y - deltaY;
          const transform = `translate3d(${this.loc.x}px, ${this.loc.y}px, 0) scale(${this.zoomVal})`;

          target.style.transform = transform;
          this.offset = [e.clientX, e.clientY];
        }
      };

      const dragUp = (e) => {
        const target = e.target;
        this.isDown = false;
        target.style.transitionDuration = "0.3s";
        target.removeEventListener("mousemove", handleMove);
        target.removeEventListener("mouseup", dragUp);
      };

      target.addEventListener("mousemove", handleMove);
      target.addEventListener("mouseup", dragUp);
    },
    pointerdown(e) {
      const target = e.target;
      this.evCache.push(e);
      this.offset = [
        target.offsetLeft - e.clientX,
        target.offsetTop - e.clientY,
      ];
    },
    pointerup_handler(e) {
      for (var i = 0; i < this.evCache.length; i++) {
        if (this.evCache[i].pointerId == e.pointerId) {
          this.evCache.splice(i, 1);
          break;
        }
      }

      if (this.evCache.length < 2) this.prevDiff = -1;
    },
    pointermove(e) {
      const target = e.target;

      for (var i = 0; i < this.evCache.length; i++) {
        if (e.pointerId == this.evCache[i].pointerId) {
          this.evCache[i] = e;
          break;
        }
      }
    },
    controlSwiperWithKey(e) {
      this.zoomOut();
      if (e.keyCode == 37) this.imageSwiper.slideNext();
      if (e.keyCode == 39) this.imageSwiper.slidePrev();
    },
    changeSliderNumber(className, swiper) {
      const numberOfPage = document.querySelector(`.${className} span`);
      if (!numberOfPage) return;
      const length = swiper.slides.length;

      const index = swiper.activeIndex + 1;

      numberOfPage.innerHTML = `${index > 10 ? index : `0${index}`} از ${
        length > 10 ? length : `0${length}`
      }`;
    },
    fullscreenChange() {
      if (
        !document.fullscreenElement &&
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        this.closeFullscreenSwiper();
      }
    },
    closeFullscreenSwiper() {
      document.querySelector("body").style.overflow = "";

      this.setFullscreenActive(this.imageSwiper.activeIndex);
      this.closeModal();

      if (document.fullscreenElement !== null) {
        document.exitFullscreen();
      }

      if (window.screen.availWidth < 1024) {
        screen.orientation.unlock();
      }
    },
    zoomFullscreenSwiper() {
      if (this.inZoom) {
        this.zoomOut();
      } else {
        this.zoomIn();
      }
    },
    hiddenController() {
      clearTimeout(this.timer);
      this.hideController = false;

      this.timer = setTimeout(() => {
        this.hideController = true;
      }, 3500);
    },
    touchstart(event) {
      if (event.touches.length === 2) {
        event.preventDefault(); // Prevent page scroll

        // Calculate where the fingers have started on the X and Y axis
        this.start.x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
        this.start.y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
        this.start.distance = this.distance(event);
      } else if (event.touches.length === 1) {
        this.start.x = event.touches[0].pageX;
        this.start.y = event.touches[0].pageY;
      }
      this.touchesStartLength = event.touches.length;
    },
    touchmove(event) {
      const target = event.target;
      target.style.transitionDuration = "0s";
      if (event.touches.length === 2) {
        event.preventDefault(); // Prevent page scroll
        // Safari provides event.scale as two fingers move on the screen
        // For other browsers just calculate the scale manually
        let scale;
        if (event.scale) {
          alert(event.scale);
          scale = event.scale;
        } else {
          const deltaDistance = this.distance(event);
          scale = deltaDistance / this.start.distance;
          if (scale > 1) scale = this.imageElementScale + (scale - 1);
          if (scale < 1) scale = this.imageElementScale - (1 - scale);
          if (scale == 1) scale = this.imageElementScale;
        }
        this.imageElementScale = Math.min(Math.max(1, scale), 3);

        // // Calculate how much the fingers have moved on the X and Y axis
        // const deltaX =
        //   ((event.touches[0].pageX + event.touches[1].pageX) / 2 -
        //     this.start.x) *
        //   2; // x2 for accelarated movement
        // const deltaY =
        //   ((event.touches[0].pageY + event.touches[1].pageY) / 2 -
        //     this.start.y) *
        //   2; // x2 for accelarated movement

        if (this.imageElementScale > 1 && this.imageElementScale < 3) {
          // Transform the image to make it grow and move with fingers
          const transform = `translate3d(${this.loc.x}px, ${this.loc.y}px, 0) scale(${this.imageElementScale})`;
          target.style.transform = transform;
        }

        if (this.imageElementScale > 1) {
          this.inZoom = true;
          this.imageSwiper.allowTouchMove = false;
        }

        this.loc.x = deltaX;
        this.loc.y = deltaY;

        this.start.x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
        this.start.y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
      } else if (event.touches.length === 1) {
        if (this.inZoom && this.touchesStartLength === 1) {
          const deltaX = this.start.x - event.touches[0].pageX;
          const deltaY = this.start.y - event.touches[0].pageY;
          this.loc.x = this.loc.x - deltaX;
          this.loc.y = this.loc.y - deltaY;
          const transform = `translate3d(${this.loc.x}px, ${this.loc.y}px, 0) scale(${this.imageElementScale})`;
          target.style.transform = transform;
          this.start.x = event.touches[0].pageX;
          this.start.y = event.touches[0].pageY;
        }
      }
    },
    touchend(event) {
      const target = event.target;
      if (this.imageElementScale === 1) {
        this.zoomOut();
      }
    },
    distance(event) {
      return Math.hypot(
        event.touches[0].pageX - event.touches[1].pageX,
        event.touches[0].pageY - event.touches[1].pageY
      );
    },
  },
  mounted() {
    this.imageSwiper.activeIndex = this.fullscreenActive;
    this.imageActiveIndex = this.fullscreenActive + 1;

    document.addEventListener("keyup", this.controlSwiperWithKey);

    document.addEventListener("fullscreenchange", this.fullscreenChange);
    document.addEventListener("webkitfullscreenchange", this.fullscreenChange);
    document.addEventListener("mozfullscreenchange", this.fullscreenChange);
    document.addEventListener("MSFullscreenChange", this.fullscreenChange);

    if (this.$refs.fullscreenSlider.requestFullscreen) {
      this.$refs.fullscreenSlider.requestFullscreen();
    } else if (this.$refs.fullscreenSlider.webkitRequestFullscreen) {
      /* Safari */
      this.$refs.fullscreenSlider.webkitRequestFullscreen();
    } else if (this.$refs.fullscreenSlider.msRequestFullscreen) {
      /* IE11 */
      this.$refs.fullscreenSlider.msRequestFullscreen();
    }

    if (window.screen.availWidth < 1024) {
      screen.orientation.lock("landscape-primary");
    }
  },
  beforeDestroy() {
    document.addEventListener("keyup", this.controlSwiperWithKey);
  },
  watch: {
    fullscreen(val) {
      if (val) {
        if (this.$refs.fullscreenSlider.requestFullscreen) {
          this.$refs.fullscreenSlider.requestFullscreen();
        } else if (this.$refs.fullscreenSlider.webkitRequestFullscreen) {
          /* Safari */
          this.$refs.fullscreenSlider.webkitRequestFullscreen();
        } else if (this.$refs.fullscreenSlider.msRequestFullscreen) {
          /* IE11 */
          this.$refs.fullscreenSlider.msRequestFullscreen();
        }

        if (window.screen.availWidth < 1024) {
          screen.orientation.lock("landscape-primary");
        }
      }
    },
  },
  setup() {
    // variables
    const imageSwiper = ref(null);
    const imageActiveIndex = ref(1);

    // methods
    const setImageSwiper = (swiper) => {
      imageSwiper.value = swiper;
    };
    const onSlideChange = (swiper) => {
      imageActiveIndex.value = swiper.activeIndex + 1;
    };

    return {
      // variables
      imageSwiper,
      imageActiveIndex,

      // methods
      setImageSwiper,
      onSlideChange,
      modules: [Navigation, A11y, Pagination, Thumbs, Lazy],
    };
  },
};
</script>
<template>
  <div
    class="fullscreen__slider single"
    :class="{ zoom: inZoom }"
    ref="fullscreenSlider"
    @pointermove="hiddenController"
  >
    <div class="swiper-container">
      <Swiper
        slidesPerView="1"
        :spaceBetween="10"
        @swiper="setImageSwiper"
        @slide-change="onSlideChange"
        :navigation="{
          prevEl: '.swiper-button-prev',
          nextEl: '.swiper-button-next',
        }"
        :modules="modules"
        navigation
        :lazy="{
          enabled: true,
        }"
        class="fullscreen-swiper"
      >
        <SwiperSlide
          v-for="(item, index) in fullscreenItems"
          :key="index"
          @wheel="wheel($event)"
        >
          <picture>
            <source
              v-for="(rImage, index) in item.resourceImages"
              :key="index"
              :media="`(min-width: ${rImage.size}px)`"
              :data-srcset="rImage.src"
            />
            <img
              :data-src="item.image"
              alt=""
              @mousedown="mousedown"
              ondragstart="return false"
              class="swiper-lazy"
              @touchstart="touchstart"
              @touchmove="touchmove"
              @touchend="touchend"
            />
            <div class="swiper-lazy-preloader"></div>
          </picture>
        </SwiperSlide>
        <button class="swiper-button-prev" @click="changeSlide" ref="prevBtn">
          <i class="fa-regular fa-angle-right"></i>
        </button>
        <button
          class="swiper-button-next"
          :class="{
            hide: hideController,
          }"
          @click="changeSlide"
        >
          <i class="fa-regular fa-angle-left"></i>
        </button>

        <button
          class="swiper__close__btn"
          :class="{
            hide: hideController,
          }"
          @click="closeFullscreenSwiper"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
        <button
          class="swiper__zoom__btn"
          :class="{ zoom: inZoom, hide: hideController }"
          @click="zoomFullscreenSwiper"
        >
          <i v-if="inZoom" class="fa-regular fa-minus"></i>
          <i v-else class="fa-regular fa-plus"></i>
        </button>

        <div
          class="swiper__footer"
          :class="{
            hide: hideController,
          }"
        >
          <div v-if="imageSwiper" class="number__of__page fullscreen__number">
            <i class="fa-regular fa-image"></i>
            <span>{{
              `${
                imageActiveIndex >= 10
                  ? imageActiveIndex
                  : `0${imageActiveIndex}`
              } از ${
                imageSwiper.slides.length > 10
                  ? imageSwiper.slides.length
                  : `0${imageSwiper.slides.length}`
              }`
            }}</span>
          </div>
        </div>
      </Swiper>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.fullscreen__slider {
  @apply w-screen h-screen fixed top-0 left-0 z-[150] overflow-hidden bg-black;

  .swiper-container {
    @apply h-full;

    .fullscreen-swiper {
      @apply h-full;

      .swiper-slide {
        @apply overflow-hidden flex justify-center;
      }

      .swiper-button-next,
      .swiper-button-prev {
        @apply w-[30px] sm:w-[45px] h-[30px] sm:h-[45px] top-[60%] sm:top-[50%] rounded-full bg-white dark:bg-[#23262F] border-2 border-[#ECEDF1] dark:border-[#353945] transition-transform duration-300 ease-in-out text-black dark:text-white;

        &::after {
          content: "" !important;
        }
      }

      .swiper-button-prev {
        @apply right-4;
      }

      .swiper-button-next {
        @apply left-4;
      }

      .swiper__close__btn,
      .swiper__zoom__btn {
        @apply absolute w-[30px] sm:w-[45px] h-[30px] sm:h-[45px] top-4 sm:top-4 rounded-md bg-white dark:bg-[#23262F] border-2 border-[#ECEDF1] dark:border-[#353945] transition-transform duration-300 ease-in-out text-black dark:text-white z-[150] flex items-center justify-center;
      }

      .swiper__close__btn {
        @apply right-4;
      }

      .swiper__zoom__btn {
        @apply left-4;
      }

      .swiper__footer {
        @apply absolute bottom-0 left-0 w-full h-[70px] flex items-center px-10 z-[150] bg-black bg-opacity-20 pointer-events-none;

        .number__of__page {
          @apply text-white text-base;

          i {
            @apply ml-2;
          }
        }
      }

      .swiper-button-next,
      .swiper-button-prev,
      .swiper__close__btn,
      .swiper__zoom__btn,
      .swiper__footer {
        @apply transition-all duration-300 ease-in-out;

        &.hide {
          @apply opacity-0;
        }
      }
    }
  }
  img {
    @apply w-auto h-full object-contain transition-all duration-300 ease-in-out;
  }

  &.zoom {
    @apply cursor-grab;

    &:active {
      @apply cursor-grabbing;
    }
  }

  &.active {
    @apply opacity-100;
  }
}
</style>
