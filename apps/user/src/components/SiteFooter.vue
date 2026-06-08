<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElDialog, ElMessage } from 'element-plus'
import { getSiteInfo } from '@/api/home'
import type { SiteInfoVO } from '@/types/home'
import logoMain from '@/assets/images/logo-main.png'

const siteInfo = ref<SiteInfoVO | null>(null)
const loading = ref(false)
const showWechatDialog = ref(false)

const mockSiteInfo: SiteInfoVO = {
  siteIcp: '晋ICP备12345678号 | 公安备案号：晋公网安备11010802012345号',
  contactUrl: {
    wechat: 'https://via.placeholder.com/200x200?text=WeChat+QR',
    weibo: 'https://weibo.com/haifeng',
    zhihu: 'https://zhihu.com/org/haifeng',
    douyin: 'https://douyin.com/haifeng',
    bilibili: 'https://space.bilibili.com/123456'
  },
  basicMessage: {
    address: '山西省临汾市尧都区木材巷四通小院',
    phone: '13303575004',
    email: 'contact@haifengfuture.com',
    consultationTime: '周一至周五 9:00-18:00'
  }
}

siteInfo.value = mockSiteInfo

const fetchSiteInfo = async () => {
  loading.value = true
  try {
    const { data } = await getSiteInfo()
    if (data.code === 200) {
      siteInfo.value = data.data
    }
  } catch {
    console.warn('使用Mock数据')
  } finally {
    loading.value = false
  }
}

interface StatConfig {
  label: string
  target: number
  display: (v: number) => string
  color: string
}

const stats: StatConfig[] = [
  { label: '服务学生', target: 10, display: v => `${v}W+`, color: '#e8722a' },
  { label: '院校库', target: 2800, display: v => `${v}+`, color: '#f5a54a' },
  { label: '满意度', target: 986, display: v => `${(v / 10).toFixed(1)}%`, color: '#fbbf24' },
  { label: '专业顾问', target: 500, display: v => `${v}+`, color: '#e8722a' },
]

const currentValues = ref<number[]>(stats.map(() => 0))
const hasAnimated = ref(false)

let animationFrameId: number | null = null

const animateStats = () => {
  if (hasAnimated.value) return
  hasAnimated.value = true

  const startTime = performance.now()
  const duration = 1800

  const step = (timestamp: number) => {
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - (1 - progress) * (1 - progress)

    stats.forEach((stat, i) => {
      currentValues.value[i] = Math.round(eased * stat.target)
    })

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step)
    } else {
      stats.forEach((stat, i) => {
        currentValues.value[i] = stat.target
      })
    }
  }

  animationFrameId = requestAnimationFrame(step)
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  fetchSiteInfo()

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats()
      }
    })
  }, { threshold: 0.3 })

  const el = document.querySelector('.stats-section')
  if (el) observer.observe(el)
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (observer) observer.disconnect()
})

const handleWechatClick = () => {
  showWechatDialog.value = true
}

const handleSocialClick = (url: string, name: string) => {
  if (!url) {
    ElMessage.info(`${name}链接暂未配置`)
    return
  }
  window.open(url, '_blank')
}
</script>

<template>
  <footer class="site-footer">
    <div class="warm-gradient-bg" />

    <div class="stats-section">
      <div class="stats-container">
        <div
          v-for="(stat, index) in stats"
          :key="stat.label"
          class="stat-item"
        >
          <div
            class="stat-value"
            :style="{ color: stat.color }"
          >
            {{ stat.display(currentValues[index]) }}
          </div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <div class="footer-main">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="brand-header">
            <img
              :src="logoMain"
              alt="海枫未来规划院"
              class="brand-logo"
            />
            <h3 class="brand-name">海枫未来规划院</h3>
          </div>
          <p class="brand-desc">
            我们致力于为学生和求职者提供专业、科学、个性化的学业与职业信息服务，帮助他们在人生关键节点做出明智决策参考。
          </p>
          <p class="brand-desc">
            从高考志愿到职场上岸，我们全程陪伴，助力每一位用户实现人生理想。
          </p>
        </div>

        <div class="footer-social">
          <div class="social-icons">
            <button
              class="social-icon wechat"
              title="微信公众号"
              @click="handleWechatClick"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.133 0 .24-.112.24-.246 0-.06-.025-.12-.04-.177l-.324-1.23a.493.493 0 0 1 .177-.554C23.017 18.461 24 16.731 24 14.85c0-3.344-3.237-5.993-7.063-5.993zm-2.888 3.098c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.97-.983zm4.844 0c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.969-.983z"/>
              </svg>
            </button>

            <button
              class="social-icon weibo"
              title="微博"
              @click="handleSocialClick(siteInfo?.contactUrl?.weibo || '', '微博')"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.254.241.085.327.357.194.587zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.402-.649.386-1.014.425-1.888.003-2.508-.789-1.165-2.952-1.102-5.427-.033 0 0-.778.34-.579-.275.382-1.21.324-2.222-.27-2.807-1.349-1.331-4.933.047-8.007 3.078C1.366 10.442 0 12.583 0 14.419c0 3.52 4.503 5.662 8.909 5.662 5.777 0 9.619-3.356 9.619-6.025 0-1.612-1.357-2.525-2.469-2.407zm3.282-4.474c-1.04-1.134-2.562-1.579-3.99-1.296-.346.069-.569.411-.5.761.069.357.413.566.762.503 1.044-.207 2.149.117 2.913.948.765.831 1.013 1.963.721 2.977-.107.358.093.734.447.839.353.106.725-.094.833-.449.4-1.389.061-2.944-.988-4.086l.002.003zm1.874-2.199c-1.873-2.041-4.631-2.851-7.2-2.339-.466.092-.768.546-.677 1.014.091.47.545.767 1.011.679 1.983-.394 4.116.23 5.559 1.807 1.445 1.575 1.879 3.754 1.328 5.694-.128.454.138.928.593 1.056.456.13.927-.139 1.054-.593.718-2.524.156-5.348-1.668-7.318z"/>
              </svg>
            </button>

            <button
              class="social-icon zhihu"
              title="知乎"
              @click="handleSocialClick(siteInfo?.contactUrl?.zhihu || '', '知乎')"
            >
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" fill="#0084ff"/>
                <text x="12" y="16" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">知</text>
              </svg>
            </button>

            <button
              class="social-icon douyin"
              title="抖音"
              @click="handleSocialClick(siteInfo?.contactUrl?.douyin || '', '抖音')"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </button>

            <button
              class="social-icon bilibili"
              title="哔哩哔哩"
              @click="handleSocialClick(siteInfo?.contactUrl?.bilibili || '', 'B站')"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.659.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="footer-contact">
          <h4 class="contact-title">联系我们</h4>
          <ul class="contact-list">
            <li class="contact-item">
              <span class="contact-icon location">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </span>
              <span class="contact-text">{{ siteInfo?.basicMessage?.address || '地址加载中...' }}</span>
            </li>
            <li class="contact-item">
              <span class="contact-icon phone">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </span>
              <span class="contact-text">咨询热线：{{ siteInfo?.basicMessage?.phone || '加载中...' }}</span>
            </li>
            <li class="contact-item">
              <span class="contact-icon email">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </span>
              <span class="contact-text">邮箱：{{ siteInfo?.basicMessage?.email || '加载中...' }}</span>
            </li>
            <li class="contact-item">
              <span class="contact-icon time">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              </span>
              <span class="contact-text">咨询时间：{{ siteInfo?.basicMessage?.consultationTime || '加载中...' }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="copyright">© 2026 海枫未来规划院 版权所有</p>
      <p class="icp">ICP备案号：{{ siteInfo?.siteIcp || '加载中...' }}</p>
    </div>

    <ElDialog
      v-model="showWechatDialog"
      title="关注微信公众号"
      width="360px"
      :show-close="true"
      center
      class="wechat-dialog"
    >
      <div class="wechat-qrcode-container">
        <img
          v-if="siteInfo?.contactUrl?.wechat"
          :src="siteInfo.contactUrl.wechat"
          alt="微信公众号二维码"
          class="wechat-qrcode"
        />
        <div v-else class="qrcode-placeholder">
          <p>二维码加载中...</p>
        </div>
        <p class="qrcode-tip">扫描二维码关注公众号</p>
      </div>
    </ElDialog>
  </footer>
</template>

<style scoped>
.site-footer {
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

.warm-gradient-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-color: #fef7ed;
  background:
    radial-gradient(ellipse 50% 35% at 0% 100%, rgba(232, 114, 42, 0.18) 0%, rgba(245, 165, 74, 0.1) 50%, transparent 100%),
    radial-gradient(ellipse 70% 60% at 5% 95%, rgba(245, 165, 74, 0.12) 0%, rgba(251, 191, 36, 0.06) 40%, transparent 80%),
    radial-gradient(ellipse 40% 50% at 100% 90%, rgba(251, 191, 36, 0.08) 0%, transparent 70%),
    linear-gradient(to bottom, #fef7ed 0%, #fef3e2 30%, #fefbf6 60%, #ffffff 100%);
}

.stats-section {
  padding: 48px 24px 40px;
  position: relative;
}

.stats-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 900px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 114, 42, 0.2), rgba(251, 191, 36, 0.2), transparent);
}

.stats-container {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 42px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
  transition: color 0.3s;
}

.stat-label {
  font-size: 15px;
  color: #6b7280;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.footer-main {
  padding: 48px 24px 32px;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(300px, 1fr) auto minmax(260px, 1fr);
  gap: 60px;
  align-items: start;
}

.footer-brand {
  max-width: 360px;
  justify-self: start;
}

.footer-contact {
  justify-self: end;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.brand-logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.brand-name {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  letter-spacing: 0.5px;
}

.brand-desc {
  font-size: 14px;
  line-height: 1.75;
  color: #6b7280;
  margin: 0 0 12px;
}

.footer-social {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
}

.social-icons {
  display: flex;
  gap: 20px;
}

.social-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
}

.social-icon svg {
  width: 36px;
  height: 36px;
}

.social-icon:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.social-icon.wechat {
  color: #07c160;
  border-color: rgba(7, 193, 96, 0.25);
}

.social-icon.wechat:hover {
  background: #07c160;
  color: #ffffff;
  border-color: #07c160;
}

.social-icon.weibo {
  color: #e6162d;
  border-color: rgba(230, 22, 45, 0.25);
}

.social-icon.weibo:hover {
  background: #e6162d;
  color: #ffffff;
  border-color: #e6162d;
}

.social-icon.zhihu {
  border-color: rgba(0, 132, 255, 0.25);
}

.social-icon.zhihu:hover {
  background: #0084ff;
  border-color: #0084ff;
}

.social-icon.douyin {
  color: #111111;
  border-color: rgba(0, 0, 0, 0.15);
}

.social-icon.douyin:hover {
  background: linear-gradient(135deg, #25f4ee 0%, #fe2c55 50%, #000000 100%);
  color: #ffffff;
  border-color: transparent;
}

.social-icon.bilibili {
  color: #fb7299;
  border-color: rgba(251, 114, 153, 0.25);
}

.social-icon.bilibili:hover {
  background: #fb7299;
  color: #ffffff;
  border-color: #fb7299;
}

.footer-contact {
  min-width: 280px;
}

.contact-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px;
  position: relative;
  padding-left: 16px;
}

.contact-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #ff9f43 0%, #ff6b35 100%);
  border-radius: 2px;
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 14px;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.contact-icon svg {
  width: 18px;
  height: 18px;
}

.contact-icon.location {
  color: #ff9f43;
}

.contact-icon.phone {
  color: #ff6b35;
}

.contact-icon.email {
  color: #ffc107;
}

.contact-icon.time {
  color: #ff9f43;
}

.contact-text {
  color: #6b7280;
  line-height: 1.6;
}

.footer-bottom {
  border-top: 1px solid rgba(232, 114, 42, 0.12);
  padding: 20px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
}

.copyright {
  font-size: 14px;
  color: #9ca3af;
  margin: 0 0 8px;
}

.icp {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

.wechat-qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.wechat-qrcode {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #eee;
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  color: #999;
}

.qrcode-tip {
  margin-top: 16px;
  color: #666;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .stats-container {
    gap: 24px;
  }

  .stat-value {
    font-size: 36px;
  }

  .footer-container {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }

  .footer-brand {
    max-width: 100%;
  }

  .brand-header {
    justify-content: center;
  }

  .footer-social {
    order: -1;
  }

  .social-icons {
    justify-content: center;
  }

  .footer-contact {
    min-width: auto;
  }

  .footer-brand {
    justify-self: center;
  }

  .footer-contact {
    justify-self: center;
  }

  .contact-title {
    padding-left: 0;
    text-align: center;
  }

  .contact-title::before {
    display: none;
  }

  .contact-item {
    justify-content: center;
    text-align: left;
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px 20px;
  }

  .stat-value {
    font-size: 32px;
  }
}

@media (max-width: 640px) {
  .stats-section {
    padding: 36px 16px 32px;
  }

  .footer-main {
    padding: 36px 16px 24px;
  }

  .stats-container {
    gap: 24px 16px;
  }

  .stat-value {
    font-size: 28px;
  }

  .stat-label {
    font-size: 13px;
  }

  .social-icons {
    gap: 16px;
  }

  .social-icon {
    width: 52px;
    height: 52px;
  }

  .social-icon svg {
    width: 26px;
    height: 26px;
  }

  .brand-name {
    font-size: 20px;
  }

  .contact-title {
    font-size: 16px;
  }
}
</style>

<style>
.wechat-dialog .el-dialog__header {
  background: linear-gradient(135deg, #07c160 0%, #05a34c 100%);
  margin-right: 0;
  padding: 16px 20px;
  border-radius: 8px 8px 0 0;
}

.wechat-dialog .el-dialog__title {
  color: #ffffff !important;
  font-weight: 600;
}

.wechat-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #ffffff;
}

.wechat-dialog .el-dialog__body {
  padding: 0;
}

.wechat-dialog .el-dialog {
  border-radius: 8px;
  overflow: hidden;
}
</style>
