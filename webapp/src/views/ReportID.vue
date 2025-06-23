<template>
  <Hero
    imageUrl="/id.webp"
    title="Report using iD" 
    description="Add and edit ALPRs using OSM's powerful web-based editor."
  />

  <v-container class="mb-16">
    <h1 class="text-center">
      Editing the Map
    </h1>

    <v-alert
      variant="elevated"
      type="info"
      class="my-6"
      title="Easier Reporting Coming Soon!"
      color="green"
    >
      <p>
        We're working on an easier method for reporting ALPRs that will allow you to submit them with just one click. Stay tuned for updates!
      </p>
    </v-alert>

    <v-stepper-vertical color="rgb(18, 151, 195)" v-model="step" flat non-linear class="my-8" edit-icon="mdi-home">
      <template v-slot:default="{ step }: { step: any }">
        <v-stepper-vertical-item
          class="transparent"
          :complete="step > 1"
          title="Create an OpenStreetMap Account"
          value="1"
          editable
        >
          <p>
            <a href="https://www.openstreetmap.org/user/new" target="_blank">Sign up for an OpenStreetMap account</a> in order to submit changes.
          </p>
        </v-stepper-vertical-item>

        <v-stepper-vertical-item
          class="transparent"
          :complete="step > 2"
          title="Find the ALPR's Location"
          value="2"
          editable
        >
          <p>
            <a href="https://www.openstreetmap.org" target="_blank">Launch OpenStreetMap</a> and search for the location of the ALPR. You can use the search bar at the top of the page to find the location.
          </p>
        </v-stepper-vertical-item>

        <v-stepper-vertical-item
          class="transparent"
          :complete="step > 3"
          title="Add the ALPR to OpenStreetMap"
          value="3"
          editable
        >
          <p>
            Once you've found the location of the ALPR, click the <strong>Edit</strong> button in the top left corner of the page. This will open the OpenStreetMap editor, where you can add the ALPR to the map.
          </p>
          <v-img max-width="450" src="/edit-map.png" class="my-8" />
          <p class="mt-16 mb-8">
            To add the ALPR, click the <strong>Point</strong> button at the top center of the editor, then click on the location of the ALPR on the map. In the popup that appears, paste one of the following sets of tags based on the brand of the ALPR:
          </p>

          <v-divider class="my-4"><span class="serif text-grey-darken-2">Choose a Manufacturer</span></v-divider>

          <OSMTagSelector />

          <v-divider class="mb-4 mt-8" />

          <p class="mt-8">
            After copying the tags, paste them into the <strong>Tags</strong> field in the popup.
          </p>
          <v-img max-width="450" class="my-8" src="/paste-tags.png" />
        </v-stepper-vertical-item>

        <v-stepper-vertical-item
          class="transparent"
          :complete="step > 4"
          title="Adjust the Direction"
          value="4"
          editable
        >
          <v-img
            max-width="450"
            class="my-8"
            src="/adjust-angle.png"
          />
          <p>
            If you know the direction that the ALPR is facing, you can use the up and down arrows to set the direction it faces.
          </p>

          <v-img
            max-width="450"
            class="my-8"
            src="/multi-directional-marker.png"
          />
          <p>
              To report two cameras that are on the same pole, separate directions with a semi-colon (<code>;</code>).
          </p>
        </v-stepper-vertical-item>

        <v-stepper-vertical-item
          class="transparent"
          :complete="step > 5"
          title="Submit Your Changes"
          value="5"
          editable
        >
          <p>
            Once you've added the ALPR to the map, click the <strong>Save</strong> button in the top right corner of the editor. You'll be asked to provide a brief description of your changes. Once you've submitted your changes, the ALPR will be added to OpenStreetMap.
          </p>
          <v-alert
            variant="tonal"
            type="info"
            class="my-6"
            title="How Long Will It Take?"
          >
            <p>
              We pull data from OpenStreetMap <i>hourly</i>, so it may take up to an hour for your changes to appear on this site. Rest assured that your changes will be reflected here soon. As we continue to scale, we hope to reduce this delay.
            </p>
          </v-alert>
        </v-stepper-vertical-item>
      </template>
    </v-stepper-vertical>
  </v-container>
</template>

<script setup lang="ts">
import Hero from '@/components/layout/Hero.vue';
import { ref, onMounted, watch } from 'vue';
import OSMTagSelector from '@/components/OSMTagSelector.vue';
import { VStepperVerticalItem, VStepperVertical } from 'vuetify/labs/components';

const step = ref(parseInt(localStorage.getItem('currentStep') || '1'));

onMounted(() => {
  step.value = parseInt(localStorage.getItem('currentStep') || '1');
});

watch(step, (newStep) => {
  localStorage.setItem('currentStep', newStep.toString());
});
</script>
