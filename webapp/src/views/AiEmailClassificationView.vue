<template>
  <DefaultLayout>
    <v-container class="narrow-text">
      <h1>AI Email Classification</h1>
      
      <p>
        We get a lot of emails, too many for our volunteers to respond to. To keep up with demand during this period of increased public interest, we've implemented AI classification of emails.
      </p>

      <p class="font-weight-bold">
        Responses will still be from a human.
      </p>

      <h4>What it Does</h4>
      <ul>
          <li>Classifies the email into one of several categories</li>
          <li>Filters out spam</li>
          <li>Summarizes the email</li>
          <li>Suggests a response for common questions</li>
      </ul>

      <h4>What is Sent</h4>
      <ul>
        <li>Message body</li>
        <li>Message subject</li>
        <li>Domain name of the email address (e.g. gmail.com)</li>
      </ul>

      <h3>How to Opt Out</h3>

      <p>
        The classification code is only run on form submissions. If you'd like to opt out, simply email us at <a href="mailto:contact@deflock.org">contact@deflock.org</a>, and it will not be processed by AI.
      </p>

      <h3>More Info</h3>
      <p>
        We're an open-source project. If you'd like to see how our classification system works, check out our <a target="_blank" href="https://github.com/FoggedLens/deflock">GitHub</a>.
      </p>
    </v-container>
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
</script>
