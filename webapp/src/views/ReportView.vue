<template>
  <v-container class="mb-16">
    <h1 class="text-center mt-4">Report a New ALPR</h1>

    <p>
      If you've spotted an ALPR in your area, you can help us track it by reporting it to OpenStreetMap, where we source our information. Here's how you can do it:
    </p>

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
            To add the ALPR, click the <strong>Point</strong> button in the top left corner of the editor, then click on the location of the ALPR on the map. In the popup that appears, paste one of the following sets of tags based on the brand of the ALPR:
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
        </v-stepper-vertical-item>

        <v-stepper-vertical-item
          class="transparent"
          :complete="step > 5"
          title="Submit Your Changes"
          value="5"
          editable
        >
          <p>
            Once you've added the ALPR to the map, click the <strong>Save</strong> button in the top left corner of the editor. You'll be asked to provide a brief description of your changes. Once you've submitted your changes, the ALPR will be added to OpenStreetMap.
          </p>
          <v-alert
            variant="tonal"
            type="info"
            class="my-6"
            title="How Long Will It Take?"
          >
            <p>
              We pull data from OpenStreetMap <i>daily</i>, so it may take up to 24 hours for your changes to appear on this site. Rest assured that your changes will be reflected here soon. As we continue to scale, we hope to reduce this delay.
            </p>
          </v-alert>
        </v-stepper-vertical-item>

        <v-stepper-vertical-item
          class="transparent"
          :complete="step > 6"
          title="Hang a Sign"
          value="6"
          editable
        >
          <p>
            Download our <a href="/deflock-poster.pdf" target="_blank">ALPR sign</a> and hang it near the ALPR to help raise awareness about the device. Be sure to follow all local laws and regulations when hanging signs.
          </p>
        </v-stepper-vertical-item>
      </template>
    </v-stepper-vertical>
  </v-container>

  <Footer />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import OSMTagSelector from '@/components/OSMTagSelector.vue';
import { VStepperVerticalItem, VStepperVertical } from 'vuetify/labs/components';
import Footer from '@/components/layout/Footer.vue';

const step = ref(parseInt(localStorage.getItem('currentStep') || '1'));

onMounted(() => {
  step.value = parseInt(localStorage.getItem('currentStep') || '1');
});

watch(step, (newStep) => {
  localStorage.setItem('currentStep', newStep.toString());
});
</script>
