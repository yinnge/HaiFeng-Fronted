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
      // 带 # 锚点：跳转 /gaokao 并滚动到页面底部「直通考院」区（AppHeader/MobileNavDrawer 的 handleSubClick 经 pushNavItem 处理）
      { label: '直通院校', route: '/gaokao#exams' },
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
    route: '/postgraduate',
    subItems: [
      // 点击「研究生专栏」或「研究生资料」都导向研究生专栏主页
      { label: '研究生资料', route: '/postgraduate' },
      { label: '申博指南', route: '/postgraduate/phd' },
    ],
  },
  {
    id: 'employment',
    label: '就业信息专栏',
    route: '/employment/civil',
    subItems: [
      { label: '体制内招录招聘', route: '/employment/civil' },
      { label: '基层服务招聘', route: '/employment/grassroots' },
      { label: '行业专项招聘', route: '/employment/teacher' },
    ],
  },
  { id: 'cet', label: '英语四六级' },
  { id: 'city', label: '城市查询', route: '/city' },
  {
    id: 'enterprise-industry',
    label: '企业行业',
    subItems: [
      { label: '企业查询', route: '/enterprise' },
      { label: '行业查询', route: '/industry' },
    ],
  },
  { id: 'resource', label: '资料档案', route: '/resource' },
  { id: 'tools', label: '规划工具' },
  {
    id: 'competition',
    label: '竞赛证书',
    route: '/competition',
    subItems: [
      { label: '竞赛', route: '/competition' },
      { label: '证书', route: '/certificate' },
    ],
  },
]
