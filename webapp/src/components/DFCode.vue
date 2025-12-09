<template>
  <div style="position: relative">
    <v-btn v-if="showCopyButton" color="white" @click="copyToClipboard" icon variant="plain" flat class="copy-button">
      <v-icon class="copy-icon-with-shadow">
        <CopyIcon />
      </v-icon>
    </v-btn>
    <code ref="codeContent">
      <slot></slot>
    </code>
    <v-snackbar color="#0081ac" v-model="snackbarOpen" :timeout="3000">
      Copied to clipboard!
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbarOpen = false"
        >
          <v-icon>
            <CloseIcon />
          </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import CloseIcon from '@iconify-vue/mdi/close';
import CopyIcon from '@iconify-vue/mdi/content-copy';

defineProps({
  showCopyButton: {
    type: Boolean,
    default: true
  }
});

const codeContent = ref<HTMLElement | null>(null);
const snackbarOpen = ref(false);

function copyToClipboard() {
  if (codeContent.value) {
    navigator.clipboard.writeText(codeContent.value.innerText)
      .then(() => snackbarOpen.value = true)
      .catch(() => console.error('Failed to copy to clipboard'));
  }
}
</script>

<style scoped>
code {
  background-color: rgb(33,33,33);
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  display: block;
  margin-top: 0.5rem;
  overflow-x: scroll;
}

code {
  white-space: nowrap;
}

.copy-icon-with-shadow {
  filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 1));
  /* Adjust shadow values as needed: horizontal-offset vertical-offset blur-radius color */
}

.copy-button {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1000;
}
</style>
