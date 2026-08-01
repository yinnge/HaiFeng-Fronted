export interface EmploymentTabItem {
  label: string
  route: string
}

export interface EmploymentModule {
  id: string
  label: string
  tabs: EmploymentTabItem[]
}

export const employmentModules: EmploymentModule[] = [
  {
    id: 'civilService',
    label: '体制内招录招聘',
    tabs: [
      { label: '公务员', route: '/employment/civil' },
      { label: '事业编', route: '/employment/institution' },
      { label: '军队文职', route: '/employment/military' },
      { label: '选调生', route: '/employment/selection' },
    ],
  },
  {
    id: 'grassroots',
    label: '基层服务招聘',
    tabs: [
      { label: '基层服务项目', route: '/employment/grassroots' },
      { label: '社区工作者', route: '/employment/community' },
      { label: '公益性岗位', route: '/employment/welfare' },
    ],
  },
  {
    id: 'industry',
    label: '行业专项招聘',
    tabs: [
      { label: '教师招聘', route: '/employment/teacher' },
      { label: '医疗卫生', route: '/employment/healthcare' },
      { label: '金融银行', route: '/employment/finance' },
    ],
  },
]
