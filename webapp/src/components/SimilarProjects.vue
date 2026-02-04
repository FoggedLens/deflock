<template>
  <v-container class="similar-projects py-12">
    <v-row justify="center" class="mb-8">
      <v-col cols="12" md="8">
        <h2 class="text-center text-h4 font-weight-bold mb-4">Similar Projects</h2>
        <p class="text-center text-body-1 text-medium-emphasis">
          Explore other initiatives working to protect privacy and track surveillance infrastructure
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col 
        v-for="project in similarProjects" 
        :key="project.name"
        cols="12" 
        sm="6" 
        md="4" 
        lg="3"
        class="d-flex"
      >
        <v-card
          :href="project.url"
          target="_blank"
          rel="noopener noreferrer"
          class="project-card flex-grow-1 d-flex flex-column"
          elevation="2"
          hover
        >
          <!-- Project Image/Logo -->
          <div class="project-image-container">
            <v-img
              :src="project.imageUrl"
              :alt="project.name"
              class="project-image"
              :aspect-ratio="16/9"
              cover
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-icon 
                    icon="mdi-web" 
                    size="x-large" 
                    color="grey-lighten-2"
                  ></v-icon>
                </v-row>
              </template>
            </v-img>
            
            <!-- Overlay with external link icon -->
            <div class="project-overlay">
              <v-icon 
                icon="mdi-open-in-new" 
                color="white" 
                size="large"
                class="external-link-icon"
              ></v-icon>
            </div>
          </div>

          <!-- Project Content -->
          <v-card-title class="text-subtitle-1 font-weight-bold pa-4 pb-0 text-center">
            {{ project.name }}
          </v-card-title>
          
          <v-card-text class="flex-grow-1 pa-4 pt-2">
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ project.description }}
            </p>
          </v-card-text>

          <!-- Visit Button -->
          <v-card-actions class="pa-4 pt-0">
            <v-btn
              :href="project.url"
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-arrow-top-right"
              block
              @click.stop
            >
              Visit Site
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
interface SimilarProject {
  name: string;
  description: string;
  url: string;
  imageUrl: string;
}

const similarProjects: SimilarProject[] = [
  {
    name: "Have I Been Flocked?",
    description: "See if your license plate has been searched in Flock's system, as well as concerning trends in Flock usage.",
    url: "https://haveibeenflocked.com",
    imageUrl: "/similar-projects/hibf.webp"
  },
  {
    name: "FlockHopper",
    description: "Get directions that avoid ALPR cameras, and see how many are normally on your route.",
    url: "https://dontgetflocked.com",
    imageUrl: "/similar-projects/flockhopper.webp"
  },
  {
    name: "Upcoming Meetings",
    description: "Find upcoming public meetings related to ALPR deployments.",
    url: "https://alpr.watch/",
    imageUrl: "/similar-projects/alprdotwatch.webp"
  },
  {
    name: "Eyes On Flock",
    description: "Dashboard for tracking Flock usage patterns, including total cameras & top search reasons.",
    url: "https://eyesonflock.com",
    imageUrl: "/similar-projects/eof.webp"
  },
  {
    name: "Suspected Locations",
    description: "Map of locations where ALPRs may be, based on 811 locate requests, FOIA, and other sources.",
    url: "https://alprwatch.org/flock/suspected-locations/",
    imageUrl: "/similar-projects/flockutil.webp"
  },
  {
    name: "Recent Submissions",
    description: "Explore recently added Flock cameras in the US.",
    url: "https://alprwatch.org/flock/map",
    imageUrl: "/similar-projects/alprwatch.webp"
  },
  {
    name: "Atlas of Surveillance",
    description: "EFF's comprehensive database of surveillance technologies used by law enforcement.",
    url: "https://atlasofsurveillance.org/atlas",
    imageUrl: "/similar-projects/eff-atlas.webp"
  },
  {
    name: "Plate Privacy",
    description: "The Institute for Justice's site analyzing ALPR usage patterns in the US.",
    url: "https://plateprivacy.com",
    imageUrl: "/similar-projects/plate-privacy.webp"
  }
]
</script>

<style scoped>
.similar-projects {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.10) 0%, rgba(100, 181, 246, 0.08) 100%);
}

.project-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 16px !important;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.project-image-container {
  position: relative;
  overflow: hidden;
}

.project-image {
  transition: transform 0.3s ease;
}

.project-card:hover .project-image {
  transform: scale(1.05);
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .project-overlay {
  opacity: 1;
}

.external-link-icon {
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.project-card:hover .external-link-icon {
  transform: scale(1);
}

.v-card-title {
  line-height: 1.3;
  word-break: break-word;
}

.v-card-text p {
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.cta-card {
  border-radius: 16px !important;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1) 0%, rgba(var(--v-theme-secondary), 0.05) 100%);
}

/* Responsive grid adjustments */
@media (max-width: 960px) {
  .project-card:hover {
    transform: translateY(-4px) scale(1.01);
  }
}

@media (max-width: 600px) {
  .similar-projects {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
  
  .project-card {
    margin-bottom: 1rem;
  }
  
  .project-card:hover {
    transform: translateY(-2px);
  }
}

/* Dark mode adjustments */
.v-theme--dark .project-overlay {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3));
}

.v-theme--dark .cta-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.15) 0%, rgba(var(--v-theme-secondary), 0.08) 100%);
}
</style>
