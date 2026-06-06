<!-- apps/admin/src/views/login/components/DynamicBackground.vue -->
<script setup lang="ts">
// 动态背景图案组件
// 红黄蓝圆点 + 虚线连接 + 动画效果
</script>

<template>
  <svg class="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <!-- 左上区域 -->
    <circle cx="8%" cy="15%" r="8" fill="#e53935" opacity="0.7" class="animate-float-1" />
    <circle cx="15%" cy="28%" r="4" fill="#333" opacity="0.2" class="animate-float-2" />
    <line x1="8%" y1="15%" x2="15%" y2="28%" stroke="#eee" stroke-width="1" stroke-dasharray="4,4" />

    <!-- 左中区域 -->
    <circle cx="5%" cy="50%" r="10" fill="#ffc107" opacity="0.6" class="animate-float-3" />
    <circle cx="12%" cy="62%" r="5" fill="#1e88e5" opacity="0.5" class="animate-float-1" />
    <text x="18%" y="45%" fill="#ddd" font-size="14" class="animate-float-2">+</text>

    <!-- 左下区域 -->
    <circle cx="10%" cy="82%" r="6" fill="#1e88e5" opacity="0.6" class="animate-float-2" />
    <circle cx="3%" cy="75%" r="4" fill="none" stroke="#ddd" stroke-width="1" class="animate-float-3" />

    <!-- 右上区域 -->
    <circle cx="92%" cy="12%" r="9" fill="#ffc107" opacity="0.7" class="animate-float-2" />
    <circle cx="85%" cy="22%" r="5" fill="#333" opacity="0.2" class="animate-float-1" />
    <line x1="92%" y1="12%" x2="85%" y2="22%" stroke="#eee" stroke-width="1" stroke-dasharray="4,4" />
    <text x="88%" y="8%" fill="#ddd" font-size="14" class="animate-float-3">+</text>

    <!-- 右中区域 -->
    <circle cx="95%" cy="48%" r="6" fill="#e53935" opacity="0.5" class="animate-float-1" />
    <circle cx="88%" cy="58%" r="4" fill="none" stroke="#ddd" stroke-width="1" class="animate-float-2" />

    <!-- 右下区域 -->
    <circle cx="90%" cy="85%" r="11" fill="#1e88e5" opacity="0.6" class="animate-float-3" />
    <circle cx="95%" cy="75%" r="5" fill="#ffc107" opacity="0.5" class="animate-float-1" />
    <line x1="90%" y1="85%" x2="95%" y2="75%" stroke="#eee" stroke-width="1" stroke-dasharray="4,4" />
    <text x="82%" y="80%" fill="#ddd" font-size="14" class="animate-float-2">+</text>
  </svg>
</template>

<style scoped>
@keyframes float-1 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes float-2 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

@keyframes float-3 {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

.animate-float-1 {
  animation: float-1 4s ease-in-out infinite;
}

.animate-float-2 {
  animation: float-2 5s ease-in-out infinite;
}

.animate-float-3 {
  animation: float-3 6s ease-in-out infinite;
}
</style>
