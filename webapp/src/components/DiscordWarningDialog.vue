<template>
  <v-dialog :model-value="modelValue" @update:modelValue="emit('update:modelValue', $event)" max-width="480">
    <v-card class="discord-warning-card">
      <v-card-text>
        <div class="discord-warning-content">
          <v-icon color="warning" size="28" class="mb-2">
            <AlertIcon />
          </v-icon>
          <p class="mb-3 text-body-1">
            <strong>You're about to join Discord</strong>
          </p>
          <v-alert color="warning" variant="outlined" class="mb-4">
            <b>Law enforcement</b> and <b>Flock employees</b> actively monitor the Discord server. Please act accordingly.
          </v-alert>
          <p class="text-caption text-medium-emphasis mb-2">
            If you understand the risks and wish to continue, click <strong>Proceed</strong> below.
          </p>
        </div>
      </v-card-text>
      <v-card-actions class="justify-end pt-0">
        <v-btn color="primary" @click="proceed" class="mr-2" rounded>
          <v-icon start>
            <ArrowRightIcon />
          </v-icon>
          Proceed
        </v-btn>
        <v-btn variant="text" @click="cancel" rounded>
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import AlertIcon from '@iconify-vue/mdi/alert';
import ArrowRightIcon from '@iconify-vue/mdi/arrow-right';

const props = defineProps<{ modelValue: boolean; discordUrl: string }>();
const emit = defineEmits(['update:modelValue', 'proceed']);

function proceed() {
  emit('proceed', props.discordUrl);
  emit('update:modelValue', false);
}
function cancel() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.discord-warning-card {
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(76, 78, 100, 0.18);
  background: linear-gradient(135deg, #fffbe6 0%, #fff 100%);
}
.v-theme--dark .discord-warning-card {
  background: linear-gradient(135deg, #232323 0%, #2d2d2d 100%);
}
.discord-warning-content {
  text-align: center;
  padding: 8px 0 0 0;
}
.v-card-title {
  font-size: 1.25rem;
  letter-spacing: -0.01em;
}
.v-btn {
  min-width: 120px;
  font-weight: 600;
  font-size: 1rem;
}
.v-alert {
  font-size: 1rem;
  border-radius: 10px;
}
</style>
