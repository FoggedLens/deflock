<template>
  <v-footer>
    <v-container>
      <v-row align-items="center" justify="center">

        <v-col cols="12" class="mt-4">
          <v-img height="30" contain src="/deflock-logo-grey.svg" />
        </v-col>
        
        <!-- Info -->
        <v-col cols="12" sm="4">
          <v-list-subheader class="mx-2 font-weight-black text-subtitle-1" :class="isDark ? 'text-grey-lighten-5' : 'text-black'" id="footer-info-heading">Info</v-list-subheader>

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
                <v-icon class="custom-icon" start :icon="link.icon" :alt="link.alt" />
                {{ link.title }}
                </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Contact Us -->
        <v-col cols="12" sm="4">
          <v-list-subheader class="mx-2 font-weight-black text-subtitle-1" :class="isDark ? 'text-grey-lighten-5' : 'text-black'" id="footer-contact-heading">Contact Us</v-list-subheader>

          <v-list density="compact" aria-labelledby="footer-contact-heading" role="list">
            <v-list-item role="listitem"
              v-for="link in contactLinks"
              :key="link.title"
              link
              :to="link.to"
              slim
              :aria-label="link.alt"
            >
                <v-list-item-title class="d-flex align-center">
                <v-icon class="custom-icon" start :icon="link.icon" :alt="link.alt" />
                {{ link.title }}
                </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Get Involved -->
        <v-col cols="12" sm="4">
          <v-list-subheader class="mx-2 font-weight-black text-subtitle-1" :class="isDark ? 'text-grey-lighten-5' : 'text-black'" id="footer-involved-heading">Get Involved</v-list-subheader>

          <v-list density="compact" aria-labelledby="footer-involved-heading" role="list">
            <v-list-item
              v-for="link in getInvolvedLinks"
              :key="link.title"
              link
              slim
              :href="link.href"
              :to="link.to"
              :target="link.href ? '_blank' : undefined"
              role="listitem"
            >
              <v-list-item-title class="d-flex align-center justify-start">
                <v-icon start class="custom-icon" :icon="link.icon"></v-icon>
                {{ link.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Copyright -->
        <v-col
          class="text-center d-flex align-center justify-center text-grey-darken-1"
          cols="12"
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
const theme = useTheme();
const isDark = computed(() => theme.name.value === 'dark');
const currentYear = new Date().getFullYear();

const internalLinks = [
  { title: 'About', to: '/about', icon: 'mdi-information', alt: 'About' },
  { title: 'Privacy Policy', to: '/privacy', icon: 'mdi-shield-lock', alt: 'Privacy Policy' },
  { title: 'Terms of Service', to: '/terms', icon: 'mdi-file-document', alt: 'Terms of Service' },
];

const contactLinks = [
  { title: 'Press', to: '/press', icon: 'mdi-newspaper', alt: 'Press' },
  { title: 'Contact', to: '/contact', icon: 'mdi-email', alt: 'Contact' },
];

const getInvolvedLinks = [
  { title: 'Local Groups', to: '/groups', icon: 'mdi-account-group' },
  { title: 'GitHub', href: 'https://github.com/FoggedLens/deflock', icon: 'mdi-github' },
  { title: 'Submit Cameras', to: '/report', icon: 'mdi-map-marker-plus' },
]
</script>

<style scoped>
.custom-icon {
  opacity: var(--v-medium-emphasis-opacity);
}
.copyright p {
  font-size: 0.85rem;
  line-height: 0.5rem;
}
</style>
