<script setup lang="ts">
import { onMounted, ref } from 'vue'
import UniversityModule from './UniversityModule.vue'
import MajorModule from './MajorModule.vue'
import CityModule from './CityModule.vue'
import ContestCertModule from './ContestCertModule.vue'
import EnterpriseIndustryModule from './EnterpriseIndustryModule.vue'
import type { ContestTab, EnterpriseTab, MajorTab } from './types'
import { useToolboxData } from './useToolboxData'
import './toolbox.css'

const majorTab = ref<MajorTab>('undergrad')
const contestTab = ref<ContestTab>('contest')
const enterpriseTab = ref<EnterpriseTab>('enterprise')

const {
  universities,
  undergraduateMajors,
  postgradMajors,
  cities,
  cityTotal,
  competitions,
  certificates,
  enterprises,
  industries,
  loading,
  failed,
  initToolbox,
  loadUniversities,
  loadUndergradMajors,
  loadPostgradMajors,
  loadCities,
  loadCompetitions,
  loadCertificates,
  loadEnterprises,
  loadIndustries,
} = useToolboxData()

function onMajorTab(tab: MajorTab) {
  majorTab.value = tab
  if (tab === 'postgrad') void loadPostgradMajors()
}

function onContestTab(tab: ContestTab) {
  contestTab.value = tab
  if (tab === 'certificate') void loadCertificates()
}

function onEnterpriseTab(tab: EnterpriseTab) {
  enterpriseTab.value = tab
  if (tab === 'industry') void loadIndustries()
}

function retryUniversity() {
  void loadUniversities(true)
}

function retryMajor(tab: MajorTab) {
  if (tab === 'undergrad') void loadUndergradMajors(true)
  else void loadPostgradMajors(true)
}

function retryContest(tab: ContestTab) {
  if (tab === 'contest') void loadCompetitions(true)
  else void loadCertificates(true)
}

function retryEnterprise(tab: EnterpriseTab) {
  if (tab === 'enterprise') void loadEnterprises(true)
  else void loadIndustries(true)
}

function retryCity() {
  void loadCities(true)
}

onMounted(() => {
  void initToolbox()
})
</script>

<template>
  <div class="tbx-section">
    <UniversityModule
      :items="universities"
      :loading="loading.university"
      :error="failed.university"
      @retry="retryUniversity"
    />

    <MajorModule
      :undergrad="undergraduateMajors"
      :postgrad="postgradMajors"
      :active-tab="majorTab"
      :undergrad-loading="loading.undergrad"
      :postgrad-loading="loading.postgrad"
      :undergrad-error="failed.undergrad"
      :postgrad-error="failed.postgrad"
      @update:active-tab="onMajorTab"
      @retry="retryMajor"
    />

    <CityModule :items="cities" :total="cityTotal" :loading="loading.city" :error="failed.city" @retry="retryCity" />

    <div class="tbx-duo">
      <ContestCertModule
        :competitions="competitions"
        :certificates="certificates"
        :active-tab="contestTab"
        :competition-loading="loading.competition"
        :certificate-loading="loading.certificate"
        :competition-error="failed.competition"
        :certificate-error="failed.certificate"
        @update:active-tab="onContestTab"
        @retry="retryContest"
      />

      <EnterpriseIndustryModule
        :enterprises="enterprises"
        :industries="industries"
        :active-tab="enterpriseTab"
        :enterprise-loading="loading.enterprise"
        :industry-loading="loading.industry"
        :enterprise-error="failed.enterprise"
        :industry-error="failed.industry"
        @update:active-tab="onEnterpriseTab"
        @retry="retryEnterprise"
      />
    </div>
  </div>
</template>
