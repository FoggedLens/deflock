<template>
<DefaultLayout>
  <v-container>
    <v-row justify="center" class="mb-8">
      <v-col cols="12" md="8" class="text-center">
        <h1 class="text-h3 font-weight-bold mb-4">Contact Us</h1>
        <p class="text-h6 text-medium-emphasis">
          How can we help you today?
        </p>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-row>
          <!-- Report Camera Option -->
          <v-col cols="12" md="6">
            <v-card
              variant="outlined"
              class="mx-auto h-100 d-flex flex-column"
              max-width="400"
              hover
              @click="$router.push('/report')"
              style="cursor: pointer;"
            >
              <v-card-item class="text-center pa-6">
                <v-icon
                  size="48"
                  color="primary"
                  class="mb-4"
                >
                  <CameraIcon />
                </v-icon>
                <v-card-title class="text-h5 font-weight-bold card-title-wrap">
                  Report a Camera
                </v-card-title>
                <v-card-subtitle class="text-body-1 mt-2 card-subtitle-wrap">
                  Found an ALPR camera? Help us map it and protect your community's privacy.
                </v-card-subtitle>
              </v-card-item>
              <v-card-actions class="justify-center pb-6">
                <v-btn
                  color="primary"
                  size="large"
                  :append-icon="ArrowRightIcon"
                >
                  Start Report
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <!-- General Inquiry Option -->
          <v-col cols="12" md="6">
            <v-card
              variant="outlined"
              class="mx-auto h-100 d-flex flex-column"
              max-width="400"
              :hover="!showContactOptions"
              @click="!showContactOptions ? showContactOptions = true : null"
              :style="showContactOptions ? 'cursor: default;' : 'cursor: pointer;'"
            >
              <v-card-item class="text-center pa-6">
                <v-icon
                  size="48"
                  color="secondary"
                  class="mb-4"
                >
                  <MessageTextIcon />
                </v-icon>
                <v-card-title class="text-h5 font-weight-bold card-title-wrap">
                  {{ showContactOptions ? 'Get in Touch' : 'General Inquiry' }}
                </v-card-title>
                <v-card-subtitle class="text-body-1 mt-2 card-subtitle-wrap">
                  {{ showContactOptions ? 'Send us an email with your questions' : 'Have questions about DeFlock, need help, or want to get involved?' }}
                </v-card-subtitle>
              </v-card-item>
              <v-card-actions class="justify-center pb-6">
                <div v-if="!showContactOptions">
                  <v-btn
                    color="secondary"
                    size="large"
                    :append-icon="ArrowRightIcon"
                  >
                    Contact Options
                  </v-btn>
                </div>
                <div v-else class="d-flex flex-column gap-3 w-100">
                  <div class="text-center">
                    <p class="text-body-1 mb-2">Send us an email at:</p>
                    <a 
                      href="mailto:contact@deflock.me"
                      class="text-h6 font-weight-bold text-decoration-none"
                      style="color: rgb(var(--v-theme-secondary));"
                    >
                      contact@deflock.me
                    </a>
                  </div>
                </div>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <p class="text-center text-body-2 text-medium-emphasis mt-8">
          <b>Media inquiries?</b> Visit our 
          <router-link to="/press" class="text-decoration-none">
            press page
          </router-link>.
        </p>

      </v-col>
    </v-row>

    <!-- Additional Help Section -->
    <v-row justify="center">
      <v-col cols="12" md="8" class="text-center">
        <v-divider class="mb-6"></v-divider>
        <p class="text-body-2 text-medium-emphasis">
          Need to identify if something is an ALPR camera?<br>
          <router-link to="/identify" class="text-decoration-none">
            Check our camera gallery
          </router-link>
          or learn more about 
          <router-link to="/what-is-an-alpr" class="text-decoration-none">
            what ALPRs are
          </router-link>.
        </p>
      </v-col>
    </v-row>
  </v-container>
</DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useTheme } from 'vuetify';
import { ref } from 'vue';

import CameraIcon from '@iconify-vue/mdi/camera';
import ArrowRightIcon from '@iconify-vue/mdi/arrow-right';
import MessageTextIcon from '@iconify-vue/mdi/message-text';

const theme = useTheme();
const showContactOptions = ref(false);
</script>
 
<style lang="css" scoped>
.card-title-wrap {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
}

.card-subtitle-wrap {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  line-height: 1.4 !important;
}

.gap-3 > * + * {
  margin-top: 12px;
}
</style>

