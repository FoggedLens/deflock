<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="650">
    <v-card>
      <v-card-title class="text-h5 font-weight-bold text-center">
        Share This Map
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-6">
        <!-- Social Sharing Section -->
        <div class="mb-4">
          <div class="d-flex align-center mb-3">
            <v-icon class="mr-2" color="primary">mdi-crop-free</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold">Link to this Region</h3>
          </div>
          <div class="d-flex ga-2 flex-wrap">
            <v-btn
              color="var(--df-blue)"
              class="text-white"
              variant="flat"
              prepend-icon="mdi-link-variant"
              @click="copyToClipboard(shareUrl)"
            >
              Copy Link
            </v-btn>
            <v-btn
              :href="redditShareUrl"
              target="_blank"
              color="#FF4500"
              variant="flat"
              prepend-icon="mdi-reddit"
            >
              Reddit
            </v-btn>
          </div>
        </div>

        <v-divider class="my-4" />

        <!-- Embed Section -->
        <div class="mb-4">
          <div class="d-flex align-center mb-3">
            <v-icon class="mr-2" color="primary">mdi-code-tags</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold">Embed on Your Site</h3>
          </div>
          <DFCode>&lt;iframe src="{{ shareUrl }}" width="100%" height="600" style="border: none;"&gt;&lt;/iframe&gt;</DFCode>
        </div>

        <v-divider class="my-4" />

        <!-- Download Data Section -->
        <div>
          <div class="d-flex align-center mb-3">
            <v-icon class="mr-2" color="primary">mdi-download</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold">Download All Data (Coming Soon)</h3>
          </div>
          <p class="text-body-2 mb-3">Get the complete dataset in GeoJSON format.</p>
          <v-btn
            href="#"
            target="_blank"
            download
            color="primary"
            variant="tonal"
            size="large"
            block
            prepend-icon="mdi-download"
            disabled
          >
            Coming Soon
          </v-btn>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn @click="$emit('update:modelValue', false)" variant="text">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Copy Success Snackbar -->
  <v-snackbar v-model="snackbarOpen" :timeout="3000" color="var(--df-blue)">
    Copied to clipboard!
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import DFCode from '@/components/DFCode.vue';

const props = defineProps<{
  modelValue: boolean,
}>();
const emit = defineEmits(['update:modelValue']);

const router = useRouter();
const snackbarOpen = ref(false);

const shareUrl = computed(() => {
  return window.location.href;
});

const redditShareUrl = computed(() => {
  const title = encodeURIComponent('DeFlock - License Plate Readers Near You');
  return `https://reddit.com/submit?url=${encodeURIComponent(shareUrl.value)}&title=${title}`;
});

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
    .then(() => snackbarOpen.value = true)
    .catch(() => console.error('Failed to copy to clipboard'));
}
</script>