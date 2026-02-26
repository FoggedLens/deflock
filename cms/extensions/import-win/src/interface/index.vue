<template>
  <div class="import-win">
    <v-input
      v-model="articleUrl"
      placeholder="https://example.com/article"
      :disabled="loading"
      type="url"
    />
    <v-button
      class="import-btn"
      :loading="loading"
      :disabled="!articleUrl"
      @click="importWin"
    >
      Import
    </v-button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useApi } from '@directus/extensions-sdk';

const props = defineProps({
  setFieldValue: {
    type: Function,
    default: null,
  },
});

const api = useApi();
const articleUrl = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function importWin() {
  if (!articleUrl.value) return;
  loading.value = true;
  errorMessage.value = '';

  try {
    const { data } = await api.post('/import-win', { url: articleUrl.value });

    if (props.setFieldValue) {
      props.setFieldValue('cityState', data.cityState);
      props.setFieldValue('monthYear', data.monthYear);
      props.setFieldValue('description', data.description);
      props.setFieldValue('outcome', data.outcome);
    }

    articleUrl.value = '';
  } catch (err) {
    const message = err?.response?.data?.error ?? err?.message ?? 'An unknown error occurred.';
    errorMessage.value = `Import failed: ${message}`;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.import-win {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.import-btn {
  flex-shrink: 0;
}

.error-message {
  width: 100%;
  color: var(--danger);
  font-size: 13px;
  margin: 4px 0 0;
}
</style>
