export interface NavSubItem {
  label: string
  route?: string // undefined = "正在开发中"
}

export interface NavItem {
  id: string
  label: string
  route?: string // undefined = "正在开发中"（仅无子项时）
  subItems?: NavSubItem[]
}

export const navItems: NavItem[] = [
  { id: 'home', label: '首 页', route: '/' },
  {
    id: 'gaokao',
    label: '志愿填报',
    route: '/gaokao',
    subItems: [
      { label: '高考报志愿', route: '/gaokao' },
      { label: '特殊通道', route: '/special' },
      { label: '直通院校', route: '/gaokao' },
    ],
  },
  { id: 'university', label: '院校查询', route: '/university' },
  {
    id: 'major',
    label: '专业查询',
    route: '/major',
    subItems: [
      { label: '本科专业', route: '/major' },
      { label: '考研专业', route: '/postgrad-major' },
    ],
  },
  {
    id: 'postgrad',
    label: '研究生专栏',
    subItems: [
      { label: '研究生资料' },
      { label: '申博指南' },
    ],
  },
  {
    id: 'employment',
    label: '就业信息专栏',
    route: '/employment/jobs',
    subItems: [
      { label: '体制内招录管理', route: '/employment/jobs' },
      { label: '基层服务管理', route: '/employment/jobs' },
      { label: '行业专项招聘管理', route: '/employment/jobs' },
    ],
  },
  { id: 'cet', label: '英语四六级' },
  { id: 'city', label: '城市查询', route: '/city' },
  { id: 'industry', label: '行业查询', route: '/industry' },
  { id: 'resource', label: '资料档案', route: '/resource' },
  { id: 'tools', label: '规划工具' },
  {
    id: 'competition',
    label: '竞赛证书',
    route: '/competition',
    subItems: [
      { label: '竞赛详情', route: '/competition' },
      { label: '证书详情', route: '/certificate' },
    ],
  },
]
