<template>
  <v-expansion-panels multiple :model-value :readonly="showAll">
    <v-expansion-panel>
      <v-expansion-panel-title class="font-weight-bold">
        ALPRs Do Not Reduce Crime
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p>
          There&apos;s no independent research proving that ALPRs can reduce crime. Headlines and supporting studies claiming otherwise are often produced by the companies selling ALPRs and the police agencies buying them.
        </p>

        <p>
          For example, Flock Safety claims that <a href="https://www.flocksafety.com/articles/10-of-reported-crime-in-the-u-s-is-solved-using-flock-technology" target="_blank">10% of Reported Crime in the U.S. Is Solved Using Flock Technology.</a> The study that Flock cites was conducted by two Flock employees and “given legitimacy with the &apos;oversight&apos; of two academic researchers whose names are also on the paper” according to <a href="https://www.404media.co/researcher-who-oversaw-flock-surveillance-study-now-has-concerns-about-it/" target="_blank">a report by 404 Media</a>. Flock Safety is using the veneer of an academic study as part of its sales pitch.
        </p>

        <v-divider class="my-6" />

        <p>
          What research does exist regarding the ability of ALPRs to reduce crime is inconclusive at best:
        </p>

        <quoted-source source-url="https://link.springer.com/article/10.1007/s11292-011-9133-9" attribution-text="Journal of Experimental Criminology">
          Our findings indicate that, when small numbers of LPR patrols are used in crime hot spots in the way we have tested them here, they do not seem to generate either a general or offense-specific deterrent effect.
        </quoted-source>

        <quoted-source source-url="https://www.independent.org/publications/article.asp?id=13893" attribution-text="Automated License Plate Readers: A Study in Failure">
          There is not even a moderate degree of correlation between ALPRs and stolen vehicle recoveries, let alone any apparent casualty
        </quoted-source>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title class="font-weight-bold">
        ALPRs Are a Major Security Risk
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p>
          Companies that make ALPRs have a history of poor security practices, which can lead to data breaches and unauthorized access to sensitive information. For example:
        </p>

        <ul>
          <li>
            In January 2025, Motorola Solutions' ALPR system was <a href="https://www.404media.co/researcher-turns-insecure-license-plate-cameras-into-open-source-surveillance-tool/" target="_blank">found to have a critical security flaw</a> that allowed anyone to access live data from their cameras. Data includes <b>license plate numbers, make, model, color, and timestamps</b>. A <b>live feed</b> of both cameras (color and infrared) was also available to stream using a web browser.
          </li>
        </ul>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title class="font-weight-bold">
        ALPRs Are Dragnet Surveillance
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p><i>
          See <a href="https://en.wikipedia.org/wiki/Dragnet_(policing)" target="_blank">Dragnet (Policing)</a> on Wikipedia.
        </i></p>
        <p>
          A study of ALPRs in Piedmont, CA, found that <b>less than 0.3%</b> of ALPR hits might translate into a useful investigative lead. Most license plates recorded were not on a hot list, yet police still logged information on people's movements throughout the day.
        </p>
        <p>
          Flock Safety provides Transparency Portals to their police customers, which allow the public to see the data collected by ALPRs. From these portals, we can see that the vast majority of license plates scanned are not on a hot list (vehicles suspected of being involved in crimes). For example:
        </p>

        <ul>
          <li>
            <a href="https://transparency.flocksafety.com/oak-park-il-pd" target="_blank">Oak Park, IL Transparency Portal</a>
          </li>
          <li>
            <a href="https://transparency.flocksafety.com/vallejo-ca-pd" target="_blank">Vallejo, CA Transparency Portal</a>
          </li>
        </ul>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title class="font-weight-bold">
        ALPRs Are Abused
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p>
          There are many documented cases where police have knowingly used ALPRs to commit crimes and put people in danger. These examples illustrate that it can be difficult to put meaningful restrictions in place that prevent ALPRs from being used for nefarious purposes. It's often only after harm is done that an officer is caught and punished, if at all.
        </p>
        <ul>
          <li>
            <a href="https://www.404media.co/a-texas-cop-searched-license-plate-cameras-nationwide-for-a-woman-who-got-an-abortion/" target="_blank">
              Texas police used Flock ALPRs to track an abortion seeker across state lines
            </a>
          </li>
          <li>
            <a href="https://www.kwch.com/2022/10/31/kechi-police-lieutenant-arrested-using-police-technology-stalk-wife/" target="_blank">A police officer used Flock Safety ALPRs to stalk his estranged wife in Kechi, KS</a>
          </li>
          <li>
            <a href="https://apnews.com/general-news-699236946e3140659fff8a2362e16f43" target="_blank">A police officer accepted a bribe to run a woman's license plate in Georgia</a>
          </li>
          <li>
            <a href="https://apnews.com/general-news-699236946e3140659fff8a2362e16f43" target="_blank">A police officer used ALPRs to stalk his ex-girlfriend in Ohio</a>
          </li>
          <li>
            <a href="https://information.auditor.ca.gov/pdfs/reports/2019-118.pdf" target="_blank">California agencies keeping data longer than necessary and sharing it with unauthorized agencies</a>
          </li>
          <li>
            <a href="https://inewsource.org/2022/01/06/police-share-license-plate-data/" target="_blank">Police in San Diego County breaking the law sharing drivers' data</a>
          </li>
        </ul>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title class="font-weight-bold">
        ALPR Errors Create Dangerous Police Interactions
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p>
          ALPR misread errors have led to dangerous police encounters, including pulling guns on innocent drivers. Here are just a few examples:
        </p>
        <ul>
          <li>
            <a href="https://www.aclu.org/blog/privacy-technology/location-tracking/san-francisco-woman-pulled-out-car-gunpoint-because" target="_blank">San Francisco Woman Pulled Out of Car at Gunpoint Because of License Plate Reader Error</a>
          </li>
          <li>
            <a href="https://gizmodo.com/cops-terrorize-black-family-but-blame-license-plate-rea-1844602731" target="_blank">Cops Terrorize Black Family but Blame License Plate Reader for Misidentifying 'Stolen' Vehicle</a>
          </li>
          <li>
            <a href="https://www.techdirt.com/2019/02/20/deputies-sued-after-false-alpr-hit-leads-to-guns-out-traffic-stop-california-privacy-activist/" target="_blank">Deputies Sued After False ALPR Hit Leads To Guns-Out Traffic Stop Of California Privacy Activist</a>
          </li>
          <li>
            <a href="https://www.ktvu.com/news/privacy-advocate-sues-coco-sheriffs-deputies-after-license-plate-readers-target-his-car-stolen" target="_blank">Privacy advocate sues CoCo sheriff's deputies after license plate readers target his car stolen</a>
          </li>
        </ul>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title class="font-weight-bold">
        ALPRs Result in Racist Policing
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p>
          ALPRs are more likely to surveil communities with a higher density of Black and brown people, reinforcing systemic racism in policing.
        </p>
        <p>
          The Electronic Frontier Foundation <a href="https://www.eff.org/deeplinks/2015/01/what-we-learned-oakland-raw-alpr-data" target="_blank">reviewed the use of ALPRs by the Oakland Police Department</a> and found that ALPR cameras were more likely to scan license plates in communities with a higher density of Black and brown people than in communities with a higher density of white people.
        </p>

        <p class="mt-4"><a href="https://www.ap.org/ap-in-the-news/2012/with-cameras-informants-nypd-eyed-mosques" target="_blank">A report by The Associated Press</a> shows that after 9/11, the NYPD used ALPRs to monitor Muslims visiting mosques.</p>
        
        <p>A study of Flock Safety’s impact in Oak Park, IL found:</p>          
        <quoted-source source-url="https://www.freedomtothriveop.com/blog/zine-analyzes-flock-alpr-cameras-in-oak-park-il" attribution-text="Freedom to Thrive Oak Park">
          In the first 10 months of their use, 84% of the drivers stopped by Oak Park police because of Flock were Black.
        </quoted-source>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title class="font-weight-bold">
        ALPRs Put Undocumented People at Risk
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <p>
          Police agencies frequently share ALPR data with ICE, putting undocumented people at risk, even in states where this is legally prohibited:
        </p>
        <ul>
          <li>
            <a href="https://www.404media.co/ice-taps-into-nationwide-ai-enabled-camera-network-data-shows/" target="_blank">
              ICE Taps Into Flock's Nationwide Camera Network, Data Shows
            </a>
          </li>
          <li>
            <a href="https://www.latimes.com/business/technology/story/2020-12-21/pasadena-long-beach-police-ice-automated-license-plate-reader-data" target="_blank">Police in Pasadena, Long Beach pledged not to send license plate data to ICE. They shared it anyway.</a>
          </li>
          <li>
            <a href="https://www.aclu-il.org/en/press-releases/ice-targeting-immigrants-based-automatic-license-plate-reader-alpr-data-supplied" target="_blank">Documents Reveal ICE Using Driver Location Data From Local Police for Deportations</a>
          </li>
          <li>
            <a href="https://www.nwpb.org/2022/12/22/new-report-finds-data-sharing-with-federal-immigration-agencies-might-violate-washington-law/" target="_blank">New report finds data sharing with federal immigration agencies might violate Washington law</a>
          </li>

        </ul>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import QuotedSource from '@/components/QuotedSource.vue';
import { computed } from 'vue';

const props = defineProps({
  showAll: {
    type: Boolean,
    default: false,
  }
});

const modelValue = computed(() => props.showAll ? [0,1,2,3,4,5] : []);
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
