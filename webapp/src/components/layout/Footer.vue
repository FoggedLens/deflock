<template>
  <v-footer>
    <v-container>
      <v-row align-items="center" justify="center">

        <v-col cols="12" class="mt-4">
          <v-img height="30" contain src="/deflock-logo-grey.svg" />
        </v-col>
        
        <!-- Internal Links -->
        <v-col cols="7" sm="3">
          <v-list density="compact">
            <v-list-subheader>Info</v-list-subheader>
            <v-list-item
              v-for="link in internalLinks"
              :key="link.title"
              link
              :to="link.to"
              slim
            >
                <v-list-item-title class="d-flex align-center">
                <v-icon class="custom-icon" start :icon="link.icon" />
                {{ link.title }}
                </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- External Links -->
        <v-col cols="5" sm="3">
          <v-list density="compact">
            <v-list-subheader>Get Involved</v-list-subheader>
            <v-list-item
              v-for="link in externalLinks"
              :key="link.title"
              link
              slim
              :href="link.href"
              :to="link.to"
              :target="link.href ? '_blank' : undefined"
            >
              <v-list-item-title class="d-flex align-center justify-start">
                <v-icon start v-if="link.icon" class="custom-icon" :icon="link.icon"></v-icon>
                <img v-else-if="link.customIcon" class="mr-2 custom-icon" width="24" height="24" :src="isDark ? link.customIconDark : link.customIcon" />
                {{ link.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Copyright -->
        <v-col
          class="text-center serif copyright d-flex align-center justify-center text-grey-darken-1"
          cols="12"
          sm="6"
        >
        <div>
          <p>&copy; {{ currentYear }} DeFlock. All Rights Reserved</p>
          <p>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" style="color: unset; font-weight: normal;">OpenStreetMap contributors</a></p>
          <p class="mt-4">v1.0.6</p>
        </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
const theme = useTheme();
const isDark = computed(() => theme.name.value === 'dark');
const currentYear = new Date().getFullYear();

const internalLinks = [
  { title: 'About', to: '/about', icon: 'mdi-information' },
  { title: 'Privacy Policy', to: '/privacy', icon: 'mdi-shield-lock' },
  { title: 'Terms of Service', to: '/terms', icon: 'mdi-file-document' },
  { title: 'Contact', to: '/contact', icon: 'mdi-email' },
];

const externalLinks = [
  { title: 'Discord', href: 'https://discord.gg/aV7v4R3sKT', customIcon: '/icon-discord.svg', customIconDark: '/icon-discord-white.svg' },
  { title: 'Donate', to: '/donate', icon: 'mdi-heart' },
  { title: 'GitHub', href: 'https://github.com/FoggedLens/deflock', icon: 'mdi-github' },
]
</script>

<style scoped>
.custom-icon {
  opacity: var(--v-medium-emphasis-opacity);
}
.copyright {
  font-size: 0.85rem;
}
</style>
