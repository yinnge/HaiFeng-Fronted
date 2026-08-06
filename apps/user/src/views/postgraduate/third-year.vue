<script setup lang="ts">
import { ElMessage } from 'element-plus'

interface ThesisCard {
  emoji: string
  title: string
  desc: string
  items: string[]
  btn: string
  developing?: boolean
}

const thesisCards: ThesisCard[] = [
  {
    emoji: '🎯',
    title: '选题收尾与框架优化',
    desc: '研三初期需完成选题最终确认，针对导师意见优化论文框架，明确研究边界与创新点：',
    items: [
      '梳理已有研究成果，聚焦核心研究问题',
      '调整论文章节逻辑，确保研究脉络清晰',
      '与导师确认研究方法可行性，规避后期返工',
    ],
    btn: '查看详细指南',
  },
  {
    emoji: '✍️',
    title: '论文撰写与修改',
    desc: '核心撰写阶段的重点与技巧，高效完成初稿并针对性修改：',
    items: [
      '按章节拆解任务，设定阶段性完成节点',
      '注重文献综述的逻辑性与研究评述的深度',
      '数据/案例分析部分确保论证充分、结论可信',
      '根据导师批注逐轮修改，优先解决核心问题',
    ],
    btn: '查看修改技巧',
  },
  {
    emoji: '🔍',
    title: '查重降重与格式规范',
    desc: '定稿前的关键步骤，确保论文符合学术规范：',
    items: [
      '选择正规查重平台（知网/万方等），控制重复率在学校要求内',
      '降重核心：改写而非删减，保留原意的同时优化表述',
      '严格遵循学校论文格式要求（字体、行距、引用格式等）',
    ],
    btn: '查重工具推荐',
  },
]

interface DefenseCard {
  emoji: string
  title: string
  desc: string
  items: string[]
  btn: string
}

const defenseCards: DefenseCard[] = [
  {
    emoji: '📊',
    title: '答辩PPT制作',
    desc: '答辩PPT需简洁明了、重点突出，符合学术答辩规范：',
    items: [
      '结构：研究背景→研究问题→方法→结果→结论→创新点',
      '视觉：配色简洁、字体清晰，图表为主、文字为辅',
      '时长：按答辩时长控制页数（10-15分钟建议15-20页）',
    ],
    btn: 'PPT模板下载',
  },
  {
    emoji: '🗣️',
    title: '答辩技巧与话术准备',
    desc: '提升答辩表现的核心技巧，从容应对评委提问：',
    items: [
      '试讲练习：控制语速，突出研究核心与创新点',
      '预设问题：梳理研究薄弱点，提前准备应答思路',
      '态度：谦虚诚恳，遇质疑不慌，如实回应',
    ],
    btn: '答辩话术模板',
  },
  {
    emoji: '🔄',
    title: '模拟答辩与复盘',
    desc: '通过模拟答辩提前暴露问题，优化答辩表现：',
    items: [
      '邀请导师/同门组成模拟评委，完整模拟答辩流程',
      '记录问题与不足，针对性调整PPT或应答思路',
      '复盘核心：时间控制、语言表达、问题应答逻辑',
    ],
    btn: '模拟答辩指南',
  },
]

function go(card: ThesisCard | DefenseCard) {
  if ('developing' in card && card.developing) {
    ElMessage.info('该功能正在开发中')
    return
  }
  ElMessage.info('功能正在建设中，敬请期待')
}
</script>

<template>
  <div class="ty-page">
    <!-- Hero -->
    <section class="ty-hero">
      <div class="ty-hero-badge">Postgraduate Year 3 · 毕业阶段</div>
      <h1 class="ty-hero-title">研三信息专区</h1>
      <p class="ty-hero-desc">
        毕业论文、答辩准备、职业规划、就业指导，<br />
        助您顺利毕业并规划未来
      </p>
    </section>

    <!-- 毕业论文攻坚 -->
    <section class="ty-section">
      <div class="ty-section-head">
        <h2 class="ty-section-title">毕业论文攻坚</h2>
      </div>
      <div class="ty-grid">
        <article v-for="c in thesisCards" :key="c.title" class="ty-card" @click="go(c)">
          <div class="ty-card-head">
            <span class="ty-card-emoji">{{ c.emoji }}</span>
            <h3 class="ty-card-title">{{ c.title }}</h3>
          </div>
          <p class="ty-card-desc">{{ c.desc }}</p>
          <ul class="ty-card-list">
            <li v-for="it in c.items" :key="it">{{ it }}</li>
          </ul>
          <span class="ty-btn">{{ c.btn }}</span>
        </article>
      </div>
    </section>

    <!-- 答辩全程准备 -->
    <section class="ty-section">
      <div class="ty-section-head">
        <h2 class="ty-section-title">答辩全程准备</h2>
      </div>
      <div class="ty-grid">
        <article v-for="c in defenseCards" :key="c.title" class="ty-card" @click="go(c)">
          <div class="ty-card-head">
            <span class="ty-card-emoji">{{ c.emoji }}</span>
            <h3 class="ty-card-title">{{ c.title }}</h3>
          </div>
          <p class="ty-card-desc">{{ c.desc }}</p>
          <ul class="ty-card-list">
            <li v-for="it in c.items" :key="it">{{ it }}</li>
          </ul>
          <span class="ty-btn">{{ c.btn }}</span>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ty-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
}

/* Hero */
.ty-hero {
  text-align: center;
  padding: 3rem 1.5rem;
  border-radius: 1.5rem;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.92), rgba(255, 247, 237, 0.92));
  border: 1px solid rgba(249, 115, 22, 0.18);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 10px 40px rgba(249, 115, 22, 0.1);
}

.ty-hero-badge {
  display: inline-flex;
  padding: 0.3rem 1rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #e8722a;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.25);
  letter-spacing: 1px;
}

.ty-hero-title {
  margin-top: 1.25rem;
  font-size: clamp(1.6rem, 2.6vw, 2.6rem);
  font-weight: 800;
  color: #1f2937;
  letter-spacing: 1px;
}

.ty-hero-desc {
  margin: 1rem auto 0;
  font-size: 1.05rem;
  line-height: 1.9;
  color: #6b7280;
}

/* Section */
.ty-section {
  margin-top: 2.5rem;
}

.ty-section-head {
  margin-bottom: 1.25rem;
}

.ty-section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  position: relative;
  padding-left: 0.875rem;
}

.ty-section-title::before {
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

/* Cards */
.ty-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.ty-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
  transition: all 0.25s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.ty-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.14);
  border-color: rgba(249, 115, 22, 0.35);
}

.ty-card-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.ty-card-emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  font-size: 1.4rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.22);
  flex-shrink: 0;
}

.ty-card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1f2937;
}

.ty-card-desc {
  font-size: 0.9rem;
  line-height: 1.75;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.ty-card-list {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
  flex-grow: 1;
}

.ty-card-list li {
  position: relative;
  padding: 0.35rem 0 0.35rem 1.15rem;
  font-size: 0.9rem;
  line-height: 1.65;
  color: #4b5563;
}

.ty-card-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.95rem;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #fb923c);
}

/* 按钮 */
.ty-btn {
  display: block;
  text-align: center;
  padding: 0.6rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(90deg, #f97316, #fb923c);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.28);
  transition: all 0.2s ease;
}

.ty-btn:hover {
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
  transform: translateY(-2px);
}

/* 响应式 */
@media (max-width: 640px) {
  .ty-page {
    padding: 1.5rem 0.875rem 3rem;
  }
  .ty-hero {
    padding: 2.25rem 1rem;
  }
}
</style>
