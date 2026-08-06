<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getCityPage,
  getCityDetail,
  addCity,
  updateCity,
  updateCityDetail,
  updateCityStatus,
  deleteCity,
  batchDeleteCity,
  importCity,
  importCityDetail,
} from '@/api/city'
import type {
  CityListVO,
  CityDetailVO,
  CityQueryDTO,
  CityAddDTO,
} from '@/types/city'
import JsonbArrayEditor from '@/components/JsonbArrayEditor.vue'

const loading = ref(false)
const tableData = ref<CityListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<CityQueryDTO>({
  page: 1,
  size: 10,
  cityName: '',
  province: '',
  region: '',
  isDeleted: null!,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<CityDetailVO | null>(null)
const activeTab = ref('basic')

const formData = reactive<Record<string, any>>({
  cityName: '',
  province: '',
  region: '',
  cityIntro: '',
  collegeCount: null,
  keyCollegeCount: null,
  residentPopulation: null,
  gdp: null,
})

const detailForm = reactive<Record<string, any>>({
  area: null,
  subtitle: '',
  cityLevel: '',
  adminCode: '',
  perCapitaGdp: null,
  urbanizationRate: null,
  ruralPopRatio: null,
  agingRate: null,
  migrantPopRatio: null,
  gdpGrowthRate: null,
  fortune500Count: null,
  industryDescription: '',
  mainIndustries: [] as string[],
  emergingIndustries: [] as string[],
  industryStructure: { primaryRatio: null, secondaryRatio: null, tertiaryRatio: null },
  futurePlan: { targetYear: null, developmentGoal: '', keyAreas: [] as string[] },
  highEducation: { totalColleges: null, doubleFirstClassCount: null, undergraduateCount: null, graduateCount: null },
  basicEducation: { totalSchools: null, modelSchoolCount: null, keySchoolCount: null, educationNote: '' },
  enterpriseStats: { enterpriseCategories: null, keyEnterpriseCount: null, fortune500Count: null },
  housingPriceLevel: { avgPrice: null, coreAreaPrice: null, suburbanPriceRange: '', priceGrowthRate: null, priceIncomeRatio: null },
  rentalCost: { downtownRentRange: '', suburbanRentRange: '', rentIncomeRatio: null, rentGrowthRate: null },
  housingPolicy: { purchaseRestriction: '', sharedPropertyHousing: null, publicRentalHousing: null, firstHomeRate: null, secondHomeRate: null },
  consumption: { perCapitaConsumption: null, consumptionGrowthRate: null, engelCoefficient: null, educationExpenseRatio: null, consumptionIndex: null, consumptionRank: null },
  employment: { unemploymentRate: null, nationalUnemploymentRate: null, tertiaryEmploymentRatio: null, newEmployment: null, avgSalary: null, salaryRank: null, skilledTalentRatio: null, skilledTalentGrowth: null },
  transportation: { metroLines: null, metroMileage: null, highwayMileage: null, trafficWorldRank: null },
  medical: { topHospitalCount: null, tertiaryHospitalCount: null, doctorDensity: null, medicalRank: null },
  culture: { worldHeritageCount: null, annualTourists: null, aScenicCount: null, coreAttractions: [] as string[] },
})

const importDialogVisible = ref(false)
const importType = ref<'main' | 'detail'>('main')
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const cityLevelOptions = ['直辖市', '省会城市', '地级市', '县级市']
const provinceOptions = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '香港', '澳门', '台湾']

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.cityName) params.cityName = queryParams.cityName
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.region) params.region = queryParams.region
    if (queryParams.isDeleted !== null && queryParams.isDeleted !== undefined) params.isDeleted = queryParams.isDeleted
    const res = await getCityPage(params as CityQueryDTO)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.cityName = ''
  queryParams.province = ''
  queryParams.region = ''
  queryParams.isDeleted = null!
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: CityListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null
  activeTab.value = 'basic'

  if (mode === 'add') {
    dialogTitle.value = '新增城市'
    resetForm()
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改城市'
    formLoading.value = true
    try {
      const res = await getCityDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        fillForm(d)
        fillDetailForm(d)
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '城市详情'
    formLoading.value = true
    try {
      const res = await getCityDetail(id)
      if (res.data.code === 200) {
        detailData.value = res.data.data
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
    } finally {
      formLoading.value = false
    }
  }

  dialogVisible.value = true
}

const resetForm = () => {
  formData.cityName = ''
  formData.province = ''
  formData.region = ''
  formData.cityIntro = ''
  formData.collegeCount = null
  formData.keyCollegeCount = null
  formData.residentPopulation = null
  formData.gdp = null
  detailForm.area = null
  detailForm.subtitle = ''
  detailForm.cityLevel = ''
  detailForm.adminCode = ''
  detailForm.perCapitaGdp = null
  detailForm.urbanizationRate = null
  detailForm.ruralPopRatio = null
  detailForm.agingRate = null
  detailForm.migrantPopRatio = null
  detailForm.gdpGrowthRate = null
  detailForm.fortune500Count = null
  detailForm.industryDescription = ''
  detailForm.mainIndustries = []
  detailForm.emergingIndustries = []
  detailForm.industryStructure = { primaryRatio: null, secondaryRatio: null, tertiaryRatio: null }
  detailForm.futurePlan = { targetYear: null, developmentGoal: '', keyAreas: [] }
  detailForm.highEducation = { totalColleges: null, doubleFirstClassCount: null, undergraduateCount: null, graduateCount: null }
  detailForm.basicEducation = { totalSchools: null, modelSchoolCount: null, keySchoolCount: null, educationNote: '' }
  detailForm.enterpriseStats = { enterpriseCategories: null, keyEnterpriseCount: null, fortune500Count: null }
  detailForm.housingPriceLevel = { avgPrice: null, coreAreaPrice: null, suburbanPriceRange: '', priceGrowthRate: null, priceIncomeRatio: null }
  detailForm.rentalCost = { downtownRentRange: '', suburbanRentRange: '', rentIncomeRatio: null, rentGrowthRate: null }
  detailForm.housingPolicy = { purchaseRestriction: '', sharedPropertyHousing: null, publicRentalHousing: null, firstHomeRate: null, secondHomeRate: null }
  detailForm.consumption = { perCapitaConsumption: null, consumptionGrowthRate: null, engelCoefficient: null, educationExpenseRatio: null, consumptionIndex: null, consumptionRank: null }
  detailForm.employment = { unemploymentRate: null, nationalUnemploymentRate: null, tertiaryEmploymentRatio: null, newEmployment: null, avgSalary: null, salaryRank: null, skilledTalentRatio: null, skilledTalentGrowth: null }
  detailForm.transportation = { metroLines: null, metroMileage: null, highwayMileage: null, trafficWorldRank: null }
  detailForm.medical = { topHospitalCount: null, tertiaryHospitalCount: null, doctorDensity: null, medicalRank: null }
  detailForm.culture = { worldHeritageCount: null, annualTourists: null, aScenicCount: null, coreAttractions: [] }
}

const fillForm = (d: CityDetailVO) => {
  formData.cityName = d.cityName
  formData.province = d.province
  formData.region = d.region || ''
  formData.cityIntro = d.cityIntro || ''
  formData.collegeCount = d.collegeCount
  formData.keyCollegeCount = d.keyCollegeCount
  formData.residentPopulation = d.residentPopulation
  formData.gdp = d.gdp
}

const fillDetailForm = (d: CityDetailVO) => {
  detailForm.area = d.area
  detailForm.subtitle = d.subtitle || ''
  detailForm.cityLevel = d.cityLevel || ''
  detailForm.adminCode = d.adminCode || ''
  detailForm.perCapitaGdp = d.perCapitaGdp
  detailForm.urbanizationRate = d.urbanizationRate
  detailForm.ruralPopRatio = d.ruralPopRatio
  detailForm.agingRate = d.agingRate
  detailForm.migrantPopRatio = d.migrantPopRatio
  detailForm.gdpGrowthRate = d.gdpGrowthRate
  detailForm.fortune500Count = d.fortune500Count
  detailForm.industryDescription = d.industryDescription || ''
  detailForm.mainIndustries = d.mainIndustries ? [...d.mainIndustries] : []
  detailForm.emergingIndustries = d.emergingIndustries ? [...d.emergingIndustries] : []

  const is = d.industryStructure || {}
  detailForm.industryStructure = { primaryRatio: is.primaryRatio ?? null, secondaryRatio: is.secondaryRatio ?? null, tertiaryRatio: is.tertiaryRatio ?? null }

  const fp = d.futurePlan || {}
  detailForm.futurePlan = { targetYear: fp.targetYear ?? null, developmentGoal: fp.developmentGoal || '', keyAreas: fp.keyAreas ? [...fp.keyAreas] : [] }

  const he = d.highEducation || {}
  detailForm.highEducation = { totalColleges: he.totalColleges ?? null, doubleFirstClassCount: he.doubleFirstClassCount ?? null, undergraduateCount: he.undergraduateCount ?? null, graduateCount: he.graduateCount ?? null }

  const be = d.basicEducation || {}
  detailForm.basicEducation = { totalSchools: be.totalSchools ?? null, modelSchoolCount: be.modelSchoolCount ?? null, keySchoolCount: be.keySchoolCount ?? null, educationNote: be.educationNote || '' }

  const es = d.enterpriseStats || {}
  detailForm.enterpriseStats = { enterpriseCategories: es.enterpriseCategories ?? null, keyEnterpriseCount: es.keyEnterpriseCount ?? null, fortune500Count: es.fortune500Count ?? null }

  const hp = d.housingPriceLevel || {}
  detailForm.housingPriceLevel = { avgPrice: hp.avgPrice ?? null, coreAreaPrice: hp.coreAreaPrice ?? null, suburbanPriceRange: hp.suburbanPriceRange || '', priceGrowthRate: hp.priceGrowthRate ?? null, priceIncomeRatio: hp.priceIncomeRatio ?? null }

  const rc = d.rentalCost || {}
  detailForm.rentalCost = { downtownRentRange: rc.downtownRentRange || '', suburbanRentRange: rc.suburbanRentRange || '', rentIncomeRatio: rc.rentIncomeRatio ?? null, rentGrowthRate: rc.rentGrowthRate ?? null }

  const hpol = d.housingPolicy || {}
  detailForm.housingPolicy = { purchaseRestriction: hpol.purchaseRestriction || '', sharedPropertyHousing: hpol.sharedPropertyHousing ?? null, publicRentalHousing: hpol.publicRentalHousing ?? null, firstHomeRate: hpol.firstHomeRate ?? null, secondHomeRate: hpol.secondHomeRate ?? null }

  const con = d.consumption || {}
  detailForm.consumption = { perCapitaConsumption: con.perCapitaConsumption ?? null, consumptionGrowthRate: con.consumptionGrowthRate ?? null, engelCoefficient: con.engelCoefficient ?? null, educationExpenseRatio: con.educationExpenseRatio ?? null, consumptionIndex: con.consumptionIndex ?? null, consumptionRank: con.consumptionRank ?? null }

  const emp = d.employment || {}
  detailForm.employment = { unemploymentRate: emp.unemploymentRate ?? null, nationalUnemploymentRate: emp.nationalUnemploymentRate ?? null, tertiaryEmploymentRatio: emp.tertiaryEmploymentRatio ?? null, newEmployment: emp.newEmployment ?? null, avgSalary: emp.avgSalary ?? null, salaryRank: emp.salaryRank ?? null, skilledTalentRatio: emp.skilledTalentRatio ?? null, skilledTalentGrowth: emp.skilledTalentGrowth ?? null }

  const tra = d.transportation || {}
  detailForm.transportation = { metroLines: tra.metroLines ?? null, metroMileage: tra.metroMileage ?? null, highwayMileage: tra.highwayMileage ?? null, trafficWorldRank: tra.trafficWorldRank ?? null }

  const med = d.medical || {}
  detailForm.medical = { topHospitalCount: med.topHospitalCount ?? null, tertiaryHospitalCount: med.tertiaryHospitalCount ?? null, doctorDensity: med.doctorDensity ?? null, medicalRank: med.medicalRank ?? null }

  const cul = d.culture || {}
  detailForm.culture = { worldHeritageCount: cul.worldHeritageCount ?? null, annualTourists: cul.annualTourists ?? null, aScenicCount: cul.aScenicCount ?? null, coreAttractions: cul.coreAttractions ? [...cul.coreAttractions] : [] }
}

const saveBasic = async (): Promise<boolean> => {
  if (!formData.cityName || !formData.province || !formData.region) {
    ElMessage.warning('请填写城市名称、省份和所属地区')
    return false
  }
  try {
    const data: Record<string, any> = {
      cityName: formData.cityName,
      province: formData.province,
      region: formData.region,
    }
    if (formData.cityIntro) data.cityIntro = formData.cityIntro
    if (formData.collegeCount !== null) data.collegeCount = formData.collegeCount
    if (formData.keyCollegeCount !== null) data.keyCollegeCount = formData.keyCollegeCount
    if (formData.residentPopulation !== null) data.residentPopulation = formData.residentPopulation
    if (formData.gdp !== null) data.gdp = formData.gdp

    let res: any
    if (dialogMode.value === 'add') {
      res = await addCity(data as CityAddDTO)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateCity(currentId.value, data)
    } else {
      return false
    }

    if (res.data.code === 200) {
      if (dialogMode.value === 'add' && res.data.data) {
        currentId.value = res.data.data
      }
      return true
    } else {
      ElMessage.error(res.data.msg || '保存失败')
      return false
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '保存失败')
    return false
  }
}

const saveDetail = async (): Promise<boolean> => {
  if (!currentId.value) return false
  try {
    const data: Record<string, any> = {}
    if (detailForm.area !== null) data.area = detailForm.area
    if (detailForm.subtitle) data.subtitle = detailForm.subtitle
    if (detailForm.cityLevel) data.cityLevel = detailForm.cityLevel
    if (detailForm.adminCode) data.adminCode = detailForm.adminCode
    if (detailForm.perCapitaGdp !== null) data.perCapitaGdp = detailForm.perCapitaGdp
    if (detailForm.urbanizationRate !== null) data.urbanizationRate = detailForm.urbanizationRate
    if (detailForm.ruralPopRatio !== null) data.ruralPopRatio = detailForm.ruralPopRatio
    if (detailForm.agingRate !== null) data.agingRate = detailForm.agingRate
    if (detailForm.migrantPopRatio !== null) data.migrantPopRatio = detailForm.migrantPopRatio
    if (detailForm.gdpGrowthRate !== null) data.gdpGrowthRate = detailForm.gdpGrowthRate
    if (detailForm.fortune500Count !== null) data.fortune500Count = detailForm.fortune500Count
    if (detailForm.industryDescription) data.industryDescription = detailForm.industryDescription
    data.mainIndustries = detailForm.mainIndustries.filter(Boolean)
    data.emergingIndustries = detailForm.emergingIndustries.filter(Boolean)

    const buildJsonb = (obj: Record<string, any>): Record<string, any> | undefined => {
      const result: Record<string, any> = {}
      let hasValue = false
      for (const [k, v] of Object.entries(obj)) {
        if (v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)) {
          result[k] = v
          hasValue = true
        }
      }
      return hasValue ? result : undefined
    }

    data.industryStructure = buildJsonb(detailForm.industryStructure)
    data.futurePlan = buildJsonb(detailForm.futurePlan)
    data.highEducation = buildJsonb(detailForm.highEducation)
    data.basicEducation = buildJsonb(detailForm.basicEducation)
    data.enterpriseStats = buildJsonb(detailForm.enterpriseStats)
    data.housingPriceLevel = buildJsonb(detailForm.housingPriceLevel)
    data.rentalCost = buildJsonb(detailForm.rentalCost)
    data.housingPolicy = buildJsonb(detailForm.housingPolicy)
    data.consumption = buildJsonb(detailForm.consumption)
    data.employment = buildJsonb(detailForm.employment)
    data.transportation = buildJsonb(detailForm.transportation)
    data.medical = buildJsonb(detailForm.medical)
    data.culture = buildJsonb(detailForm.culture)

    const res = await updateCityDetail(currentId.value, data)
    if (res.data.code === 200) {
      return true
    } else {
      ElMessage.error(res.data.msg || '保存失败')
      return false
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '保存失败')
    return false
  }
}

const handleSubmit = async () => {
  if (dialogMode.value === 'detail') return

  if (dialogMode.value === 'add') {
    // 新增：先建基本信息拿到 id，再保存详情；两项都提交，与当前停留在哪个 tab 无关
    const okBasic = await saveBasic()
    if (!okBasic) return
    await saveDetail()
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } else {
    // 修改：基本信息与详细信息一起提交，无论当前停留在哪个 tab，改过的都保存
    const okBasic = await saveBasic()
    const okDetail = await saveDetail()
    if (okBasic || okDetail) {
      ElMessage.success('保存成功')
      dialogVisible.value = false
      fetchData()
    }
  }
}

const handleToggleStatus = async (row: CityListVO) => {
  const newStatus = !row.isDeleted
  const actionText = newStatus ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该城市吗？`, '提示')
  } catch {
    return
  }
  try {
    const res = await updateCityStatus(row.id, { isDeleted: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败，请检查网络连接')
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要永久删除该城市吗？此操作不可恢复！',
      '警告',
      { type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消' }
    )
    const res = await deleteCity(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch {
    // 取消
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的城市')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要永久删除选中的${selectedIds.value.length} 条城市记录吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定批量永久删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteCity(selectedIds.value as unknown as number[])
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch {
    // 取消
  }
}

const openImportDialog = (type: 'main' | 'detail') => {
  importType.value = type
  importFile.value = null
  importDialogVisible.value = true
}

const handleImportFileChange = (uploadFile: any) => {
  importFile.value = uploadFile.raw
  return false
}

const handleImportSubmit = async () => {
  if (!importFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  importLoading.value = true
  try {
    let res: any
    if (importType.value === 'main') {
      res = await importCity(importFile.value)
    } else {
      res = await importCityDetail(importFile.value)
    }
    if (res.data.code === 200) {
      ElMessage.success('导入成功')
      importDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '导入失败')
    }
  } catch (err: any) {
    if (err.response?.data?.msg) {
      ElMessage.error(err.response.data.msg)
    } else {
      ElMessage.error('导入失败')
    }
  } finally {
    importLoading.value = false
  }
}

const statusTag = (val: boolean) => (val ? 'info' : 'success')
const statusLabel = (val: boolean) => (val ? '禁用' : '启用')

const jsonbLabelMaps: Record<string, Record<string, string>> = {
  industryStructure: { primaryRatio: '第一产业(%)', secondaryRatio: '第二产业(%)', tertiaryRatio: '第三产业(%)' },
  futurePlan: { targetYear: '目标年份', developmentGoal: '发展目标', keyAreas: '重点领域' },
  highEducation: { totalColleges: '高校总数', doubleFirstClassCount: '双一流高校', undergraduateCount: '在校生(万)', graduateCount: '研究生(万)' },
  basicEducation: { totalSchools: '学校总数', modelSchoolCount: '示范学校', keySchoolCount: '重点学校', educationNote: '教育备注' },
  enterpriseStats: { enterpriseCategories: '企业类别数', keyEnterpriseCount: '重点企业', fortune500Count: '世界500强' },
  housingPriceLevel: { avgPrice: '平均房价(万/㎡)', coreAreaPrice: '核心区房价(万/㎡)', suburbanPriceRange: '郊区房价范围', priceGrowthRate: '房价涨幅(%)', priceIncomeRatio: '房价收入比' },
  rentalCost: { downtownRentRange: '市中心租金(元/月)', suburbanRentRange: '郊区租金(元/月)', rentIncomeRatio: '租金收入比(%)', rentGrowthRate: '租金涨幅(%)' },
  housingPolicy: { purchaseRestriction: '限购政策', sharedPropertyHousing: '共有产权房(万套)', publicRentalHousing: '公租房(万套)', firstHomeRate: '首套房利率(%)', secondHomeRate: '二套房利率(%)' },
  consumption: { perCapitaConsumption: '人均消费(万/年)', consumptionGrowthRate: '消费涨幅(%)', engelCoefficient: '恩格尔系数(%)', educationExpenseRatio: '教育支出占比(%)', consumptionIndex: '消费指数', consumptionRank: '消费排名' },
  employment: { unemploymentRate: '城市失业率(%)', nationalUnemploymentRate: '全国失业率(%)', tertiaryEmploymentRatio: '第三产业就业占比(%)', newEmployment: '新增就业(万人)', avgSalary: '平均工资(万/年)', salaryRank: '工资排名', skilledTalentRatio: '技能人才占比(%)', skilledTalentGrowth: '技能人才增长(%)' },
  transportation: { metroLines: '地铁线路(条)', metroMileage: '地铁里程(公里)', highwayMileage: '高速公路(公里)', trafficWorldRank: '交通世界排名' },
  medical: { topHospitalCount: '三甲医院(所)', tertiaryHospitalCount: '三级医院(所)', doctorDensity: '医生密度(人/千人)', medicalRank: '医疗排名' },
  culture: { worldHeritageCount: '世界遗产(项)', annualTourists: '年游客量(万人次)', aScenicCount: 'A级景区(家)', coreAttractions: '核心景点' },
}

const formatJsonb = (obj: Record<string, any> | null | undefined, labelMap: Record<string, string>): string => {
  if (!obj || typeof obj !== 'object') return '-'
  const entries = Object.entries(obj)
    .filter(([, v]) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `${labelMap[k] || k}: ${Array.isArray(v) ? v.join(', ') : v}`)
  return entries.length ? entries.join('；') : '-'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-wrap">
    <!-- Page Header -->
    <div class="page-header">
      <h2 class="page-title">城市列表管理</h2>
      <p class="page-subtitle">管理所有城市的基本信息与详细数据，支持增删改查和批量导入导出</p>
    </div>

    <!-- Search Card -->
    <div class="search-card">
      <span class="section-label">搜索筛选</span>
      <el-form :model="queryParams" inline>
        <el-form-item label="城市名称">
          <el-input v-model="queryParams.cityName" placeholder="城市名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="省份">
          <el-select v-model="queryParams.province" placeholder="省份" clearable filterable allow-create style="width: 150px">
            <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属地区">
          <el-input v-model="queryParams.region" placeholder="所属地区模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.isDeleted" placeholder="请选择" clearable style="width: 120px">
            <el-option label="启用" :value="false" />
            <el-option label="禁用" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="search-btn" @click="handleSearch">查询</el-button>
          <el-button class="reset-btn" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <div class="action-bar-left">
        <el-button class="btn-add" @click="openDialog('add')">
          <span class="btn-icon">+</span> 新增城市
        </el-button>
        <el-dropdown class="btn-import" @command="(cmd: string) => openImportDialog(cmd as 'main' | 'detail')">
          <el-button class="btn-outline">
            Excel导入 <span class="btn-arrow">&#9662;</span>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="main">导入城市主表</el-dropdown-item>
              <el-dropdown-item command="detail">导入城市详情</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button class="btn-batch-delete" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量永久删除
        </el-button>
      </div>
      <el-button class="btn-refresh" @click="fetchData">
        <span class="btn-icon-refresh">&#8635;</span> 刷新
      </el-button>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="cityName" label="城市名称" min-width="120" />
        <el-table-column prop="province" label="省份" width="120" />
        <el-table-column prop="collegeCount" label="高校数量" width="100" align="center" />
        <el-table-column prop="keyCollegeCount" label="重点高校" width="100" align="center" />
        <el-table-column prop="residentPopulation" label="常住人口(万)" width="120" align="right" />
        <el-table-column prop="isDeleted" label="状态" width="80" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.isDeleted ? 'status-disabled' : 'status-active'">
              {{ statusLabel(row.isDeleted) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <span class="action-pill action-detail" @click="openDialog('detail', row.id)">详情</span>
            <span class="action-pill action-edit" @click="openDialog('edit', row.id)">修改</span>
            <span class="action-pill" :class="row.isDeleted ? 'action-enable' : 'action-disable'" @click="handleToggleStatus(row)">
              {{ row.isDeleted ? '启用' : '禁用' }}
            </span>
            <span class="action-pill action-delete" @click="handleDelete(row.id)">永久删除</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="custom-pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <el-dialog class="uni-dialog" v-model="dialogVisible" :title="dialogTitle" width="1000px" :close-on-click-modal="false" :destroy-on-close="true">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border :label-class-name="'desc-label'">
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="城市名称">{{ detailData.cityName }}</el-descriptions-item>
            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>
            <el-descriptions-item label="所属地区">{{ detailData.region || '-' }}</el-descriptions-item>
            <el-descriptions-item label="高校数量">{{ detailData.collegeCount ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="重点高校数量">{{ detailData.keyCollegeCount ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="常住人口(万)">{{ detailData.residentPopulation ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="GDP(亿元)">{{ detailData.gdp ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态" :span="2">
              <span class="status-pill" :class="detailData.isDeleted ? 'status-disabled' : 'status-active'">
                {{ statusLabel(detailData.isDeleted) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="城市简介" :span="2">
              <div class="max-h-40 overflow-y-auto whitespace-pre-wrap">{{ detailData.cityIntro || '-' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="面积(km²)">{{ detailData.area ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="副标题">{{ detailData.subtitle || '-' }}</el-descriptions-item>
            <el-descriptions-item label="城市级别">{{ detailData.cityLevel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="行政区划代码">{{ detailData.adminCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="人均GDP(万元)">{{ detailData.perCapitaGdp ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="城镇化率(%)">{{ detailData.urbanizationRate ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="农村人口比例(%)">{{ detailData.ruralPopRatio ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="老龄化率(%)">{{ detailData.agingRate ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="外来人口比例(%)">{{ detailData.migrantPopRatio ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="GDP增长率(%)">{{ detailData.gdpGrowthRate ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="500强企业数">{{ detailData.fortune500Count ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="产业描述" :span="2">{{ detailData.industryDescription || '-' }}</el-descriptions-item>
            <el-descriptions-item label="主要产业" :span="2">{{ detailData.mainIndustries?.join(', ') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="新兴产业" :span="2">{{ detailData.emergingIndustries?.join(', ') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="产业结构" :span="2">{{ formatJsonb(detailData.industryStructure, jsonbLabelMaps.industryStructure) }}</el-descriptions-item>
            <el-descriptions-item label="未来规划" :span="2">{{ formatJsonb(detailData.futurePlan, jsonbLabelMaps.futurePlan) }}</el-descriptions-item>
            <el-descriptions-item label="高等教育" :span="2">{{ formatJsonb(detailData.highEducation, jsonbLabelMaps.highEducation) }}</el-descriptions-item>
            <el-descriptions-item label="基础教育" :span="2">{{ formatJsonb(detailData.basicEducation, jsonbLabelMaps.basicEducation) }}</el-descriptions-item>
            <el-descriptions-item label="企业统计" :span="2">{{ formatJsonb(detailData.enterpriseStats, jsonbLabelMaps.enterpriseStats) }}</el-descriptions-item>
            <el-descriptions-item label="房价水平" :span="2">{{ formatJsonb(detailData.housingPriceLevel, jsonbLabelMaps.housingPriceLevel) }}</el-descriptions-item>
            <el-descriptions-item label="租房成本" :span="2">{{ formatJsonb(detailData.rentalCost, jsonbLabelMaps.rentalCost) }}</el-descriptions-item>
            <el-descriptions-item label="住房政策" :span="2">{{ formatJsonb(detailData.housingPolicy, jsonbLabelMaps.housingPolicy) }}</el-descriptions-item>
            <el-descriptions-item label="消费水平" :span="2">{{ formatJsonb(detailData.consumption, jsonbLabelMaps.consumption) }}</el-descriptions-item>
            <el-descriptions-item label="就业情况" :span="2">{{ formatJsonb(detailData.employment, jsonbLabelMaps.employment) }}</el-descriptions-item>
            <el-descriptions-item label="交通情况" :span="2">{{ formatJsonb(detailData.transportation, jsonbLabelMaps.transportation) }}</el-descriptions-item>
            <el-descriptions-item label="医疗资源" :span="2">{{ formatJsonb(detailData.medical, jsonbLabelMaps.medical) }}</el-descriptions-item>
            <el-descriptions-item label="文化旅游" :span="2">{{ formatJsonb(detailData.culture, jsonbLabelMaps.culture) }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="城市名称" required>
                      <el-input v-model="formData.cityName" placeholder="请输入城市名称" maxlength="50" show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="省份" required>
                      <el-select v-model="formData.province" placeholder="请选择省份" filterable allow-create style="width: 100%">
                        <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="所属地区" required>
                      <el-input v-model="formData.region" placeholder="请输入所属地区" maxlength="20" show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="高校数量">
                      <el-input-number controls-position="right" v-model="formData.collegeCount" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="重点高校数量">
                      <el-input-number controls-position="right" v-model="formData.keyCollegeCount" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="常住人口(万)">
                      <el-input-number controls-position="right" v-model="formData.residentPopulation" :min="0" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="GDP(亿元)">
                      <el-input-number controls-position="right" v-model="formData.gdp" :min="0" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="城市简介">
                  <el-input v-model="formData.cityIntro" type="textarea" :rows="4" placeholder="请输入城市简介" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="详细信息" name="detail">
              <el-form :model="detailForm" label-width="140px" class="mt-2">
                <div class="mb-2 mt-4 text-sm font-medium section-subtitle">基础数据</div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="面积(km²)">
                      <el-input-number controls-position="right" v-model="detailForm.area" :min="0" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="副标题">
                      <el-input v-model="detailForm.subtitle" placeholder="城市副标题" maxlength="200" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="城市级别">
                      <el-select v-model="detailForm.cityLevel" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in cityLevelOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="行政区划代码">
                      <el-input v-model="detailForm.adminCode" placeholder="行政区划代码" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="人均GDP(万元)">
                      <el-input-number controls-position="right" v-model="detailForm.perCapitaGdp" :min="0" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="城镇化率(%)">
                      <el-input-number controls-position="right" v-model="detailForm.urbanizationRate" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="GDP增长率(%)">
                      <el-input-number controls-position="right" v-model="detailForm.gdpGrowthRate" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="农村人口比例(%)">
                      <el-input-number controls-position="right" v-model="detailForm.ruralPopRatio" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="老龄化率(%)">
                      <el-input-number controls-position="right" v-model="detailForm.agingRate" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="外来人口比例(%)">
                      <el-input-number controls-position="right" v-model="detailForm.migrantPopRatio" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="世界500强企业数">
                      <el-input-number controls-position="right" v-model="detailForm.fortune500Count" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <div class="mb-2 mt-4 text-sm font-medium section-subtitle">产业信息</div>
                <el-form-item label="产业描述">
                  <el-input v-model="detailForm.industryDescription" type="textarea" :rows="3" />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="主要产业">
                      <JsonbArrayEditor v-model="detailForm.mainIndustries" placeholder="如：信息技术" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="新兴产业">
                      <JsonbArrayEditor v-model="detailForm.emergingIndustries" placeholder="如：人工智能" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <!-- 产业结构 -->
                <div class="section-block">
                  <div class="section-title">产业结构</div>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="第一产业(%)">
                        <el-input-number controls-position="right" v-model="detailForm.industryStructure.primaryRatio" :min="0" :max="100" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="第二产业(%)">
                        <el-input-number controls-position="right" v-model="detailForm.industryStructure.secondaryRatio" :min="0" :max="100" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="第三产业(%)">
                        <el-input-number controls-position="right" v-model="detailForm.industryStructure.tertiaryRatio" :min="0" :max="100" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>

                <!-- 未来规划 -->
                <div class="section-block">
                  <div class="section-title">未来规划</div>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="目标年份">
                        <el-input-number controls-position="right" v-model="detailForm.futurePlan.targetYear" :min="2000" :max="2100" :precision="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="16">
                      <el-form-item label="发展目标">
                        <el-input v-model="detailForm.futurePlan.developmentGoal" placeholder="发展目标" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item label="重点领域">
                    <JsonbArrayEditor v-model="detailForm.futurePlan.keyAreas" placeholder="如：数字经济" />
                  </el-form-item>
                </div>

                <!-- 高等教育 -->
                <div class="section-block">
                  <div class="section-title">高等教育</div>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="高校总数">
                        <el-input-number controls-position="right" v-model="detailForm.highEducation.totalColleges" :min="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="双一流高校">
                        <el-input-number controls-position="right" v-model="detailForm.highEducation.doubleFirstClassCount" :min="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="在校生(万)">
                        <el-input-number controls-position="right" v-model="detailForm.highEducation.undergraduateCount" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="研究生(万)">
                        <el-input-number controls-position="right" v-model="detailForm.highEducation.graduateCount" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>

                <!-- 基础教育 -->
                <div class="section-block">
                  <div class="section-title">基础教育</div>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="学校总数">
                        <el-input-number controls-position="right" v-model="detailForm.basicEducation.totalSchools" :min="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="示范学校">
                        <el-input-number controls-position="right" v-model="detailForm.basicEducation.modelSchoolCount" :min="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="重点学校">
                        <el-input-number controls-position="right" v-model="detailForm.basicEducation.keySchoolCount" :min="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item label="教育备注">
                    <el-input v-model="detailForm.basicEducation.educationNote" type="textarea" :rows="2" />
                  </el-form-item>
                </div>

                <!-- 企业统计 -->
                <div class="section-block">
                  <div class="section-title">企业统计</div>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="企业类别数">
                        <el-input-number controls-position="right" v-model="detailForm.enterpriseStats.enterpriseCategories" :min="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="重点企业">
                        <el-input-number controls-position="right" v-model="detailForm.enterpriseStats.keyEnterpriseCount" :min="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="世界500强">
                        <el-input-number controls-position="right" v-model="detailForm.enterpriseStats.fortune500Count" :min="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>

                <!-- 房价水平 -->
                <div class="section-block">
                  <div class="section-title">房价水平</div>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="平均房价(万/㎡)">
                        <el-input-number controls-position="right" v-model="detailForm.housingPriceLevel.avgPrice" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="核心区房价(万/㎡)">
                        <el-input-number controls-position="right" v-model="detailForm.housingPriceLevel.coreAreaPrice" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="郊区房价范围">
                        <el-input v-model="detailForm.housingPriceLevel.suburbanPriceRange" placeholder="如：1-3万" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="房价涨幅(%)">
                        <el-input-number controls-position="right" v-model="detailForm.housingPriceLevel.priceGrowthRate" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="房价收入比">
                        <el-input-number controls-position="right" v-model="detailForm.housingPriceLevel.priceIncomeRatio" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>

                <!-- 租房成本 -->
                <div class="section-block">
                  <div class="section-title">租房成本</div>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="市中心租金(元/月)">
                        <el-input v-model="detailForm.rentalCost.downtownRentRange" placeholder="如：3000-6000" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="郊区租金(元/月)">
                        <el-input v-model="detailForm.rentalCost.suburbanRentRange" placeholder="如：1500-3000" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="租金收入比(%)">
                        <el-input-number controls-position="right" v-model="detailForm.rentalCost.rentIncomeRatio" :min="0" :max="100" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="租金涨幅(%)">
                        <el-input-number controls-position="right" v-model="detailForm.rentalCost.rentGrowthRate" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>

                <!-- 住房政策 -->
                <div class="section-block">
                  <div class="section-title">住房政策</div>
                  <el-form-item label="限购政策">
                    <el-input v-model="detailForm.housingPolicy.purchaseRestriction" placeholder="如：限购2套" />
                  </el-form-item>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="共有产权房(万套)">
                        <el-input-number controls-position="right" v-model="detailForm.housingPolicy.sharedPropertyHousing" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="公租房(万套)">
                        <el-input-number controls-position="right" v-model="detailForm.housingPolicy.publicRentalHousing" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="首套房利率(%)">
                        <el-input-number controls-position="right" v-model="detailForm.housingPolicy.firstHomeRate" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="二套房利率(%)">
                        <el-input-number controls-position="right" v-model="detailForm.housingPolicy.secondHomeRate" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>

                <!-- 消费水平 -->
                <div class="section-block">
                  <div class="section-title">消费水平</div>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="人均消费(万/年)">
                        <el-input-number controls-position="right" v-model="detailForm.consumption.perCapitaConsumption" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="消费涨幅(%)">
                        <el-input-number controls-position="right" v-model="detailForm.consumption.consumptionGrowthRate" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="恩格尔系数(%)">
                        <el-input-number controls-position="right" v-model="detailForm.consumption.engelCoefficient" :min="0" :max="100" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="教育支出占比(%)">
                        <el-input-number controls-position="right" v-model="detailForm.consumption.educationExpenseRatio" :min="0" :max="100" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="消费指数">
                        <el-input-number controls-position="right" v-model="detailForm.consumption.consumptionIndex" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="消费排名(全国)">
                        <el-input-number controls-position="right" v-model="detailForm.consumption.consumptionRank" :min="1" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>

                <!-- 就业情况 -->
                <div class="section-block">
                  <div class="section-title">就业情况</div>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="城市失业率(%)">
                        <el-input-number controls-position="right" v-model="detailForm.employment.unemploymentRate" :min="0" :max="100" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="全国失业率(%)">
                        <el-input-number controls-position="right" v-model="detailForm.employment.nationalUnemploymentRate" :min="0" :max="100" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="第三产业就业(%)">
                        <el-input-number controls-position="right" v-model="detailForm.employment.tertiaryEmploymentRatio" :min="0" :max="100" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="新增就业(万人)">
                        <el-input-number controls-position="right" v-model="detailForm.employment.newEmployment" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="平均工资(万/年)">
                        <el-input-number controls-position="right" v-model="detailForm.employment.avgSalary" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="工资排名(全国)">
                        <el-input-number controls-position="right" v-model="detailForm.employment.salaryRank" :min="1" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="技能人才占比(%)">
                        <el-input-number controls-position="right" v-model="detailForm.employment.skilledTalentRatio" :min="0" :max="100" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="技能人才增长(%)">
                        <el-input-number controls-position="right" v-model="detailForm.employment.skilledTalentGrowth" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>

                <!-- 交通情况 -->
                <div class="section-block">
                  <div class="section-title">交通情况</div>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="地铁线路(条)">
                        <el-input-number controls-position="right" v-model="detailForm.transportation.metroLines" :min="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="地铁里程(公里)">
                        <el-input-number controls-position="right" v-model="detailForm.transportation.metroMileage" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="高速公路(公里)">
                        <el-input-number controls-position="right" v-model="detailForm.transportation.highwayMileage" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="交通世界排名">
                        <el-input-number controls-position="right" v-model="detailForm.transportation.trafficWorldRank" :min="1" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>

                <!-- 医疗资源 -->
                <div class="section-block">
                  <div class="section-title">医疗资源</div>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="三甲医院(所)">
                        <el-input-number controls-position="right" v-model="detailForm.medical.topHospitalCount" :min="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="三级医院(所)">
                        <el-input-number controls-position="right" v-model="detailForm.medical.tertiaryHospitalCount" :min="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="医生密度(人/千人)">
                        <el-input-number controls-position="right" v-model="detailForm.medical.doctorDensity" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="医疗排名(全国)">
                        <el-input-number controls-position="right" v-model="detailForm.medical.medicalRank" :min="1" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>

                <!-- 文化旅游 -->
                <div class="section-block">
                  <div class="section-title">文化旅游</div>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="世界遗产(项)">
                        <el-input-number controls-position="right" v-model="detailForm.culture.worldHeritageCount" :min="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="年游客量(万人次)">
                        <el-input-number controls-position="right" v-model="detailForm.culture.annualTourists" :min="0" :precision="2" style="width:100%" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="A级景区(家)">
                        <el-input-number controls-position="right" v-model="detailForm.culture.aScenicCount" :min="0" style="width:100%" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item label="核心景点">
                    <JsonbArrayEditor v-model="detailForm.culture.coreAttractions" placeholder="如：故宫博物院" />
                  </el-form-item>
                </div>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- Import Dialog -->
    <el-dialog v-model="importDialogVisible" :title="importType === 'main' ? '导入城市主表' : '导入城市详情'" width="500px">
      <el-upload
        drag
        :auto-upload="false"
        :show-file-list="true"
        accept=".xlsx,.xls"
        :on-change="handleImportFileChange"
        :limit="1"
      >
        <el-icon class="el-icon--upload" style="font-size: 48px;"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持.xlsx / .xls 格式文件</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* ===========================
   Page Wrapper
   =========================== */
.page-wrap {
  background: linear-gradient(135deg, #fff5f0 0%, #fff7ed 50%, #fff1f2 100%);
  min-height: 100vh;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Maple leaf watermarks */
.page-wrap::before,
.page-wrap::after {
  content: '';
  position: absolute;
  width: 320px;
  height: 320px;
  background: url('@/assets/images/logo-main.png') center / contain no-repeat;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}

.page-wrap::before {
  top: -60px;
  right: -60px;
  transform: rotate(18deg);
}

.page-wrap::after {
  bottom: -60px;
  left: -60px;
  transform: rotate(-12deg);
}

/* ===========================
   Page Header
   =========================== */
.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #F97316;
  letter-spacing: 1px;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #9ca3af;
}

/* ===========================
   Search Card
   =========================== */
.search-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border: 1px solid #FB923C;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(249, 115, 22, 0.06);
}

.section-label {
  display: inline-block;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 14px;
  border-radius: 10px;
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.search-card :deep(.el-form) {
  margin-top: 4px;
}

.search-card :deep(.el-input__wrapper),
.search-card :deep(.el-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px #fed7aa inset;
  border-radius: 8px;
}

.search-card :deep(.el-input__wrapper:hover),
.search-card :deep(.el-select:hover .el-input__wrapper) {
  box-shadow: 0 0 0 1px #FB923C inset;
}

.search-card :deep(.el-input.is-focus .el-input__wrapper),
.search-card :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.search-btn {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  border: none !important;
  color: #fff !important;
  border-radius: 8px !important;
  padding: 8px 22px !important;
  font-weight: 500;
}

.search-btn:hover {
  opacity: 0.9;
}

.reset-btn {
  border: 1px solid #fdba74 !important;
  color: #F97316 !important;
  background: #fff7ed !important;
  border-radius: 8px !important;
  padding: 8px 22px !important;
  font-weight: 500;
}

.reset-btn:hover {
  background: #fff1f2 !important;
  border-color: #F97316 !important;
}

/* ===========================
   Action Bar
   =========================== */
.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.action-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-add {
  background: linear-gradient(135deg, #F97316, #EA580C) !important;
  border: none !important;
  color: #fff !important;
  border-radius: 8px !important;
  padding: 8px 18px !important;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.btn-add:hover {
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.45);
  opacity: 0.95;
}

.btn-icon {
  font-size: 16px;
  margin-right: 2px;
  font-weight: 700;
}

.btn-outline {
  border: 1px solid #F97316 !important;
  color: #F97316 !important;
  background: #fff7ed !important;
  border-radius: 8px !important;
  font-weight: 500;
}

.btn-outline:hover {
  background: #fff1f2 !important;
  border-color: #EA580C !important;
  color: #EA580C !important;
}

.btn-arrow {
  font-size: 10px;
  margin-left: 4px;
}

.btn-batch-delete {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  border: none !important;
  color: #fff !important;
  border-radius: 8px !important;
  padding: 8px 18px !important;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
}

.btn-batch-delete:hover:not(:disabled) {
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
}

.btn-batch-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-refresh {
  border: 1px solid #d1d5db !important;
  color: #6b7280 !important;
  background: #fff !important;
  border-radius: 8px !important;
  font-weight: 500;
}

.btn-refresh:hover {
  border-color: #F97316 !important;
  color: #F97316 !important;
  background: #fff7ed !important;
}

.btn-icon-refresh {
  font-size: 15px;
  margin-right: 2px;
}

/* ===========================
   Table Card
   =========================== */
.table-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(249, 115, 22, 0.06);
  border: 1px solid #fed7aa;
}

.table-card :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.table-card :deep(.el-table th.el-table__cell) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}

.table-card :deep(.el-table th.el-table__cell .cell) {
  color: #1f2937;
}

.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: #fefaf5 !important;
}

.table-card :deep(.el-table__body tr:hover > td.el-table__cell) {
  background-color: #fff5f0 !important;
}

/* Status Pills */
.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.status-disabled {
  background: #f3f4f6;
  color: #9ca3af;
  border: 1px solid #e5e7eb;
}

/* Action Pills */
.action-pill {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 2px;
  user-select: none;
}

.action-pill:hover {
  transform: translateY(-1px);
}

.action-detail {
  color: #F97316;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.action-detail:hover {
  background: #F97316;
  color: #fff;
}

.action-edit {
  color: #8b5cf6;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
}

.action-edit:hover {
  background: #8b5cf6;
  color: #fff;
}

.action-enable {
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

.action-enable:hover {
  background: #059669;
  color: #fff;
}

.action-disable {
  color: #6b7280;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.action-disable:hover {
  background: #6b7280;
  color: #fff;
}

.action-delete {
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.action-delete:hover {
  background: #ef4444;
  color: #fff;
}

/* ===========================
   Custom Pagination
   =========================== */
.custom-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.custom-pagination :deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff !important;
  border-radius: 6px;
  border: none;
}

.custom-pagination :deep(.el-pagination .el-pager li:hover) {
  color: #F97316;
}

.custom-pagination :deep(.el-pagination .btn-prev:hover),
.custom-pagination :deep(.el-pagination .btn-next:hover) {
  color: #F97316;
}

.custom-pagination :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

/* ===========================
   Uni Dialog
   =========================== */
.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid #FB923C;
  padding-bottom: 16px;
  margin-bottom: 4px;
}

.uni-dialog :deep(.el-dialog__title) {
  color: #F97316;
  font-weight: 700;
  font-size: 17px;
}

.uni-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #fed7aa;
  padding-top: 14px;
}

.uni-dialog :deep(.el-descriptions__label.is-bordered-label) {
  background: #fffbeb !important;
  color: #F97316 !important;
  font-weight: 600;
}

.uni-dialog :deep(.el-tabs__active-bar) {
  background-color: #F97316 !important;
}

.uni-dialog :deep(.el-tabs__item.is-active) {
  color: #F97316 !important;
  font-weight: 600;
}

.uni-dialog :deep(.el-tabs__item:hover) {
  color: #FB923C !important;
}

.uni-dialog :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #fed7aa inset;
  border-radius: 8px;
}

.uni-dialog :deep(.el-input.is-focus .el-input__wrapper),
.uni-dialog :deep(.el-textarea__inner:focus),
.uni-dialog :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.uni-dialog :deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #fed7aa inset;
  border-radius: 8px;
}

.uni-dialog :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #FB923C inset;
}

.uni-dialog :deep(.el-form-item__label) {
  word-break: break-all;
  line-height: 1.35;
  padding-right: 6px;
}

.uni-dialog :deep(.el-input-number) {
  width: 100%;
}

.uni-dialog :deep(.el-input-number .el-input__wrapper) {
  box-shadow: 0 0 0 1px #fed7aa inset;
  border-radius: 8px;
}

.uni-dialog :deep(.el-input-number .el-input__inner) {
  font-weight: 600;
  color: #374151;
}

.uni-dialog :deep(.el-input-number.is-controls-right .el-input__wrapper) {
  padding-right: 34px;
}

/* 右侧 controls 按钮：浅橙底 + 橙色图标，与品牌色统一 */
.uni-dialog :deep(.el-input-number.is-controls-right .el-input-number__decrease),
.uni-dialog :deep(.el-input-number.is-controls-right .el-input-number__increase) {
  width: 30px;
  background: #fff7ed;
  border-left: 1px solid #fed7aa;
  color: #F97316;
  font-weight: 700;
}

.uni-dialog :deep(.el-input-number.is-controls-right .el-input-number__decrease:hover),
.uni-dialog :deep(.el-input-number.is-controls-right .el-input-number__increase:hover) {
  background: #ffe4c4;
  color: #EA580C;
}

.uni-dialog :deep(.el-input-number.is-controls-right .el-input-number__decrease.is-disabled),
.uni-dialog :deep(.el-input-number.is-controls-right .el-input-number__increase.is-disabled) {
  color: #d1d5db;
  background: #f9fafb;
}

.uni-dialog :deep(.el-input-number.is-controls-right .el-input-number__decrease) {
  border-radius: 0 0 8px 0;
}

.uni-dialog :deep(.el-input-number.is-controls-right .el-input-number__increase) {
  border-radius: 0 8px 0 0;
}

.uni-dialog :deep(.el-input-number.is-controls-right:hover .el-input-number__decrease),
.uni-dialog :deep(.el-input-number.is-controls-right:hover .el-input-number__increase) {
  border-left-color: #fdba74;
}

.uni-dialog :deep(.el-button--primary) {
  background: linear-gradient(135deg, #F97316, #EA580C) !important;
  border: none !important;
  border-radius: 8px !important;
  font-weight: 500;
}

.uni-dialog :deep(.el-button--primary:hover) {
  opacity: 0.9;
}

.section-subtitle {
  color: #F97316;
  font-weight: 600;
}

.section-block {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #F97316;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px dashed #fdba74;
}
</style>
