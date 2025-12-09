<template>
<DefaultLayout no-bottom-margin>
  <div class="app-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <v-container class="hero-container">
        <v-row align="center" class="min-height-screen">
          <v-col cols="12" md="6" class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">
                Protect Your
                <span class="gradient-text">Privacy</span>
              </h1>
              <p class="hero-subtitle">
                Discover and report automatic license plate readers in your community. 
                Take control of surveillance in your neighborhood.
              </p>
              <div class="download-buttons">
                <v-btn
                  size="large"
                  color="black"
                  class="download-btn ios-btn"
                  :href="appLinks.ios"
                  target="_blank"
                >
                  <template #prepend>
                    <v-icon>
                      <AppleIcon />
                    </v-icon>
                  </template>
                  Download for iOS
                </v-btn>
                <v-btn
                  size="large"
                  variant="outlined"
                  color="black"
                  class="download-btn android-btn"
                  :href="appLinks.android"
                  target="_blank"
                >
                  <template #prepend>
                    <v-icon>
                      <GooglePlayIcon />
                    </v-icon>
                  </template>
                  Get on Android
                </v-btn>

                <v-btn
                  size="large"
                  variant="tonal"
                  color="white"
                  to="/app/docs"
                  class="download-btn mt-8"
                >
                  <template #prepend>
                    <v-icon>
                      <BookOpenIcon />
                    </v-icon>
                  </template>
                  Read the User Guide
                  <v-icon size="small" class="ml-1">
                    <OpenInNewIcon />
                  </v-icon>
                </v-btn>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="hero-image">
            <div class="phone-mockup">
              <img src="/app-screenshots/app_showcase.webp" alt="DeFlock App Screenshot" class="phone-image" />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <v-container>
        <div class="section-header">
          <h2 class="section-title">Powerful Features</h2>
          <p class="section-subtitle">Everything you need to understand surveillance in your area</p>
        </div>
        
        <v-row class="features-grid">
          <v-col 
            v-for="feature in features" 
            :key="feature.id"
            cols="12" 
            md="4" 
            class="feature-col"
          >
            <v-card class="feature-card" elevation="4">
              <v-card-text class="text-center pa-8">
                <div class="feature-icon mb-6">
                  <v-icon size="48" :color="feature.color">
                    <component :is="feature.icon" />
                  </v-icon>
                </div>
                <h3 class="feature-title mb-3">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Screenshots Section -->
    <section class="screenshots-section">
      <v-container>
        <div class="section-header">
          <h2 class="section-title">See It In Action</h2>
          <p class="section-subtitle">Beautiful design meets powerful functionality</p>
        </div>
        
        <div class="screenshots-carousel">
          <v-row justify="center">
            <v-col 
              v-for="(screenshot, index) in visibleScreenshots" 
              :key="screenshot.id"
              cols="12" 
              sm="6" 
              md="4"
              lg="3"
              class="screenshot-col"
            >
              <div class="screenshot-card" :class="{ 'featured': index === 1 }">
                <img :src="'/app-screenshots' + screenshot.image" :alt="screenshot.title" class="screenshot-image" />
                <div class="screenshot-overlay">
                  <h4 class="screenshot-title">{{ screenshot.title }}</h4>
                  <p class="screenshot-description">{{ screenshot.description }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </section>

    <!-- Statistics Section -->
    <section class="stats-section">
      <v-container>
        <div class="stats-grid">
          <div 
            v-for="stat in statistics" 
            :key="stat.id"
            class="stat-item"
          >
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </v-container>
    </section>

    <!-- Privacy Policy Section -->
    <section class="privacy-policy-section" id="privacy-policy">
      <v-container>
        <div class="privacy-policy-content">
          <h2 class="privacy-policy-title">Your Privacy, Protected</h2>
          <div class="privacy-policy-text">
            <p class="privacy-intro">
              We believe privacy is a fundamental right. Here's our commitment to protecting yours:
            </p>
            
            <div class="privacy-principles">
              <v-card
                v-for="principle in privacyPrinciples"
                :key="principle.id"
                class="privacy-principle-card mb-6"
                elevation="2"
              >
                <v-card-text class="pa-8">
                  <h3 class="principle-title mb-3">
                    <v-icon color="primary" class="me-3">
                      <LockIcon />
                    </v-icon>
                    {{ principle.title }}
                  </h3>
                  <p class="principle-description mb-0">
                    <span v-html="principle.description"></span>
                  </p>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>
      </v-container>
    </section>

    <!-- Download CTA Section -->
    <section class="download-cta-section">
      <v-container>
        <div class="download-cta-content">
          <h2 class="cta-title">Ready to Take Control?</h2>
          <p class="cta-subtitle">
            Join thousands of users mapping surveillance in their communities.
          </p>
          <div class="cta-buttons">
            <v-btn
              size="x-large"
              color="primary"
              class="cta-btn ios-cta"
              :href="appLinks.ios"
              target="_blank"
            >
              <template #prepend>
                <v-icon>
                  <AppleIcon />
                </v-icon>
              </template>
              Download for iPhone
            </v-btn>
            <v-btn
              size="x-large"
              variant="outlined"
              color="primary"
              class="cta-btn android-cta"
              :href="appLinks.android"
              target="_blank"
            >
              <template #prepend>
                <v-icon>
                  <GooglePlayIcon />
                </v-icon>
              </template>
              Get on Android
            </v-btn>
          </div>
          <p class="cta-note">Free download • No ads • Privacy focused</p>
        </div>
      </v-container>
    </section>
  </div>
</DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { ref, computed } from 'vue';

import AppleIcon from '@iconify-vue/mdi/apple';
import GooglePlayIcon from '@iconify-vue/mdi/google-play';
import BookOpenIcon from '@iconify-vue/mdi/book-open-variant';
import OpenInNewIcon from '@iconify-vue/mdi/open-in-new';
import MapSearchIcon from '@iconify-vue/mdi/map-search';
import CameraPlusIcon from '@iconify-vue/mdi/camera-plus';
import AccountGroupIcon from '@iconify-vue/mdi/account-group';
import LockIcon from '@iconify-vue/mdi/lock';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
}

interface Screenshot {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface Statistic {
  id: number;
  number: string;
  label: string;
}

interface PrivacyPrinciple {
  id: number;
  title: string;
  description: string;
}

const appLinks = {
  android: 'https://play.google.com/store/apps/details?id=me.deflock.deflockapp',
  ios: 'https://apps.apple.com/us/app/deflock-me/id6752760780',
}

// App features
const features: Feature[] = [
  {
    id: 1,
    title: 'Discover ALPRs',
    description: 'Find automatic license plate readers in your neighborhood with our comprehensive database.',
    icon: MapSearchIcon,
    color: 'primary'
  },
  {
    id: 2,
    title: 'Report New Cameras',
    description: 'Easily report new ALPR installations you discover to help grow the community database.',
    icon: CameraPlusIcon,
    color: 'success'
  },
  {
    id: 3,
    title: 'Community Driven',
    description: 'Join a community of privacy advocates working together to map surveillance.',
    icon: AccountGroupIcon,
    color: 'info'
  },
];

// App screenshots
const screenshots: Screenshot[] = [
  {
    id: 1,
    title: 'Interactive Map',
    description: 'Explore ALPR cameras near you',
    image: '/1_home.webp'
  },
  {
    id: 2,
    title: 'Report New Cameras',
    description: 'Add new ALPR locations easily',
    image: '/13_add_and_place.webp'
  },
  {
    id: 3,
    title: 'Works Offline',
    description: 'Log cameras without internet',
    image: '/26_select_zoom.webp'
  },
];

// Statistics
const statistics: Statistic[] = [
  {
    id: 1,
    number: '40K+',
    label: 'Cameras Mapped'
  },
  {
    id: 2,
    number: '500+',
    label: 'Communities Covered'
  },
  {
    id: 3,
    number: '1K+',
    label: 'Contributors'
  },
];

const privacyPrinciples: PrivacyPrinciple[] = [
  {
    id: 1,
    title: 'Zero Personal Data Collection',
    description: 'This app does not collect, store, or transmit any personal information. No email addresses, phone numbers, names, or identifying information is ever requested or stored.'
  },
  {
    id: 2,
    title: 'Open Data Sources',
    description: 'All map data comes directly from OpenStreetMap, a collaborative, open-source mapping project. ALPR locations are crowd-sourced from contributors like you. Tiles are provided by OSM, Google, and Esri.'
  },
  {
    id: 3,
    title: 'Secure Authentication',
    description: 'If you choose to authenticate with OpenStreetMap to submit camera locations, the app retrieves a token for your OSM account securely via OAuth, which is stored locally on your phone and only used for submissions.'
  },
  {
    id: 4,
    title: 'Local Location Use',
    description: 'Your location is used only locally on your device to center the map for convenience. Location access is completely optional, and your position is never transmitted to our servers.'
  },
  {
    id: 5,
    title: 'No Tracking or Analytics',
    description: 'We don\'t use cookies, tracking pixels, or analytics services. No third-party services monitor your usage or behavior within the app.'
  },
  {
    id: 6,
    title: 'Open Source Transparency',
    description: 'Our code is <a target="_blank" href="https://github.com/foggedlens/deflock-app">open source</a> and available for review. You can verify our privacy commitments by examining the source code yourself.'
  }
];

const showAllScreenshots = ref(false);
const visibleScreenshots = computed(() =>
  showAllScreenshots.value ? screenshots : screenshots.slice(0, 3)
);
</script>

<style scoped>
.app-page {
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-container {
  padding: 80px 0;
  position: relative;
  z-index: 1;
}

.min-height-screen {
  min-height: 70vh;
}

.hero-content {
  display: flex;
  align-items: center;
}

.hero-text {
  max-width: 500px;
  padding: 0 20px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(45deg, #FFD700, #FF6B6B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.5;
  margin-bottom: 40px;
  opacity: 0.9;
  font-weight: 400;
}

.download-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.download-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 12px;
}

.ios-btn {
  background: white !important;
  color: black !important;
}

.android-btn {
  border: 2px solid white;
  color: white !important;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone-mockup {
  position: relative;
  max-width: 850px;
}

.phone-image {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
}

/* Features Section */
.features-section {
  padding-top: 120px;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.01em;
}

.section-subtitle {
  font-size: 1.125rem;
  opacity: 0.7;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  margin-top: 60px;
}

.feature-col {
  margin-bottom: 40px;
}

.feature-card {
  transition: all 0.3s ease;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-8px);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.feature-description {
  opacity: 0.8;
  line-height: 1.6;
}

/* Screenshots Section */
.screenshots-section {
  padding: 120px 0;
}

.screenshots-carousel {
  margin-top: 60px;
}

.screenshot-col {
  margin-bottom: 30px;
}

.screenshot-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.screenshot-card.featured {
  transform: scale(1.05);
}

.screenshot-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.screenshot-image {
  width: 100%;
  height: auto;
  display: block;
}

.screenshot-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 30px 20px 20px;
}

.screenshot-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.screenshot-description {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Statistics Section */
.stats-section {
  padding: 80px 0;
  background: #1a1a1a;
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Privacy Section */
.privacy-section {
  padding: 120px 0;
}

.privacy-content {
  padding-right: 40px;
}

.privacy-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  letter-spacing: -0.01em;
}

.privacy-description {
  font-size: 1.125rem;
  line-height: 1.6;
  opacity: 0.8;
  margin-bottom: 40px;
}

.privacy-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.privacy-feature {
  display: flex;
  align-items: center;
  gap: 12px;
}

.privacy-icon {
  flex-shrink: 0;
}

.privacy-text {
  font-size: 1rem;
}

.privacy-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.privacy-img {
  max-width: 100%;
  height: auto;
}

/* Privacy Policy Section */
.privacy-policy-section {
  padding-top: 100px;
}

.privacy-policy-content {
  max-width: 900px;
  margin: 0 auto;
}

.privacy-policy-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 48px;
  letter-spacing: -0.01em;
}

.privacy-intro {
  font-size: 1.25rem;
  line-height: 1.6;
  opacity: 0.8;
  text-align: center;
  margin-bottom: 60px;
  font-weight: 400;
}

.privacy-principles {
  margin-bottom: 60px;
}

.privacy-principle-card {
  transition: all 0.3s ease;
}

.privacy-principle-card:hover {
  transform: translateY(-2px);
}

.principle-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.principle-description {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
}

.privacy-summary-alert {
  font-size: 1.125rem;
}

/* Download CTA Section */
.download-cta-section {
  padding: 120px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.download-cta-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.01em;
}

.cta-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 40px;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.cta-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 12px;
}

.ios-cta {
  background: white !important;
  color: black !important;
}

.android-cta {
  border: 2px solid white !important;
  color: white !important;
}

.cta-note {
  font-size: 0.875rem;
  opacity: 0.7;
}

/* Responsive Design */
@media (max-width: 960px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .privacy-content {
    padding-right: 0;
    margin-bottom: 40px;
  }
  
  .cta-title {
    font-size: 2rem;
  }
}

@media (max-width: 600px) {
  .hero-container {
    padding: 60px 0;
  }
  
  .hero-text {
    padding: 0 16px;
  }
  
  .download-cta-content {
    padding: 0 16px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .download-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .features-section,
  .screenshots-section,
  .privacy-section,
  .download-cta-section {
    padding: 80px 0;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

<!-- flock employees are here!!! warning before discord -->