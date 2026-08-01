<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { UniversityAddDTO } from '@/types/university/info'

export interface UniversityFormData extends UniversityAddDTO {
  status?: number
}

export interface UniversityDetailFormData {
  address: string
  admissionPhone: string
  website: string
  historyGroupScore: number | undefined
  scienceGroupScore: number | undefined
  carouselImages: string[]
  detailIntroduction: string
  rankings: {
    ruanke: number | undefined
    xiaoyouhui: number | undefined
    wushulian: number | undefined
    qs: number | undefined
    usnews: number | undefined
  }
  abroadRate: string
  genderRatio: string
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  formLoading: boolean
  initialForm?: UniversityFormData | null
  initialDetail?: UniversityDetailFormData | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', data: UniversityFormData, detail: UniversityDetailFormData): void
}>()

const formData = reactive<UniversityFormData>({
  name: '', nameEn: '', provinceName: '', cityName: '', region: '华东',
  category: '', majorCount: 0, educationLevel: '', nature: '',
  recommendationRate: undefined, recommendationYear: undefined,
  hasDoctorate: false, hasMaster: false, department: '',
  tags: [], famousUnion: '', imageUrl: '', introduction: '',
})

const detailFormData = reactive<UniversityDetailFormData>({
  address: '', admissionPhone: '', website: '',
  historyGroupScore: undefined, scienceGroupScore: undefined,
  carouselImages: [], detailIntroduction: '',
  rankings: { ruanke: undefined, xiaoyouhui: undefined, wushulian: undefined, qs: undefined, usnews: undefined },
  abroadRate: '', genderRatio: '',
})

const activeTab = ref('basic')

watch(
  () => [props.visible, props.initialForm, props.initialDetail, props.mode] as const,
  ([visible, form, detail, mode]) => {
    if (visible) {
      activeTab.value = 'basic'
      if (mode === 'edit' && form) {
        Object.assign(formData, {
          name: form.name || '', nameEn: form.nameEn || '',
          provinceName: form.provinceName || '', cityName: form.cityName || '',
          region: form.region || '华东', category: form.category || '',
          majorCount: form.majorCount ?? 0, educationLevel: form.educationLevel || '',
          nature: form.nature || '', recommendationRate: form.recommendationRate ?? undefined,
          recommendationYear: form.recommendationYear ?? undefined,
          hasDoctorate: form.hasDoctorate ?? false, hasMaster: form.hasMaster ?? false,
          department: form.department || '', tags: form.tags || [],
          famousUnion: form.famousUnion || '', imageUrl: form.imageUrl || '',
          introduction: form.introduction || '',
        })
        if (detail) {
          Object.assign(detailFormData, {
            address: detail.address || '', admissionPhone: detail.admissionPhone || '',
            website: detail.website || '',
            historyGroupScore: detail.historyGroupScore ?? undefined,
            scienceGroupScore: detail.scienceGroupScore ?? undefined,
            carouselImages: detail.carouselImages || [],
            detailIntroduction: detail.detailIntroduction || '',
            rankings: detail.rankings ? { ...detail.rankings } : { ruanke: undefined, xiaoyouhui: undefined, wushulian: undefined, qs: undefined, usnews: undefined },
            abroadRate: detail.abroadRate || '', genderRatio: detail.genderRatio || '',
          })
        }
      } else {
        Object.assign(formData, {
          name: '', nameEn: '', provinceName: '', cityName: '', region: '华东',
          category: '', majorCount: 0, educationLevel: '', nature: '',
          recommendationRate: undefined, recommendationYear: undefined,
          hasDoctorate: false, hasMaster: false, department: '',
          tags: [], famousUnion: '', imageUrl: '', introduction: '',
        })
        Object.assign(detailFormData, {
          address: '', admissionPhone: '', website: '',
          historyGroupScore: undefined, scienceGroupScore: undefined,
          carouselImages: [], detailIntroduction: '',
          rankings: { ruanke: undefined, xiaoyouhui: undefined, wushulian: undefined, qs: undefined, usnews: undefined },
          abroadRate: '', genderRatio: '',
        })
      }
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  emit('submit', { ...formData }, { ...detailFormData, rankings: { ...detailFormData.rankings } })
}

const handleClose = () => { emit('update:visible', false) }
const dialogTitle = () => (props.mode === 'add' ? '新增院校' : '修改院校')

const addCarouselImage = () => { detailFormData.carouselImages.push('') }
const removeCarouselImage = (index: number) => { detailFormData.carouselImages.splice(index, 1) }
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle()"
    width="880px"
    class="form-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="form-content">
      <el-tabs v-model="activeTab" class="form-tabs">
        <!-- 基础信息 Tab -->
        <el-tab-pane label="基础信息" name="basic">
          <el-form :model="formData" label-width="110px" class="uni-form">
            <el-form-item label="院校名称" required>
              <el-input v-model="formData.name" placeholder="请输入院校名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="英文名称" required>
              <el-input v-model="formData.nameEn" placeholder="请输入英文名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="省份" required>
                  <el-input v-model="formData.provinceName" placeholder="请输入" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="城市" required>
                  <el-input v-model="formData.cityName" placeholder="请输入" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="地区" required>
                  <el-select v-model="formData.region" style="width:100%">
                    <el-option v-for="r in ['华东','华北','华中','华南','西南','西北','东北']" :key="r" :label="r" :value="r" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="院校类别" required>
                  <el-select v-model="formData.category" style="width:100%">
                    <el-option v-for="c in ['综合','理工','师范','农林','医药','财经','政法','体育','艺术','民族','军事']" :key="c" :label="c" :value="c" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="专业数量">
                  <el-input-number v-model="formData.majorCount" :min="0" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="办学层次">
                  <el-select v-model="formData.educationLevel" style="width:100%">
                    <el-option label="本科" value="本科" />
                    <el-option label="专科" value="专科" />
                    <el-option label="本专兼招" value="本专兼招" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="院校性质">
                  <el-select v-model="formData.nature" style="width:100%">
                    <el-option label="公办" value="公办" />
                    <el-option label="民办" value="民办" />
                    <el-option label="中外合作" value="中外合作" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="推免率">
                  <el-input-number v-model="formData.recommendationRate" :min="0" :max="100" :precision="2" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="推免年份">
                  <el-input-number v-model="formData.recommendationYear" :min="2000" :max="2099" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="博士点">
                  <el-switch v-model="formData.hasDoctorate" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="硕士点">
                  <el-switch v-model="formData.hasMaster" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="隶属部门">
                  <el-select v-model="formData.department" style="width:100%">
                    <el-option label="教育部" value="教育部" />
                    <el-option label="省教育厅" value="省教育厅" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="院校标签">
              <el-select v-model="formData.tags" multiple filterable allow-create default-first-option placeholder="输入标签后回车" style="width:100%">
                <el-option label="985" value="985" />
                <el-option label="211" value="211" />
                <el-option label="双一流" value="双一流" />
              </el-select>
            </el-form-item>
            <el-form-item label="知名联盟">
              <el-input v-model="formData.famousUnion" placeholder="如：C9、华东五校" maxlength="50" />
            </el-form-item>
            <el-form-item label="院校图片">
              <el-input v-model="formData.imageUrl" placeholder="图片URL地址" maxlength="500" />
            </el-form-item>
            <el-form-item label="院校简介">
              <el-input v-model="formData.introduction" type="textarea" :rows="3" maxlength="5000" show-word-limit />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 详细信息 Tab -->
        <el-tab-pane label="详细信息" name="detail">
          <el-form :model="detailFormData" label-width="110px" class="uni-form">
            <el-form-item label="地址">
              <el-input v-model="detailFormData.address" placeholder="详细校区地址" maxlength="200" />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="招生电话">
                  <el-input v-model="detailFormData.admissionPhone" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="官方网站">
                  <el-input v-model="detailFormData.website" maxlength="500" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="历史组分数线">
                  <el-input-number v-model="detailFormData.historyGroupScore" :min="0" :max="750" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="物理组分数线">
                  <el-input-number v-model="detailFormData.scienceGroupScore" :min="0" :max="750" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="轮播图片">
              <div class="carousel-images-list">
                <div v-for="(img, idx) in detailFormData.carouselImages" :key="idx" class="carousel-image-row">
                  <el-input v-model="detailFormData.carouselImages[idx]" placeholder="图片URL地址" maxlength="500" class="carousel-image-input" />
                  <el-image
                    v-if="img"
                    :src="img"
                    :preview-src-list="[img]"
                    fit="cover"
                    class="carousel-image-thumb"
                    preview-teleported
                  />
                  <el-button type="danger" :icon="Delete" circle size="small" @click="removeCarouselImage(idx)" />
                </div>
                <el-button type="primary" :icon="Plus" plain size="small" @click="addCarouselImage">新增轮播图片</el-button>
              </div>
            </el-form-item>
            <el-form-item label="院校详细介绍">
              <el-input v-model="detailFormData.detailIntroduction" type="textarea" :rows="3" maxlength="5000" show-word-limit />
            </el-form-item>

            <el-divider>排名信息</el-divider>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="软科排名">
                  <el-input-number v-model="detailFormData.rankings.ruanke" :min="0" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="校友会排名">
                  <el-input-number v-model="detailFormData.rankings.xiaoyouhui" :min="0" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="武书连排名">
                  <el-input-number v-model="detailFormData.rankings.wushulian" :min="0" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="QS排名">
                  <el-input-number v-model="detailFormData.rankings.qs" :min="0" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="USNEWS排名">
                  <el-input-number v-model="detailFormData.rankings.usnews" :min="0" controls-position="right" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="出国比例">
                  <el-input v-model="detailFormData.abroadRate" placeholder="如：30%" maxlength="10" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="男女比例">
              <el-input v-model="detailFormData.genderRatio" placeholder="如：6:4" maxlength="10" style="width:200px" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">取消</button>
        <button type="button" class="submit-btn" @click="handleSubmit">
          {{ mode === 'add' ? '确认新增' : '保存修改' }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-dialog :deep(.el-dialog) { border-radius: 12px; overflow: hidden; }
.form-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px; margin: 0;
}
.form-dialog :deep(.el-dialog__title) { font-size: 16px; font-weight: 600; color: #1f2937; }
.form-dialog :deep(.el-dialog__body) { padding: 24px; }
.form-dialog :deep(.el-dialog__footer) { border-top: 1px solid #f3f4f6; padding: 16px 24px; }

.form-tabs :deep(.el-tabs__header) { margin-bottom: 20px; }
.form-tabs :deep(.el-tabs__item.is-active) { color: #F97316; font-weight: 600; }
.form-tabs :deep(.el-tabs__active-bar) { background: #F97316; }
.form-tabs :deep(.el-tabs__item:hover) { color: #F97316; }

.uni-form :deep(.el-form-item__label) { font-weight: 500; color: #374151; }
.uni-form :deep(.el-input__wrapper),
.uni-form :deep(.el-textarea__inner),
.uni-form :deep(.el-input-number .el-input__wrapper),
.uni-form :deep(.el-select__wrapper) {
  border-radius: 8px; transition: all 0.25s ease;
}
.uni-form :deep(.el-input__wrapper:hover),
.uni-form :deep(.el-textarea__inner:hover),
.uni-form :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.uni-form :deep(.el-input__wrapper.is-focus),
.uni-form :deep(.el-textarea__inner:focus),
.uni-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.uni-form :deep(.el-switch.is-checked .el-switch__core) {
  background: #F97316; border-color: #F97316;
}

.uni-form :deep(.el-divider__text) {
  background: #fff; font-weight: 600; color: #F97316; font-size: 14px;
}
.uni-form :deep(.el-divider) { border-top: 1px solid rgba(249, 115, 22, 0.15); }

.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; }
.cancel-btn {
  display: inline-flex; align-items: center; padding: 8px 24px;
  background: #fff; color: #6b7280; border: 1px solid #d1d5db;
  border-radius: 20px; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.25s ease;
}
.cancel-btn:hover { color: #374151; border-color: #9ca3af; background: #f9fafb; }
.cancel-btn:active { background: #f3f4f6; }
.submit-btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C); color: #fff;
  border: none; border-radius: 20px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.submit-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
.submit-btn:active { transform: translateY(0); }

.carousel-images-list { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.carousel-image-row { display: flex; align-items: center; gap: 8px; }
.carousel-image-input { flex: 1; }
.carousel-image-thumb { width: 64px; height: 64px; border-radius: 6px; border: 1px solid #e5e7eb; flex-shrink: 0; }
</style>
