<template>
<DefaultLayout>
  <template #header>
    <Hero
      imageUrl="/press.jpg"
      title="Media"
      description="We're grateful for the media's interest in DeFlock. Below you'll find our media kit and contact information for interviews."
    />
  </template>

  <v-container class="narrow-text">
    <h2>What is DeFlock?</h2>
    <p>
      DeFlock is a community-driven project that maps surveillance devices across the world. We help communities hold their government and surveillance vendors accountable and understand where and how they're being watched.
    </p>

    <h2>Founder Bio</h2>
    <p>
      DeFlock was founded in October 2024 by Will Freeman, a software engineer and privacy advocate. On a road trip from Washington state to Alabama, he noticed hundreds of newly-installed cameras mounted on black poles with solar panels in nearly every town he passed through. Curious about their purpose, he discovered they were <a target="_blank" href="https://en.wikipedia.org/wiki/Flock_Safety">Flock cameras</a> used for surveillance. Upset about this trend to blatantly disregard the Fourth Amendment, he created a platform that maps these devices, empowering communities to understand and challenge surveillance practices.
    </p>

    <p>Since its launch, DeFlock has received significant media coverage and community support, including code contributors and volunteer mappers, helping to raise awareness about the dangers of surveillance technology.</p>

    <h2>Media Kit</h2>
    <p>
      Download our very basic media kit <a target="_blank" href="https://cdn.deflock.me/deflock-media-kit.zip">here</a>.
    </p>

    <h2>Embedding our Map</h2>
    <p>
      You are welcome to embed our map on your website. Simply <a href="https://maps.deflock.org" target="_blank">click the share button on our map</a>, and copy the embed code.
    </p>

    <h2>Contact Us</h2>
    <p>
      For media inquiries and interview requests, send us an email at <a href="mailto:media@deflock.org">media@deflock.org</a>.
    </p>

  </v-container>
</DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Hero from '@/components/layout/Hero.vue';
</script>
