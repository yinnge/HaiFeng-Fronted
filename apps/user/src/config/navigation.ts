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
    route: '/middle',
    subItems: [
      // 原「中考信息资料/初一/初二/初三」四个入口已合并为「初中资料」：
      // 页内导航栏提供初一/初二/初三身份切换（分段控件，默认初三），
      // 接口 applicableStage 随身份变化；「中考真题」固定查 stage=中考资料，不随身份变。
      { label: '初中资料', route: '/middle' },
      { label: '练题系统' },
      { label: '初中生涯规划' },
    ],
  },

  /* ---------------- 高中专栏 ---------------- */
  {
    id: 'high',
    label: '高中专栏',
    route: '/high',
    subItems: [
      // 原「高考信息资料/高一/高二/高三」四个入口已合并为「高中资料」
      { label: '高中资料', route: '/high' },
      { label: '练题系统' },
      { label: '高中生涯规划' },
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
      // 原「大一/大二/大三/大四」四个入口已合并为「大学资料」
      { label: '大学资料', route: '/college' },
      { label: '大学生涯规划' },
    ],
  },

  /* ---------------- 英语四六级（原在「更多」，移至主菜单） ---------------- */
  { id: 'cet', label: '英语四六级' },

  /* ---------------- 考研（新增） ---------------- */
  {
    id: 'kaoyan',
    label: '考研',
    subItems: [
      // 复用考研专栏列表页，面向人群由路由 props 写死（考研人）
      { label: '考研资料', route: '/postgrad-exam' },
      { label: '考研系统' },
    ],
  },

  /* ---------------- 考公（新增） ---------------- */
  {
    id: 'kaogong',
    label: '考公',
    subItems: [
      // 复用考公专栏列表页，面向人群由路由 props 写死（考公人）
      { label: '考公资料', route: '/civil-service' },
      { label: '考公系统' },
    ],
  },

  /* ---------------- 研究生专栏（保留） ---------------- */
  {
    id: 'postgrad',
    label: '研究生专栏',
    route: '/graduate',
    subItems: [
      // 「研究生资料」复用研究生专栏文件列表页（面向人群写死：研究生）；
      // 「申博指南」仍走原有静态页
      { label: '研究生资料', route: '/graduate' },
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
