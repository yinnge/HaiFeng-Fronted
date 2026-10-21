import { reactive, ref } from 'vue'
import { getUniversityList } from '@/api/university'
import { getMajorList } from '@/api/major'
import { getPostgradMajorList } from '@/api/postgrad-major'
import { getCityList } from '@/api/city'
import { getCertificateList, getCompetitionList } from '@/api/certificate'
import { getEnterpriseList } from '@/api/enterprise'
import { getIndustryList } from '@/api/industry'
import type { UniversityListVO } from '@/types/university'
import type { MajorListVO } from '@/types/major'
import type { PostgradMajorListVO } from '@/types/postgrad-major'
import type { CityListVO } from '@/types/city'
import type { CertificateListVO, CompetitionListVO } from '@/types/certificate'
import type { EnterpriseListVO } from '@/types/enterprise'
import type { IndustryListVO } from '@/types/industry'

export type ToolboxLoadKey =
  | 'university'
  | 'undergrad'
  | 'postgrad'
  | 'city'
  | 'competition'
  | 'certificate'
  | 'enterprise'
  | 'industry'

const FETCH_SIZE = 10
const UNIVERSITY_LIMIT = 4
const MAJOR_LIMIT = 6
const CITY_LIMIT = 4
const PAIR_LIMIT = 2

const universities = ref<UniversityListVO[]>([])
const undergraduateMajors = ref<MajorListVO[]>([])
const postgradMajors = ref<PostgradMajorListVO[]>([])
const cities = ref<CityListVO[]>([])
const cityTotal = ref(0)
const competitions = ref<CompetitionListVO[]>([])
const certificates = ref<CertificateListVO[]>([])
const enterprises = ref<EnterpriseListVO[]>([])
const industries = ref<IndustryListVO[]>([])

const loading = reactive<Record<ToolboxLoadKey, boolean>>({
  university: false,
  undergrad: false,
  postgrad: false,
  city: false,
  competition: false,
  certificate: false,
  enterprise: false,
  industry: false,
})

const failed = reactive<Record<ToolboxLoadKey, boolean>>({
  university: false,
  undergrad: false,
  postgrad: false,
  city: false,
  competition: false,
  certificate: false,
  enterprise: false,
  industry: false,
})

const loaded = reactive<Record<ToolboxLoadKey, boolean>>({
  university: false,
  undergrad: false,
  postgrad: false,
  city: false,
  competition: false,
  certificate: false,
  enterprise: false,
  industry: false,
})

async function runLoad(key: ToolboxLoadKey, task: () => Promise<void>, force = false) {
  if (loading[key]) return
  if (loaded[key] && !force) return

  loading[key] = true
  failed[key] = false
  try {
    await task()
    loaded[key] = true
  } catch {
    failed[key] = true
  } finally {
    loading[key] = false
  }
}

async function loadUniversities(force = false) {
  await runLoad(
    'university',
    async () => {
      const res = await getUniversityList({ page: 1, size: FETCH_SIZE })
      universities.value = (res.data.data?.records ?? []).slice(0, UNIVERSITY_LIMIT)
    },
    force,
  )
}

async function loadUndergradMajors(force = false) {
  await runLoad(
    'undergrad',
    async () => {
      const res = await getMajorList({ page: 1, size: FETCH_SIZE, majorType: '本科' })
      undergraduateMajors.value = (res.data.data?.records ?? []).slice(0, MAJOR_LIMIT)
    },
    force,
  )
}

async function loadPostgradMajors(force = false) {
  await runLoad(
    'postgrad',
    async () => {
      const res = await getPostgradMajorList({ page: 1, size: FETCH_SIZE })
      postgradMajors.value = (res.data.data?.records ?? []).slice(0, MAJOR_LIMIT)
    },
    force,
  )
}

async function loadCities(force = false) {
  await runLoad(
    'city',
    async () => {
      const res = await getCityList({ page: 1, size: FETCH_SIZE })
      cities.value = (res.data.data?.records ?? []).slice(0, CITY_LIMIT)
      cityTotal.value = res.data.data?.total ?? 0
    },
    force,
  )
}

async function loadCompetitions(force = false) {
  await runLoad(
    'competition',
    async () => {
      const res = await getCompetitionList({ page: 1, size: FETCH_SIZE })
      competitions.value = (res.data.data?.records ?? []).slice(0, PAIR_LIMIT)
    },
    force,
  )
}

async function loadCertificates(force = false) {
  await runLoad(
    'certificate',
    async () => {
      const res = await getCertificateList({ page: 1, size: FETCH_SIZE })
      certificates.value = (res.data.data?.records ?? []).slice(0, PAIR_LIMIT)
    },
    force,
  )
}

async function loadEnterprises(force = false) {
  await runLoad(
    'enterprise',
    async () => {
      const res = await getEnterpriseList({ page: 1, size: FETCH_SIZE })
      enterprises.value = (res.data.data?.records ?? []).slice(0, PAIR_LIMIT)
    },
    force,
  )
}

async function loadIndustries(force = false) {
  await runLoad(
    'industry',
    async () => {
      const res = await getIndustryList({ page: 1, size: FETCH_SIZE })
      industries.value = (res.data.data?.records ?? []).slice(0, PAIR_LIMIT)
    },
    force,
  )
}

async function initToolbox() {
  await Promise.allSettled([
    loadUniversities(),
    loadUndergradMajors(),
    loadCities(),
    loadCompetitions(),
    loadEnterprises(),
  ])
}

export function useToolboxData() {
  return {
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
    loaded,
    initToolbox,
    loadUniversities,
    loadUndergradMajors,
    loadPostgradMajors,
    loadCities,
    loadCompetitions,
    loadCertificates,
    loadEnterprises,
    loadIndustries,
  }
}
