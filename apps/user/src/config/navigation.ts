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

  /* ---------------- 初中专栏 ---------------- */
  {
    id: 'middle',
    label: '初中专栏',
    route: '/middle', // 点击顶层仍进入已有的初中资料库；子项均为新页面（待开发）
    subItems: [
      { label: '中考信息资料' },
      { label: '初一资料' },
      { label: '初二资料' },
      { label: '初三资料' },
      { label: '练题系统' },
    ],
  },

  /* ---------------- 高中专栏 ---------------- */
  {
    id: 'high',
    label: '高中专栏',
    route: '/high',
    subItems: [
      { label: '高一资料' },
      { label: '高二资料' },
      { label: '高三资料' },
      { label: '练题系统' },
    ],
  },

  /* ---------------- 高考志愿填报（原「志愿填报」） ---------------- */
  {
    id: 'gaokao',
    label: '高考志愿填报',
    route: '/gaokao',
    subItems: [
      { label: '高考报志愿', route: '/gaokao' },
      { label: '特殊通道', route: '/special' },
      // 带 # 锚点：跳转 /gaokao 并滚动到页面底部「直通考院」区（AppHeader/MobileNavDrawer 的 handleSubClick 经 pushNavItem 处理）
      { label: '直通院校', route: '/gaokao#exams' },
    ],
  },

  /* ---------------- 大学专栏 ---------------- */
  {
    id: 'college',
    label: '大学专栏',
    route: '/college',
    subItems: [
      { label: '大一资料' },
      { label: '大二资料' },
      { label: '大三资料' },
      { label: '大四资料' },
      { label: '大学AI规划系统' },
    ],
  },

  /* ---------------- 英语四六级（原在「更多」，移至主菜单） ---------------- */
  { id: 'cet', label: '英语四六级' },

  /* ---------------- 考研（新增） ---------------- */
  {
    id: 'kaoyan',
    label: '考研',
    subItems: [
      { label: '考研资料' },
      { label: '考研系统' },
    ],
  },

  /* ---------------- 考公（新增） ---------------- */
  {
    id: 'kaogong',
    label: '考公',
    subItems: [
      { label: '考公资料' },
      { label: '考公系统' },
    ],
  },

  /* ---------------- 研究生专栏（保留） ---------------- */
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

  /* ---------------- 博士专栏（新增，置于研究生专栏之后） ---------------- */
  {
    id: 'phd',
    label: '博士专栏',
    subItems: [
      { label: '博一' },
      { label: '博二' },
      { label: '博三' },
    ],
  },

  /* ---------------- 就业信息专栏（保留） ---------------- */
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
]

/**
 * 固定收纳在导航栏「更多」下拉里的菜单项（不随宽度变化，始终在更多面板中）
 * 注：原「英语四六级 / 规划工具」已移除——英语四六级移至主菜单，规划工具按需求删除。
 * 目前「更多」面板仅用于窄屏时放不下的主菜单溢出项。
 */
export const moreNavItems: NavItem[] = []
