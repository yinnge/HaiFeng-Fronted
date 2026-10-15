<script setup lang="ts">
/**
 * 富文本编辑器（wangEditor v5 封装，锁定 @wangeditor/editor@5.1.23）
 * - v-model 输出 HTML 字符串（空内容归一为 ''）
 * - 排除视频组与本地图片上传（暂无图片上传接口，可用「网络图片」按 URL 插入）
 * - 长什么样由展示端说了算：正文展示统一走 .article-content（assets/styles/article-content.css）
 * 注意：组件不做外部 modelValue 回写同步。父组件应在数据就绪后再渲染本组件
 * （表单弹窗内已用 v-if 保证每次打开都携带最新 content 重新挂载）。
 */
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { createEditor, createToolbar } from '@wangeditor/editor'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    height?: number
  }>(),
  {
    placeholder: '请输入正文内容，支持标题/加粗/表格/引用等…',
    height: 420,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const toolbarRef = ref<HTMLDivElement | null>(null)
let editor: IDomEditor | null = null

const editorConfig: Partial<IEditorConfig> = {
  placeholder: props.placeholder,
  onChange(ed: IDomEditor) {
    emit('update:modelValue', ed.isEmpty() ? '' : ed.getHtml())
  },
}

onMounted(() => {
  if (!editorRef.value || !toolbarRef.value) return
  editor = createEditor({
    selector: editorRef.value,
    html: props.modelValue || '<p><br></p>',
    config: editorConfig,
    mode: 'default',
  })
  createToolbar({
    editor,
    selector: toolbarRef.value,
    mode: 'default',
    config: {
      // 排除视频组与本地图片上传（无上传接口）；保留「网络图片」插入
      excludeKeys: ['group-video', 'uploadImage'],
    } as Partial<IToolbarConfig>,
  })
})

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})
</script>

<template>
  <div class="rich-editor">
    <div ref="toolbarRef" class="rich-editor-toolbar"></div>
    <div ref="editorRef" class="rich-editor-body" :style="{ height: `${height}px` }"></div>
  </div>
</template>

<style scoped>
/* 不加 overflow:hidden，避免裁剪工具栏下拉面板 */
.rich-editor {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  z-index: 1;
}

.rich-editor-toolbar {
  border-bottom: 1px solid #f3f4f6;
  background: #fffbf5;
  border-radius: 9px 9px 0 0;
}

.rich-editor-body {
  overflow-y: auto;
  border-radius: 0 0 9px 9px;
}
</style>
