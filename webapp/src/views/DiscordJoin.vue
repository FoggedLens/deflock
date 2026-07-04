<template>
  <DefaultLayout>
    <v-container class="narrow-text text-center">
      <h1 class="mb-4">Join the DeFlock Discord</h1>
      <v-btn color="primary" size="large" rounded @click="showDialog = true">
        <v-icon start>mdi-discord</v-icon>
        Join Discord
      </v-btn>
    </v-container>

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
