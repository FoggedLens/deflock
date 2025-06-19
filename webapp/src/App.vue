<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useTheme } from 'vuetify';

const theme = useTheme();
const router = useRouter();
const isDark = computed(() => theme.name.value === 'dark');
const isFullscreen = computed(() => router.currentRoute.value?.query.fullscreen === 'true');

function toggleTheme() {
  const newTheme = theme.global.name.value === 'dark' ? 'light' : 'dark';
  theme.global.name.value = newTheme;
}

const items = [
  { title: 'Home', icon: 'mdi-home', to: '/' },
  { title: 'Map', icon: 'mdi-map', to: '/map' },
  { title: 'What are ALPRs', icon: 'mdi-cctv', to: '/what-is-an-alpr' },
  { title: 'Report an ALPR', icon: 'mdi-map-marker-plus', to: '/report' },
  { title: 'Public Records', icon: 'mdi-file-document', to: '/foia' },
  { title: 'Wardriving', icon: 'mdi-car-connected', to: '/wardriving' },
  // { title: 'Known Operators', icon: 'mdi-police-badge', to: '/operators' },
  // { title: 'About', icon: 'mdi-information', to: '/about' },
  // { title: 'Feature Roadmap', icon: 'mdi-road-variant', to: '/roadmap' },
]

const metaItems = [
  { title: 'Discord', customIcon: '/icon-discord.svg', customIconDark: '/icon-discord-white.svg', href: 'https://discord.gg/aV7v4R3sKT'},
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
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

        <v-toolbar-title>
          <v-img style="cursor: pointer" height="36" width="130" src="/deflock-logo.svg" @click="router.push('/')" />
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <!-- <v-btn icon>
          <v-icon @click="toggleTheme">mdi-theme-light-dark</v-icon>
        </v-btn> -->
      </v-app-bar>

      <v-navigation-drawer
        v-model="drawer"
        temporary
      >
        <v-list nav>
          <v-list-item
            v-for="item in items"
            :key="item.title"
            link
            :to="item.to"
          ><v-icon start>{{ item.icon }}</v-icon>{{ item.title }}</v-list-item>
          
          <v-divider />
          
          <v-list-subheader>Get Involved</v-list-subheader>
          <v-list-item
            v-for="item in metaItems"
            :key="item.title"
            link
            :to="item.to"
            :href="item.href"
            :target="{ '_blank': item.href }"
          >
            <v-icon v-if="item.icon" start>{{ item.icon }}</v-icon>
              <v-img v-else-if="item.customIcon" class="mr-2 custom-icon" contain width="24" height="24" :src="isDark ? item.customIconDark : item.customIcon" style="vertical-align: middle;" />
              <span style="vertical-align: middle;">{{ item.title }}</span>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </template>

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<style lang="css" scoped>
.custom-icon {
  display: inline-block;
  margin-right: 5px;
}
</style>
