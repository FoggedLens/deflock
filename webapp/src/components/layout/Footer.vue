<template>
  <v-footer>
    <v-container>
      <v-row align-items="center" justify="center">

        <v-col cols="12" class="mt-4">
          <v-img height="30" contain src="/deflock-logo-grey.svg" />
        </v-col>
        
        <!-- Internal Links -->
        <v-col cols="7" sm="3">
          <v-list-subheader class="mx-4 font-weight-black text-subtitle-1" :class="isDark ? 'text-grey-lighten-5' : 'text-black'" id="footer-info-heading">Info</v-list-subheader>
          <v-list density="compact" aria-labelledby="footer-info-heading" role="list">
            <v-list-item role="listitem"
              v-for="link in internalLinks"
              :key="link.title"
              link
              :to="link.to"
              slim
              :aria-label="link.alt"
            >
                <v-list-item-title class="d-flex align-center">
                <v-icon start :alt="link.alt">
                  <component :is="link.icon" />
                </v-icon>
                {{ link.title }}
                </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- External Links -->
        <v-col cols="5" sm="3">
          <v-list-subheader class="mx-4 font-weight-black text-subtitle-1" :class="isDark ? 'text-grey-lighten-5' : 'text-black'" id="footer-involved-heading">Get Involved</v-list-subheader>
          <v-list density="compact" aria-labelledby="footer-involved-heading" role="list">
            <v-list-item
              v-for="link in externalLinks"
              :key="link.title"
              link
              slim
              :href="link.href"
              :to="link.to"
              :target="link.href ? '_blank' : undefined"
              role="listitem"
            >
              <v-list-item-title class="d-flex align-center justify-start">
                <v-icon start :alt="link.alt">
                  <component :is="link.icon" />
                </v-icon>
                {{ link.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Copyright -->
        <v-col
          class="text-center d-flex align-center justify-center text-grey-darken-1"
          cols="12"
          sm="6"
        >
          <div class="copyright" :class="isDark ? 'text-grey-lighten-5' : 'text-black'">
            <p>&copy; {{ currentYear }} DeFlock. All Rights Reserved</p>
            <p>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" style="color: unset; font-weight: normal;">OpenStreetMap contributors</a></p>
            <p class="mt-4">v1.1.0</p>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';

import InformationIcon from '@iconify-vue/mdi/information';
import ShieldLockIcon from '@iconify-vue/mdi/shield-lock';
import FileDocumentIcon from '@iconify-vue/mdi/file-document';
import NewspaperIcon from '@iconify-vue/mdi/newspaper';
import EmailIcon from '@iconify-vue/mdi/email';
import HeartIcon from '@iconify-vue/mdi/heart';
import GithubIcon from '@iconify-vue/mdi/github';
import DiscordIcon from '@iconify-vue/ic/baseline-discord';

const theme = useTheme();
const isDark = computed(() => theme.name.value === 'dark');
const currentYear = new Date().getFullYear();

const internalLinks = [
  { title: 'About', to: '/about', icon: InformationIcon, alt: 'About' },
  { title: 'Privacy Policy', to: '/privacy', icon: ShieldLockIcon, alt: 'Privacy Policy' },
  { title: 'Terms of Service', to: '/terms', icon: FileDocumentIcon, alt: 'Terms of Service' },
  { title: 'Press', to: '/press', icon: NewspaperIcon, alt: 'Press' },
  { title: 'Contact', to: '/contact', icon: EmailIcon, alt: 'Contact' },
];

const externalLinks = [
  { title: 'Discord', href: 'https://discord.gg/aV7v4R3sKT', icon: DiscordIcon, alt: 'Discord Logo' },
  { title: 'Donate', to: '/donate', icon: HeartIcon, alt: 'Donate' },
  { title: 'GitHub', href: 'https://github.com/FoggedLens/deflock', icon: GithubIcon, alt: 'GitHub Logo' },
]
</script>

<style scoped>
.copyright p {
  font-size: 0.85rem;
  line-height: 0.5rem;
}
</style>
