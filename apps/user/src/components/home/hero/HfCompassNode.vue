<script setup lang="ts">
import { type Component } from 'vue'
import {
  School,
  Target,
  Languages,
  GraduationCap,
  FlaskConical,
  Briefcase,
  ChevronRight,
  ArrowDown,
} from 'lucide-vue-next'
import type { HeroModule } from './hero.config'

defineProps<{
  module: HeroModule
  styleObj: Record<string, string>
  isActive: boolean
  label: string
  tabIndex: number
}>()

defineEmits<{
  enter: []
  leave: []
  click: []
}>()

const MODULE_ICONS: Record<string, Component> = {
  School,
  Target,
  Languages,
  GraduationCap,
  FlaskConical,
  Briefcase,
}
</script>

<template>
  <button
    type="button"
    class="hf-node"
    :class="['hf-node--' + module.key, { 'is-active': isActive }]"
    :style="styleObj"
    :aria-expanded="module.type === 'multi' ? isActive : undefined"
    :aria-label="label"
    :tabindex="tabIndex"
    @mouseenter="$emit('enter')"
    @mouseleave="$emit('leave')"
    @click="$emit('click')"
  >
    <span class="hf-node-inner">
      <span class="hf-node-icon" :style="{ background: module.color.bg }">
        <component
          :is="MODULE_ICONS[module.iconName]"
          :size="20"
          :stroke-width="1.75"
          :style="{ color: module.color.solid }"
        />
      </span>
      <span class="hf-node-body">
        <span class="hf-node-title">{{ module.name }}</span>
        <span class="hf-node-sub" :title="module.subtitle">{{ module.subtitle }}</span>
      </span>
      <span class="hf-node-arrow">
        <ArrowDown v-if="module.type === 'single'" :size="14" :stroke-width="2" />
        <ChevronRight v-else :size="14" :stroke-width="2" />
      </span>
      <span v-if="module.type === 'multi'" class="hf-node-badge">{{ module.columns.length }}</span>
      <span v-if="module.key === 'gaokao'" class="hf-node-hot">热门</span>
    </span>
  </button>
</template>

<style scoped>
.hf-node {
  position: absolute;
  z-index: 3;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}
.hf-node-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 168px;
  height: 64px;
  padding: 0 12px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 8px 24px -4px rgba(15, 23, 42, 0.08);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.hf-node:hover .hf-node-inner {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.22);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.03),
    0 14px 28px -6px rgba(15, 23, 42, 0.12);
}
.hf-node:focus-visible {
  outline: none;
}
.hf-node:focus-visible .hf-node-inner {
  border-color: rgba(249, 115, 22, 0.5);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.18);
}
.hf-node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 12px;
}
.hf-node-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}
.hf-node-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  text-align: left;
}
.hf-node-sub {
  font-size: 11.5px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hf-node-arrow {
  flex-shrink: 0;
  color: #334155;
  transition: color 0.2s ease, transform 0.2s ease;
}
.hf-node:hover .hf-node-arrow {
  color: #ea580c;
  transform: translateX(2px);
}
.hf-node-badge {
  position: absolute;
  top: -6px;
  left: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: var(--m-color, #f97316);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}
.hf-node-hot {
  position: absolute;
  top: -8px;
  right: -6px;
  padding: 1px 7px;
  border-radius: 9999px;
  background: #e11d48;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
  box-shadow: 0 2px 6px rgba(225, 29, 72, 0.3);
}
.hf-node--gaokao {
  --m-color: #f97316;
}
.hf-node--junior-senior {
  --m-color: #2563eb;
}
.hf-node--english {
  --m-color: #0891b2;
}
.hf-node--university {
  --m-color: #059669;
}
.hf-node--postgrad {
  --m-color: #d97706;
}
.hf-node--civil-career {
  --m-color: #e11d48;
}
</style>
