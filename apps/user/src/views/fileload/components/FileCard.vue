<script setup lang="ts">
import { computed } from 'vue'
import type { FileLoadListVO } from '@/types/fileload'

const props = defineProps<{
  item: FileLoadListVO
  view: 'grid' | 'list'
}>()

const emit = defineEmits<{ (e: 'open', item: FileLoadListVO): void }>()

type Tone = 'rose' | 'blue' | 'green' | 'amber' | 'violet' | 'slate'
type Kind = 'doc' | 'video' | 'image' | 'cloud' | 'sheet' | 'slides'

interface FileMeta {
  label: string
  tone: Tone
  kind: Kind
}

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', 'mp3', 'wav', 'm4a']
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']

function extensionOf(fileType?: string): string {
  const type = (fileType || '').toLowerCase().trim()
  return type.startsWith('.') ? type.slice(1) : type
}

const meta = computed<FileMeta>(() => {
  if (props.item.storageType === 'BAIDU') {
    return { label: '网盘', tone: 'blue', kind: 'cloud' }
  }
  const ext = extensionOf(props.item.fileType)
  const label = ext ? ext.toUpperCase() : '文件'
  if (ext === 'pdf') return { label: 'PDF', tone: 'rose', kind: 'doc' }
  if (ext === 'doc' || ext === 'docx') return { label, tone: 'blue', kind: 'doc' }
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return { label, tone: 'green', kind: 'sheet' }
  if (ext === 'ppt' || ext === 'pptx') return { label, tone: 'amber', kind: 'slides' }
  if (VIDEO_EXTENSIONS.includes(ext)) return { label, tone: 'green', kind: 'video' }
  if (IMAGE_EXTENSIONS.includes(ext)) return { label, tone: 'violet', kind: 'image' }
  return { label, tone: 'slate', kind: 'doc' }
})

const hasCover = computed(() => props.item.storageType === 'BAIDU' && !!props.item.coverUrl)

function tagTone(text: string): Tone {
  if (/精品|重点|期中|期末|试卷|真题|押题|冲刺|模拟|密卷/.test(text)) return 'rose'
  if (/复习|讲义|笔记|指南|汇总|速查|公式|必备|清单/.test(text)) return 'amber'
  if (/视频|微课|专项|练习|口语|实验|实操|训练/.test(text)) return 'green'
  if (/学科|教案|课件|知识点|思维导图|资料/.test(text)) return 'blue'
  return 'slate'
}

const cardTags = computed(() => {
  const tags: { text: string; tone: Tone }[] = []
  if (props.item.subject) tags.push({ text: props.item.subject, tone: 'blue' })
  if (props.item.tag) tags.push({ text: props.item.tag, tone: tagTone(props.item.tag) })
  if (tags.length < 2 && props.item.applicableStage) {
    tags.push({ text: props.item.applicableStage, tone: 'green' })
  }
  return tags.slice(0, 2)
})

function formatSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '-'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let value = bytes
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index++
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[index]}`
}

function formatDate(time?: string): string {
  if (!time) return '-'
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) return time
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const sizeText = computed(() => (props.item.storageType === 'BAIDU' ? '百度网盘' : formatSize(props.item.fileSize)))
const dateText = computed(() => formatDate(props.item.createTime))

function open(): void {
  emit('open', props.item)
}
</script>

<template>
  <article class="file-card" :class="[`is-${view}`, `tone-${meta.tone}`]" @click="open">
    <div class="file-card__head">
      <div class="file-thumb">
        <img
          v-if="hasCover"
          :src="item.coverUrl || ''"
          :alt="item.fileName"
          class="file-thumb__img"
          loading="lazy"
          draggable="false"
        />
        <svg v-else-if="meta.kind === 'cloud'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7 18a4 4 0 0 1-.9-7.9A5.5 5.5 0 0 1 16.9 9a4.5 4.5 0 0 1 .6 9H7Z" />
        </svg>
        <svg v-else-if="meta.kind === 'video'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="m10 9 5 3-5 3V9Z" />
        </svg>
        <svg v-else-if="meta.kind === 'image'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="m4 17 4.4-4.4a2 2 0 0 1 2.8 0L18 19" />
        </svg>
        <svg v-else-if="meta.kind === 'sheet'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18M3 14h18M9 9v11" />
        </svg>
        <svg v-else-if="meta.kind === 'slides'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M12 17v3M8.5 20h7M8 9h8M8 12h5" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
          <path d="M14 3v5h5M9 13h6M9 17h4" />
        </svg>
        <span class="file-badge">{{ meta.label }}</span>
      </div>

      <div v-if="cardTags.length" class="file-card__tags">
        <span v-for="tag in cardTags" :key="`${tag.text}-${tag.tone}`" class="micro-tag" :class="`tone-${tag.tone}`" :title="tag.text">
          {{ tag.text }}
        </span>
      </div>
    </div>

    <div class="file-card__body">
      <h3 class="file-card__title" :title="item.fileName">{{ item.fileName }}</h3>
      <p class="file-card__desc" :title="item.description || ''">{{ item.description || '点击查看资料详情' }}</p>
    </div>

    <div class="file-card__foot">
      <div class="file-card__meta">
        <span class="format-chip">{{ meta.label }}</span>
        <span class="meta-sep" aria-hidden="true">·</span>
        <span class="meta-size">{{ sizeText }}</span>
        <span class="meta-date">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M8 3v4M16 3v4M3 10h18" />
          </svg>
          <span>{{ dateText }}</span>
        </span>
      </div>
      <button
        type="button"
        class="file-download"
        :aria-label="`查看详情并下载 ${item.fileName}`"
        title="查看详情后下载"
        @click.stop="open"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 4v10" />
          <path d="m8 10 4 4 4-4" />
          <path d="M5 19h14" />
        </svg>
        <span>下载</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
.file-card {
  --tone: #64748b;
  --tone-bg: #f1f5f9;
  --tone-ring: rgba(100, 116, 139, 0.18);
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 14px;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 18px -10px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition:
    transform 0.25s cubic-bezier(0.32, 0.72, 0, 1),
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.file-card:hover {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.22);
  box-shadow:
    0 4px 12px rgba(15, 23, 42, 0.04),
    0 16px 32px -12px rgba(249, 115, 22, 0.16);
}

.file-card:active {
  transform: translateY(-1px) scale(0.997);
}

.tone-rose {
  --tone: #e11d48;
  --tone-bg: #fff1f2;
  --tone-ring: rgba(225, 29, 72, 0.18);
}

.tone-blue {
  --tone: #2563eb;
  --tone-bg: #eff6ff;
  --tone-ring: rgba(37, 99, 235, 0.18);
}

.tone-green {
  --tone: #059669;
  --tone-bg: #ecfdf5;
  --tone-ring: rgba(5, 150, 105, 0.18);
}

.tone-amber {
  --tone: #d97706;
  --tone-bg: #fffbeb;
  --tone-ring: rgba(245, 158, 11, 0.22);
}

.tone-violet {
  --tone: #7c3aed;
  --tone-bg: #f5f3ff;
  --tone-ring: rgba(124, 58, 237, 0.18);
}

.tone-slate {
  --tone: #64748b;
  --tone-bg: #f1f5f9;
  --tone-ring: rgba(100, 116, 139, 0.18);
}

.file-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.file-thumb {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: var(--tone);
  border-radius: 12px;
  background: var(--tone-bg);
  box-shadow: inset 0 0 0 1px var(--tone-ring);
}

.file-thumb > svg {
  width: 24px;
  height: 24px;
}

.file-thumb__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
}

.file-badge {
  position: absolute;
  bottom: -5px;
  left: -5px;
  padding: 1px 5px;
  color: var(--tone);
  font-size: 9px;
  font-weight: 800;
  line-height: 1.45;
  letter-spacing: 0.02em;
  border-radius: 5px;
  background: #ffffff;
  box-shadow:
    0 0 0 1px var(--tone-ring),
    0 1px 2px rgba(15, 23, 42, 0.06);
}

.file-card__tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px;
  min-width: 0;
  max-width: 62%;
}

.micro-tag {
  max-width: 100%;
  padding: 2px 7px;
  overflow: hidden;
  color: var(--tone);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 6px;
  background: var(--tone-bg);
  box-shadow: inset 0 0 0 1px var(--tone-ring);
}

.file-card__body {
  min-width: 0;
}

.file-card__title {
  overflow: hidden;
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-card__desc {
  min-height: 18px;
  margin-top: 4px;
  overflow: hidden;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.file-card__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  overflow: hidden;
  color: #94a3b8;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.format-chip {
  flex-shrink: 0;
  padding: 1px 5px;
  color: var(--tone);
  font-size: 10px;
  font-weight: 800;
  line-height: 1.5;
  border-radius: 5px;
  background: var(--tone-bg);
  box-shadow: inset 0 0 0 1px var(--tone-ring);
}

.meta-sep {
  color: #cbd5e1;
}

.meta-size {
  overflow: hidden;
  color: #64748b;
  text-overflow: ellipsis;
}

.meta-date {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 3px;
}

.meta-date svg {
  width: 11px;
  height: 11px;
}

.file-download {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 10px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(37, 99, 235, 0.28);
  border-radius: 8px;
  background: #eff6ff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-download svg {
  width: 13px;
  height: 13px;
}

.file-download:hover {
  color: #ffffff;
  border-color: #2563eb;
  background: #2563eb;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
}

.file-download:active {
  transform: translateY(1px);
}

.file-download:focus-visible {
  outline: 2px solid rgba(249, 115, 22, 0.5);
  outline-offset: 2px;
}

.file-card.is-list {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  grid-template-areas:
    'thumb body foot'
    'thumb tags foot';
  align-items: center;
  gap: 4px 12px;
  padding: 12px 14px;
  border-radius: 12px;
}

.file-card.is-list .file-card__head {
  display: contents;
}

.file-card.is-list .file-thumb {
  grid-area: thumb;
}

.file-card.is-list .file-card__tags {
  grid-area: tags;
  justify-content: flex-start;
  max-width: none;
}

.file-card.is-list .file-card__body {
  grid-area: body;
}

.file-card.is-list .file-card__desc {
  margin-top: 2px;
}

.file-card.is-list .file-card__foot {
  grid-area: foot;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}

.file-card.is-list .file-card__meta {
  justify-content: flex-end;
}

.file-card.is-list:hover {
  transform: translateX(2px);
}

.file-card.is-list:active {
  transform: translateX(1px);
}

@media (max-width: 640px) {
  .file-card.is-list {
    grid-template-columns: 44px minmax(0, 1fr);
    grid-template-areas:
      'thumb body'
      'thumb tags'
      'foot foot';
  }

  .file-card.is-list .file-card__foot {
    flex-direction: row;
    align-items: center;
    width: 100%;
    margin-top: 6px;
    padding-top: 8px;
    border-top: 1px solid #f1f5f9;
  }

  .file-card.is-list .file-card__meta {
    justify-content: flex-start;
  }
}
</style>
