<template>
<DefaultLayout>
  <template #header>
    <Hero
      title="Support DeFlock"
      image-url="/donate.webp"
      background-position="0 25%"
      button-text="Donate Now"
      button-href="https://buymeacoffee.com/deflock"
      :opacity="0.25"
    />
  </template>

  <v-container fluid>
    <!-- GitHub Sponsors Section -->
    <v-row justify="center" class="sponsors-section text-center">
      <v-col cols="12" md="10">
        <h2 class="mb-2">Founding Sponsors</h2>
        <p class="mb-8">
          <a target="_blank" href="https://buymeacoffee.com/deflock">We've made donating easier</a>, but if you want to see your name on this list, <a target="_blank" href="https://github.com/sponsors/frillweeman">sponsor us on GitHub!</a>
        </p>

        <v-row>
          <v-col v-if="isLoadingSponsors" v-for="n in 4" cols="6" md="4" lg="3">
            <v-skeleton-loader type="image"></v-skeleton-loader>
          </v-col>
          <v-col v-else v-for="sponsor in sponsors" :key="sponsor.login" cols="6" md="4" lg="3">
            <v-card :href="sponsor.url" target="_blank" variant="flat" class="text-center py-2" color="transparent">
              <v-avatar size="64px" class="mb-3">
                <v-img :src="sponsor.avatarUrl" :alt="sponsor.name" />
              </v-avatar>
              <p>{{ sponsor.name ?? sponsor.login }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Special Thanks Section -->
    <v-row justify="center" class="sponsors-section text-center mt-4">
      <v-col cols="12" md="10">
        <h2 class="mb-2">Special Thanks</h2>
        
        <v-card href="https://www.404media.co/" target="_blank" max-width="250" variant="flat" class="text-center py-2 mx-auto" color="transparent">
          <v-img class="ma-4" src="/404media.svg" alt="404 Media Logo" contain style="background: rgb(245,245,245)" />
          <v-card-title class="mt-2 serif text-center font-weight-bold">404 Media</v-card-title>
          <v-card-text>
            <p>Special thanks to Jason Koebler at 404 Media for popularizing this project.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from "vue";
import { getSponsors } from "@/services/apiService";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import Hero from "@/components/layout/Hero.vue";

interface Sponsor {
  login: string;
  name: string;
  avatarUrl: string;
  url: string;
}

const sponsors: Ref<Sponsor[]> = ref([]);
const isLoadingSponsors = ref(true);

onMounted(() => {
  getSponsors()
    .then((data) => {
      sponsors.value = data.map((s: any) => s.sponsor);
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      isLoadingSponsors.value = false;
    });
});
</script>
