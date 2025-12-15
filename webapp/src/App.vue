<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { computed, ref, watch, onMounted } from 'vue'
import { useTheme } from 'vuetify';
import DiscordWarningDialog from '@/components/DiscordWarningDialog.vue';
import { useDiscordIntercept } from '@/composables/useDiscordIntercept';

const theme = useTheme();
const router = useRouter();
const isDark = computed(() => theme.name.value === 'dark');
const isFullscreen = computed(() => router.currentRoute.value?.query.fullscreen === 'true');
const { showDialog, discordUrl, interceptDiscordLinks } = useDiscordIntercept();

function toggleTheme() {
  const newTheme = theme.global.name.value === 'dark' ? 'light' : 'dark';
  theme.global.name.value = newTheme;
  localStorage.setItem('theme', newTheme);
}

function handleDiscordProceed(url: string) {
  window.open(url, '_blank');
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    theme.global.name.value = savedTheme;
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.global.name.value = prefersDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme.global.name.value);
  }
  interceptDiscordLinks();
});

const items = [
  { title: 'Home', icon: 'mdi-home', to: '/' },
  { title: 'Map', icon: 'mdi-map', to: '/map' },
  { title: 'Learn', icon: 'mdi-school', to: '/what-is-an-alpr' },
  { title: 'News', icon: 'mdi-newspaper', to: '/blog' },
]

const contributeItems = [
  { title: 'Submit Cameras', icon: 'mdi-map-marker-plus', to: '/report' },
  { title: 'Hang Signs', icon: 'mdi-sign-direction', to: '/store' },
  { title: 'Public Records', icon: 'mdi-file-document', to: '/foia' },
  { title: 'City Council', icon: 'mdi-account-voice', to: '/council' },
]

const metaItems = [
  { title: 'Discord', customIcon: '/icon-discord.svg', customIconDark: '/icon-discord-white.svg', customIconGrey: '/icon-discord-grey.svg', href: 'https://discord.gg/aV7v4R3sKT'},
  { title: 'Contact', icon: 'mdi-email-outline', to: '/contact' },
  { title: 'GitHub', icon: 'mdi-github', href: 'https://github.com/frillweeman/deflock'},
  { title: 'Donate', icon: 'mdi-heart', to: '/donate'},
];
const drawer = ref(false)

watch(() => theme.global.name.value, (newTheme) => {
  const root = document.documentElement;
  if (newTheme === 'dark') {
    root.style.setProperty('--df-background-color', 'rgb(33, 33, 33)');
    root.style.setProperty('--df-text-color', '#ccc');
  } else {
    root.style.setProperty('--df-background-color', 'white');
    root.style.setProperty('--df-text-color', 'black');
  }
});
</script>

<template>
  <v-app>
    <template v-if="!isFullscreen">
      <v-app-bar
        flat
        prominent
      >
        <!-- Mobile hamburger menu -->
        <v-app-bar-nav-icon 
          variant="text" 
          @click.stop="drawer = !drawer"
          class="d-md-none"
          aria-label="Toggle Navigation Drawer"
        ></v-app-bar-nav-icon>

        <!-- Logo -->
        <v-toolbar-title style="flex: unset;">
          <div style="display: flex; align-items: center; cursor: pointer;" @click="router.push('/')">
            <v-img height="36" width="36" alt="DeFlock Icon" src="/favicons/apple-icon-144x144.png" />
            <v-img style="margin-left: 8px;" height="36" width="130" alt="DeFlock Logo" src="/deflock-logo.svg" />
          </div>
        </v-toolbar-title>

        <!-- Desktop horizontal navigation -->
        <div class="d-none d-md-flex ml-8 flex-grow-1">
          <!-- Main navigation items -->
          <div class="d-flex align-center">
            <v-btn 
              v-for="item in items.slice(1)" 
              :key="item.title"
              :to="item.to"
              variant="text"
              class="mx-1"
              :prepend-icon="item.icon"
            >
              {{ item.title }}
            </v-btn>
          </div>

          <v-spacer></v-spacer>

          <!-- Contribute section -->
          <div class="d-flex align-center">
            <v-menu offset-y>
              <template v-slot:activator="{ props }">
                <v-btn
                  variant="text"
                  v-bind="props"
                  append-icon="mdi-chevron-down"
                  class="mx-1"
                >
                  Contribute
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="item in contributeItems"
                  :key="item.title"
                  :to="item.to"
                  link
                >
                  <template v-slot:prepend>
                    <v-icon>{{ item.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <!-- Get Involved section -->
            <v-menu offset-y>
              <template v-slot:activator="{ props }">
                <v-btn
                  variant="text"
                  v-bind="props"
                  append-icon="mdi-chevron-down"
                  class="mx-1"
                >
                  Get Involved
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="item in metaItems"
                  :key="item.title"
                  :to="item.to"
                  :href="item.href"
                  :target="item.href ? '_blank' : undefined"
                  link
                >
                  <template v-slot:prepend>
                    <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
                    <v-img 
                      v-else-if="item.customIcon"
                      class="mr-8"
                      contain 
                      width="24" 
                      height="24" 
                      :src="isDark ? item.customIconDark : item.customIconGrey" 
                    />
                  </template>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <v-spacer class="d-md-none" />

        <v-btn icon @click="toggleTheme" aria-label="Toggle Theme">
          <v-icon>mdi-theme-light-dark</v-icon>
        </v-btn>
      </v-app-bar>

      <!-- Mobile navigation drawer -->
      <v-navigation-drawer
        v-model="drawer"
        temporary
        class="d-md-none"
        aria-label="Navigation Drawer"
      >
        <v-list nav aria-label="Main Navigation">
          <v-list-item
            v-for="item in items"
            :key="item.title"
            link
            :to="item.to"
            role="option"
          >
            <v-icon start>{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-list-item>
        </v-list>

        <v-divider class="my-2" aria-hidden="true" role="presentation" />

        <v-list-subheader class="px-4">Contribute</v-list-subheader>
        <v-list nav aria-label="Contribute Links">
          <v-list-item
            v-for="item in contributeItems"
            :key="item.title"
            link
            :to="item.to"
            role="option"
          >
            <v-icon v-if="item.icon" start>{{ item.icon }}</v-icon>
            <span style="vertical-align: middle;">{{ item.title }}</span>
          </v-list-item>
        </v-list>
          
        <v-divider class="my-2" aria-hidden="true" role="presentation" />
          
        <v-list-subheader class="px-4">Get Involved</v-list-subheader>
        <v-list nav aria-label="Meta Links">
          <v-list-item
            v-for="item in metaItems"
            :key="item.title"
            link
            :to="item.to"
            :href="item.href"
            :target="item.href ? '_blank' : undefined"
            role="option"
          >
            <v-icon v-if="item.icon" start>{{ item.icon }}</v-icon>
            <v-img
              v-else-if="item.customIcon"
              class="mr-2 custom-icon"
              contain
              width="24"
              height="24"
              :src="isDark ? item.customIconDark : item.customIcon"
              style="vertical-align: middle;"
            />
            <span style="vertical-align: middle;">{{ item.title }}</span>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </template>

    <v-main>
      <RouterView />
    </v-main>

    <DiscordWarningDialog
      v-model="showDialog"
      :discordUrl="discordUrl"
      @proceed="handleDiscordProceed"
    />
  </v-app>
</template>

<style lang="css" scoped>
.custom-icon {
  display: inline-block;
  margin-right: 5px;
}
</style>
