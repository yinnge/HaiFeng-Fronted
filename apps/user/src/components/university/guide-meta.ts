/**
 * 院校适应指南 - 14 个 JSONB 模块的前端元数据
 * 与后端 UniversityGuide*VO 字段一一对应；名称/说明由前端维护。
 */

export type GuideGroupKey = 'survival' | 'academic' | 'social' | 'safety' | 'life'

export type GuideCategoryApi = GuideGroupKey

export interface GuideModuleMeta {
  /** 与后端 VO 字段名一致（注意 constriction 拼写） */
  key: string
  label: string
  group: GuideGroupKey
  category: GuideCategoryApi
  desc: string
  icon: string
  /** 旗舰版模块：非 VIP 不可请求 */
  vip?: boolean
}

export interface GuideGroupMeta {
  key: GuideGroupKey
  label: string
  color: string
  soft: string
  ring: string
}

export const GUIDE_GROUPS: Record<GuideGroupKey, GuideGroupMeta> = {
  survival: {
    key: 'survival',
    label: '基础生存类',
    color: '#2563EB',
    soft: '#EFF6FF',
    ring: 'rgba(37, 99, 235, 0.18)',
  },
  academic: {
    key: 'academic',
    label: '学业规划类',
    color: '#D97706',
    soft: '#FFFBEB',
    ring: 'rgba(245, 158, 11, 0.22)',
  },
  social: {
    key: 'social',
    label: '社交融入类',
    color: '#059669',
    soft: '#ECFDF5',
    ring: 'rgba(5, 150, 105, 0.18)',
  },
  safety: {
    key: 'safety',
    label: '权益与安全类',
    color: '#E11D48',
    soft: '#FFF1F2',
    ring: 'rgba(225, 29, 72, 0.18)',
  },
  life: {
    key: 'life',
    label: '周边生活类',
    color: '#F97316',
    soft: '#FFF7ED',
    ring: 'rgba(249, 115, 22, 0.2)',
  },
}

export const GUIDE_MODULES: GuideModuleMeta[] = [
  {
    key: 'campusFacilities',
    label: '校园设施',
    group: 'survival',
    category: 'survival',
    desc: '教学楼、图书馆、实验室、体育馆等设施介绍',
    icon: 'building',
  },
  {
    key: 'dormitoryServices',
    label: '水电网与宿舍管理',
    group: 'survival',
    category: 'survival',
    desc: '宿舍条件、用电用水、网络服务、宿舍管理规定',
    icon: 'bed',
  },
  {
    key: 'campusTransportation',
    label: '校园通勤与校外交通',
    group: 'survival',
    category: 'survival',
    desc: '校内交通、地铁公交、周边出行指南',
    icon: 'bus',
  },
  {
    key: 'academicGuidance',
    label: '专业与课程核心信息',
    group: 'academic',
    category: 'academic',
    desc: '专业设置、课程体系、学分要求、选课指南',
    icon: 'cap',
    vip: true,
  },
  {
    key: 'majorTransferGuidelines',
    label: '转专业指南',
    group: 'academic',
    category: 'academic',
    desc: '转专业政策、申请流程、注意事项',
    icon: 'switch',
    vip: true,
  },
  {
    key: 'majorTransferConstriction',
    label: '转专业限制',
    group: 'academic',
    category: 'academic',
    desc: '各专业转入限制、成绩要求、名额情况',
    icon: 'document-x',
    vip: true,
  },
  {
    key: 'academicSupportResources',
    label: '学习支持资源',
    group: 'academic',
    category: 'academic',
    desc: '图书馆资源、学术平台、辅导服务',
    icon: 'books',
    vip: true,
  },
  {
    key: 'studentOrganizations',
    label: '学生组织与社团',
    group: 'social',
    category: 'social',
    desc: '学生会、社团组织、志愿服务',
    icon: 'users',
  },
  {
    key: 'campusEvents',
    label: '校园活动与竞赛',
    group: 'social',
    category: 'social',
    desc: '品牌活动、学科竞赛、技能竞赛',
    icon: 'trophy',
  },
  {
    key: 'classDormSocial',
    label: '班级与宿舍社交',
    group: 'social',
    category: 'social',
    desc: '班级管理、宿舍关系、社交建议',
    icon: 'chat',
  },
  {
    key: 'financialAid',
    label: '奖助勤贷与权益保障',
    group: 'safety',
    category: 'safety',
    desc: '奖学金、助学金、勤工俭学、权益申诉',
    icon: 'shield-check',
  },
  {
    key: 'campusSecurity',
    label: '校园安全与应急处理',
    group: 'safety',
    category: 'safety',
    desc: '安全设施、校园规则、应急处理',
    icon: 'shield-alert',
  },
  {
    key: 'healthServices',
    label: '医保与心理健康',
    group: 'safety',
    category: 'safety',
    desc: '医保报销、心理健康服务',
    icon: 'heart',
  },
  {
    key: 'lifeServices',
    label: '生活服务',
    group: 'life',
    category: 'life',
    desc: '校园生活服务、医疗资源、兼职实习资源',
    icon: 'bag',
  },
]

/** 顶部热门指南的 4 个跳转胶囊（静态运营位） */
export const HOT_GUIDE_PILLS: { label: string; moduleKey: string }[] = [
  { label: '入学流程', moduleKey: 'campusFacilities' },
  { label: '生活服务', moduleKey: 'lifeServices' },
  { label: '校园卡', moduleKey: 'dormitoryServices' },
  { label: '常见问题', moduleKey: 'campusSecurity' },
]

export interface QuickToolMeta {
  key: string
  label: string
  desc: string
  icon: string
  tone: 'blue' | 'violet' | 'orange' | 'green' | 'rose'
  to?: string
  action?: 'expert' | 'coming'
}

export const QUICK_TOOLS: QuickToolMeta[] = [
  {
    key: 'postgrad-guide',
    label: '考研专业报考指南',
    desc: '查看专业介绍、考试科目、报考条件',
    icon: 'cap',
    tone: 'blue',
    to: '/postgrad-major',
  },
  {
    key: 'university-major',
    label: '院校招生专业查询',
    desc: '查询院校开设专业及招生信息',
    icon: 'building',
    tone: 'violet',
    to: '/university',
  },
  {
    key: 'ai-plan',
    label: 'AI 考研规划',
    desc: '智能匹配院校、专业及备考路线',
    icon: 'sparkles',
    tone: 'orange',
    action: 'coming',
  },
  {
    key: 'practice',
    label: '考研在线练题',
    desc: '海量真题、模拟题，助你高效备考',
    icon: 'pencil',
    tone: 'green',
    action: 'coming',
  },
  {
    key: 'expert',
    label: '专家一对一咨询',
    desc: '获取专业选择、跨考及择校建议',
    icon: 'headset',
    tone: 'rose',
    action: 'expert',
  },
]

/** 线性 SVG 图标路径（24×24，stroke 1.75） */
export const GUIDE_ICON_PATHS: Record<string, string[]> = {
  building: [
    'M4 21h16',
    'M6 21V9l6-4 6 4v12',
    'M9 21v-4h6v4',
    'M9.5 11.5h.01',
    'M14.5 11.5h.01',
  ],
  bed: [
    'M3 18v-5a2 2 0 012-2h14a2 2 0 012 2v5',
    'M3 18v2',
    'M21 18v2',
    'M3 18h18',
    'M7 11V8a2 2 0 012-2h3a2 2 0 012 2v3',
    'M14 11V9a2 2 0 012-2h1a2 2 0 012 2v2',
  ],
  bus: [
    'M4 17h16',
    'M6 17V7a2 2 0 012-2h8a2 2 0 012 2v10',
    'M6 17v2',
    'M18 17v2',
    'M6 10h12',
    'M8 13.5h.01',
    'M16 13.5h.01',
  ],
  cap: [
    'M22 9L12 5 2 9l10 4 10-4z',
    'M6 11v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4',
    'M22 9v4',
  ],
  switch: [
    'M4 8h13',
    'M14 5l3 3-3 3',
    'M20 16H7',
    'M10 13l-3 3 3 3',
  ],
  'document-x': [
    'M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z',
    'M14 3v5h5',
    'M9.5 13.5l5 5',
    'M14.5 13.5l-5 5',
  ],
  books: [
    'M4 5h5v14H4z',
    'M9 4h5v16H9z',
    'M14 7h5v13h-5z',
    'M6 8h1',
    'M11 8h1',
    'M16 10h1',
  ],
  users: [
    'M16 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2',
    'M9.5 10a4 4 0 100-8 4 4 0 000 8z',
    'M21 20v-2a4 4 0 00-3-3.87',
    'M16 2.13a4 4 0 010 7.75',
  ],
  trophy: [
    'M8 4h8v4a4 4 0 01-8 0V4z',
    'M8 6H5a2 2 0 002 4h1',
    'M16 6h3a2 2 0 01-2 4h-1',
    'M12 12v4',
    'M9 20h6',
    'M10 16h4v4h-4z',
  ],
  chat: [
    'M21 12a8 8 0 01-8 8H8l-4 3v-5.5A8 8 0 1121 12z',
    'M8 11h.01',
    'M12 11h.01',
    'M16 11h.01',
  ],
  'shield-check': [
    'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z',
    'M9 12l2 2 4-4',
  ],
  'shield-alert': [
    'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z',
    'M12 8v4',
    'M12 15h.01',
  ],
  heart: [
    'M20.8 5.6a5 5 0 00-7.1 0L12 7.3l-1.7-1.7a5 5 0 10-7.1 7.1L12 21l8.8-8.3a5 5 0 000-7.1z',
    'M3 12h4l2-3 3 6 2-3h7',
  ],
  bag: [
    'M6 8h12l1 12H5L6 8z',
    'M9 8V6a3 3 0 016 0v2',
    'M9 12h.01',
    'M15 12h.01',
  ],
  sparkles: [
    'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z',
    'M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z',
    'M5 15l.6 1.4L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.6L5 15z',
  ],
  pencil: [
    'M4 20l4.5-1 10-10a2.1 2.1 0 00-3-3l-10 10L4 20z',
    'M13 7l4 4',
  ],
  headset: [
    'M4 13a8 8 0 0116 0',
    'M4 13v3a2 2 0 002 2h1v-5H6a2 2 0 00-2 2z',
    'M20 13v3a2 2 0 01-2 2h-1v-5h1a2 2 0 012 2z',
    'M17 18v1a2 2 0 01-2 2h-3',
  ],
}

export const GUIDE_TEXT = {
  title: '院校适应指南',
  subtitle: '全方位了解学校生活，帮助你更快适应大学新环境',
  allGuide: '全部指南',
  noContent: '暂无内容',
  vipOnly: 'VIP 专享',
  moduleEmpty: '该模块内容整理中',
  guideEmpty: '该院校适应指南整理中',
  backToAll: '返回全部指南',
  recorded: (n: number) => `已收录 ${n} 个模块内容`,
  itemCount: (n: number) => `${n} 项内容`,
  totalModules: (n: number) => `共 ${n} 个模块内容`,
  lockedTitle: '开通旗舰版解锁学业规划',
  lockedDesc: '专业与课程、转专业、学习资源等 4 个模块为旗舰版专享内容。',
  lockedAction: '开通旗舰版',
  comingSoon: '敬请期待，功能正在开发中',
}
