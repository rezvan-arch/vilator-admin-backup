<template>
  <div class="admin__pagination">
    <ul v-if="+lastPage <= 3">
      <li
        :class="{ active: +currentPage == i }"
        @click="$emit('onChange', i)"
        v-for="(i, index) in +lastPage"
        :key="index"
      >
        {{ i }}
      </li>
    </ul>
    <ul v-else>
      <template v-if="+currentPage > 3">
        <li @click="$emit('onChange', 1)">
          <i class="fa-solid fa-angles-right"></i>
        </li>
        <li @click="$emit('onChange', +currentPage - 1)">
          <i class="fa-solid fa-angle-right"></i>
        </li>
        <li class="disabled">...</li>
      </template>
      <template v-for="(i, index) in 2" :key="index">
        <li
          v-if="+currentPage - (2 - index) > 0"
          @click="$emit('onChange', +currentPage - (2 - index))"
        >
          {{ +currentPage - (2 - index) }}
        </li>
      </template>
      <li v-if="+lastPage > 2" :class="{ active: +currentPage }">
        {{ +currentPage }}
      </li>
      <li
        v-else
        :class="{ active: +currentPage == i }"
        @click="$emit('onChange', i)"
        v-for="(i, index) in +lastPage"
        :key="index"
      >
        {{ i }}
      </li>
      <template v-for="(i, index) in 2" :key="index">
        <li
          v-if="+currentPage + i <= +lastPage"
          @click="$emit('onChange', +currentPage + i)"
        >
          {{ +currentPage + i }}
        </li>
      </template>
      <template
        v-if="+currentPage < +lastPage && +currentPage + 3 <= +lastPage"
      >
        <li class="disabled">...</li>
        <li @click="$emit('onChange', currentPage + 1)">
          <i class="fa-solid fa-angle-left"></i>
        </li>
        <li @click="$emit('onChange', +lastPage)">
          <i class="fa-solid fa-angles-left"></i>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
export default {
  props: ["currentPage", "lastPage"],
};
</script>
