<template>
  <Hero
    title="Wardriving"
    description="Learn how driving around with an Android phone can help map ALPRs!"
    imageUrl="/wardriving.jpg"
  />
  <v-container class="mb-16">
    <h2>What is Wardriving?</h2>
    <p>
      Wardriving is the practice of collecting data on wireless networks, Bluetooth devices, and other signals while traveling (typically in a car). For DeFlock, this technique can be a valuable way to locate Flock ALPRs and contribute to the map.
    </p>

    <h2>How is Wardriving Useful?</h2>
    <p>
      Flock ALPRs often use battery packs called <b>Penguin Packs</b> that emit a Bluetooth signal with names starting with <b>"Penguin-"</b>. By recording these signals while wardriving, you can identify the general location of these cameras.
    </p>
    <p>
      This data can be used to identify new locations of ALPRs and verify the accuracy of existing locations. Members of the community regularly review WiGLE data to identify new ALPRs and update the map accordingly.
    </p>

    <h2>How to Get Started</h2>
    <p>
      Download the <a href="https://play.google.com/store/apps/details?id=net.wigle.wigleandroid" target="_blank">WiGLE WiFi Wardriving</a> app on your Android phone. This app will allow you to record the Bluetooth signals emitted by Penguin Packs.
    </p>
    <p>
      By running the app while doing your daily commute or driving around town, you can help identify new ALPRs and contribute to the map.
    </p>

    <h2>How to Add WiGLE Data to the Map</h2>
    <v-alert 
      type="info"
      variant="tonal"
      icon="mdi-information"
      class="mb-4"
      title="WiGLE Map Layer Coming Soon"
      text="We're working on a way to visualize WiGLE data on the map to identify unmapped areas. Until then, you can download some of our datasets and contribute to the map manually."
    />
    <p>
      Even if you haven't collected WiGLE data yourself, you can still contribute to the map by downloading the data from the <router-link to="/operators">our community datasets</router-link> or by performing a <a href="https://wigle.net/search#btSearch" target="_blank">WiGLE search</a> yourself. Once you have the data, you can import the CSV to a map such as <a href="https://www.google.com/mymaps" target="_blank">Google My Maps</a>. From there, you can verify the ALPR's location, direction, and other details. Once you're confident in the data, you can submit it to OpenStreetMap for inclusion in the map.
    </p>
    <div class="text-center mt-12">
      <v-btn to="/operators" color="rgb(18, 151, 195)"><v-icon start>mdi-table</v-icon>View Datasets</v-btn>
    </div>

  </v-container>

  <Footer />
</template>

<script setup lang="ts">
import Hero from '@/components/layout/Hero.vue';
import Footer from '@/components/layout/Footer.vue';
</script>

<style scoped>
@import url('@/assets/typography.css');
</style>
