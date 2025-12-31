<template>
<v-card :to="props.to" :href="props.href" :target="props.href ? '_blank' : undefined" hover>
  <v-card-title class="font-weight-bold text-primary">
    <v-icon start>{{ props.icon }}</v-icon>
    <span>{{ props.title }}</span>
  </v-card-title>
  <v-card-text>{{ props.description }}</v-card-text>
</v-card>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: false
  },
  href: {
    type: String,
    required: false
  }
});
</script>