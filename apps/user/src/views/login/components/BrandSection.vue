<script setup lang="ts">
import logoImage from '@/assets/images/logo-main.png'
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 brand-content">
    <div class="relative mb-4">
      <div class="absolute inset-0 scale-[2] logo-glow rounded-full blur-3xl" />
      <div class="logo-wrapper relative">
        <img
          :src="logoImage"
          alt="海枫未来规划院"
          class="logo-image w-full h-full object-contain"
        />
      </div>
    </div>

    <h1 class="brand-title text-5xl lg:text-6xl font-bold mb-6 tracking-[0.1em]">
      海枫未来规划院
    </h1>

    <div class="flex flex-wrap items-center justify-center gap-3 lg:gap-5">
      <div class="feature-tag">
        <span class="feature-icon">📖</span>
        <span>高中生志愿填报指南</span>
      </div>
      <span class="text-brand-gold/30 hidden lg:inline text-xl">|</span>
      <div class="feature-tag">
        <span class="feature-icon">🎓</span>
        <span>大学/考公/考研规划</span>
      </div>
      <span class="text-brand-gold/30 hidden lg:inline text-xl">|</span>
      <div class="feature-tag">
        <span class="feature-icon">👤</span>
        <span>未来就业辅导</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.brand-content {
  transform: translateY(clamp(-100px, -5vh, -50px));
}

.logo-wrapper {
  position: relative;
  width: clamp(280px, 25vw, 450px);
  height: clamp(280px, 25vw, 450px);
}

.logo-glow {
  background: radial-gradient(
    ellipse 120% 120% at -20% -20%,
    rgba(245, 165, 74, 0.2) 0%,
    rgba(251, 191, 36, 0.12) 40%,
    rgba(254, 243, 226, 0.06) 70%,
    transparent 100%
  );
}

.logo-image {
  filter: drop-shadow(0 12px 30px rgba(232, 114, 42, 0.2));
}

.brand-title {
  background: linear-gradient(
    135deg,
    #dc2626 0%,
    #e8722a 25%,
    #f5a54a 50%,
    #fbbf24 75%,
    #f5a54a 100%
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 4s ease infinite;
  text-shadow: none;
  filter: drop-shadow(0 2px 8px rgba(232, 114, 42, 0.4));
}

@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% center;
  }
  50% {
    background-position: 100% center;
  }
}

.feature-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(254, 247, 237, 0.7));
  border-radius: 9999px;
  border: 1px solid rgba(232, 114, 42, 0.2);
  color: #52525b;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(232, 114, 42, 0.1);
}

.feature-tag:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(254, 247, 237, 0.9));
  border-color: rgba(232, 114, 42, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(232, 114, 42, 0.2);
}

.feature-icon {
  font-size: 1rem;
}
</style>
