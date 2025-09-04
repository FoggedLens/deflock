<template>
  <!-- Hero Section -->
  <v-container fluid class="hero-section">
    <v-row justify="center">
      <v-col cols="12" md="8" class="text-center">
        <h1 class="display-1 px-8">You're Being Tracked</h1>
        
        <ALPRCounter class="my-6" />
        
        <!-- Featured On Section -->
        <v-container class="featured-on-section my-8">
          <h4 class="mb-4" style="opacity: 0.8">Featured On</h4>
          <v-row justify="center" align-items="center">
            <v-card v-for="site in featuredOn" flat target="_blank" :href="site.url" class="mx-4" :width="site.wide ? 200 : 100" height="50" style="background: rgba(0,0,0,0)">
              <v-img contain :src="site.logo" :alt="site.name" class="featured-logo" style="display: flex; align-items: center; height: 100%;" />
            </v-card>
          </v-row>
        </v-container>

        <v-btn size="large" color="rgb(18, 151, 195)" large @click="goToMap({ withCurrentLocation: true })">
          Explore the Map
          <v-icon end>mdi-map</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
  
  <!-- Dangers Section -->
  <v-container class="py-10 text-center info-section">

    <h2 class="mb-4">What is an ALPR</h2>
    <p class="text-left px-6">
      Automated License Plate Readers (ALPRs) are AI-powered cameras that capture and analyze images of all passing vehicles, storing details like your car's location, date, and time. They also capture your car's make, model, color, and identifying features such as dents, roof racks, and bumper stickers, <a href="https://www.flocksafety.com/products/license-plate-readers#:~:text=No%20Plate%3F%20No%20Problem" target="_blank">often turning these into searchable data points</a>. These cameras collect data on millions of vehicles—regardless of whether the driver is suspected of a crime. While these systems can be useful for tracking stolen cars or wanted individuals, they are mostly used to track the movements of innocent people.
    </p>

    <v-divider class="my-8" />

    <h2 class="display-2 mb-4">The Dangers of ALPRs</h2>
    <p class="px-6">
      ALPRs are a serious risk to your privacy and civil liberties. These systems continuously record people's movements, often without a warrant, probable cause, or even reasonable suspicion. Your driving history is rarely confined to the town or city where the cameras are installed. It's typically shared with <router-link to="/what-is-an-alpr#faq-transparency">thousands of other agencies nationwide (secretly)</router-link>. Once the data is out of your community, you have no control over how it's used or what rules apply. And once this kind of tracking infrastructure exists, there are no guarantees it will only be used against criminals.
    </p>
    <p class="px-6 pt-6">
      Learn more about how Flock, the most popular ALPR vendor<sup>1</sup>, is being used in your community on the independent site:
      <a target="_blank" href="https://eyesonflock.com" style="text-decoration: underline;">
        Eyes on Flock
        <v-icon size="small">mdi-open-in-new</v-icon>
      </a>.
    </p>
    <footer class="serif text-grey-darken-2 mt-4">
      <small><sup>[1]</sup> This claim is based on an OSM Overpass API query conducted on 7/21/2025</small>
    </footer>
    
    <v-row class="align-center mt-4">
      <v-col cols="12" md="4" class="text-center">
        <v-card>
          <v-card-title class="headline">
            <v-icon x-large class="mr-2">mdi-shield-alert</v-icon>
            Privacy Violations
          </v-card-title>
          <v-card-text>
            ALPRs track your movements and store your data for long periods of time, creating a detailed record of your location history.
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
            There's no substantial evidence that ALPRs effectively prevent crime, despite <a target="_blank" href="https://www.404media.co/researcher-who-oversaw-flock-surveillance-study-now-has-concerns-about-it/">Flock's unethical attempts</a> to prove otherwise.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-btn class="mt-8" color="rgb(18, 151, 195)" large to="/what-is-an-alpr">
      <v-icon start>mdi-book-open-page-variant</v-icon>
      Read More
    </v-btn>
  </v-container>
  
  <!-- Map Section -->
  <v-container fluid class="map-section py-10 text-center">
    <h2 class="display-2 mb-4">Explore ALPR Locations Near You</h2>
    <v-btn color="white" large @click="goToMap({ withCurrentLocation: true })">
      View the Map
      <v-icon end>mdi-map</v-icon>
    </v-btn>
  </v-container>
  
  <Footer />
</template>

<style>
.hero-section {
  background: url('/flock-camera.jpeg') no-repeat center center;
  background-size: cover;
  color: white;
  padding: 60px 0 50px 0 !important;
  position: relative;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1;
}

.hero-section > * {
  position: relative;
  z-index: 2;
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

.bigger {
  font-size: 1.1rem;
}

.featured-logo {
  opacity: 0.7;
}
</style>


<script setup lang="ts">
import { useRouter } from 'vue-router';
import ALPRCounter from '@/components/ALPRCounter.vue';
import { useGlobalStore } from '@/stores/global';
import Footer from '@/components/layout/Footer.vue';

const router = useRouter();
const { setCurrentLocation } = useGlobalStore();

interface GoToMapOptions {
  withCurrentLocation?: boolean;
}

const featuredOn = [
{
  name: 'Forbes',
  logo: '/white-logos/forbes.svg',
  url: 'https://www.forbes.com/sites/larsdaniel/2024/11/26/think-youre-not-being-watched-deflock-says-think-again/',
},
{
  name: '404 Media',
  logo: '/white-logos/404media.svg',
  url: 'https://www.404media.co/the-open-source-project-deflock-is-mapping-license-plate-surveillance-cameras-all-over-the-world/',
},
{
  name: 'LA Times',
  logo: '/white-logos/latimes.svg',
  url: 'https://www.latimes.com/california/story/2024-11-14/are-there-automated-license-plate-readers-in-your-city-theres-an-open-source-program-for-that',
  wide: true,
}
];

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
