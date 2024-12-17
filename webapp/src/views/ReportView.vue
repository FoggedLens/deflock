<template>
  <v-container class="info-section" max-width="1000">
    <v-alert
      variant="tonal"
      type="info"
      class="my-6"
      title="Reporting Feature Coming Soon"
    >
      <p>
        We're working on a feature that will allow you to report ALPRs directly on this site. In the meantime, you can follow the steps below to add the ALPR to OpenStreetMap.
      </p>
    </v-alert>
    <h2>How to Report an ALPR</h2>
    <p>
      If you've spotted an ALPR in your area, you can help us track it by reporting it to OpenStreetMap, where we source our information. Here's how you can do it:
    </p>

    <v-alert
      variant="tonal"
      type="warning"
      class="my-6"
      title="Are you sure it's an ALPR?"
    >
      <p>
        Before you report an ALPR, please read our <router-link style="color: unset !important" to="/what-is-an-alpr#not-alpr">guide on what ALPRs look like</router-link> to make sure you're reporting the right thing.
      </p>
    </v-alert>

    <div class="ml-4 mt-4">
      <h3>1. Create an OpenStreetMap Account</h3>
      <p>
        <a href="https://www.openstreetmap.org/user/new" target="_blank">Sign up for an OpenStreetMap account</a> in order to submit changes.
      </p>

      <h3>2. Find the ALPR's Location on OpenStreetMap</h3>
      <p>
        <a href="https://www.openstreetmap.org" target="_blank">Launch OpenStreetMap</a> and search for the location of the ALPR. You can use the search bar at the top of the page to find the location.
      </p>

      <h3>3. Add the ALPR to OpenStreetMap</h3>
      <p>
        Once you've found the location of the ALPR, click the <strong>Edit</strong> button in the top left corner of the page. This will open the OpenStreetMap editor, where you can add the ALPR to the map.
      </p>

      <v-img max-width="450" src="/edit-map.png" class="my-8" />

      <p>
        To add the ALPR, click the <strong>Point</strong> button in the top left corner of the editor, then click on the location of the ALPR on the map. In the popup that appears, paste one of the following sets of tags based on the brand of the ALPR:
      </p>

      <OSMTagSelector />

      <p class="mt-8">
        After copying the tags, paste them into the <strong>Tags</strong> field in the popup.
      </p>

      <v-img max-width="450" class="my-8" src="/paste-tags.png" />

      <h3>4. Adjust the Direction</h3>

      <v-img max-width="450" class="my-8" src="/adjust-angle.png" />

      <p>
        If you know the direction that the ALPR is facing, you can use the up and down arrows to set the direction it faces.
      </p>

      <h3>5. Submit Your Changes</h3>
      <p>
        Once you've added the ALPR to the map, click the <strong>Save</strong> button in the top left corner of the editor. You'll be asked to provide a brief description of your changes. Once you've submitted your changes, the ALPR will be added to OpenStreetMap.
      </p>

      <h3>6. Hang a Sign</h3>
      <p>
        Download our <a href="/deflock-poster.pdf" target="_blank">ALPR sign</a> and hang it near the ALPR to help raise awareness about the device. Be sure to follow all local laws and regulations when hanging signs.
      </p>

    </div>
  </v-container>
</template>

<script setup lang="ts">
import DFCode from '@/components/DFCode.vue';
import OSMTagSelector from '@/components/OSMTagSelector.vue';
</script>

<style scoped>
/* TODO: put this all in one place, also in what-is view */
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

code {
  background-color: #f4f4f4;
  padding: 0.5rem;
  border-radius: 0.25rem;
  display: block;
  margin-top: 0.5rem;
}

.highlight {
  background-color: #0081ac;
  padding: 0.15rem;
  border-radius: 0.25rem;
  font-weight: bold;
}

.info-section {
  background: var(--df-page-background-color);
}
</style>
