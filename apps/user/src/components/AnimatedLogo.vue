<script setup lang="ts">
import { ref, onMounted } from 'vue'
import logoPng from '@/assets/images/logo-main.png'

/**
 * 动画 Logo：原 PNG + CSS 摇曳 + SVG 落叶粒子
 * 触发时机：页面刷新、鼠标 hover、点击
 */

const isPlaying = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

const play = () => {
  if (hideTimer) clearTimeout(hideTimer)
  isPlaying.value = false
  void document.body.offsetHeight
  isPlaying.value = true
  hideTimer = setTimeout(() => {
    isPlaying.value = false
  }, 3600)
}

onMounted(() => {
  setTimeout(play, 400)
})
</script>

<template>
  <div
    class="animated-logo"
    :class="{ playing: isPlaying }"
    @mouseenter="play"
    @click="play"
    aria-hidden="true"
  >
    <!-- 原 PNG logo，CSS 摇曳动画施加于此 -->
    <img :src="logoPng" class="logo-img" alt="" draggable="false" />

    <!-- 叠加在 PNG 上方的落叶粒子 -->
    <svg class="particle-layer" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <circle class="particle p1" cx="35" cy="18" r="2.2" fill="#fbbf24" />
      <circle class="particle p2" cx="52" cy="12" r="1.5" fill="#f97316" />
      <circle class="particle p3" cx="64" cy="16" r="1.8" fill="#fbbf24" />
      <circle class="particle p4" cx="28" cy="22" r="1.2" fill="#fb923c" />
      <circle class="particle p5" cx="72" cy="20" r="1.6" fill="#fbbf24" />
      <circle class="particle p6" cx="44" cy="10" r="2.0" fill="#f59e0b" />
      <circle class="particle p7" cx="58" cy="24" r="1.3" fill="#fbbf24" />
      <circle class="particle p8" cx="32" cy="14" r="1.7" fill="#fb923c" />
      <circle class="particle p9" cx="68" cy="10" r="1.4" fill="#fbbf24" />
      <circle class="particle p10" cx="48" cy="20" r="1.9" fill="#f59e0b" />
      <circle class="particle p11" cx="24" cy="18" r="1.1" fill="#fbbf24" />
      <circle class="particle p12" cx="76" cy="14" r="1.5" fill="#fb923c" />
    </svg>
  </div>
</template>

<style scoped>
.animated-logo {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}

/* ====== 原 PNG ====== */
.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform-origin: 50% 75%; /* 叶柄附近，让摇曳更自然 */
  transition: transform 0.3s ease;
}

/* .playing 时 PNG 摇曳 */
.playing .logo-img {
  animation: leaf-sway 3.2s cubic-bezier(0.32, 0.72, 0, 1) 1;
}

@keyframes leaf-sway {
  0%   { transform: rotate(0deg) skewX(0deg); }
  12%  { transform: rotate(-3.5deg) skewX(-1.2deg); }
  28%  { transform: rotate(3deg) skewX(1deg); }
  45%  { transform: rotate(-2.5deg) skewX(-0.8deg); }
  62%  { transform: rotate(2deg) skewX(0.6deg); }
  80%  { transform: rotate(-1deg) skewX(-0.2deg); }
  100% { transform: rotate(0deg) skewX(0deg); }
}

/* ====== 粒子层：覆盖在 PNG 上 ====== */
.particle-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* ====== 粒子：默认隐藏，.playing 时飘落 ====== */
.particle {
  opacity: 0;
}

.playing .particle {
  animation-fill-mode: forwards;
}

.playing .p1  { animation: fall 3.0s ease-in 0.0s 1 forwards; }
.playing .p2  { animation: fall 2.6s ease-in 0.12s 1 forwards; }
.playing .p3  { animation: fall 3.3s ease-in 0.25s 1 forwards; }
.playing .p4  { animation: fall 2.4s ease-in 0.38s 1 forwards; }
.playing .p5  { animation: fall 3.5s ease-in 0.08s 1 forwards; }
.playing .p6  { animation: fall 2.8s ease-in 0.45s 1 forwards; }
.playing .p7  { animation: fall 2.7s ease-in 0.18s 1 forwards; }
.playing .p8  { animation: fall 3.1s ease-in 0.32s 1 forwards; }
.playing .p9  { animation: fall 3.4s ease-in 0.5s 1 forwards; }
.playing .p10 { animation: fall 2.5s ease-in 0.05s 1 forwards; }
.playing .p11 { animation: fall 2.9s ease-in 0.42s 1 forwards; }
.playing .p12 { animation: fall 3.2s ease-in 0.28s 1 forwards; }

@keyframes fall {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) scale(1);
  }
  8% {
    opacity: 0.95;
  }
  40% {
    opacity: 0.7;
    transform: translateY(22px) translateX(3px) scale(0.88);
  }
  70% {
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: translateY(55px) translateX(-3px) scale(0.35);
  }
}
</style>
