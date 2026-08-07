<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import lottie, { type AnimationItem } from 'lottie-web'

const props = withDefaults(
  defineProps<{
    path: string
    loop?: boolean
    autoplay?: boolean
  }>(),
  {
    loop: true,
    autoplay: true,
  }
)

const container = ref<HTMLDivElement>()
let anim: AnimationItem | null = null

function loadAnimation() {
  if (!container.value) return
  anim?.destroy()
  anim = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: props.loop,
    autoplay: props.autoplay,
    path: props.path,
  })
}

onMounted(loadAnimation)

onBeforeUnmount(() => {
  anim?.destroy()
  anim = null
})

watch(() => props.path, loadAnimation)
</script>

<template>
  <div ref="container" class="lottie-player" />
</template>

<style scoped>
.lottie-player {
  width: 100%;
  height: 100%;
}
.lottie-player :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
