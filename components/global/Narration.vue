<script>
export default {
  props: ["src"],
  data() {
    return {
      play: false,
      mute: false,
      currentTime: "00:00",
      audioVolume: 0.5,
      audioSetting: false,
      speedItem: [
        {
          text: "50%",
          speed: 0.5,
        },
        {
          text: "عادی",
          speed: 1,
        },
        {
          text: "150%",
          speed: 1.5,
        },
        {
          text: "200%",
          speed: 2,
        },
      ],
      audioSpeed: 1,
    };
  },
  methods: {
    handleInputChange(e) {
      let target = e.target;

      const min = target.min;
      const max = target.max;
      const val = target.value;

      target.style.backgroundSize =
        ((val - min) * 100) / (max - min) + "% 100%";
    },
    playPause() {
      this.play ? this.$refs.audio.pause() : this.$refs.audio.play();
      this.play = !this.play;
    },
    processInput(e) {
      const value = e.target.value;
      const newTime = (this.$refs.audio.duration / 100) * value;

      this.$refs.audio.currentTime = newTime;
    },
    timeupdate(e) {
      const currentTime = e.target.currentTime;
      const duration = e.target.duration;
      let progressWidth = (currentTime / duration) * 100;

      this.$refs.processBar.style.backgroundSize = `${progressWidth}%`;
      this.$refs.processBar.value = `${progressWidth}`;

      // update current time
      let currentMin = Math.floor(currentTime / 60);
      let currentSec = Math.floor(currentTime % 60);
      if (currentSec < 10) currentSec = `0${currentSec}`;
      if (currentMin < 10) currentMin = `0${currentMin}`;
      this.currentTime = `${currentMin}:${currentSec}`;
    },
    changeVolume() {
      this.$refs.audio.volume = this.$refs.volumeBar.value;
      this.audioVolume = this.$refs.volumeBar.value;

      if (this.$refs.volumeBar.value == 0) {
        // this.mute = true;
      } else {
        // this.mute = false;
      }
    },
    closeSetting() {
      this.audioSetting = false;
    },
    changeSpeed(speed) {
      this.audioSpeed = speed;
      this.$refs.audio.playbackRate = speed;
      this.audioSetting = false;
    },
  },
  watch: {
    mute(newVal) {
      newVal
        ? (this.$refs.audio.volume = 0)
        : (this.$refs.audio.volume = this.audioVolume);
    },
  },
};
</script>

<template>
  <div class="audio__box">
    <audio
      class="audio__main"
      :class="{ play: play, mute: mute }"
      ref="audio"
      :src="src"
      @ended="play = false"
      @timeupdate="timeupdate"
    ></audio>
    <div class="play__pause" @click="playPause">
      <i v-if="!play" class="fa-solid fa-play"></i>
      <i v-else class="fa-solid fa-pause"></i>
    </div>
    <div class="process">
      <span class="current__time">{{ currentTime }}</span>
      <input
        type="range"
        class="process__bar"
        min="0"
        max="100"
        value="0"
        id=""
        ref="processBar"
        @input="
          handleInputChange($event);
          processInput($event);
        "
      />
    </div>
    <div class="volume">
      <div class="mute" @click="mute = !mute">
        <i v-if="!mute && audioVolume > 0" class="fa-solid fa-volume"></i>
        <i v-else class="fa-solid fa-volume-xmark"></i>
      </div>
      <input
        type="range"
        class="volume__bar"
        min="0"
        max="1"
        step="0.1"
        v-model="audioVolume"
        id=""
        :disabled="mute"
        ref="volumeBar"
        @input="
          handleInputChange($event);
          changeVolume($event);
        "
      />
    </div>
    <div class="setting" v-click-outside="closeSetting">
      <button @click="audioSetting = !audioSetting">
        <i class="fa-solid fa-gear"></i>
      </button>
      <ul class="audio__speed__dropdown" :class="{ active: audioSetting }">
        <span class="title">سرعت پخش</span>
        <li
          v-for="(item, index) in speedItem"
          :key="index"
          class="dropdown__item"
          :class="{ active: audioSpeed === item.speed }"
          @click="changeSpeed(item.speed)"
        >
          <span>{{ item.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<style lang="scss" scoped0>
.audio__box {
  @apply mt-5 flex flex-row-reverse items-center gap-4 w-full sm:max-w-[90%] mx-auto px-3 sm:pl-9 sm:pr-7 py-5 rounded-md border border-[#ECEDF1] dark:border-[#353945] dark:bg-[#353945];

  .play__pause {
    @apply w-6 cursor-pointer px-1;
  }

  .volume {
    @apply flex items-center gap-3;

    .volume__bar {
      @apply hidden 2sm:block w-[75px];

      &:disabled {
        @apply opacity-50;
      }
    }

    .mute {
      @apply w-6 cursor-pointer px-1;
    }
  }

  .setting {
    @apply relative;

    button {
      @apply w-6 cursor-pointer px-1;
    }

    .audio__speed__dropdown {
      @apply absolute top-full right-0 w-36 rounded-md shadow-md overflow-hidden border border-[#DBE1ED] dark:border-[#353945] bg-white dark:bg-[#23262F] z-30 flex flex-col transition-all duration-300 ease-in-out origin-top-right opacity-0 scale-0;

      .title {
        @apply p-2 text-[15px] font-semibold dark:text-white;
      }

      .dropdown__item {
        @apply px-2 transition-colors duration-300 ease-in-out cursor-pointer;

        &:last-child {
          span {
            @apply border-0;
          }
        }

        span {
          @apply block pointer-events-none py-2 text-sm border-b dark:text-white border-[#DBE1ED] dark:border-[#353945] transition-colors duration-300 ease-in-out;
        }

        &:hover,
        &.active {
          @apply bg-baseBlue-500 dark:bg-baseBlue-500;

          span {
            @apply border-b-baseBlue-500  text-white;
          }
        }
      }

      &.active {
        @apply opacity-100 scale-100;
      }
    }
  }

  .process {
    @apply flex items-center gap-3 grow;

    .process__bar {
      @apply grow w-0;
    }

    .current__time {
      @apply text-xs w-9 text-center dark:text-white;
    }
  }

  i {
    @apply align-middle text-lg dark:text-white;
  }

  input[type="range"] {
    -webkit-appearance: none;
    direction: ltr;
    background-size: 0% 100%;
    background-repeat: no-repeat;
    @apply bg-[#DADDE2] dark:bg-[#777E90] border-none h-[6px] rounded-md bg-gradient-to-t from-baseBlue-500 to-baseBlue-500 cursor-pointer;

    &.volume__bar {
      background-size: 50% 100%;
    }

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 15px;
      width: 15px;
      border-radius: 50%;
      box-shadow: 0 0 1px 2px #dadde2;
      @apply bg-white border dark:border-none border-[#ECEDF1] dark:border-[#353945];
    }

    &::-moz-range-thumb {
      height: 15px;
      width: 15px;
      border-radius: 50%;
      box-shadow: 0 0 1px 2px #dadde2;
      @apply bg-white border dark:border-none border-[#ECEDF1] dark:border-[#353945];
    }
  }
}
</style>
