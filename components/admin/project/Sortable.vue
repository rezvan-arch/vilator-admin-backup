<script>
import useStore from "~~/mixins/store";
import draggable from "vuedraggable";
export default {
  name: "transition-example-2",
  display: "Transitions",
  order: 7,
  props: ["items"],
  components: {
    draggable,
  },
  data() {
    return {
      list: this.items.map((item, index) => {
        return {
          ...item,
          order: item["sort_order"] ? item.sort_order : index + 1,
          is_main: item["is_main"] ? item.is_main : 0,
        };
      }),
      drag: false,
      popup: false,
      mediaAction: null,
      galleryType: null,
    };
  },
  setup(props) {
    const { indexStore } = useStore();

    return {
      indexStore,
    };
  },
  methods: {
    sort() {
      this.list = this.list.sort((a, b) => a.order - b.order);
    },
    deleteItem(item) {
      this.list = this.list.filter((image) => image.id != item.id);
      this.$emit("changeFiles", this.list);
    },
    mainItem(item) {
      this.list.forEach((element) => {
        if (element.id == item.id) item.is_main = item.is_main == 1 ? 0 : 1;
      });
      this.$emit("changeFiles", this.list);
    },
    openPopup(el) {
      this.mediaAction = el;
      // this.galleryType = el.type;
      this.popup = true;
      this.indexStore.showModalFn(true);
    },
    changePic(data) {
      const order = this.list[this.list.indexOf(this.mediaAction)].order;
      this.list[this.list.indexOf(this.mediaAction)] = { ...data, order };

      this.$emit("changeFiles", this.list);

      this.popup = false;
      this.indexStore.showModalFn(false);
    },
    dragEnd() {
      this.drag = false;
      this.$emit("changeFiles", this.list);
    },
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      };
    },
  },
  watch: {
    items(val) {
      this.list = this.items.map((item, index) => {
        return {
          ...item,
          order: item["sort_order"] ? item.sort_order : index + 1,
          is_main: item["is_main"] ? item.is_main : 0,
        };
      });
    },
    // list() {
    //   this.$emit("changeFiles", this.list);
    // },
  },
  mounted() {
    this.$emit("changeFiles", this.list);
  },
};
</script>
<template>
  <div class="draggable__container">
    <div class="">
      <draggable
        class="list-group"
        :component-data="{
          tag: 'ul',
          type: 'transition-group',
          name: !drag ? 'flip-list' : null,
        }"
        v-model="list"
        v-bind="dragOptions"
        @start="drag = true"
        @end="dragEnd"
      >
        <template #item="{ element }">
          <li class="list-group-item">
            <div class="delete" @click="deleteItem(element)">
              <i class="fa-regular fa-circle-xmark"></i>
            </div>
            <div
              v-if="element.format == 'image'"
              class="is__main"
              :class="{ active: element.is_main }"
              @click="mainItem(element)"
            >
              <i class="fa-regular fa-circle-check"></i>
            </div>
            <!-- <div class="check">
              <div class="round">
                <input
                  type="checkbox"
                  :id="`checkbox-${element.id}`"
                  :name="`main-${element.id}`"
                />
                <label :for="`checkbox-${element.id}`"></label>
              </div>
            </div> -->
            <img  
              v-if="element.type == 'image' || element.type == 'plan'"
              :src="element.get_url"
              alt=""
              @click="openPopup(element)" loading="lazy" format="webp"
            />
            <img  
              v-else-if="element.type == 'video'"
              :src="element.meta_value.thumbnail.get_url"
              alt=""
              @click="openPopup(element)" loading="lazy" format="webp"
            />
          </li>
        </template>
        <li class="sortable-js-rtl-clearfix"></li>
      </draggable>
    </div>
  </div>
  <teleport to="body">
    <transition name="translate">
      <AdminMediaMediaImportModal
        v-if="popup"
        :galleryType="galleryType"
        :mediaAction="mediaAction"
        :multiple="false"
        @closeModal="
          popup = false;
          indexStore.showModalFn(false);
        "
        @chooseMedia="changePic"
      />
    </transition>
  </teleport>
</template>
<style lang="scss" scoped>
.draggable__container {
  direction: ltr;
  @apply w-full;
}
.button {
  margin-top: 35px;
}
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group {
  min-height: 20px;
  direction: ltr;
  @apply flex flex-wrap gap-5 list-none;
}
.list-group-item {
  box-shadow: 0 0 3px 1px #e7e7e7;
  cursor: move;
  @apply w-[150px] h-[100px] relative;

  img,
  video {
    @apply object-cover h-full w-full rounded-sm bg-gray-100;
  }
}

.delete {
  @apply text-red-500 bg-white absolute -top-2 -left-2 cursor-pointer h-5 w-5 flex items-center justify-center rounded-full border-black;

  i {
    @apply text-base align-middle leading-5;
  }
}

.is__main {
  @apply text-green-500 bg-white absolute -top-2 -right-2 cursor-pointer h-5 w-5 flex items-center justify-center rounded-full border-black;

  i {
    @apply text-base align-middle leading-5;
  }

  &.active {
    @apply bg-green-500 text-white;
  }
}

.check {
  @apply absolute -top-2 -right-2;
}

.round {
  @apply relative;

  label {
    @apply bg-white border-2 rounded-full cursor-pointer top-0 absolute h-4 w-4 border-[#66bb6a] ring-[3px] ring-white;

    &::after {
      @apply border-2 border-[#66bb6a] border-t-0 border-r-0 content-[""] h-1 w-2 left-[2.5px] top-[4px] absolute -rotate-45;
    }
  }

  input {
    @apply hidden;

    &:checked + label {
      @apply bg-[#66bb6a];

      &::after {
        @apply border-[#fff];
      }
    }
  }
}
</style>
