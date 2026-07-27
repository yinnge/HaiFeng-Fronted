<!-- Particles - 动态粒子背景组件 -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  colors?: string[]
  quantity?: number
  minSize?: number
  maxSize?: number
  speed?: number
  interactivity?: boolean
  mouseRadius?: number
  breathIntensity?: number
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => ['#e8722a', '#f5a54a', '#bf8a30'],
  quantity: 50,
  minSize: 2,
  maxSize: 6,
  speed: 0.5,
  interactivity: true,
  mouseRadius: 120,
  breathIntensity: 0.3,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

interface Particle {
  x: number
  y: number
  size: number
  baseSize: number
  color: string
  vx: number
  vy: number
  opacity: number
  baseOpacity: number
  breathOffset: number
}

let particles: Particle[] = []
let animationId: number | null = null
let mouseX = -1000
let mouseY = -1000
let time = 0

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
}
let ripples: Ripple[] = []

const initParticles = (width: number, height: number) => {
  particles = []
  for (let i = 0; i < props.quantity; i++) {
    const size = Math.random() * (props.maxSize - props.minSize) + props.minSize
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size,
      baseSize: size,
      color: props.colors[Math.floor(Math.random() * props.colors.length)],
      vx: (Math.random() - 0.5) * props.speed,
      vy: (Math.random() - 0.5) * props.speed,
      opacity: Math.random() * 0.5 + 0.3,
      baseOpacity: Math.random() * 0.5 + 0.3,
      breathOffset: Math.random() * Math.PI * 2,
    })
  }
}

const animate = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)
  time += 0.02

  particles.forEach((p) => {
    const breathFactor = 1 + Math.sin(time + p.breathOffset) * props.breathIntensity
    p.size = p.baseSize * breathFactor
    p.opacity = p.baseOpacity * (0.7 + breathFactor * 0.3)

    if (props.interactivity && mouseX >= 0) {
      const dx = mouseX - p.x
      const dy = mouseY - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < props.mouseRadius) {
        const force = (props.mouseRadius - dist) / props.mouseRadius
        const easeForce = force * force * 0.8
        p.x -= (dx / dist) * easeForce
        p.y -= (dy / dist) * easeForce
      }
    }

    p.x += p.vx
    p.y += p.vy

    // 边界反弹
    if (p.x < 0) { p.x = 0; p.vx *= -1 }
    if (p.x > width) { p.x = width; p.vx *= -1 }
    if (p.y < 0) { p.y = 0; p.vy *= -1 }
    if (p.y > height) { p.y = height; p.vy *= -1 }

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = p.color
    ctx.globalAlpha = p.opacity
    ctx.fill()

    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
    gradient.addColorStop(0, p.color)
    gradient.addColorStop(1, 'transparent')
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.globalAlpha = p.opacity * 0.3
    ctx.fill()
  })

  ripples.forEach((ripple, index) => {
    ripple.radius += 4
    ripple.opacity -= 0.015

    if (ripple.opacity <= 0 || ripple.radius >= ripple.maxRadius) {
      ripples.splice(index, 1)
      return
    }

    ctx.beginPath()
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(232, 114, 42, ${ripple.opacity})`
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(251, 191, 36, ${ripple.opacity * 0.6})`
    ctx.lineWidth = 1.5
    ctx.stroke()
  })

  ctx.globalAlpha = 1
  animationId = requestAnimationFrame(animate)
}

const handleResize = () => {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  canvas.width = container.offsetWidth
  canvas.height = container.offsetHeight
  initParticles(canvas.width, canvas.height)
}

const handleMouseMove = (e: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const newX = e.clientX - rect.left
  const newY = e.clientY - rect.top

  const dist = Math.sqrt((newX - mouseX) ** 2 + (newY - mouseY) ** 2)
  if (dist > 30 && ripples.length < 5) {
    ripples.push({
      x: newX,
      y: newY,
      radius: 0,
      maxRadius: props.mouseRadius * 1.5,
      opacity: 0.4,
    })
  }

  mouseX = newX
  mouseY = newY
}

const handleClick = (e: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  ripples.push({
    x,
    y,
    radius: 0,
    maxRadius: props.mouseRadius * 2.5,
    opacity: 0.6,
  })
}

const handleMouseLeave = () => {
  mouseX = -1000
  mouseY = -1000
}

onMounted(() => {
  handleResize()
  animate()

  window.addEventListener('resize', handleResize)
  if (props.interactivity) {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleClick)
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('click', handleClick)
})
</script>

<template>
  <div ref="containerRef" class="absolute inset-0 overflow-hidden pointer-events-auto">
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full" />
  </div>
</template>
