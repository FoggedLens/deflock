<template>
  <div style="position: relative">
    <v-btn v-if="props.showCopyButton" color="white" @click="copyToClipboard" icon variant="plain" flat class="copy-button">
      <v-icon class="copy-icon-with-shadow">mdi-content-copy</v-icon>
    </v-btn>
    <code ref="codeContent" :class="{ 'code-darker': isDark }">
      <template v-if="osmTags">
        <template v-for="(value, key) in osmTags" :key="key">
          <span v-if="value !== ''">
            {{ key }}=<span :class="{ highlight: highlightValuesForKeys.includes(key)}">{{ value }}</span><br>
          </span>
        </template>
      </template>
      <slot v-else></slot>
    </code>
    <v-snackbar color="var(--df-blue-dark)" v-model="snackbarOpen" :timeout="3000">
      <span class="text-white">Copied to clipboard!</span>
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbarOpen = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();
const isDark = computed(() => theme.name.value === 'dark');

const props = withDefaults(defineProps<{
  showCopyButton?: boolean;
  osmTags?: Record<string, string>;
  highlightValuesForKeys?: string[];
}>(), {
  showCopyButton: true,
  highlightValuesForKeys: () => []
});

const highlightValuesForKeys = computed(() => props.highlightValuesForKeys ?? []);

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
  white-space: nowrap;
}

.code-darker {
  background-color: rgb(22,22,22);
}

.copy-icon-with-shadow {
  filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 1));
}

.copy-button {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1000;
}

.highlight {
  background-color: #0081ac;
  padding: 0.15rem;
  border-radius: 0.25rem;
  font-weight: bold;
}
</style>
