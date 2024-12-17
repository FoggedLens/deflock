<template>
  <v-container class="info-section" max-width="1000">
    <p>
      <v-img max-height="450" width="100%" cover src="/flock-camera.jpeg" />
    </p>

    <h2>What is an ALPR</h2>
    <p>
      Automated License Plate Readers (ALPRs) are cameras that capture images of all passing license plates, storing details like the car's location, date, and time. These cameras collect data on millions of vehicles—regardless of whether the driver is suspected of a crime. While these systems can be useful for tracking stolen cars or wanted individuals, they are mostly used to track the movements of innocent people.
    </p>

    <p>For a detailed explanation of how ALPRs are a threat to privacy, see this <a href="https://www.aclu.org/issues/privacy-technology/you-are-being-tracked" target="_blank">ACLU article</a> as well as this <a href="https://sls.eff.org/technologies/automated-license-plate-readers-alprs" target="_blank">EFF article</a> on ALPRs.</p>

    <h2>Why Should You Be Concerned</h2>
    <p class="mb-4">
      ALPRs invade your privacy and violate your civil liberties. Here's how:
    </p>

    <dangers />

    <h2 id="not-alpr" :class="{ highlighted: route.hash === '#not-alpr' }">What They Look Like</h2>
    <v-carousel class="my-4" hide-delimiters>
      <v-carousel-item
        v-for="{ url, brand } in images"
        :key="url"
        aspect-ratio="1"
        :src="url"
        class="text-center"
      >
        <v-chip :rounded="false" color="warning" variant="elevated" size="x-large" style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);">
          <span class="font-weight-bold">Brand: <span class="text-uppercase">{{ brand }}</span></span>
        </v-chip>
      </v-carousel-item>
    </v-carousel>
    

    <p>
      While <a href="https://en.wikipedia.org/wiki/Flock_Safety" target="_blank">Flock Safety</a> is a common brand of ALPRs in the US, there are several others, including <a href="https://en.wikipedia.org/wiki/Vigilant_Solutions" target="_blank">Vigilant Solutions</a>, owned by Motorola Solutions. Flock Safety ALPRs are easy to spot as they almost all look the same, typically mounted on poles with a solar panel on top. In rural areas, they are likely to be on standalone black poles, while in cities, they are more likely to be on existing utility or traffic poles. The cameras are often placed near intersections or on main roads at the edge of a city or town. Vigilant Solutions ALPRs, on the other hand, are typically mounted on traffic poles at or near intersections, with a distinctive white box mounted nearby.
    </p>

    <h2>Not All Cameras are Law Enforcement ALPRs</h2>
    <p>
      Not all cameras near roads are ALPRs operated by law enforcement. Many people mistakenly assume that every traffic camera or intersection camera is an ALPR, but the reality is more nuanced. Here are some common types of cameras you might see near roads:
    </p>

    <div class="ml-4">
      <h3>Traffic Cameras</h3>
      <div class="flex-image">
        <v-img rounded cover aspect-ratio="4/3" width="180" src="/traffic-camera.jpg" />
        <p>Standard traffic cameras typically capture live video or images of intersections to monitor traffic flow and manage signals. They do not specifically focus on reading license plates or storing data long-term.</p>
      </div>

      <h3>Red Light Cameras/Speed Cameras</h3>
      <div class="flex-image">
        <v-img rounded cover aspect-ratio="4/3" width="180" src="/redlight-camera.jpg" />
        <p>These cameras are set up to capture violations, such as running a red light or speeding. They may record plate numbers when a violation is detected, but they do not perform continuous surveillance or collect location data over time.</p>
      </div>

      <h3>Toll Cameras</h3>
      <div class="flex-image">
        <v-img rounded cover aspect-ratio="4/3" width="180" src="/toll-camera.jpg" />
        <p>Cameras on toll roads are used to capture license plates for billing purposes. They are not designed to track vehicles or store data beyond the transaction.</p>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import Dangers from '@/components/Dangers.vue';
const route = useRoute();

const flockImageCount = 6;
const vigilantImageCount = 3;

const images = [
  ...Array.from({ length: flockImageCount }, (_, i) => ({
    url: `/flock-${i + 1}.jpg`,
    brand: 'flock'
  })),
  ...Array.from({ length: vigilantImageCount }, (_, i) => ({
    url: `/vigilant-${i + 1}.jpg`,
    brand: 'motorola'
  }))
];
</script>

<style scoped>
h2 {
  margin-top: 2rem;
}

h3 {
  margin-top: 1.25rem;
}

p {
  margin-top: 0.5rem;
}

.flex-image {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.5rem;
}

li {
  margin-top: 0.5rem;
  margin-left: 1rem;
}

.highlighted {
  background-color: yellow;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.info-section {
  background: var(--df-page-background-color);
}
</style>
