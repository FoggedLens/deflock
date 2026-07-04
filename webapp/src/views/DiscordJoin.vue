<template>
  <DefaultLayout>
    <div class="loading-container">
      Loading...
    </div>

    <DiscordWarningDialog
      v-model="showDialog"
      :discordUrl="discordUrl"
      @proceed="handleProceed"
    />
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHead } from '@unhead/vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import DiscordWarningDialog from '@/components/DiscordWarningDialog.vue';

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
});

const discordUrl = 'https://discord.gg/aV7v4R3sKT';
const showDialog = ref(true);

function handleProceed(url: string) {
  window.open(url, '_blank');
}
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  font-size: 1.1rem;
  color: var(--df-text-color);
}
</style>
