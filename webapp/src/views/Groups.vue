<template>
  <DefaultLayout>
    <template #header>
      <Hero
        title="Local Groups"
        description="Find and join an independent group fighting mass surveillance near you."
      />
    </template>
    <v-container>
      <v-row>
        <v-col cols="12" class="mx-auto text-center">
          <p>
            These groups are <b>independently run</b> and are <b>not affiliated with DeFlock</b>.
          </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="8" lg="6" class="mx-auto">
          <div v-if="chapters.length">
            <div v-for="(state, idx) in statesWithChapters" :key="state" class="mb-8">
              <h3 class="font-weight-bold text-h6 mb-0">{{ abbrevToState[state] }}</h3>
              <v-divider class="mb-4" />
              <v-list>
                <template v-for="(chapter, idx) in chaptersByState[state]" :key="chapter.id">
                  <v-list-item
                    two-line
                    class="chapter-list-item"
                  >
                    <v-list-item-content>
                      <v-list-item-title class="font-weight-bold">
                        {{ chapter.name }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="font-weight-bold">
                        {{ chapter.city }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
    
                    <template #append>
                      <v-list-item-action>
                        <v-btn :href="chapter.website" target="_blank" rel="noopener" color="primary" variant="outlined" size="small">
                          Visit Website
                          <v-icon end>mdi-open-in-new</v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </template>

                  </v-list-item>
                  <v-divider v-if="idx < chaptersByState[state].length - 1" />
                </template>
              </v-list>
            </div>

            <v-divider />

            <div class="text-center">
              <p>Don't see a group near you?</p>
              <v-btn color="primary" variant="outlined" to="/contact">
                <v-icon start>mdi-plus</v-icon>Submit a Group
              </v-btn>
            </div>
          </div>

          <div v-else class="text-center">
            <div v-if="!isLoading">
              <v-alert variant="tonal" color="info">No chapters found.</v-alert>
            </div>
            <div v-else>
              <v-progress-circular indeterminate color="primary" size="48" />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
</DefaultLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import Hero from '@/components/layout/Hero.vue'
  import { cmsService } from '@/services/cmsService'
  
  interface Chapter {
    id: string
    name: string
    city: string
    state: string
    website: string
  }

  const abbrevToState: Record<string, string> = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
  }
  
  const chapters = ref<Chapter[]>([])
  const isLoading = ref(true)

  const chaptersByState = computed(() => {
    const grouped: Record<string, Chapter[]> = {}
    chapters.value.forEach(chapter => {
      if (!grouped[chapter.state]) grouped[chapter.state] = []
      grouped[chapter.state].push(chapter)
    })
    return grouped
  })

  const statesWithChapters = computed(() => {
    return Object.keys(chaptersByState.value).sort()
  })

  onMounted(() => {
    cmsService.getChapters()
      .then(data => {
        chapters.value = data
      })
      .finally(() => {
        isLoading.value = false
      })
  })
</script>
  