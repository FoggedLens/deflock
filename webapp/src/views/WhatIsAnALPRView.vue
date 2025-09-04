<template>
  <v-container fluid>
    <v-row justify="center" class="hero-section-whatis text-center mb-4">
    </v-row>
  </v-container>
  
  <v-container class="info-section">
    <h1 class="mt-0">What are ALPRs?</h1>
    <p>
      Automated License Plate Readers (ALPRs) are AI-powered cameras that capture and analyze images of all passing vehicles, storing details like your car's location, date, and time. They also capture your car's make, model, color, and identifying features such as dents, roof racks, and bumper stickers, <a href="https://www.flocksafety.com/products/license-plate-readers#:~:text=No%20Plate%3F%20No%20Problem" target="_blank">often turning these into searchable data points</a>. These cameras collect data on millions of vehicles—regardless of whether the driver is suspected of a crime. While these systems can be useful for tracking stolen cars or wanted individuals, they are mostly used to track the movements of innocent people.
    </p>

    <p>For a detailed explanation of how ALPRs are a threat to privacy, see this <a href="https://www.aclu.org/issues/privacy-technology/you-are-being-tracked" target="_blank">ACLU article</a> as well as this <a href="https://sls.eff.org/technologies/automated-license-plate-readers-alprs" target="_blank">EFF article</a> on ALPRs.</p>

    <h2>Why Should You Be Concerned</h2>
    <p class="mb-8 text-center">
      ALPRs invade your privacy and violate your civil liberties. Here's how:
    </p>

    <Dangers />


    <h2>Frequently Asked Questions</h2>
    <FAQ />

    <h2 id="photos">What they Look Like</h2>

    <v-row v-for="vendor in vendors" :key="vendor.vendor" class="mb-4">
      <v-col cols="12">
        <h3 class="text-center">{{ vendor.vendor }}</h3>
      </v-col>
      <v-col v-for="url in vendor.imageUrls" cols="12" sm="6" md="4">
        <v-img @click="openImageInNewTab(url)" style="cursor: pointer;" cover :aspect-ratio="3/2" :src="url" />
      </v-col>
    </v-row>
  </v-container>
  <Footer />
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useDisplay } from 'vuetify';
import Dangers from '@/components/Dangers.vue';
import FAQ from '@/components/FAQ.vue';
import Footer from '@/components/layout/Footer.vue';
const { xs: isMobile } = useDisplay();

const showFullScreenImage = ref(false);
const fullScreenImage: Ref<any|undefined> = ref(undefined);

function openImageInNewTab(url: string, newTab: boolean = true) {
  window.open(url, newTab ? '_blank' : '_self');
}

const vendors = [
  {
    vendor: 'Flock',
    count: 4,
    urlScheme: '/alprs/flock-{index}.jpg',
  },
  {
    vendor: 'Motorola/Vigilant',
    count: 4,
    urlScheme: '/alprs/motorola-{index}.jpg',
  },
  {
    vendor: 'Genetec',
    count: 3,
    urlScheme: '/alprs/genetec-{index}.webp',
  },
  {
    vendor: 'Leonardo/ELSAG',
    count: 4,
    urlScheme: '/alprs/elsag-{index}.jpg',
  },
  {
    vendor: 'Neology',
    count: 2,
    urlScheme: '/alprs/neology-{index}.jpg',
  },
].reduce((acc: any, vendor: any) => {
  const imageUrls = Array.from({ length: vendor.count }, (_, index) => 
    vendor.urlScheme.replace('{index}', String(index + 1)),
  );

  acc.push({ vendor: vendor.vendor, imageUrls });
  return acc;
}, []);
</script>

<style scoped>
@import url('@/assets/typography.css');

h1, h2 {
  text-align: center;
}

.scrim {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.image-close-btn {
  position: absolute;
  top: 0;
  right: 0;
  color: white;
  z-index: 100;
}

.scrim-text {
  text-transform: uppercase;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.hero-section-whatis {
  background: url('/flock-camera.jpeg') no-repeat right center;
  background-size: cover;
  color: white;
  position: relative;
  height: 400px;
}
</style>
