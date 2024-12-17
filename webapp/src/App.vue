<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import { useTheme } from 'vuetify';

const theme = useTheme();
const router = useRouter();

function toggleTheme() {
  const newTheme = theme.global.name.value === 'dark' ? 'light' : 'dark';
  theme.global.name.value = newTheme;
}

const items = [
  { title: 'Home', icon: 'mdi-home', to: '/' },
  { title: 'Map', icon: 'mdi-map', to: '/map' },
  { title: 'What is an ALPR?', icon: 'mdi-cctv', to: '/what-is-an-alpr' },
  { title: 'Dangers of ALPRs', icon: 'mdi-shield-alert', to: '/dangers' },
  { title: 'Report an ALPR', icon: 'mdi-map-marker-plus', to: '/report' },
  { title: 'Known Operators', icon: 'mdi-police-badge', to: '/operators' },
  // { title: 'About', icon: 'mdi-information', to: '/about' },
  // { title: 'Feature Roadmap', icon: 'mdi-road-variant', to: '/roadmap' },
]

const metaItems = [
  { title: 'Discord', icon: 'mdi-chat-processing-outline', href: 'https://discord.gg/aV7v4R3sKT'},
  { title: 'Contact', icon: 'mdi-email-outline', to: '/contact' },
  { title: 'GitHub', icon: 'mdi-github', href: 'https://github.com/frillweeman/deflock'},
  { title: 'Donate', icon: 'mdi-heart', to: '/donate'},
];
const drawer = ref(false)

watch(() => theme.global.name.value, (newTheme) => {
  const root = document.documentElement;
  if (newTheme === 'dark') {
    root.style.setProperty('--df-background-color', 'rgb(33, 33, 33)');
    root.style.setProperty('--df-page-background-color', 'unset');
    root.style.setProperty('--df-text-color', '#ccc');
  } else {
    root.style.setProperty('--df-background-color', 'white');
    root.style.setProperty('--df-page-background-color', '#f5f5f5');
    root.style.setProperty('--df-text-color', 'black');
  }
});
</script>

<template>
  <v-app>
    <v-app-bar
      flat
      prominent
    >
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>
        <v-img style="cursor: pointer" height="36" width="130" src="/deflock-logo.svg" @click="router.push('/')" />
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon @click="toggleTheme">mdi-theme-light-dark</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      temporary
    >
      <v-list nav>
        <v-list-subheader>DeFlock</v-list-subheader>
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
        ><v-icon start>{{ item.icon }}</v-icon>{{ item.title }}</v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>
