<template>
  <DefaultLayout>
    <v-container class="narrow-text text-center">
      <v-btn color="primary" size="large" rounded @click="showDialog = true">
        <v-img class="mr-2" contain width="24" height="24" :src="isDark ? '/icon-discord-white.svg' : '/icon-discord.svg'" />
        Join DeFlock Discord
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
import { computed, ref } from 'vue';
import { useTheme } from 'vuetify';
import { useHead } from '@unhead/vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import DiscordWarningDialog from '@/components/DiscordWarningDialog.vue';

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
});

const theme = useTheme();
const isDark = computed(() => theme.name.value === 'dark');

const discordUrl = 'https://discord.gg/aV7v4R3sKT';

const showDialog = ref(true);

function handleProceed(url: string) {
  window.open(url, '_blank');
}
</script>
