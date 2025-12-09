<template>
  <v-dialog 
    v-model="show" 
    :max-width="$vuetify.display.mobile ? undefined : '600'"
    :fullscreen="$vuetify.display.mobile"
    :transition="$vuetify.display.mobile ? 'dialog-bottom-transition' : 'dialog-transition'"
    @click:outside="dismiss"
  >
    <v-card class="h-100 d-flex flex-column">
      <v-card-title class="text-center py-4 font-weight-bold bg-warning d-flex align-center justify-center">
        <v-icon size="large" class="mr-2">
          <AlertCircleIcon />
        </v-icon>
        <h3 class="headline">Are you sure it's an ALPR?</h3>
        <v-spacer v-if="$vuetify.display.mobile"></v-spacer>
        <v-btn
          icon
          v-if="$vuetify.display.mobile"
          variant="text"
          color="on-warning"
          @click="dismiss"
        >
          <v-icon>
            <CloseIcon />
          </v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text class="pa-6 flex-grow-1 d-flex flex-column justify-center">
        <div class="content-wrapper">
          <div class="text-center mb-6">
            <img
              src="/alprs/flock-1.jpg"
              alt="Example ALPR Camera"
              style="max-width: 220px; width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);"
            />
            <div class="mt-2 text-caption text-grey-darken-1">
              Example ALPR camera (Flock Safety)
            </div>
          </div>

          <p class="text-center text-body-1 mb-12">
            Not every camera on a pole is an ALPR. Many are just traffic monitoring cameras or other equipment.
          </p>

          <div class="text-center">
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              to="/identify"
              class="mb-3"
              @click="dismiss"
            >
              <template #prepend>
                <v-icon>
                  <ImageSearchIcon />
                </v-icon>
              </template>
              View ALPR Gallery
            </v-btn>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn
          width="100%"
          color="success"
          variant="text"
          size="large"
          @click="dismiss"
        >
          Continue
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import AlertCircleIcon from '@iconify-vue/mdi/alert-circle';
import CloseIcon from '@iconify-vue/mdi/close';
import ImageSearchIcon from '@iconify-vue/mdi/image-search';

const show = ref(false);

onMounted(() => {
  if (!localStorage.getItem('alpr-verification-acknowledged')) {
    show.value = true;
  }
});

function dismiss() {
  show.value = false;
  localStorage.setItem('alpr-verification-acknowledged', 'true');
}
</script>

<style scoped>
.headline {
  color: rgb(var(--v-theme-on-warning));
}

ul {
  padding-left: 1.2rem;
}

li {
  margin-bottom: 0.25rem;
}

/* Mobile fullscreen styling */
@media (max-width: 960px) {
  .content-wrapper {
    max-width: 100%;
  }
  
  .v-card-title h3 {
    font-size: 1.25rem !important;
  }
  
  .v-card-text {
    padding: 1.5rem !important;
  }
  
  .v-card-actions {
    padding: 1.5rem !important;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .v-card-actions .v-btn {
    width: 100%;
    margin: 0 !important;
  }
}
</style>