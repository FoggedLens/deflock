<template>
  <v-expansion-panels multiple :model-value :readonly="showAll">
    <v-expansion-panel>
      <v-expansion-panel-title class="font-weight-bold">
        Why should I care if I have nothing to hide?
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <h3 class="mb-2">1. You don't get to decide what looks suspicious tomorrow.</h3>
        <p class="pl-6">
          Just because you're not doing anything wrong today doesn't mean you won't be watched tomorrow. License plate cameras like Flock don't know your intentions—only your movements. A trip to a protest, a friend's house in a “high-crime” area, or even a misread plate can flag you as “suspicious.”
        </p>
        <p class="pl-6">
          As history has shown, when governments or third parties gain unchecked surveillance powers, they're eventually used against people who weren't doing anything wrong—<b>until someone decided they were</b>. For example, until early in 2025, ALPRs weren't used for tracking immigrants, legal or otherwise, but <b>now they are</b>, despite policies prohibiting it.
        </p>

        <h3 class="mb-2 mt-8">2. Mistakes happen, and you're the one who pays for them.</h3>
        <p class="pl-6">
          Automated License Plate Readers (ALPRs) are not always accurate. People have been pulled over at gunpoint, arrested, or detained because a camera misread a plate or flagged the wrong car.
        </p>
        <p class="pl-6">
          If you “have nothing to hide,” you also have nothing to correct the record with when a machine error points the finger at you.
        </p>

      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title class="font-weight-bold">
        Do these cameras only record vehicles involved in crimes?
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p>
          <b>No, ALPRs record all vehicles that pass by</b>, not just those involved in crimes. They capture license plates, unique identifying features, locations, dates, and times of every vehicle, regardless of whether the driver is suspected of wrongdoing. This means that even if you're not doing anything wrong, your movements are still being tracked and stored, often for long periods of time.
        </p>
        <p>
          Additionally, the data collected by ALPRs can be shared with other law enforcement agencies and third parties, further extending the reach of this surveillance. This raises significant privacy concerns, as most individuals are not aware that their movements are being monitored and recorded.
        </p>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title class="font-weight-bold">
        Do police need a warrant to search these cameras?
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p>
          <b>No, police do not need a warrant to search these cameras</b>. The data collected by ALPRs is owned by the police department, and law enforcement agencies can access it without a warrant. There is often <b>no oversight at all</b> on how these searches are conducted, <a target="_blank" href="https://ij.org/case/norfolk-virginia-camera-surveillance/">raising concerns about their constitutionality under the Fourth Amendment</a>.
        </p>
        <p>
          Some agencies have implemented agency-wide ALPR policies, but <b>these policies are meaningless</b>, as most agencies have opted into an extensive data sharing network that allows other agencies to access their data without the same restrictions, with <b>tens of thousands of national searches</b> occurring on a daily basis.
        </p>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title class="font-weight-bold">
        What oversight is there for these systems?
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p>
          <b>There is little to no oversight for these systems</b>. While some police departments <a target="_blank" href="https://search.libraryofleaks.org/datasets/61?cslimit=30&csq=ALPR#mode=search">have implemented policies</a> regarding the use of ALPRs, these policies are often weak and poorly enforced. Many agencies do not have any policies at all, and there is no requirement for transparency or accountability in how these systems are used.
        </p>
        <p>
          While Flock offers a <b>transparency portal</b> for their law enforcement customers, they allow their customers to cherry-pick what information is included or excluded from the portal. They also <b>lack any meaningful data</b>, often <a target="_blank" href="https://www.9news.com/article/news/local/denver-city-councilmembers-police-department-audit-license-plate-camera-data-usage/73-3777d34d-7723-4397-af37-716a6db6ebd9">underreporting the number of agencies with access</a>. Many activists believe the <b>hotlist hits section is inflated</b> to make it appear that the cameras are more effective than they actually are.
        </p>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel id="faq-transparency">
      <v-expansion-panel-title class="font-weight-bold">
        Do Flock's transparency portals give a full picture of who has access to the data?
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p>
          Absolutely not. Flock's transparency portals are <i>notoriously incomplete</i> and often <i>misleading</i>. They allow law enforcement agencies to cherry-pick what information is included or excluded, leading to significant underreporting of the number of organizations with access to the data.
        </p>
        <p>
          Take Boulder, Colorado for example. Their <a href="https://transparency.flocksafety.com/boulder-co-pd" target="_blank">transparency portal</a> lists around 90 agencies with access to their ALPR data. However, <a href="https://www.muckrock.com/foi/boulder-172/boulder-alpr-audits-187797/" target="_blank">a public records request</a> revealed that <b>over  6,000 agencies</b> actually had access. This discrepancy highlights the lack of transparency and accountability in Flock's reporting.
        </p>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title class="font-weight-bold">
        Can Flock be trusted to keep our data safe?
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p>
          Absolutely not. Flock has been caught <i>several times</i> lying on the record. For example, their CEO was interviewed by Denver 9News, and <a href="https://youtu.be/aMfO7D-f7U0?si=23FNwA91zVTwxb02&t=898" target="_blank">he claimed that Flock had no federal contracts.</a> However, a couple weeks later, <a href="https://www.9news.com/article/news/local/flock-federal-immigration-agents-access-tracking-data/73-a8aee742-56d4-4a57-b5bb-0373286dfef8" target="_blank">9News discovered</a> that Border Patrol actually <i>did</i> have access to search Flock's systems. Flock described the data sharing agreement as "one-to-one", meaning an agency would have to accept the data sharing request from Border Patrol.
        </p>
        <p>
          Doubtful of this claim, we filed <a href="https://www.muckrock.com/foi/boulder-172/boulder-alpr-audits-187797/" target="_blank">a public records request</a> with the Boulder Police Department in Colorado, and we found that "U.S. Border Patrol" was searching over 6,000 agencies, consistent with the number of agencies on the national network at the time. Either every agency on the national network happily accepted Border Patrol's request to their data, or Flock was lying on the record yet again.
        </p>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title class="font-weight-bold">
        How can I get these cameras out of my city/town?
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p>
          Several cities in the US have killed contracts for ALPRs, such as <a target="_blank" href="https://www.denver7.com/news/local-news/denver-city-council-rejects-contract-expansion-for-license-plate-recognition-cameras-in-the-city">Denver</a> and <a target="_blank" href="http://eff.org/deeplinks/2025/06/victory-austin-organizers-cancel-citys-flock-alpr-contract">Austin</a>. An effective strategy is to raise concerns in your community, build a group of advocates, and petition the city council not to extend the contract. This can be done through public comment at meetings and is most effective when there is a large enough group of concerned residents.
        </p>
        <p>
          <a target="_blank" href="https://youtu.be/YjaH_1Ia6NA">
            <v-icon start>mdi-youtube</v-icon>
            Watch Denver's talking points by Councilmember Sarah Parady
          </a>
        </p>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import QuotedSource from '@/components/QuotedSource.vue';
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  showAll: {
    type: Boolean,
    default: false,
  }
});

// Map hash values to panel indices
const hashToPanelIndex: Record<string, number> = {
  '#faq-transparency': 4,
  // Add more mappings here if you add more panel hashes
};

const modelValue = ref(props.showAll ? [0,1,2,3,4,5,6] : []);

function updatePanelFromHash() {
  const hash = window.location.hash;
  if (props.showAll) {
    modelValue.value = [0,1,2,3,4,5,6];
    return;
  }
  if (hashToPanelIndex.hasOwnProperty(hash)) {
    modelValue.value = [hashToPanelIndex[hash]];
  } else {
    modelValue.value = [];
  }
}

onMounted(() => {
  updatePanelFromHash();
  window.addEventListener('hashchange', updatePanelFromHash);
});

watch(() => props.showAll, (val) => {
  if (val) {
    modelValue.value = [0,1,2,3,4,5,6];
  } else {
    updatePanelFromHash();
  }
});
</script>

<style scoped>
blockquote {
  border-left: 4px solid #616161;
  padding-left: 16px;
  font-style: italic;
  margin-top: 16px;
  margin-bottom: 8px;
}

p {
  margin-bottom: 16px;
}

ul {
  margin-left: 16px;
  margin-bottom: 16px;
}
</style>
