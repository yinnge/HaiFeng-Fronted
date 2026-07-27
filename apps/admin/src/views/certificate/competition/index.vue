<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getCompetitionPage,

  getCompetitionDetail,

  addCompetition,

  updateCompetition,

  softDeleteCompetition,

  hardDeleteCompetition,

  batchDeleteCompetition,

} from '@/api/certificate/competition'

import type {

  CompetitionListVO,

  CompetitionDetailVO,

  CompetitionQueryDTO,

  CompetitionAddDTO,

  CompetitionUpdateDTO,

} from '@/types/certificate/competition'



const loading = ref(false)

const tableData = ref<CompetitionListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<CompetitionQueryDTO>({

  page: 1,

  size: 10,

  compName: '',

  compLevel: undefined,

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<CompetitionDetailVO | null>(null)



const formData = reactive<CompetitionAddDTO>({

  compName: '',

  compLevel: '',

  registrationTime: '',

})



// Dynamic list helpers for detail sub-fields

const newAward = ref('')

const newPurpose = ref('')

const newCriteria = ref('')

const newNotice = ref('')

const newRuleTitle = ref('')

const newRuleContent = ref('')

const newGuideTitle = ref('')

const newGuideContent = ref('')

const newAwardDispTitle = ref('')

const newAwardDispContent = ref('')



const basicInfoKey = ref('')

const basicInfoValue = ref('')



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.compName) params.compName = queryParams.compName

    if (queryParams.compLevel) params.compLevel = queryParams.compLevel

    const res = await getCompetitionPage(params as CompetitionQueryDTO)

    if (res.data.code === 200) {

      tableData.value = res.data.data.records

      total.value = res.data.data.total

    } else {

      ElMessage.error(res.data.msg || '获取列表失败')

    }

  } catch {

    ElMessage.error('获取列表失败')

  } finally {

    loading.value = false

  }

}



const handleSearch = () => { queryParams.page = 1; fetchData() }

const handleReset = () => {

  queryParams.compName = ''

  queryParams.compLevel = undefined

  queryParams.page = 1

  fetchData()

}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {

  queryParams.size = size

  queryParams.page = 1

  fetchData()

}

const handleSelectionChange = (val: CompetitionListVO[]) => {

  selectedIds.value = val.map(v => v.id)

}



// Detail sub-field helpers

const addAward = () => { if (newAward.value.trim()) { if (!formData.detail) formData.detail = {}; if (!formData.detail.awards) formData.detail.awards = []; formData.detail.awards.push(newAward.value.trim()); newAward.value = '' } }

const removeAward = (i: number) => { formData.detail?.awards?.splice(i, 1) }

const addPurpose = () => { if (newPurpose.value.trim()) { if (!formData.detail) formData.detail = {}; if (!formData.detail.purposes) formData.detail.purposes = []; formData.detail.purposes.push(newPurpose.value.trim()); newPurpose.value = '' } }

const removePurpose = (i: number) => { formData.detail?.purposes?.splice(i, 1) }

const addCriteria = () => { if (newCriteria.value.trim()) { if (!formData.detail) formData.detail = {}; if (!formData.detail.scoringCriteria) formData.detail.scoringCriteria = []; formData.detail.scoringCriteria.push(newCriteria.value.trim()); newCriteria.value = '' } }

const removeCriteria = (i: number) => { formData.detail?.scoringCriteria?.splice(i, 1) }

const addNotice = () => { if (newNotice.value.trim()) { if (!formData.detail) formData.detail = {}; if (!formData.detail.notices) formData.detail.notices = []; formData.detail.notices.push(newNotice.value.trim()); newNotice.value = '' } }

const removeNotice = (i: number) => { formData.detail?.notices?.splice(i, 1) }

const addRule = () => {

  if (newRuleTitle.value.trim() && newRuleContent.value.trim()) {

    if (!formData.detail) formData.detail = {}

    if (!formData.detail.competitionRules) formData.detail.competitionRules = []

    formData.detail.competitionRules.push({ title: newRuleTitle.value.trim(), content: newRuleContent.value.trim() })

    newRuleTitle.value = ''; newRuleContent.value = ''

  }

}

const removeRule = (i: number) => { formData.detail?.competitionRules?.splice(i, 1) }

const addGuide = () => {

  if (newGuideTitle.value.trim() && newGuideContent.value.trim()) {

    if (!formData.detail) formData.detail = {}

    if (!formData.detail.processGuide) formData.detail.processGuide = []

    formData.detail.processGuide.push({ title: newGuideTitle.value.trim(), content: newGuideContent.value.trim() })

    newGuideTitle.value = ''; newGuideContent.value = ''

  }

}

const removeGuide = (i: number) => { formData.detail?.processGuide?.splice(i, 1) }

const addAwardDisp = () => {

  if (newAwardDispTitle.value.trim() && newAwardDispContent.value.trim()) {

    if (!formData.detail) formData.detail = {}

    if (!formData.detail.awardsDisplay) formData.detail.awardsDisplay = []

    formData.detail.awardsDisplay.push({ title: newAwardDispTitle.value.trim(), content: newAwardDispContent.value.trim() })

    newAwardDispTitle.value = ''; newAwardDispContent.value = ''

  }

}

const removeAwardDisp = (i: number) => { formData.detail?.awardsDisplay?.splice(i, 1) }

const addBasicInfo = () => {

  if (basicInfoKey.value.trim()) {

    if (!formData.detail) formData.detail = {}

    if (!formData.detail.basicInfo) formData.detail.basicInfo = {}

    formData.detail.basicInfo[basicInfoKey.value.trim()] = basicInfoValue.value.trim()

    basicInfoKey.value = ''; basicInfoValue.value = ''

  }

}

const removeBasicInfo = (key: string) => {

  if (formData.detail?.basicInfo) {

    delete formData.detail.basicInfo[key]

  }

}



const resetFormData = () => {

  formData.compName = ''

  formData.compLevel = ''

  formData.registrationTime = ''

  formData.detail = {

    basicInfo: {},

    awards: [],

    background: '',

    purposes: [],

    competitionRules: [],

    scoringCriteria: [],

    notices: [],

    processGuide: [],

    awardsDisplay: [],

  }

}



const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {

  dialogMode.value = mode

  currentId.value = id || null



  if (mode === 'add') {

    dialogTitle.value = '新增竞赛'

    resetFormData()

    detailData.value = null

  } else if (mode === 'edit' && id) {

    dialogTitle.value = '修改竞赛'

    formLoading.value = true

    try {

      const res = await getCompetitionDetail(id)

      if (res.data.code === 200) {

        const d = res.data.data

        formData.compName = d.compName

        formData.compLevel = d.compLevel || ''

        formData.registrationTime = d.registrationTime || ''

        formData.detail = {

          basicInfo: d.basicInfo || {},

          awards: d.awards || [],

          background: d.background || '',

          purposes: d.purposes || [],

          competitionRules: d.competitionRules || [],

          scoringCriteria: d.scoringCriteria || [],

          notices: d.notices || [],

          processGuide: d.processGuide || [],

          awardsDisplay: d.awardsDisplay || [],

        }

      }

    } catch {

      ElMessage.error('获取详情失败')

    } finally {

      formLoading.value = false

    }

    detailData.value = null

  } else if (mode === 'detail' && id) {

    dialogTitle.value = '竞赛详情'

    formLoading.value = true

    try {

      const res = await getCompetitionDetail(id)

      if (res.data.code === 200) {

        detailData.value = res.data.data

      }

    } catch {

      ElMessage.error('获取详情失败')

    } finally {

      formLoading.value = false

    }

  }



  dialogVisible.value = true

}



const handleSubmit = async () => {

  if (!formData.compName) {

    ElMessage.warning('请填写竞赛名称')

    return

  }

  try {

    let res: any

    if (dialogMode.value === 'add') {

      const data: CompetitionAddDTO = { compName: formData.compName }

      if (formData.compLevel) data.compLevel = formData.compLevel

      if (formData.registrationTime) data.registrationTime = formData.registrationTime

      if (formData.detail && Object.keys(formData.detail).length > 0) {

        const detail: any = {}

        for (const key of Object.keys(formData.detail) as (keyof typeof formData.detail)[]) {

          const val = formData.detail[key]

          if (Array.isArray(val) && val.length > 0) detail[key] = val

          else if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) detail[key] = val

          else if (typeof val === 'string' && val) detail[key] = val

        }

        if (Object.keys(detail).length > 0) data.detail = detail

      }

      res = await addCompetition(data)

    } else if (dialogMode.value === 'edit' && currentId.value) {

      const data: CompetitionUpdateDTO = { id: currentId.value, compName: formData.compName }

      if (formData.compLevel) data.compLevel = formData.compLevel

      if (formData.registrationTime) data.registrationTime = formData.registrationTime

      if (formData.detail && Object.keys(formData.detail).length > 0) {

        const detail: any = {}

        for (const key of Object.keys(formData.detail) as (keyof typeof formData.detail)[]) {

          const val = formData.detail[key]

          if (Array.isArray(val) && val.length > 0) detail[key] = val

          else if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) detail[key] = val

          else if (typeof val === 'string' && val) detail[key] = val

        }

        if (Object.keys(detail).length > 0) data.detail = detail

      }

      res = await updateCompetition(data)

    } else {

      return

    }



    if (res.data.code === 200) {

      ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '修改成功')

      dialogVisible.value = false

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch {

    ElMessage.error('操作失败')

  }

}



const handleSoftDelete = async (id: string, name: string) => {

  try {

    await ElMessageBox.confirm(`确定要软删除竞赛"${name}"吗？关联数据将保留可恢复。`, '提示')

    const res = await softDeleteCompetition(id)

    if (res.data.code === 200) {

      ElMessage.success('软删除成功')

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch { /* 取消 */ }

}



const handleHardDelete = async (id: string, name: string) => {

  try {

    await ElMessageBox.confirm(

      `确定要硬删除竞赛"${name}"吗？关联数据将同步删除，不可恢复！`,

      '警告',

      { type: 'warning', confirmButtonText: '确定硬删除', cancelButtonText: '取消' }

    )

    const res = await hardDeleteCompetition(id)

    if (res.data.code === 200) {

      ElMessage.success('硬删除成功')

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch { /* 取消 */ }

}



const handleBatchDelete = async () => {

  if (selectedIds.value.length === 0) {

    ElMessage.warning('请选择要删除的竞赛')

    return

  }

  try {

    await ElMessageBox.confirm(

      `确定要批量硬删除选中的${selectedIds.value.length} 条竞赛记录吗？关联数据将同步删除，不可恢复！`,

      '警告',

      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }

    )

    const res = await batchDeleteCompetition(selectedIds.value)

    if (res.data.code === 200) {

      ElMessage.success('批量删除成功')

      selectedIds.value = []

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch { /* 取消 */ }

}



onMounted(() => { fetchData() })

</script>



<template>

  <div>

    <!-- 搜索-->

    <div class="mb-4 rounded-lg bg-white p-5">

      <el-form :model="queryParams" inline>

        <el-form-item label="竞赛名称">

          <el-input v-model="queryParams.compName" placeholder="竞赛名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="竞赛级别">

          <el-select v-model="queryParams.compLevel" placeholder="全部级别" clearable style="width: 140px">

            <el-option label="国家级" value="国家级" />

            <el-option label="省级" value="省级" />

            <el-option label="校级" value="校级" />

          </el-select>

        </el-form-item>

        <el-form-item>

          <el-button type="primary" @click="handleSearch">查询</el-button>

          <el-button @click="handleReset">重置</el-button>

        </el-form-item>

      </el-form>

    </div>



    <!-- 操作-->

    <div class="mb-4">

      <el-button type="primary" @click="openDialog('add')">新增竞赛</el-button>

      <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchDelete">批量硬删除</el-button>

      <el-button @click="fetchData">刷新</el-button>

    </div>



    <!-- 表格 -->

    <div class="rounded-lg bg-white p-5">

      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">

        <el-table-column type="selection" width="50" />

        <el-table-column prop="id" label="ID" width="140" />

        <el-table-column prop="compName" label="竞赛名称" width="200" show-overflow-tooltip />

        <el-table-column prop="compLevel" label="竞赛级别" width="100" />

        <el-table-column prop="registrationTime" label="报名时间" width="150" />

        <el-table-column prop="updatedAt" label="更新时间" width="180" />

        <el-table-column label="操作" width="280" align="center" fixed="right">

          <template #default="{ row }">

            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>

            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>

            <el-button type="info" link @click="handleSoftDelete(row.id, row.compName)">软删除</el-button>

            <el-button type="danger" link @click="handleHardDelete(row.id, row.compName)">硬删除</el-button>

          </template>

        </el-table-column>

      </el-table>



      <div class="mt-4 flex justify-end">

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



    <!-- Dialog -->

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" :close-on-click-modal="false">

      <div v-loading="formLoading">

        <!-- 详情模式 -->

        <template v-if="dialogMode === 'detail' && detailData">

          <el-descriptions :column="1" border class="mb-4">

            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>

            <el-descriptions-item label="竞赛名称">{{ detailData.compName }}</el-descriptions-item>

            <el-descriptions-item label="竞赛级别">{{ detailData.compLevel || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名时间">{{ detailData.registrationTime || '-' }}</el-descriptions-item>

            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>

            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>

          </el-descriptions>



          <el-collapse>

            <el-collapse-item title="基本信息" name="basicInfo">

              <div v-if="detailData.basicInfo && Object.keys(detailData.basicInfo).length > 0">

                <el-descriptions :column="2" border>

                  <el-descriptions-item v-for="(val, key) in detailData.basicInfo" :key="key" :label="key">

                    {{ val }}

                  </el-descriptions-item>

                </el-descriptions>

              </div>

              <span v-else class="text-gray-400">暂无</span>

            </el-collapse-item>



            <el-collapse-item title="奖项设置" name="awards">

              <div v-if="detailData.awards && detailData.awards.length > 0" class="flex flex-wrap gap-1">

                <el-tag v-for="(a, i) in detailData.awards" :key="i">{{ a }}</el-tag>

              </div>

              <span v-else class="text-gray-400">暂无</span>

            </el-collapse-item>



            <el-collapse-item title="竞赛背景与意义" name="background">

              <div v-if="detailData.background">{{ detailData.background }}</div>

              <span v-else class="text-gray-400">暂无</span>

            </el-collapse-item>



            <el-collapse-item title="竞赛目的" name="purposes">

              <div v-if="detailData.purposes && detailData.purposes.length > 0">

                <ul class="list-disc pl-5">

                  <li v-for="(p, i) in detailData.purposes" :key="i">{{ p }}</li>

                </ul>

              </div>

              <span v-else class="text-gray-400">暂无</span>

            </el-collapse-item>



            <el-collapse-item title="竞赛规则" name="rules">

              <div v-if="detailData.competitionRules && detailData.competitionRules.length > 0">

                <div v-for="(r, i) in detailData.competitionRules" :key="i" class="mb-2">

                  <strong>{{ r.title }}</strong>{{ r.content }}

                </div>

              </div>

              <span v-else class="text-gray-400">暂无</span>

            </el-collapse-item>



            <el-collapse-item title="评分标准" name="scoring">

              <div v-if="detailData.scoringCriteria && detailData.scoringCriteria.length > 0">

                <ul class="list-disc pl-5">

                  <li v-for="(s, i) in detailData.scoringCriteria" :key="i">{{ s }}</li>

                </ul>

              </div>

              <span v-else class="text-gray-400">暂无</span>

            </el-collapse-item>



            <el-collapse-item title="注意事项" name="notices">

              <div v-if="detailData.notices && detailData.notices.length > 0">

                <ul class="list-disc pl-5">

                  <li v-for="(n, i) in detailData.notices" :key="i">{{ n }}</li>

                </ul>

              </div>

              <span v-else class="text-gray-400">暂无</span>

            </el-collapse-item>



            <el-collapse-item title="参赛流程指南" name="processGuide">

              <div v-if="detailData.processGuide && detailData.processGuide.length > 0">

                <div v-for="(g, i) in detailData.processGuide" :key="i" class="mb-2">

                  <strong>{{ g.title }}</strong>{{ g.content }}

                </div>

              </div>

              <span v-else class="text-gray-400">暂无</span>

            </el-collapse-item>

          </el-collapse>

        </template>



        <!-- 新增/修改模式 -->

        <template v-if="dialogMode !== 'detail'">

          <el-form :model="formData" label-width="120px">

            <el-form-item label="竞赛名称" required>

              <el-input v-model="formData.compName" placeholder="请输入竞赛名称" maxlength="200" show-word-limit />

            </el-form-item>

            <el-form-item label="竞赛级别">

              <el-select v-model="formData.compLevel" placeholder="请选择级别" clearable style="width: 200px">

                <el-option label="国家级" value="国家级" />

                <el-option label="省级" value="省级" />

                <el-option label="校级" value="校级" />

              </el-select>

            </el-form-item>

            <el-form-item label="报名时间">

              <el-input v-model="formData.registrationTime" placeholder="如：每年6月9月" maxlength="100" />

            </el-form-item>



            <!-- 折叠detail 字段 -->

            <el-collapse class="mt-4">

              <el-collapse-item title="竞赛详情（选填）" name="detail">

                <!-- basicInfo -->

                <el-form-item label="基本信息">

                  <div class="flex gap-2 mb-2">

                    <el-input v-model="basicInfoKey" placeholder="字段" style="width: 150px" />

                    <el-input v-model="basicInfoValue" placeholder="字段" style="width: 200px" />

                    <el-button type="primary" @click="addBasicInfo">添加</el-button>

                  </div>

                  <div v-if="formData.detail?.basicInfo && Object.keys(formData.detail.basicInfo).length > 0" class="flex flex-wrap gap-1">

                    <el-tag v-for="(val, key) in formData.detail.basicInfo" :key="key" closable @close="removeBasicInfo(key)">

                      {{ key }}: {{ val }}

                    </el-tag>

                  </div>

                </el-form-item>



                <el-form-item label="奖项设置">

                  <div class="flex gap-2 mb-2">

                    <el-input v-model="newAward" placeholder="输入奖项名称" style="width: 300px" @keyup.enter="addAward" />

                    <el-button type="primary" @click="addAward">添加</el-button>

                  </div>

                  <div class="flex flex-wrap gap-1">

                    <el-tag v-for="(a, i) in formData.detail?.awards || []" :key="i" closable @close="removeAward(i)">{{ a }}</el-tag>

                  </div>

                </el-form-item>



                <el-form-item label="竞赛背景">

                  <el-input v-model="formData.detail!.background" type="textarea" :rows="3" placeholder="竞赛背景与意义" />

                </el-form-item>



                <el-form-item label="竞赛目的">

                  <div class="flex gap-2 mb-2">

                    <el-input v-model="newPurpose" placeholder="输入竞赛目的" style="width: 300px" @keyup.enter="addPurpose" />

                    <el-button type="primary" @click="addPurpose">添加</el-button>

                  </div>

                  <div class="flex flex-wrap gap-1">

                    <el-tag v-for="(p, i) in formData.detail?.purposes || []" :key="i" closable @close="removePurpose(i)">{{ p }}</el-tag>

                  </div>

                </el-form-item>



                <el-form-item label="竞赛规则">

                  <div class="flex gap-2 mb-2">

                    <el-input v-model="newRuleTitle" placeholder="标题" style="width: 150px" />

                    <el-input v-model="newRuleContent" placeholder="内容" style="width: 250px" />

                    <el-button type="primary" @click="addRule">添加</el-button>

                  </div>

                  <div v-for="(r, i) in formData.detail?.competitionRules || []" :key="i" class="mb-1">

                    <el-tag closable @close="removeRule(i)">

                      {{ r.title }}：{{ r.content }}

                    </el-tag>

                  </div>

                </el-form-item>



                <el-form-item label="评分标准">

                  <div class="flex gap-2 mb-2">

                    <el-input v-model="newCriteria" placeholder="输入评分标准" style="width: 300px" @keyup.enter="addCriteria" />

                    <el-button type="primary" @click="addCriteria">添加</el-button>

                  </div>

                  <div class="flex flex-wrap gap-1">

                    <el-tag v-for="(s, i) in formData.detail?.scoringCriteria || []" :key="i" closable @close="removeCriteria(i)">{{ s }}</el-tag>

                  </div>

                </el-form-item>



                <el-form-item label="注意事项">

                  <div class="flex gap-2 mb-2">

                    <el-input v-model="newNotice" placeholder="输入注意事项" style="width: 300px" @keyup.enter="addNotice" />

                    <el-button type="primary" @click="addNotice">添加</el-button>

                  </div>

                  <div class="flex flex-wrap gap-1">

                    <el-tag v-for="(n, i) in formData.detail?.notices || []" :key="i" closable @close="removeNotice(i)">{{ n }}</el-tag>

                  </div>

                </el-form-item>



                <el-form-item label="参赛流程">

                  <div class="flex gap-2 mb-2">

                    <el-input v-model="newGuideTitle" placeholder="步骤标题" style="width: 150px" />

                    <el-input v-model="newGuideContent" placeholder="步骤内容" style="width: 250px" />

                    <el-button type="primary" @click="addGuide">添加</el-button>

                  </div>

                  <div v-for="(g, i) in formData.detail?.processGuide || []" :key="i" class="mb-1">

                    <el-tag closable @close="removeGuide(i)">

                      {{ g.title }}：{{ g.content }}

                    </el-tag>

                  </div>

                </el-form-item>



                <el-form-item label="奖项展示">

                  <div class="flex gap-2 mb-2">

                    <el-input v-model="newAwardDispTitle" placeholder="奖项标题" style="width: 150px" />

                    <el-input v-model="newAwardDispContent" placeholder="奖项详情" style="width: 250px" />

                    <el-button type="primary" @click="addAwardDisp">添加</el-button>

                  </div>

                  <div v-for="(ad, i) in formData.detail?.awardsDisplay || []" :key="i" class="mb-1">

                    <el-tag closable @close="removeAwardDisp(i)">

                      {{ ad.title }}：{{ ad.content }}

                    </el-tag>

                  </div>

                </el-form-item>

              </el-collapse-item>

            </el-collapse>

          </el-form>

        </template>

      </div>



      <template #footer>

        <el-button @click="dialogVisible = false">

          {{ dialogMode === 'detail' ? '关闭' : '取消' }}

        </el-button>

        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">

          确定

        </el-button>

      </template>

    </el-dialog>

  </div>

</template>

