<template>
  <v-container class="report-redirect" fill-height>
    <v-row align="center" justify="center">
      <v-col class="text-center">
        <h1 class="text-h6 my-8 text-grey-darken-2">
          <span v-if="hasLaunchedEditor">Launched Editor</span>
          <span v-else>Launching Editor...</span>
        </h1>

        <div v-if="isMobileDevice && !hasLaunchedEditor">
          <v-icon size="x-large" class="rotate-icon">mdi-screen-rotation</v-icon>
          <p class="rotate-text">Please rotate your device to continue.</p>
            <v-fade-transition>
              <v-btn
                class="bypass-button"
                v-show="showBypassButton"
                @click="redirectToEditor"
                variant="text"
                color="primary"
              >
                Continue without rotating
              </v-btn>
            </v-fade-transition>
        </div>

        <div v-else-if="hasLaunchedEditor">
          <v-btn
            color="primary"
            variant="tonal"
            @click="goBack"
          >
            <v-icon start>mdi-chevron-left</v-icon>
            Return to Your Last Page
          </v-btn>
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useDisplay } from 'vuetify';

const isMobileDevice = useDisplay().mobile;
const hasLaunchedEditor = ref(false);
const showBypassButton = ref(false);

function redirectToEditor() {
  window.open("https://deflock-editor.netlify.app", "_blank");
  hasLaunchedEditor.value = true;
}

function goBack() {
  window.history.back();
}

function handleOrientationChange() {
  if (window.innerWidth > window.innerHeight) {
    redirectToEditor();
  }
}

onMounted(() => {
  if (!isMobileDevice.value) {
    redirectToEditor();
    return;
  }
  setTimeout(() => {
    showBypassButton.value = true;
  }, 3000); // Show bypass button after 3 seconds

  window.addEventListener("resize", handleOrientationChange);
  handleOrientationChange(); // in case already landscape
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleOrientationChange);
});
</script>

<style scoped>
.report-redirect {
  background-color: #f5f5f5;
}

.rotate-icon {
  animation: rotate-animation 2s infinite;
  color: #1976d2;
}

.rotate-text {
  font-size: 18px;
  margin-top: 20px;
}

.bypass-button {
  margin-top: 30px;
}

@keyframes rotate-animation {
  0% {
    transform: rotate(45deg);
  }
  50% {
    transform: rotate(135deg);
  }
  100% {
    transform: rotate(45deg);
  }
}
</style>
