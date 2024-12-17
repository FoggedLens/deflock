<template>
  <blockquote class="serif text-grey-darken-2">
    <slot name="default"></slot>
  </blockquote>
  <p style="font-size: 0.9rem;">
    <a :href="sourceUrl" target="_blank">-{{ attributionText }}</a>
  </p>
</template>

<script setup lang="ts">
defineProps({
  sourceUrl: String,
  attributionText: {
    type: String,
    default: 'Read the full study'
  },
});
</script>

<style scoped>
blockquote {
  font-size: 1.05rem;
  border-left: 4px solid #616161;
  padding-left: 16px;
  font-style: italic;
  margin-top: 16px;
  margin-bottom: 8px;
}
</style>
