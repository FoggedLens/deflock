<template>
<DefaultLayout>
  <template #header>
    <Hero
      imageUrl="/press.jpg"
      title="Press"
      description="We're grateful for the media's interest in DeFlock. Below you'll find our press kit and contact information for interviews."
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
      You are welcome to embed our map on your website. Use the following HTML snippet:
    </p>

    <p>
      <DFCode>
        &lt;iframe src=&quot;https://deflock.me/map&quot; width=&quot;100%&quot; height=&quot;600&quot; style=&quot;border: none;&quot;&gt;&lt;/iframe&gt;
      </DFCode>
    </p>

    <p>
      If you would like to <b>localize the URL</b> to a specific region, please zoom to the area at <router-link to="/map">https://deflock.me/map</router-link> and copy the URL from your browser's address bar.
    </p>

    <p>
      To <b>remove the header bar</b>, add the following query parameter to the URL: <code>?fullscreen=true</code>. For example:
      <DFCode>
        &lt;iframe src=&quot;https://deflock.me/map?fullscreen=true#map=14/40.014863/-105.266275&quot; width=&quot;100%&quot; height=&quot;600&quot; style=&quot;border: none;&quot;&gt;&lt;/iframe&gt;
      </DFCode>
    </p>

    <h2>Contact Us</h2>
    <p>
      For press inquiries and interview requests, <router-link to="/contact" >please contact us here</router-link>.
    </p>

  </v-container>
</DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Hero from '@/components/layout/Hero.vue';
import DFCode from "@/components/DFCode.vue";
</script>
