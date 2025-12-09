<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { computed, ref, watch, onMounted } from 'vue'
import { useTheme } from 'vuetify';
import DiscordWarningDialog from '@/components/DiscordWarningDialog.vue';
import { useDiscordIntercept } from '@/composables/useDiscordIntercept';

// Icons
import HamburgerIcon from '@iconify-vue/mdi/menu';
import HomeIcon from '@iconify-vue/mdi/home';
import MapIcon from '@iconify-vue/mdi/map';
import SchoolIcon from '@iconify-vue/mdi/school';
import ShoppingIcon from '@iconify-vue/mdi/shopping-cart';
import MapMarkerPlusIcon from '@iconify-vue/mdi/map-marker-plus';
import FileDocumentIcon from '@iconify-vue/mdi/file-document';
import AccountVoiceIcon from '@iconify-vue/mdi/account-voice';
import EmailOutlineIcon from '@iconify-vue/mdi/email-outline';
import GithubIcon from '@iconify-vue/mdi/github';
import HeartIcon from '@iconify-vue/mdi/heart';
import DiscordIcon from '@iconify-vue/ic/baseline-discord';
import ChevronDownIcon from '@iconify-vue/mdi/chevron-down';
import ThemeIcon from '@iconify-vue/mdi/theme-light-dark';

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
  { title: 'Home', icon: HomeIcon, to: '/' },
  { title: 'Map', icon: MapIcon, to: '/map' },
  { title: 'Learn', icon: SchoolIcon, to: '/what-is-an-alpr' },
  { title: 'Store', icon: ShoppingIcon, to: '/store' },
]

const contributeItems = [
  { title: 'Submit Cameras', icon: MapMarkerPlusIcon, to: '/report' },
  { title: 'Public Records', icon: FileDocumentIcon, to: '/foia' },
  { title: 'City Council', icon: AccountVoiceIcon, to: '/council' },
]

const metaItems = [
  { title: 'Discord', icon: DiscordIcon, href: 'https://discord.gg/aV7v4R3sKT'},
  { title: 'Contact', icon: EmailOutlineIcon, to: '/contact' },
  { title: 'GitHub', icon: GithubIcon, href: 'https://github.com/frillweeman/deflock'},
  { title: 'Donate', icon: HeartIcon, to: '/donate'},
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
          :icon="HamburgerIcon"
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
                  :append-icon="ChevronDownIcon"
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
                    <v-icon>
                      <component :is="item.icon" class="custom-icon" />
                    </v-icon>
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
                  :append-icon="ChevronDownIcon"
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
                    <v-icon>
                      <component :is="item.icon" />
                    </v-icon>
                  </template>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <v-spacer class="d-md-none" />

        <v-btn icon @click="toggleTheme" aria-label="Toggle Theme">
          <v-icon>
            <ThemeIcon />
          </v-icon>
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
            <v-icon start>
              <component :is="item.icon" />
            </v-icon>
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
            <v-icon start>
              <component :is="item.icon" />
            </v-icon>
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
            <v-icon start>
              <component :is="item.icon" />
            </v-icon>
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
