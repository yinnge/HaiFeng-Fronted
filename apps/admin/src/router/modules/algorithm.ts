import type { RouteRecordRaw } from 'vue-router'

const algorithmRoutes: RouteRecordRaw = {
  path: '/algorithm',
  name: 'Algorithm',
  meta: { title: '高考算法', icon: 'TrendCharts' },
  redirect: '/algorithm/admission/group',
  children: [
    {
      path: 'admission/group',
      name: 'AdmissionGroup',
      component: () => import('@/views/algorithm/admission/group/index.vue'),
      meta: { title: '专业组列表', moduleCode: 'algo_admission_grp' },
    },
    {
      path: 'admission/major-score',
      name: 'AdmissionMajorScore',
      component: () => import('@/views/algorithm/admission/major-score/index.vue'),
      meta: { title: '专业明细列表', moduleCode: 'algo_admission_dtl' },
    },
    {
      path: 'config/province-reform',
      name: 'AlgorithmConfigProvinceReform',
      component: () => import('@/views/algorithm/config/province-reform/index.vue'),
      meta: { title: '省份改革配置', moduleCode: 'algo_score_prov' },
    },
    {
      path: 'config/score-rank',
      name: 'AlgorithmConfigScoreRank',
      component: () => import('@/views/algorithm/config/score-rank/index.vue'),
      meta: { title: '一分一段位次', moduleCode: 'algo_score_rank' },
    },
    {
      path: 'config/batch-score-line',
      name: 'AlgorithmConfigBatchScoreLine',
      component: () => import('@/views/algorithm/config/batch-score-line/index.vue'),
      meta: { title: '批次分数线', moduleCode: 'algo_score_baseline' },
    },
    // === 约束管理 ===
    {
      path: 'constraint',
      name: 'AlgorithmConstraint',
      meta: { title: '约束管理', icon: 'List' },
      redirect: '/algorithm/constraint/dict',
      children: [
        {
          path: 'dict',
          name: 'AlgorithmConstraintDict',
          component: () => import('@/views/algorithm/constraint/dict/index.vue'),
          meta: { title: '约束字典', moduleCode: 'algo_constraint_dict' },
        },
        {
          path: 'major',
          name: 'AlgorithmConstraintMajor',
          component: () => import('@/views/algorithm/constraint/major/index.vue'),
          meta: { title: '专业约束关联', moduleCode: 'algo_constraint_mjr' },
        },
      ],
    },
    // === 安全系数管理 ===
    {
      path: 'safety',
      name: 'AlgorithmSafety',
      meta: { title: '安全系数管理', icon: 'TrendCharts' },
      redirect: '/algorithm/safety/level',
      children: [
        {
          path: 'level',
          name: 'AlgorithmSafetyLevel',
          component: () => import('@/views/algorithm/constraint/safety-level/index.vue'),
          meta: { title: '安全系数', moduleCode: 'algo_safety_level' },
        },
      ],
    },
    // === 算法配置管理 ===
    {
      path: 'config',
      name: 'AlgorithmConfig',
      meta: { title: '算法配置管理', icon: 'Setting' },
      redirect: '/algorithm/config/province',
      children: [
        {
          path: 'province',
          name: 'AlgorithmConfigProvince',
          component: () => import('@/views/algorithm/config/province/index.vue'),
          meta: { title: '省份算法配置', moduleCode: 'algo_config_prov' },
        },
        {
          path: 'gaokao',
          name: 'AlgorithmConfigGaokao',
          component: () => import('@/views/algorithm/config/gaokao/index.vue'),
          meta: { title: '高考算法全局参数', moduleCode: 'algo_config_gaokao' },
        },
      ],
    },
  ],
}

export default algorithmRoutes
