<template>
<DefaultLayout>
  <template #header>
    <Hero
      imageUrl="/city-council.jpg"
      title="City Council"
      description="Block ALPRs in your community using the proven technique of petitioning your city or town's council."
    />
  </template>

  <v-container>
    <!-- Introduction Section -->
    <v-row>
      <v-col cols="12" md="10" lg="8" class="mx-auto">
        <div class="text-center mb-8">
          <v-icon size="64" color="var(--df-blue)" class="mb-4">
            <AccountVoiceIcon />
          </v-icon>
          <h2 class="text-h4 mb-4 font-weight-bold">Your Voice Matters Locally</h2>
          <p class="text-h6 text-medium-emphasis serif">
            City council members rely on us to understand public opinion. Here's your step-by-step guide to effectively advocate
            against mass surveillance systems with your local representatives.
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Talking Points -->
    <v-row class="mb-8">
      <v-col cols="12" md="10" lg="8" class="mx-auto">
        <v-card 
          class="pa-4" 
          elevation="2" 
          rounded="lg"
          hover
          href="https://consumerrights.wiki/w/Common_Questions,_Arguments,_%26_Responses_when_discussing_Flock_Surveillance"
          target="_blank"
        >
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-3 align-self-center">
                <CommentAlertIcon />
              </v-icon>
              <div>
                <h4 class="text-h6 font-weight-bold mb-1">Talking Points</h4>
                <p class="text-body-2 mb-0">Common questions, arguments & responses for discussing surveillance</p>
              </div>
            </div>
            <v-icon color="primary" class="align-self-center">
              <OpenInNewIcon />
            </v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Step 1: One-on-One Meetings -->
    <v-row class="mb-12">
      <v-col cols="12" md="10" lg="8" class="mx-auto">
        <v-card class="pa-6" elevation="3" rounded="lg">
          <div class="d-flex align-center mb-4">
            <v-avatar size="48" color="primary" class="mr-4">
              <span class="text-h5 font-weight-bold white--text">1</span>
            </v-avatar>
            <div>
              <h3 class="text-h5 font-weight-bold mb-1">Meet Council Members Privately</h3>
              <p class="text-body-2 text-medium-emphasis mb-0">Start with personal conversations - often the most effective approach</p>
            </div>
          </div>

          <p class="text-body-1 mb-4">
            Personal conversations with council members are often the most effective way to influence their vote. 
            These private meetings allow for deeper discussion and help them understand the human impact of surveillance policies.
          </p>

          <v-row>
            <v-col cols="12" md="6">
              <h4 class="text-h6 mb-3 d-flex align-center">
                <v-icon color="primary" class="mr-2">
                  <CalendarPlusIcon />
                </v-icon>
                How to Schedule
              </h4>
              <v-list density="compact">
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Contact their office via phone or email</v-list-item-title>
                </v-list-item>
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Suggest meeting at a local coffee shop or their office</v-list-item-title>
                </v-list-item>
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Request just 15-20 minutes of their time</v-list-item-title>
                </v-list-item>
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Mention you're a constituent concerned about ALPRs</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <h4 class="text-h6 mb-3 d-flex align-center">
                <v-icon color="primary" class="mr-2">
                  <LightbulbOnIcon />
                </v-icon>
                Meeting Tips
              </h4>
              <v-list density="compact">
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Bring a brief printed summary of key points</v-list-item-title>
                </v-list-item>
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Share personal concerns about privacy and community impact</v-list-item-title>
                </v-list-item>
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Ask about their position and listen to their concerns</v-list-item-title>
                </v-list-item>
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Respond to their concerns with your ideas</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <div>
            <h4 class="text-h6 font-weight-bold mb-2">Sample Email Template</h4>
            <v-card class="pa-4" variant="tonal">
              <p class="mb-0">
                Hello [Council Member], I'm a [city] resident concerned about the upcoming 
                surveillance technology contract. Would you have 15 minutes to discuss this over coffee? I'd love to share some community 
                concerns and hear your thoughts.
              </p>
            </v-card>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Step 2: Public Speaking -->
    <v-row class="mb-12">
      <v-col cols="12" md="10" lg="8" class="mx-auto">
        <v-card class="pa-6" elevation="3" rounded="lg">
          <div class="d-flex align-center mb-4">
            <v-avatar size="48" color="primary" class="mr-4">
              <span class="text-h5 font-weight-bold white--text">2</span>
            </v-avatar>
            <div>
              <h3 class="text-h5 font-weight-bold mb-1">Speak at Council Meetings</h3>
              <p class="text-body-2 text-medium-emphasis mb-0">Create an official record and show public opposition</p>
            </div>
          </div>

          <p class="text-body-1 mb-4">
            Public comment at council meetings creates an official record of community opposition and demonstrates 
            to council members that constituents are paying attention to their votes on surveillance issues.
          </p>

          <v-row>
            <v-col cols="12" md="6">
              <h4 class="text-h6 mb-3 d-flex align-center">
                <v-icon color="primary" class="mr-2">
                  <ClockIcon />
                </v-icon>
                Before the Meeting
              </h4>
              <v-list density="compact">
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Check meeting schedule and agenda online</v-list-item-title>
                </v-list-item>
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Sign up for public comment (often required)</v-list-item-title>
                </v-list-item>
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Prepare 2-3 minute statement (practice timing)</v-list-item-title>
                </v-list-item>
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Bring a copy of your statement</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <h4 class="text-h6 mb-3 d-flex align-center">
                <v-icon color="primary" class="mr-2">
                  <PresentationIcon />
                </v-icon>
                During the Meeting
              </h4>
              <v-list density="compact">
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Arrive on time or early</v-list-item-title>
                </v-list-item>
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>State your name and connection to the city</v-list-item-title>
                </v-list-item>
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Speak clearly and maintain eye contact</v-list-item-title>
                </v-list-item>
                <v-list-item :prepend-icon="CheckIcon">
                  <v-list-item-title>Stay respectful and thank council for their time</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <v-alert type="info" variant="tonal" class="mb-4">
            <strong>Pro Tip:</strong> Focus on how ALPRs affect YOUR community specifically. Personal stories and local examples are more compelling than abstract arguments.
          </v-alert>

          <!-- Example Videos -->
          <div class="mt-6">
            <h4 class="text-h6 font-weight-bold mb-4 d-flex align-center">
              <v-icon color="primary" class="mr-2">
                <VideoIcon />
              </v-icon>
              Example Speeches
            </h4>
            <v-row>
              <v-col v-for="video in videos" :key="video.url" cols="12" sm="6">
                <v-card 
                  class="video-card-compact pa-4 d-flex align-center"
                  elevation="2" 
                  rounded="lg"
                  hover
                  @click="openVideo(video.url)"
                >
                  <v-avatar size="48" color="primary" class="mr-3 video-play-button-compact">
                    <v-icon size="24" color="white">
                      <PlayIcon />
                    </v-icon>
                  </v-avatar>
                  
                  <div class="flex-grow-1">
                    <h4 class="text-body-1 font-weight-bold mb-0">{{ video.location }}</h4>
                    <p class="text-caption text-medium-emphasis mb-0">City Council Meeting</p>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Stories -->
    <v-row class="mb-12">
      <v-col cols="12" md="10" lg="8" class="mx-auto">
        <div ref="tableRef" class="intersection-target">
          <v-card class="pa-6" elevation="3" rounded="lg">
            <div class="d-flex align-center mb-4">
              <v-avatar size="48" color="primary" class="mr-4">
                <v-icon size="24" color="white">
                  <TrophyOutlineIcon />
                </v-icon>
              </v-avatar>
              <div>
                <h3 class="text-h5 font-weight-bold mb-1">Recent Victories</h3>
                <p class="text-body-2 text-medium-emphasis mb-0">Communities across the country are winning</p>
              </div>
            </div>
          
          <v-data-table
            :headers="headers"
            :items="citiesRejectingFlock"
            :loading="loading"
            :items-per-page="10"
            :items-per-page-options="[10, 25, 50]"
            class="elevation-0"
            density="comfortable"
            hover
            show-expand
            item-value="cityState"
          >
            <template v-slot:header.cityState="{ column }">
              <div class="d-flex align-center text-medium-emphasis">
                <v-icon size="18" class="mr-2">
                  <MapMarkerIcon />
                </v-icon>
                <span class="text-caption font-weight-medium">{{ column.title }}</span>
              </div>
            </template>

            <template v-slot:header.MonthYear="{ column }">
              <div class="d-flex align-center text-medium-emphasis">
                <v-icon size="18" class="mr-2">
                  <CalendarMonthIcon />
                </v-icon>
                <span class="text-caption font-weight-medium">{{ column.title }}</span>
              </div>
            </template>

            <template v-slot:header.Outcome="{ column }">
              <div class="d-flex align-center text-medium-emphasis">
                <v-icon size="18" class="mr-2">
                  <TrophyOutlineIcon />
                </v-icon>
                <span class="text-caption font-weight-medium">{{ column.title }}</span>
              </div>
            </template>

            <template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
              <v-btn
                :append-icon="isExpanded(internalItem) ? ChevronUpIcon : ChevronDownIcon"
                :text="isExpanded(internalItem) ? 'Collapse' : 'More info'"
                class="text-none"
                color="medium-emphasis"
                size="small"
                variant="text"
                border
                slim
                @click="toggleExpand(internalItem)"
              />
            </template>

            <template v-slot:expanded-row="{ columns, item }">
              <tr>
                <td :colspan="columns.length" class="pa-4">
                  <div v-html="item.description" class="text-body-1" style="line-height: 1.6;"></div>
                </td>
              </tr>
            </template>

            <template v-slot:item.cityState="{ item }">
              <span class="font-weight-bold">{{ item.cityState }}</span>
            </template>
            
            <template v-slot:item.MonthYear="{ item }">
              {{ item.MonthYear }}
            </template>
            
            <template v-slot:item.Outcome="{ item }">
              <v-icon size="18" class="mr-2">
                <CheckBoldIcon />
              </v-icon>
              <span class="font-weight-bold">{{ item.Outcome }}</span>
            </template>
            
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
            </template>
            
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="48" color="grey-lighten-1" class="mb-4">
                  <DatabaseOffIcon />
                </v-icon>
                <div class="text-h6 text-medium-emphasis">No victories found</div>
                <div class="text-body-2 text-medium-emphasis mt-2">
                  Check your connection and try again
                </div>
                <v-btn
                  @click="fetchRecentWins"
                  color="primary"
                  variant="outlined"
                  class="mt-4"
                  :prepend-icon="RefreshIcon"
                >
                  Retry
                </v-btn>
              </div>
            </template>
          </v-data-table>

          <div v-if="lastUpdated" class="mt-4 text-caption text-medium-emphasis text-center">
            Last updated: {{ formatDate(lastUpdated) }}
          </div>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Community Support Section -->
    <v-row>
      <v-col cols="12" md="10" lg="8" class="mx-auto">
        <v-card class="pa-6" elevation="3" rounded="lg" color="primary" variant="tonal">
          <div class="text-center">
            <v-icon size="64" color="primary" class="mb-4">
              <CommentQuestionIcon />
            </v-icon>
            <h3 class="text-h4 font-weight-bold mb-4">Need Help or Have Questions?</h3>
            <p class="text-h6 mb-6 serif">
              Join our supportive community of activists and experienced speakers who are ready to help you succeed.
            </p>
            
            <v-btn
              href="https://discord.gg/aV7v4R3sKT"
              target="_blank"
              size="large"
              color="primary"
              class="mr-4 mb-4"
            >
              <template #prepend>
                <v-icon>
                  <DiscordIcon />
                </v-icon>
              </template>
              Join #campaigning Channel
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Hero from '@/components/layout/Hero.vue';
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

import AccountVoiceIcon from '@iconify-vue/mdi/account-voice';
import CommentAlertIcon from '@iconify-vue/mdi/comment-alert';
import OpenInNewIcon from '@iconify-vue/mdi/open-in-new';
import CalendarPlusIcon from '@iconify-vue/mdi/calendar-plus';
import CheckIcon from '@iconify-vue/mdi/check';
import CheckBoldIcon from '@iconify-vue/mdi/check-bold';
import PresentationIcon from '@iconify-vue/mdi/presentation';
import VideoIcon from '@iconify-vue/mdi/video';
import CommentQuestionIcon from '@iconify-vue/mdi/comment-question';
import MapMarkerIcon from '@iconify-vue/mdi/map-marker';
import CalendarMonthIcon from '@iconify-vue/mdi/calendar-month';
import TrophyOutlineIcon from '@iconify-vue/mdi/trophy-outline';
import ChevronUpIcon from '@iconify-vue/mdi/chevron-up';
import ChevronDownIcon from '@iconify-vue/mdi/chevron-down';
import DatabaseOffIcon from '@iconify-vue/mdi/database-off';
import RefreshIcon from '@iconify-vue/mdi/refresh';
import LightbulbOnIcon from '@iconify-vue/mdi/lightbulb-on';
import ClockIcon from '@iconify-vue/mdi/clock';
import DiscordIcon from '@iconify-vue/ic/baseline-discord';
import PlayIcon from '@iconify-vue/mdi/play';

const sortMonthYearByDateDesc = (a: string, b: string) => {
  const [aMonth, aYear] = a.split(/\s/);
  const [bMonth, bYear] = b.split(/\s/);
  const aDate = new Date(`${aMonth} 1, ${aYear}`);
  const bDate = new Date(`${bMonth} 1, ${bYear}`);
  return bDate.getTime() - aDate.getTime();
};

interface CityRejection {
  cityState: string;
  MonthYear: string;
  description: string;
  Outcome: string;
}

interface CMSResponse {
  id: number;
  WinInstances: CityRejection[];
  date_updated: string;
}

// Reactive data for CMS content
const citiesRejectingFlock = ref<CityRejection[]>([]);
const lastUpdated = ref<string>('');
const loading = ref<boolean>(false);
const tableRef = ref<HTMLElement | null>(null);
const hasLoaded = ref<boolean>(false);

// Intersection observer for lazy loading
let observer: IntersectionObserver | null = null;

// Data table configuration
const headers = [
  { 
    title: 'City/State',
    key: 'cityState', 
    width: '30%',
    sortable: false
  },
  { 
    title: 'Date',
    key: 'MonthYear', 
    width: '25%',
    sortable: false,
  },
  { 
    title: 'Outcome',
    key: 'Outcome', 
    width: '35%',
    sortable: false
  }
];

// Fetch recent wins from CMS
const fetchRecentWins = async () => {
  loading.value = true;
  try {
    const response = await fetch('https://cms.deflock.me/items/RecentWins');
    const result: CMSResponse = (await response.json()).data;

    const sortedResult = result.WinInstances.sort((a, b) => sortMonthYearByDateDesc(a.MonthYear, b.MonthYear));

    citiesRejectingFlock.value = sortedResult;
    lastUpdated.value = result.date_updated;
  } catch (error) {
    console.error('Error fetching recent wins:', error);
    // Fallback to empty array if fetch fails
    citiesRejectingFlock.value = [];
  } finally {
    loading.value = false;
  }
};

// Setup intersection observer for lazy loading
const setupIntersectionObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasLoaded.value) {
          hasLoaded.value = true;
          fetchRecentWins();
          // Disconnect observer after loading once
          if (observer) {
            observer.disconnect();
            observer = null;
          }
        }
      });
    },
    {
      rootMargin: '50px',
      threshold: 0.1
    }
  );

  if (tableRef.value) {
    observer.observe(tableRef.value);
  } else {
    console.warn('tableRef is null, cannot observe element');
  }
};

// Setup observer when component mounts
onMounted(async () => {
  await nextTick();
  setupIntersectionObserver();
});

// Cleanup observer on unmount
onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

// Format date helper function
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const videos = [
  {
    location: "Flagstaff, AZ",
    url: "https://youtu.be/6L6UlDJFYWk"
  },
  {
    location: "Eugene, OR (1)",
    url: "https://youtu.be/FpXyS0dqUSM"
  },
  {
    location: "Denver, CO",
    url: "https://youtu.be/YjaH_1Ia6NA"
  },
  {
    location: "Coralville, IA",
    url: "http://coralvision.cablecast.tv:8080/internetchannel/show/2643?seekto=312&channel=1"
  },
  {
    location: "Eugene, OR (2)",
    url: "https://drive.google.com/file/d/1d49xph-LJsbTzbc9WOYo8bvB8l2260s5/view?usp=drivesdk"
  },
  {
    location: "Lockhart, TX",
    url: "https://lockharttx.new.swagit.com/videos/357764?ts=4437"
  }
].sort((a, b) => a.location.localeCompare(b.location));

const openVideo = (url: string) => {
  window.open(url, '_blank');
};

</script>

<style scoped>
.talking-points {
  list-style: none;
  padding: 0;
}

.talking-points li {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.talking-points li:last-child {
  border-bottom: none;
}

.talking-points li::before {
  content: "•";
  color: var(--df-blue);
  font-weight: bold;
  display: inline-block;
  width: 1em;
  margin-left: 0;
}

.v-card {
  transition: box-shadow 0.2s ease-in-out;
}

.v-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.v-expansion-panel-title {
  font-weight: 500;
}

.v-avatar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.success-story-card {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.success-story-card:hover {
  border-left-color: var(--df-blue);
}

.v-list-item-title {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  line-height: 1.4 !important;
  word-break: normal !important;
  hyphens: none !important;
  overflow-wrap: break-word !important;
}

.v-list-item {
  min-height: auto !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

/* Intersection target wrapper */
.intersection-target {
  display: block;
  width: 100%;
  min-height: 1px;
}

/* Data Table Styles */
.v-data-table {
  border-radius: 12px !important;
}

.v-data-table .v-data-table__th {
  font-weight: 500 !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  opacity: 0.6 !important;
}

.v-data-table .v-data-table__td {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12) !important;
}

.v-data-table .v-data-table-header {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

.v-data-table .v-data-table__tr:hover {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

/* Video Card Styles */
.video-card {
  min-height: 280px;
  cursor: pointer;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.video-card:hover {
  border-color: #f44336;
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(244, 67, 54, 0.2) !important;
}

/* Compact Video Card Styles */
.video-card-compact {
  cursor: pointer;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  min-height: 80px;
}

.video-card-compact:hover {
  background: rgba(255, 255, 255, 1);
  border-color: var(--v-theme-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.video-play-button-compact {
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.video-card-compact:hover .video-play-button-compact {
  transform: scale(1.05);
}

.video-play-container {
  position: relative;
}

.video-play-button {
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(244, 67, 54, 0.3);
}

.video-card:hover .video-play-button {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(244, 67, 54, 0.4);
}

.video-play-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border: 2px solid rgba(244, 67, 54, 0.2);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

/* Dark theme support for video cards */
.v-theme--dark .video-card {
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
}

.v-theme--dark .video-card:hover {
  box-shadow: 0 12px 30px rgba(244, 67, 54, 0.3) !important;
}

.v-theme--dark .video-card-compact {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .video-card-compact:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--v-theme-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}
</style>