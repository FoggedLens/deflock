<template>
  <v-container>
    <h1>Review Submissions</h1>
  
    <v-data-table
      :loading="isLoading"
      :headers="headers"
      :items="submissions"
      :items-per-page="10"
      class="elevation-1"
    >
      <template #item.review="{ item }: { item: Submission }">
        <v-btn @click="reviewSubmission(item)" color="primary" variant="text">Review</v-btn>
      </template>

      <template #item.objectKey="{ item }: { item: Submission }">
        <span style="text-transform: uppercase">{{ getExtension(item.objectKey) }}</span>
      </template>
    </v-data-table>
    
    <v-dialog
      v-model="isDialogOpen"
      v-if="selectedSubmission"
    >
      <ReviewSubmission
        @cancel="isDialogOpen = false"
        @delete="handleDelete"
        :submission="selectedSubmission"
      />
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import { getUserSubmissions, deleteObject } from '@/services/apiService';
import type { Submission } from '@/types';
import ReviewSubmission from '@/components/ReviewSubmission.vue';

const headers = [
  { title: 'Author', value: 'author' },
  { title: 'Type', value: 'objectKey' },
  { title: 'Review', value: 'review' }
];

const isLoading = ref(true);
const submissions: Ref<Submission[]> = ref([]);
const isDialogOpen = ref(false);
const selectedSubmission: Ref<Submission|null> = ref(null);

function reviewSubmission(submission: Submission) {
  selectedSubmission.value = submission;
  isDialogOpen.value = true;
}

function getExtension(filename: string) {
  return filename.split('.').pop();
}

function handleDelete(submission: Submission) {
  isDialogOpen.value = false;
  const fullObjectKey = submission.author + '/' + submission.objectKey;
  deleteObject(fullObjectKey)
    .then(() => {
      submissions.value = submissions.value.filter((s) => s.objectKey !== submission.objectKey);
      console.log('Object deleted successfully', fullObjectKey);
    })
    .catch((error) => {
      console.error('Error deleting object', error);
    });
}

onMounted(() => {
  getUserSubmissions()
    .then((response) => {
      submissions.value = response;
    })
    .finally(() => {
      isLoading.value = false;
    });
});
</script>
