<script setup lang="ts">
import { ref } from 'vue'

interface ProcessStep {
  num: string
  emoji: string
  title: string
  desc: string
  items: string[]
}

const processSteps: ProcessStep[] = [
  {
    num: '01',
    emoji: '🎯',
    title: '前期准备与定位',
    desc: '明确自身研究方向和学术目标，评估个人学术背景、科研成果和竞争力，确定申博的核心方向和目标院校层次。',
    items: ['梳理学术成果（论文、项目、专利等）', '评估语言能力（英语/小语种）', '确定申请类型（统考/申请考核/硕博连读）', '制定时间规划表'],
  },
  {
    num: '02',
    emoji: '🏫',
    title: '院校与导师筛选',
    desc: '根据研究方向匹配目标院校和导师，分析院校招生政策、导师研究领域、课题组资源等关键信息。',
    items: ['筛选匹配度高的院校和导师', '研究目标院校招生简章', '分析导师近5年研究成果', '了解课题组招生名额和培养模式'],
  },
  {
    num: '03',
    emoji: '✉️',
    title: '导师联系与沟通',
    desc: '撰写个性化联系邮件，建立与导师的有效沟通，获取导师的初步意向和指导建议。',
    items: ['撰写专业、简洁的联系邮件', '准备学术简历和研究设想', '把握沟通节奏和礼仪', '处理导师回复的不同情况'],
  },
  {
    num: '04',
    emoji: '📑',
    title: '申请材料准备',
    desc: '精心准备全套申请材料，突出个人优势和研究潜力，符合目标院校的材料要求。',
    items: ['研究计划（核心材料）', '个人陈述/动机信', '学术简历（CV）', '推荐信、成绩单等辅助材料'],
  },
  {
    num: '05',
    emoji: '📝',
    title: '研究计划撰写',
    desc: '完成高质量的研究计划，体现研究创新性、可行性和学术价值，符合导师研究方向。',
    items: ['确定研究问题和创新点', '设计研究方法和技术路线', '合理规划研究进度', '反复修改和完善'],
  },
  {
    num: '06',
    emoji: '🏆',
    title: '考核与录取',
    desc: '准备面试/笔试，展示学术能力和研究潜力，跟进申请进度，处理录取相关事宜。',
    items: ['面试常见问题准备', '学术汇报PPT制作', '复试/笔试针对性复习', '录取通知确认与择校'],
  },
]

interface StrategyCard {
  emoji: string
  title: string
  desc: string
  tip: string
}

const strategyCards: StrategyCard[] = [
  {
    emoji: '🎯',
    title: '匹配度优先原则',
    desc: '选择与自身研究方向高度匹配的院校和导师，而非单纯追求学校排名。研究方向匹配度直接影响导师的接收意愿和未来的科研发展。',
    tip: '先确定3-5个核心研究方向关键词，再筛选导师的研究领域包含这些关键词的院校。',
  },
  {
    emoji: '🗂️',
    title: '分层选择策略',
    desc: '采用"冲刺档+稳妥档+保底档"的分层策略，通常按2:3:1的比例选择院校，既保证成功率，又不放弃冲击优质院校的机会。',
    tip: '冲刺档选择排名较高的院校，稳妥档选择匹配度高的院校，保底档选择录取概率大的院校。',
  },
  {
    emoji: '🔍',
    title: '关键信息调研',
    desc: '深入了解目标院校的招生政策、考核方式、录取比例、培养方案、毕业要求、奖学金政策等关键信息。',
    tip: '通过院校官网、学长学姐、学术会议等多种渠道收集信息，避免信息不对称。',
  },
  {
    emoji: '🗺️',
    title: '地域与资源考量',
    desc: '考虑院校所在地区的学术资源、产业环境、就业机会，以及课题组的经费、设备、合作资源等实际条件。',
    tip: '理工科优先选择科研资源丰富的地区，人文社科考虑学术氛围和就业市场。',
  },
]

const contactCards: StrategyCard[] = [
  {
    emoji: '📧',
    title: '联系邮件撰写要点',
    desc: '邮件标题简洁明了（如"博士申请-姓名-研究方向"），正文控制在300字以内，突出个人优势、研究匹配度和申博诚意，附件包含学术简历和研究设想。',
    tip: '邮件避免模板化，针对每位导师的研究领域定制内容，体现认真态度。',
  },
  {
    emoji: '⏰',
    title: '联系时机选择',
    desc: '最佳联系时间为招生季前3-6个月（通常为每年7-10月），避免在节假日、招生高峰期联系，给导师留出充分的回复时间。',
    tip: '首次联系后2周未回复可礼貌跟进一次，避免频繁打扰导师。',
  },
  {
    emoji: '💬',
    title: '有效沟通技巧',
    desc: '沟通中保持谦逊、专业的态度，主动展示对导师研究的了解，提出有深度的问题，而非单纯询问"是否招生"。',
    tip: '提前研读导师近3年的代表性论文，沟通时提及具体观点，体现研究兴趣。',
  },
  {
    emoji: '🤝',
    title: '不同回复的应对',
    desc: '针对导师的不同回复类型（积极、中性、拒绝）采取不同策略，积极回复的导师重点跟进，中性回复的保持联系，拒绝的及时调整目标。',
    tip: '即使被拒绝，也礼貌感谢导师的回复，保持良好的学术形象。',
  },
]

const proposalCards: StrategyCard[] = [
  {
    emoji: '💡',
    title: '研究问题与创新点',
    desc: '明确提出具体、有价值的研究问题，突出研究的创新点（理论创新、方法创新或应用创新），避免选题过大或缺乏新意。',
    tip: '创新点要具体可验证，结合现有研究的不足提出，体现学术价值。',
  },
  {
    emoji: '🏗️',
    title: '研究框架与方法',
    desc: '构建清晰的研究框架，选择合适的研究方法（定量/定性/混合方法），说明方法的合理性和可行性，展示技术路线图。',
    tip: '方法部分要体现专业性，结合自身的技能和资源，避免不切实际的研究方法。',
  },
  {
    emoji: '📚',
    title: '文献综述要点',
    desc: '综述要覆盖领域内的核心文献和最新研究，梳理研究脉络，指出现有研究的不足，为自身研究奠定基础。',
    tip: '文献综述要有批判性思维，避免简单罗列，重点分析研究空白和争议点。',
  },
  {
    emoji: '📈',
    title: '研究进度与预期成果',
    desc: '合理规划博士阶段的研究进度（通常按3-4年规划），明确各阶段的研究任务和预期成果（论文、专利、项目等）。',
    tip: '进度规划要具体可行，预期成果要符合博士培养要求，体现研究的连续性。',
  },
  {
    emoji: '📐',
    title: '格式与语言规范',
    desc: '遵循目标院校的格式要求，语言专业、简洁、准确，避免语法错误和口语化表达，引用格式规范统一。',
    tip: '完成初稿后反复修改，可请导师、学长学姐帮忙审阅，完善内容和格式。',
  },
  {
    emoji: '🧩',
    title: '匹配导师研究方向',
    desc: '研究计划要与目标导师的研究方向高度契合，体现对导师研究的延续和拓展，而非完全独立的研究方向。',
    tip: '在研究计划中适当引用导师的研究成果，展示研究的衔接性和互补性。',
  },
]

interface FaqItem {
  q: string
  a: string
}

const faqs: FaqItem[] = [
  {
    q: '申请考核制和统考有什么区别？',
    a: '申请考核制主要看重申请人的学术背景、科研成果和研究潜力，通常包括材料审核、面试等环节，弱化笔试；统考则需要参加学校组织的笔试和面试，对基础知识要求较高。目前大部分985/211院校已采用申请考核制，更适合有科研成果的申请人。',
  },
  {
    q: '没有发表论文能申请博士吗？',
    a: '可以申请，但竞争力会受影响。除论文外，可通过高质量的研究计划、科研项目经历、专利、竞赛获奖等弥补；同时选择对论文要求相对宽松的院校和导师，重点突出研究潜力和学习能力。',
  },
  {
    q: '联系导师的最佳时间是什么时候？',
    a: '建议在招生年度的7-10月联系（即申请前3-6个月），此时导师尚未确定招生名额，有充分的沟通空间；避免在12月-次年3月的招生高峰期联系，此时导师可能已收到大量邮件，回复概率降低。',
  },
  {
    q: '研究计划需要写多少字？',
    a: '不同院校要求不同，通常中文研究计划3000-8000字，英文研究计划2000-5000词；核心是内容质量而非字数，重点突出研究问题、创新点和研究方法，避免冗余。',
  },
  {
    q: '博士申请需要几封推荐信？',
    a: '通常需要2-3封推荐信，推荐人最好包括申请人的硕士导师、参与项目的合作导师或领域内的知名学者；推荐信要突出申请人的科研能力、学术潜力和综合素质，避免泛泛而谈。',
  },
]

const activeFaq = ref<number | null>(0)

function toggleFaq(i: number) {
  activeFaq.value = activeFaq.value === i ? null : i
}
</script>

<template>
  <div class="phd-page">
    <!-- Hero -->
    <section class="phd-hero">
      <div class="phd-hero-badge">PhD Application · 博士申请</div>
      <h1 class="phd-hero-title">博士申请全流程指导</h1>
      <p class="phd-hero-sub">助您成功申博</p>
      <p class="phd-hero-desc">
        从院校选择、导师联系到研究计划撰写，我们提供全方位的博士申请指导，
        帮您扫清申博路上的所有障碍，顺利拿到心仪院校的录取通知书
      </p>
    </section>

    <!-- 申博全流程 -->
    <section class="phd-section">
      <div class="phd-section-head">
        <h2 class="phd-section-title">申博全流程指导</h2>
      </div>
      <div class="phd-process-grid">
        <article v-for="s in processSteps" :key="s.num" class="phd-step-card">
          <span class="phd-step-num">{{ s.num }}</span>
          <div class="phd-step-emoji">{{ s.emoji }}</div>
          <h3 class="phd-step-title">{{ s.title }}</h3>
          <p class="phd-step-desc">{{ s.desc }}</p>
          <ul class="phd-step-list">
            <li v-for="it in s.items" :key="it">{{ it }}</li>
          </ul>
        </article>
      </div>
    </section>

    <!-- 通用策略区 -->
    <section v-for="group in [
      { title: '院校选择策略', cards: strategyCards },
      { title: '导师联系技巧', cards: contactCards },
      { title: '研究计划撰写指南', cards: proposalCards },
    ]" :key="group.title" class="phd-section">
      <div class="phd-section-head">
        <h2 class="phd-section-title">{{ group.title }}</h2>
      </div>
      <div class="phd-strategy-grid">
        <article v-for="c in group.cards" :key="c.title" class="phd-strategy-card">
          <div class="phd-strategy-head">
            <span class="phd-strategy-emoji">{{ c.emoji }}</span>
            <h3 class="phd-strategy-title">{{ c.title }}</h3>
          </div>
          <p class="phd-strategy-desc">{{ c.desc }}</p>
          <div class="phd-tip">
            <span class="phd-tip-label">💡 建议</span>
            <p class="phd-tip-text">{{ c.tip }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- 常见问题 -->
    <section class="phd-section">
      <div class="phd-section-head">
        <h2 class="phd-section-title">申博常见问题</h2>
      </div>
      <div class="phd-faq">
        <div v-for="(f, i) in faqs" :key="f.q" class="phd-faq-item" :class="{ open: activeFaq === i }">
          <button class="phd-faq-q" @click="toggleFaq(i)">
            <span class="phd-faq-mark">Q</span>
            <span class="phd-faq-text">{{ f.q }}</span>
            <svg
              class="phd-faq-arrow"
              :class="{ rotated: activeFaq === i }"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <Transition name="faq">
            <div v-if="activeFaq === i" class="phd-faq-a">
              <span class="phd-faq-mark phd-faq-mark-a">A</span>
              <p>{{ f.a }}</p>
            </div>
          </Transition>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.phd-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
}

/* Hero */
.phd-hero {
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

.phd-hero-badge {
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

.phd-hero-title {
  margin-top: 1.25rem;
  font-size: clamp(1.6rem, 2.6vw, 2.6rem);
  font-weight: 800;
  color: #1f2937;
  letter-spacing: 1px;
}

.phd-hero-sub {
  margin-top: 0.5rem;
  font-size: clamp(1.1rem, 1.8vw, 1.5rem);
  font-weight: 700;
  background: linear-gradient(135deg, #f97316, #fb923c);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: #f97316;
}

.phd-hero-desc {
  max-width: 780px;
  margin: 1rem auto 0;
  font-size: 1rem;
  line-height: 1.9;
  color: #6b7280;
}

/* Section */
.phd-section {
  margin-top: 2.5rem;
}

.phd-section-head {
  margin-bottom: 1.25rem;
}

.phd-section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  position: relative;
  padding-left: 0.875rem;
}

.phd-section-title::before {
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

/* 流程卡 */
.phd-process-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}

.phd-step-card {
  position: relative;
  padding: 1.5rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
  transition: all 0.25s ease;
}

.phd-step-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.14);
  border-color: rgba(249, 115, 22, 0.35);
}

.phd-step-num {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  font-size: 2rem;
  font-weight: 900;
  color: rgba(249, 115, 22, 0.12);
  line-height: 1;
}

.phd-step-emoji {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.phd-step-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.phd-step-desc {
  font-size: 0.9rem;
  line-height: 1.75;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.phd-step-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.phd-step-list li {
  position: relative;
  padding: 0.3rem 0 0.3rem 1.15rem;
  font-size: 0.88rem;
  line-height: 1.6;
  color: #4b5563;
}

.phd-step-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.9rem;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #fb923c);
}

/* 策略卡 */
.phd-strategy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.phd-strategy-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
  transition: all 0.25s ease;
}

.phd-strategy-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.14);
  border-color: rgba(249, 115, 22, 0.35);
}

.phd-strategy-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.phd-strategy-emoji {
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

.phd-strategy-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}

.phd-strategy-desc {
  font-size: 0.9rem;
  line-height: 1.75;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.phd-tip {
  padding: 0.9rem 1rem;
  border-radius: 0.7rem;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 146, 60, 0.06));
  border: 1px dashed rgba(249, 115, 22, 0.35);
}

.phd-tip-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #e8722a;
  margin-bottom: 0.35rem;
}

.phd-tip-text {
  font-size: 0.88rem;
  line-height: 1.7;
  color: #4b5563;
}

/* FAQ */
.phd-faq {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.phd-faq-item {
  border-radius: 0.9rem;
  background: #ffffff;
  border: 1px solid rgba(249, 115, 22, 0.15);
  overflow: hidden;
  transition: all 0.25s ease;
}

.phd-faq-item.open {
  border-color: rgba(249, 115, 22, 0.4);
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.1);
}

.phd-faq-q {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.phd-faq-q:hover {
  background: #fffdf9;
}

.phd-faq-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #f97316, #fb923c);
  flex-shrink: 0;
}

.phd-faq-mark-a {
  background: linear-gradient(135deg, #fb923c, #f97316);
}

.phd-faq-text {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.phd-faq-arrow {
  width: 1.1rem;
  height: 1.1rem;
  color: #f97316;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.phd-faq-arrow.rotated {
  transform: rotate(180deg);
}

.phd-faq-a {
  display: flex;
  gap: 0.75rem;
  padding: 0 1.25rem 1.1rem;
  font-size: 0.92rem;
  line-height: 1.85;
  color: #4b5563;
}

.faq-enter-active,
.faq-leave-active {
  transition: all 0.25s ease;
}

.faq-enter-from,
.faq-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 响应式 */
@media (max-width: 640px) {
  .phd-page {
    padding: 1.5rem 0.875rem 3rem;
  }
  .phd-hero {
    padding: 2.25rem 1rem;
  }
}
</style>
