<template>
<DefaultLayout>
  <template #header>
    <Hero
      title="Get Involved"
      description="Steps you can take to make a difference"
    />
  </template>

  <v-container>
    <h3 class="text-center">For Your Community</h3>
    <v-divider class="mb-4" />
    <v-row>
      <v-col cols="12" md="6" v-for="{ title, description, icon, to, href } in localActions" :key="title">
        <ActionCard :title :description :icon :to :href />
      </v-col>
    </v-row>

    <h3 class="text-center mb-5 mt-10">For the DeFlock Project</h3>
    <v-divider class="mb-4" />
    <v-row>
      <v-col cols="12" md="6" v-for="{ title, description, icon, to, href } in deflockActions" :key="title">
        <ActionCard :title :description :icon :to :href />
      </v-col>
    </v-row>

  </v-container>
</DefaultLayout>
  
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Hero from '@/components/layout/Hero.vue';
import ActionCard from '@/components/get-involved/ActionCard.vue';

interface Action {
  title: string;
  description: string;
  icon: string;
  to?: string;
  href?: string;
}

const localActions: Action[] = [
  {
    title: 'Join a Local Group',
    description: 'Connect with local advocacy groups working to regulate LPR use in your community.',
    icon: 'mdi-account-group',
    to: '/groups'
  },
  {
    title: 'Contact Your Representatives',
    description: 'Reaching out to your local council members is surprisingly effective in influencing policy decisions.',
    icon: 'mdi-phone',
    to: '/council'
  },
  {
    title: 'Submit Cameras',
    description: 'Help us build a comprehensive map of LPR deployments by reporting cameras in your area.',
    icon: 'mdi-map-marker-plus',
    to: '/report'
  },
  {
    title: 'Join our Discord',
    description: 'Connect with other volunteers, share ideas, and stay updated on DeFlock\'s progress.',
    icon: 'mdi-chat',
    href: 'https://discord.gg/aV7v4R3sKT'
  },
  {
    title: 'Hang Signs',
    description: 'Use our printable signs to inform your community about LPR surveillance and your rights.',
    icon: 'mdi-sign-text',
    to: '/store'
  },
  {
    title: 'Request Public Records',
    description: 'File public records requests to obtain information about LPR deployments in your area.',
    icon: 'mdi-file-document',
    to: '/foia'
  },
]

const deflockActions: Action[] = [
  {
    title: 'Become a GitHub Contributor',
    description: 'Contribute to our open-source projects by reporting bugs, fixing issues, and adding new features.',
    icon: 'mdi-github',
    href: 'https://github.com/foggedlens/deflock'
  },
  {
    title: 'Donate to DeFlock',
    description: `Don't have the time to volunteer? You can still support DeFlock's mission with a financial contribution.`,
    icon: 'mdi-cash-multiple',
    to: '/donate'
  },
]
</script>