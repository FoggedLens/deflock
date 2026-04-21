<template>
  <DefaultLayout>
    <v-container>
      <v-row justify="center" class="mb-6">
        <v-col cols="12" md="8" class="text-center">
          <h1 class="text-h3 font-weight-bold mb-4">Contact Us</h1>
          <p class="text-h6 text-medium-emphasis">
            We'd love to hear from you.
          </p>
        </v-col>
      </v-row>

      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">

          <!-- Success state -->
          <v-alert
            v-if="isSuccess"
            type="success"
            variant="tonal"
            class="mb-6"
            title="Message sent!"
          >
            Thanks for reaching out. We'll get back to you as soon as we can.
          </v-alert>

          <!-- Error state -->
          <v-alert
            v-if="isError"
            type="error"
            variant="tonal"
            class="mb-6"
            title="Something went wrong"
          >
            We couldn't send your message. Please try again, or email us directly at
            <a href="mailto:contact@deflock.org" class="text-decoration-none font-weight-bold">contact@deflock.org</a>.
          </v-alert>

          <v-form ref="form" @submit.prevent="handleSubmit">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="fields.name"
                  label="Name or alias"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  autocomplete="name"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="fields.email"
                  label="Email"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  variant="outlined"
                  density="comfortable"
                  autocomplete="email"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="fields.topic"
                  label="What can we help with?"
                  :items="topicItems"
                  item-title="label"
                  item-value="value"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="fields.subject"
                  label="Subject"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="fields.message"
                  label="Message"
                  :rules="[rules.required]"
                  variant="outlined"
                  rows="5"
                  auto-grow
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <VueTurnstile
                  ref="turnstileRef"
                  site-key="0x4AAAAAADApg9O-hmUZCotn"
                  v-model="turnstileToken"
                  theme="auto"
                  @error="onTurnstileError"
                  @expired="onTurnstileExpired"
                />
                <p v-if="turnstileError" class="text-caption text-error mt-1">
                  Please complete the security check.
                </p>
              </v-col>
              <v-col cols="12">
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                  block
                >
                  Send Message
                </v-btn>
              </v-col>
            </v-row>
          </v-form>

        </v-col>
      </v-row>

      <v-divider class="mt-12" />
      
      <v-row>
        <v-col cols="12" md="8" class="mx-auto text-center">
          <h2 class="text-h5 font-weight-bold mb-3">Other Ways to Reach Us</h2>
          <p class="text-body-1 mb-4">
            If you prefer, you can also email us directly at
            <a href="mailto:contact@deflock.org" class="text-decoration-none font-weight-bold">contact@deflock.org</a>.
          </p>
        </v-col>
      </v-row>
    </v-container>
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { postContactMessage } from '@/services/apiService';
import VueTurnstile from 'vue-turnstile';
import { nextTick, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const topicItems = [
  { label: 'Questions & Comments', value: 'questions-comments' },
  { label: 'Technical Support - Website/Map', value: 'website-support' },
  { label: 'Technical Support - DeFlock App', value: 'app-support' },
  { label: 'Local Groups', value: 'local-groups' },
  { label: 'Media/Press', value: 'media' },
] as const;

type TopicValue = typeof topicItems[number]['value'];

const validTopics = topicItems.map((t) => t.value) as string[];

const initialTopic = (): TopicValue | null => {
  const q = route.query.topic as string | undefined;
  return q && validTopics.includes(q) ? (q as TopicValue) : null;
};

const fields = reactive({
  name: '',
  email: '',
  topic: initialTopic(),
  subject: '',
  message: '',
});

const rules = {
  required: (v: unknown) => (v !== null && v !== undefined && String(v).trim() !== '') || 'This field is required.',
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email address.',
};

const form = ref<{ validate: () => Promise<{ valid: boolean }>; resetValidation: () => void } | null>(null);
const turnstileRef = ref<InstanceType<typeof VueTurnstile> | null>(null);
const turnstileToken = ref('');
const turnstileError = ref(false);

const isSubmitting = ref(false);
const isSuccess = ref(false);
const isError = ref(false);

const onTurnstileError = () => {
  turnstileToken.value = '';
};

const onTurnstileExpired = () => {
  turnstileToken.value = '';
};

const resetTurnstile = () => {
  turnstileRef.value?.reset();
  turnstileToken.value = '';
};

const handleSubmit = async () => {
  isError.value = false;
  isSuccess.value = false;

  const { valid } = await form.value!.validate();
  if (!valid) return;

  if (!turnstileToken.value) {
    turnstileError.value = true;
    return;
  }
  turnstileError.value = false;

  isSubmitting.value = true;

  try {
    await postContactMessage({
      name: fields.name,
      email: fields.email,
      topic: fields.topic!,
      subject: fields.subject,
      message: fields.message,
      turnstileToken: turnstileToken.value,
    });

    isSuccess.value = true;

    // Reset form
    fields.name = '';
    fields.email = '';
    fields.topic = null;
    fields.subject = '';
    fields.message = '';
    await nextTick();
    form.value!.resetValidation();
    resetTurnstile();
  } catch {
    isError.value = true;
    resetTurnstile();
  } finally {
    isSubmitting.value = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
</script>


