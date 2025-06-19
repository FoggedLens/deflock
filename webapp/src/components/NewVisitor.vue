<template>
  <v-dialog v-model="show" max-width="900">
    <v-card>
      <v-card-title class="text-center py-4 font-weight-bold">
        <h3 class="headline">Welcome to DeFlock</h3>
      </v-card-title>
      <p class="mx-8 text-center">
        DeFlock is powered by <b>crowdsourced data</b> from the OpenStreetMap community.
      </p>

      <v-divider class="mx-4 mt-4" />

      <v-list class="text-center">
        <v-list-item class="my-4">
          <v-icon size="x-large" color="primary" class="mb-2">mdi-progress-pencil</v-icon>
          <v-list-item-title class="font-weight-bold">The map is incomplete!</v-list-item-title>
          <v-list-item-subtitle>
            New locations are always being added.
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item class="my-4">
          <v-icon size="x-large" color="primary" class="mb-2">mdi-square-edit-outline</v-icon>
          <v-list-item-title class="font-weight-bold">Add missing points!</v-list-item-title>
          <v-list-item-subtitle>
            Know of a missing ALPR? <router-link to="/report">Contribute</router-link> to the map.
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <div class="small text-grey-darken-2 text-center mx-4 mb-2">By using this site, you agree to our <router-link to="/terms">Terms of Service</router-link>.</div>
      <v-card-actions>
        <v-btn flat class="w-100" size="x-large" color="rgb(18, 151, 195)" variant="elevated" @click="acknowledge">Got it</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const show = ref(false);

onMounted(() => {
  if (!localStorage.getItem('acknowledged')) {
    show.value = true;
  }
});

function acknowledge() {
  show.value = false;
  localStorage.setItem('acknowledged', 'true');
}
</script>

<style scoped>
.no-small {
  min-width: 160px;
}

.small {
  font-size: 0.8rem;
}
</style>
