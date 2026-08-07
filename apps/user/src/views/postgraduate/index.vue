<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

interface StageItem {
  tag: string
  emoji: string
  title: string
  desc: string
  btn: string
  route?: string
  developing?: boolean
}

// 研究生阶段导航（研一 / 研二 / 研三 / 申博）
const stages: StageItem[] = [
  {
    tag: '基础阶段',
    emoji: '📅',
    title: '研一信息',
    desc: '研究生一年级学习规划、课程选择、导师沟通、学术入门指导，帮助您顺利适应研究生生活。',
    btn: '进入研一专区',
    route: '/postgraduate/first-year',
  },
  {
    tag: '研究阶段',
    emoji: '🧪',
    title: '研二信息',
    desc: '研究生二年级科研指导、论文撰写、学术发表、实验设计，助力您深入学术研究。',
    btn: '进入研二专区',
    route: '/postgraduate/second-year',
  },
  {
    tag: '毕业阶段',
    emoji: '🎓',
    title: '研三信息',
    desc: '研究生三年级毕业论文、答辩准备、职业规划、就业指导，助您顺利毕业并规划未来。',
    btn: '进入研三专区',
    route: '/postgraduate/third-year',
  },
  {
    tag: '深造阶段',
    emoji: '🩺',
    title: '申博信息',
    desc: '博士申请全流程指导、院校选择、导师联系、研究计划撰写，助您成功申博。',
    btn: '进入申博专区',
    route: '/postgraduate/phd',
  },
]

interface ModuleItem {
  emoji: string
  title: string
  desc: string
  features: string[]
  btn: string
  route?: string
  developing?: boolean
}

// 研究生核心模块（英语四六级 → 开发中；学术资料 → /resource；高层次就业 → /employment/civil）
const modules: ModuleItem[] = [
  {
    emoji: '🗣️',
    title: '英语四六级',
    desc: '提供英语四六级备考策略和学术英语能力提升方案，助力您的学术研究与国际交流。',
    features: ['英语四六级高效备考方案', '学术英语写作指导', '国际会议演讲技巧', '学术论文英文润色'],
    btn: '进入英语四六级专区',
    developing: true,
  },
  {
    emoji: '📄',
    title: '学术资料',
    desc: '汇集各学科核心学术资源、研究方法和论文写作指南，为您的学术研究提供强大支持。',
    features: ['各学科核心文献库', '研究方法与工具指南', '学术论文写作模板', '期刊投稿与发表指导'],
    btn: '进入学习资料库',
    route: '/resource',
  },
  {
    emoji: '💼',
    title: '高层次就业方向',
    desc: '为研究生提供多元化的高层次就业选择与发展路径，包括高校、科研机构、知名企业等。',
    features: ['高校教师招聘信息', '博士后申请指南', '央企/国企高层次岗位', '知名企业研发中心'],
    btn: '查看就业方向',
    route: '/employment/civil',
  },
]

function go(item: StageItem | ModuleItem) {
  if (item.developing) {
    ElMessage.info('该功能正在开发中')
    return
  }
  if (item.route) {
    router.push(item.route)
  }
}
</script>

<template>
  <div class="pg-page">
    <!-- Hero -->
    <section class="pg-hero">
      <div class="pg-hero-badge">Postgraduate · 研究生专栏</div>
      <h1 class="pg-hero-title">研究生学业与职业发展专栏</h1>
      <p class="pg-hero-desc">
        为硕士研究生和博士研究生提供全方位的学术指导、科研支持与职业规划服务，
        帮助您在研究生阶段实现学术突破与职业发展的双赢。
      </p>
      <div class="pg-stats">
        <div class="pg-stat">
          <div class="pg-stat-num">15,000+</div>
          <div class="pg-stat-label">研究生用户</div>
        </div>
        <div class="pg-stat">
          <div class="pg-stat-num">92%</div>
          <div class="pg-stat-label">申博成功率</div>
        </div>
        <div class="pg-stat">
          <div class="pg-stat-num">500+</div>
          <div class="pg-stat-label">合作院校</div>
        </div>
        <div class="pg-stat">
          <div class="pg-stat-num">3,200+</div>
          <div class="pg-stat-label">学术资源</div>
        </div>
      </div>
    </section>

    <!-- 研究生阶段导航 -->
    <section class="pg-section">
      <div class="pg-section-head">
        <h2 class="pg-section-title">研究生阶段导航</h2>
        <p class="pg-section-sub">选择您当前的研究生阶段，获取针对性指导</p>
      </div>
      <div class="pg-stage-grid">
        <article
          v-for="s in stages"
          :key="s.title"
          class="pg-card pg-stage-card"
          @click="go(s)"
        >
          <span class="pg-stage-tag">{{ s.tag }}</span>
          <div class="pg-stage-emoji">{{ s.emoji }}</div>
          <h3 class="pg-stage-title">{{ s.title }}</h3>
          <p class="pg-stage-desc">{{ s.desc }}</p>
          <span class="pg-btn">{{ s.btn }}</span>
        </article>
      </div>
    </section>

    <!-- 研究生核心模块 -->
    <section class="pg-section">
      <div class="pg-section-head">
        <h2 class="pg-section-title">研究生核心模块</h2>
        <p class="pg-section-sub">全方位支持您的研究生学业与职业发展</p>
      </div>
      <div class="pg-module-grid">
        <article v-for="m in modules" :key="m.title" class="pg-card pg-module-card" @click="go(m)">
          <div class="pg-module-head">
            <span class="pg-module-emoji">{{ m.emoji }}</span>
            <h3 class="pg-module-title">{{ m.title }}</h3>
          </div>
          <p class="pg-module-desc">{{ m.desc }}</p>
          <ul class="pg-module-features">
            <li v-for="f in m.features" :key="f">
              <svg viewBox="0 0 20 20" fill="currentColor" class="pg-check">
                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
              </svg>
              {{ f }}
            </li>
          </ul>
          <span class="pg-btn pg-btn-block">{{ m.btn }}</span>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pg-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
}

/* ---------- Hero ---------- */
.pg-hero {
  text-align: center;
  padding: 3.5rem 1.5rem;
  border-radius: 1.5rem;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.92), rgba(255, 247, 237, 0.92));
  border: 1px solid rgba(249, 115, 22, 0.18);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 10px 40px rgba(249, 115, 22, 0.1);
}

.pg-hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 1rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #e8722a;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.25);
  letter-spacing: 1px;
}

.pg-hero-title {
  margin-top: 1.25rem;
  font-size: clamp(1.6rem, 2.6vw, 2.6rem);
  font-weight: 800;
  color: #1f2937;
  letter-spacing: 1px;
  line-height: 1.3;
}

.pg-hero-desc {
  max-width: 780px;
  margin: 1rem auto 0;
  font-size: 1rem;
  line-height: 1.9;
  color: #6b7280;
}

.pg-stats {
  display: flex;
  justify-content: center;
  gap: 1rem 3rem;
  flex-wrap: wrap;
  margin-top: 2.5rem;
}

.pg-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pg-stat-num {
  font-size: clamp(1.6rem, 2.4vw, 2.4rem);
  font-weight: 900;
  background: linear-gradient(135deg, #f97316, #fb923c);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: #f97316;
}

.pg-stat-label {
  margin-top: 0.35rem;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

/* ---------- Section ---------- */
.pg-section {
  margin-top: 3rem;
}

.pg-section-head {
  margin-bottom: 1.5rem;
}

.pg-section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  position: relative;
  padding-left: 0.875rem;
}

.pg-section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 1.25rem;
  border-radius: 2px;
  background: linear-gradient(180deg, #f97316, #fb923c);
}

.pg-section-sub {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  color: #6b7280;
}

/* ---------- Cards ---------- */
.pg-card {
  background: #ffffff;
  border-radius: 1rem;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
  transition: all 0.25s ease;
  cursor: pointer;
}

.pg-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.14);
  border-color: rgba(249, 115, 22, 0.35);
}

/* 阶段卡片 */
.pg-stage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.pg-stage-card {
  position: relative;
  padding: 2rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pg-stage-tag {
  position: absolute;
  top: 0.9rem;
  right: 0.9rem;
  padding: 0.2rem 0.7rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #e8722a;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.25);
}

.pg-stage-emoji {
  font-size: 2.8rem;
  line-height: 1;
  margin-bottom: 0.75rem;
}

.pg-stage-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 1px;
}

.pg-stage-desc {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  line-height: 1.75;
  color: #6b7280;
  flex-grow: 1;
}

/* 按钮 */
.pg-btn {
  margin-top: 1.25rem;
  display: inline-block;
  padding: 0.6rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(90deg, #f97316, #fb923c);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.28);
  transition: all 0.2s ease;
}

.pg-btn:hover {
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
  transform: translateY(-2px);
}

.pg-btn-block {
  display: block;
  text-align: center;
}

/* 模块卡片 */
.pg-module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}

.pg-module-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.pg-module-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.pg-module-emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  font-size: 1.4rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.22);
}

.pg-module-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1f2937;
}

.pg-module-desc {
  font-size: 0.9rem;
  line-height: 1.75;
  color: #6b7280;
  margin-bottom: 1rem;
}

.pg-module-features {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
  flex-grow: 1;
}

.pg-module-features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  font-size: 0.9rem;
  color: #4b5563;
}

.pg-check {
  width: 1rem;
  height: 1rem;
  color: #f97316;
  flex-shrink: 0;
}

/* 响应式 */
@media (max-width: 640px) {
  .pg-page {
    padding: 1.5rem 0.875rem 3rem;
  }
  .pg-hero {
    padding: 2.25rem 1rem;
  }
  .pg-stats {
    gap: 1.25rem 2rem;
  }
}
</style>
