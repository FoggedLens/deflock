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
import { ref, nextTick } from 'vue';
import { useApi } from '@directus/extensions-sdk';

const emit = defineEmits(['setFieldValue']);

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

    console.log('[import-win] setting fields:', data);

    const fields = [
      { field: 'cityState', value: data.cityState },
      { field: 'monthYear', value: data.monthYear },
      { field: 'description', value: data.description },
      { field: 'outcome', value: data.outcome },
    ];

    for (const payload of fields) {
      emit('setFieldValue', payload);
      await nextTick();
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
