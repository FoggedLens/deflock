<template>
  <v-container class="sponsor-page">
    <!-- Hero Section -->
    <v-row justify="center" class="hero-section-sponsor text-center mb-4">
      <v-col cols="12" md="8">
        <h1 class="mb-4">Join Us in Protecting Privacy</h1>
        <p class="mb-4">
          DeFlock empowers individuals to understand and combat the rise of Automatic License Plate Readers (ALPRs). Your support helps us spread awareness, maintain infrastructure, and advocate for privacy rights.
        </p>
        <v-btn href="https://github.com/sponsors/frillweeman" target="_blank" color="rgb(18, 151, 195)" class="mt-4">Donate Now</v-btn>
      </v-col>
    </v-row>

    <!-- GitHub Sponsors Section -->
    <v-row justify="center" class="sponsors-section text-center">
      <v-col cols="12" md="10">
        <h2 class="mb-4">Our Amazing Sponsors</h2>
        <v-row>
          <v-col v-for="sponsor in sponsors" :key="sponsor.login" cols="6" md="4" lg="3">
            <v-card variant="flat" class="text-center py-2">
              <v-avatar size="64px" class="mb-3">
                <v-img :src="sponsor.avatarUrl" :alt="sponsor.name" />
              </v-avatar>
              <p>{{ sponsor.name ?? sponsor.login }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>

  <!-- Footer Section -->
  <v-footer class="text-center mt-8">
    <v-row>
      <v-col>
        <p>&copy; {{ new Date().getFullYear() }} DeFlock. All rights reserved.</p>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from "vue";
import { getSponsors } from "@/services/apiService";

interface Sponsor {
  login: string;
  name: string;
  avatarUrl: string;
}

const sponsors: Ref<Sponsor[]> = ref([]);

onMounted(() => {
  getSponsors()
    .then((data) => {
      sponsors.value = data.map((s: any) => s.sponsor);
    })
    .catch((error) => {
      console.error(error);
    });
});
</script>

<style scoped>
.hero-section-sponsor {
  background: url('/torches.webp') no-repeat center center;
  background-size: cover;
  color: white;
  padding: 100px 0 !important;
  position: relative;
  }

 .hero-section-sponsor::before {
   content: '';
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background: rgba(0, 0, 0, 0.5);
   z-index: 1;
 }

 .hero-section-sponsor > * {
   position: relative;
   z-index: 2;
}
</style>
