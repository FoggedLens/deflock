<template>
<DefaultLayout no-bottom-margin>
  <template #header>
    <div class="hero-background">
      <v-container class="text-center py-8">
        <v-row justify="center">
          <v-col cols="12" md="8">
            <h1 class="display-1 px-4 mb-4">Welcome to DeFlock</h1>
            <h2 class="text-h5 px-4 mb-6">
              An open-source project mapping license plate readers.
            </h2>
            
            <ALPRCounter class="my-6" />
    
            <v-btn size="large" color="rgb(18, 151, 195)" large @click="goToMap({ withCurrentLocation: true })">
              Explore the Map
              <v-icon end>mdi-map</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </template>
  
  <!-- Dangers Section -->
  <v-container class="pb-10 text-center">
    <h2 class="mb-6">What are ALPRs</h2>
    
    <p class="text-left px-6">
      Automated License Plate Readers (ALPRs or LPRs) are AI-powered cameras that capture and analyze images of <b>all passing vehicles</b>, storing details like your car's <b>location, date, and time</b>. They also capture your car's <b>make, model, color</b>, and <b>identifying features</b> such as dents, roof racks, and bumper stickers, often turning these into <b>searchable data points</b>.
    </p>
    <p class="text-left px-6">
      These cameras collect data on millions of vehicles <b>regardless of whether the driver is suspected of a crime</b>. These systems are marketed as indispensable tools to fight crime, but they ignore the powerful tools police already have to track criminals, such as cell phone location data, <b>creating a loophole that doesn't require a warrant</b>.
    </p>

    <div class="alpr-demo-container my-8">
      <v-img 
        max-width="500" 
        src="/lpr-demo.webp" 
        class="mx-auto alpr-demo-image" 
        style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
      />
      <p class="text-caption text-center mt-3 px-4" style="opacity: 0.8; font-style: italic;">
        Example of an annotated license plate reader photo showing captured vehicle details
      </p>
    </div>

    <v-divider class="my-8" />

    <h2 class="display-2 mb-4">The Dangers of ALPRs</h2>

    <v-row class="align-center mt-4">
      <v-col cols="12" md="4" class="text-center">
        <v-card>
          <v-card-title class="headline">
            <v-icon x-large class="mr-2">mdi-shield-alert</v-icon>
            Privacy Violations
          </v-card-title>
          <v-card-text>
            ALPRs <b>track your movements</b> and <b>store your data</b> for long periods of time, creating a detailed record of <b>your location history.</b>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4" class="text-center">
        <v-card>
          <v-card-title class="headline">
            <v-icon x-large class="mr-2">mdi-robber</v-icon>
            Risk of Misuse
          </v-card-title>
          <v-card-text>
            Data from ALPRs has led to <a target="_blank" href="https://www.newsobserver.com/news/state/north-carolina/article287381160.html">wrongful arrests</a>, profiling, and <a target="_blank" href="https://www.kwch.com/2022/10/31/kechi-police-lieutenant-arrested-using-police-technology-stalk-wife/">stalking ex-partners</a> by police officers.
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4" class="text-center">
        <v-card>
          <v-card-title class="headline">
            <v-icon x-large class="mr-2">mdi-handcuffs</v-icon>
            Limited Benefits
          </v-card-title>
          <v-card-text>
            There's <b>no substantial evidence</b> that ALPRs effectively prevent crime, despite <a target="_blank" href="https://www.404media.co/researcher-who-oversaw-flock-surveillance-study-now-has-concerns-about-it/">Flock's unethical attempts</a> to prove otherwise.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <p class="px-6 mt-8">
      ALPRs are a serious risk to your privacy and civil liberties. These systems <b>continuously record your movements without a warrant</b>, probable cause, or even reasonable suspicion. Your driving history is <b>rarely confined</b> to the town or city where the cameras are installed. It's typically shared with <router-link to="/what-is-an-alpr#faq-transparency">thousands of other agencies nationwide (secretly)</router-link>. Once the data is out of your community, you have no control over how it's used or what rules apply, <b>leading to instances of misuse.</b>
    </p>

    <v-btn class="my-4" color="rgb(18, 151, 195)" large to="/what-is-an-alpr">
      <v-icon start>mdi-book-open-page-variant</v-icon>
      Learn about ALPRs
    </v-btn>

    <v-divider class="my-8" />

    <!-- What is Flock -->
    <div class="flock-resources-section my-8">
      <h2 class="mb-4">What is Flock?</h2>
      <p class="px-6 text-left">
        <a target="_blank" href="https://consumerrights.wiki/w/Flock_Safety">Flock Safety</a> is one of the largest ALPR vendors in the United States. Their cameras are installed for <b>police departments, businesses, and HOAs</b>. Captured vehicle data is uploaded to Flock's cloud system, where participating agencies can <b>search and share information across jurisdictions</b>.
      </p>

      <p class="text-left px-6">Flock is <b>not the only ALPR vendor</b>, and other vendors still participate in similar practices. See this list of <router-link to="/identify">other common ALPR vendors</router-link>.</p>

      <v-btn class="mt-4" variant="outlined" color="rgb(18, 151, 195)" to="/what-is-an-alpr#similar">
        Learn more about Flock
        <v-icon end>mdi-arrow-right</v-icon>
      </v-btn>
    </div>
  </v-container>
  
  <!-- Map Section -->
  <v-container fluid class="map-section py-10 text-center">
    <h2 class="display-2 mb-4">Explore ALPR Locations Near You</h2>
    <v-btn color="white" large @click="goToMap({ withCurrentLocation: true })">
      View the Map
      <v-icon end>mdi-map</v-icon>
    </v-btn>
  </v-container>
</DefaultLayout>
</template>

<style>
.featured-image-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

.map-section {
  background: url('/map-interface-nationwide.webp') no-repeat center center;
  background-size: cover;
  color: white;
  padding: 100px 0;
  position: relative;
}
.map-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.map-section > * {
  position: relative;
  z-index: 2;
}

.hero-background {
  background: url('/hero.webp') no-repeat right center / cover;
  position: relative;
  min-height: 400px;
  color: white;
}

.hero-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.hero-background > * {
  position: relative;
  z-index: 2;
}

.hero-background h1,
.hero-background h2 {
  color: white;
}

.bigger {
  font-size: 1.1rem;
}

.alpr-demo-container {
  max-width: 600px;
  margin: 0 auto;
}

.alpr-demo-image {
  transition: transform 0.2s ease;
}

.alpr-demo-image:hover {
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .alpr-demo-container .v-img {
    max-width: 100% !important;
    margin: 0 16px;
  }
}

.flock-resources-section {
  margin: 0 auto;
}
</style>


<script setup lang="ts">
import { useRouter } from 'vue-router';
import ALPRCounter from '@/components/ALPRCounter.vue';
import { useGlobalStore } from '@/stores/global';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const router = useRouter();
const { setCurrentLocation } = useGlobalStore();

interface GoToMapOptions {
  withCurrentLocation?: boolean;
}

async function goToMap(options: GoToMapOptions = {}) {
  if (options.withCurrentLocation) {
    setCurrentLocation()
    .then((currentLocation) => {
      const [lat, lon] = currentLocation;
      router.push({ path: '/map', hash: `#map=12/${lat.toFixed(6)}/${lon.toFixed(6)}` });
    })
    .catch(() => {
      router.push({ path: '/map' });
    });
  } else {
    router.push({ path: '/map' });
  }
}
</script>
