<script setup lang="ts">
interface CoreItem {
  emoji: string
  title: string
  desc: string
  items: string[]
}

const coreModules: CoreItem[] = [
  {
    emoji: '🧭',
    title: '科研指导',
    desc: '研二是科研课题深化的关键阶段，重点解决"做什么、怎么做、为什么做"的核心问题：',
    items: [
      '课题方向精细化，聚焦核心研究点',
      '建立高效的导师沟通机制，定期汇报进展',
      '追踪学术前沿，掌握领域最新研究动态',
      '科研思维培养：批判性分析、逻辑推演、创新突破',
      '科研项目管理：时间规划、任务拆解、风险预判',
    ],
  },
  {
    emoji: '📝',
    title: '论文撰写',
    desc: '从开题报告到核心章节写作，构建完整的学术写作体系：',
    items: [
      '开题报告优化：研究意义、创新点、技术路线打磨',
      '核心章节写作：引言、方法、结果、讨论的逻辑构建',
      '学术语言规范：专业术语、句式表达、逻辑衔接',
      '格式标准化：参考文献、图表规范、排版要求',
      '论文修改技巧：自审、导师反馈、同行评议应对',
    ],
  },
  {
    emoji: '📤',
    title: '学术发表',
    desc: '研二是学术成果初步产出阶段，掌握发表全流程技巧：',
    items: [
      '期刊/会议选择：匹配研究方向、评估录用难度、考量发表周期',
      '投稿流程：格式调整、查重降重、cover letter撰写',
      '审稿回复：礼貌回应、清晰解释、合理修改',
      '学术成果保护：专利申请、版权登记相关知识',
      '学术交流：会议报告、海报展示、问答环节准备',
    ],
  },
  {
    emoji: '🧪',
    title: '实验设计',
    desc: '科学的实验设计是研究可靠性的核心保障：',
    items: [
      '实验方案优化：变量控制、样本量设计、对照设置',
      '数据采集：方法选择、精度控制、异常值处理',
      '误差分析：系统误差、随机误差的识别与规避',
      '实验重复性：可复现性验证、操作标准化',
      '实验安全：合规操作、风险防控、应急处理',
    ],
  },
]

interface TopicBlock {
  emoji: string
  title: string
  points: { title: string; desc: string }[]
  tipTitle: string
  tip: string
}

const topics: TopicBlock[] = [
  {
    emoji: '✍️',
    title: '论文写作进阶',
    points: [
      {
        title: '引言部分写作要点',
        desc: '引言需清晰阐述研究背景、现有研究不足、本研究的目标和创新点，遵循"宽-窄-准"的逻辑：先介绍领域大背景，逐步聚焦到具体研究问题，最后明确本研究的贡献。',
      },
      {
        title: '方法部分写作要点',
        desc: '方法部分需保证可复现性，详细描述实验材料、设备、步骤、数据分析方法，使用被动语态和过去时态，避免主观描述。',
      },
      {
        title: '结果与讨论的区别',
        desc: '结果部分客观呈现数据（图表为主，文字为辅），讨论部分则解释结果的意义、与现有研究的对比、研究局限性及未来方向。',
      },
    ],
    tipTitle: '写作小贴士',
    tip: '建立个人写作模板库，定期梳理领域内高被引论文的写作框架；使用EndNote/Zotero管理参考文献，避免格式错误；完成初稿后搁置2-3天再修改，更容易发现问题。',
  },
  {
    emoji: '🔬',
    title: '实验设计实战',
    points: [
      {
        title: '实验设计三原则',
        desc: '随机化（避免系统偏差）、对照（明确实验效应）、重复（保证结果可靠性）是实验设计的核心原则，需贯穿实验全过程。',
      },
      {
        title: '样本量计算方法',
        desc: '根据研究类型（横断面/干预性/诊断性）选择合适的样本量计算公式，可使用G*Power、PASS等工具辅助计算，避免样本量不足或过多。',
      },
      {
        title: '数据质量控制',
        desc: '制定标准化操作流程（SOP），对实验人员进行培训；使用盲法减少主观偏倚；建立数据核查机制，及时发现异常值。',
      },
    ],
    tipTitle: '实验小贴士',
    tip: '提前进行预实验验证方案可行性；详细记录实验过程（包括失败尝试），便于后续分析；定期备份实验数据，防止数据丢失；遵守实验室安全规范，做好防护措施。',
  },
  {
    emoji: '📨',
    title: '学术发表技巧',
    points: [
      {
        title: '期刊选择策略',
        desc: '通过JCR分区、中科院分区、影响因子、录用率、审稿周期等维度评估期刊；优先选择领域内专刊/专题，录用概率更高；避免盲目追求高影响因子，匹配研究水平更重要。',
      },
      {
        title: '投稿前准备',
        desc: '严格按照期刊投稿指南调整格式；使用Turnitin/iThenticate查重，控制重复率；邀请导师/师兄师姐帮忙预审，修正语言和逻辑问题；准备高质量的图表（分辨率≥300dpi）。',
      },
      {
        title: '审稿意见回复',
        desc: '逐条回应审稿意见，即使不认同也要礼貌解释；修改部分用不同颜色标注，便于审稿人查看；回复信控制在2-3页，重点突出，语言简洁。',
      },
    ],
    tipTitle: '发表小贴士',
    tip: '关注期刊的征稿通知（CFP），把握投稿窗口期；建立论文发表时间轴，预留足够的修改和补实验时间；发表后及时分享成果，扩大学术影响力。',
  },
  {
    emoji: '⏱️',
    title: '科研效率提升',
    points: [
      {
        title: '文献管理效率',
        desc: '使用Zotero/Mendeley管理文献，建立分类标签体系；定期阅读领域顶刊最新论文，保持学术敏感度；使用ReadCube/Paperpile辅助文献阅读和笔记整理。',
      },
      {
        title: '时间管理方法',
        desc: '采用番茄工作法、GTD时间管理法规划每日任务；建立周/月进度表，定期复盘科研进展；合理分配时间，避免单一任务耗时过久。',
      },
      {
        title: '协作与沟通',
        desc: '与导师建立固定沟通频率（如每周1次），提前准备沟通要点；与课题组同学定期交流，互相启发思路；积极参与学术研讨会，拓展学术视野。',
      },
    ],
    tipTitle: '效率小贴士',
    tip: '学会拒绝无关事务，聚焦核心研究；利用碎片化时间阅读短篇文献/整理数据；建立个人科研知识库，沉淀研究方法和经验。',
  },
]
</script>

<template>
  <div class="sy-page">
    <!-- Hero -->
    <section class="sy-hero">
      <div class="sy-hero-badge">Postgraduate Year 2 · 学术研究深化阶段</div>
      <h1 class="sy-hero-title">研二信息 <span class="sy-hero-sub">| 学术研究深化阶段</span></h1>
      <p class="sy-hero-desc">
        聚焦科研指导、论文撰写、学术发表、实验设计四大核心方向，助力研二学子突破学术瓶颈，
        夯实研究基础，实现从"学习"到"创造"的转变
      </p>
    </section>

    <!-- 核心能力提升 -->
    <section class="sy-section">
      <div class="sy-section-head">
        <h2 class="sy-section-title">研二核心能力提升</h2>
      </div>
      <div class="sy-core-grid">
        <article v-for="c in coreModules" :key="c.title" class="sy-core-card">
          <div class="sy-core-head">
            <span class="sy-core-emoji">{{ c.emoji }}</span>
            <h3 class="sy-core-title">{{ c.title }}</h3>
          </div>
          <p class="sy-core-desc">{{ c.desc }}</p>
          <ul class="sy-core-list">
            <li v-for="it in c.items" :key="it">{{ it }}</li>
          </ul>
        </article>
      </div>
    </section>

    <!-- 专题指导 -->
    <section class="sy-section">
      <div class="sy-section-head">
        <h2 class="sy-section-title">研二专题指导</h2>
      </div>
      <div class="sy-topic-grid">
        <article v-for="t in topics" :key="t.title" class="sy-topic-card">
          <div class="sy-topic-head">
            <span class="sy-topic-emoji">{{ t.emoji }}</span>
            <h3 class="sy-topic-title">{{ t.title }}</h3>
          </div>
          <div v-for="p in t.points" :key="p.title" class="sy-point">
            <h4 class="sy-point-title">{{ p.title }}</h4>
            <p class="sy-point-desc">{{ p.desc }}</p>
          </div>
          <div class="sy-tip">
            <span class="sy-tip-label">{{ t.tipTitle }}</span>
            <p class="sy-tip-text">{{ t.tip }}</p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sy-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
}

/* Hero */
.sy-hero {
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

.sy-hero-badge {
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

.sy-hero-title {
  margin-top: 1.25rem;
  font-size: clamp(1.6rem, 2.6vw, 2.6rem);
  font-weight: 800;
  color: #1f2937;
  letter-spacing: 1px;
}

.sy-hero-sub {
  font-size: clamp(1.1rem, 1.8vw, 1.6rem);
  font-weight: 700;
  background: linear-gradient(135deg, #f97316, #fb923c);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: #f97316;
}

.sy-hero-desc {
  max-width: 780px;
  margin: 1rem auto 0;
  font-size: 1rem;
  line-height: 1.9;
  color: #6b7280;
}

/* Section */
.sy-section {
  margin-top: 2.5rem;
}

.sy-section-head {
  margin-bottom: 1.25rem;
}

.sy-section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  position: relative;
  padding-left: 0.875rem;
}

.sy-section-title::before {
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

/* 核心能力卡 */
.sy-core-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.sy-core-card {
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

.sy-core-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.14);
  border-color: rgba(249, 115, 22, 0.35);
}

.sy-core-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.sy-core-emoji {
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

.sy-core-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1f2937;
}

.sy-core-desc {
  font-size: 0.9rem;
  line-height: 1.75;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.sy-core-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sy-core-list li {
  position: relative;
  padding: 0.35rem 0 0.35rem 1.15rem;
  font-size: 0.9rem;
  line-height: 1.65;
  color: #4b5563;
}

.sy-core-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.95rem;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #fb923c);
}

/* 专题卡 */
.sy-topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.25rem;
}

.sy-topic-card {
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

.sy-topic-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.14);
  border-color: rgba(249, 115, 22, 0.35);
}

.sy-topic-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed rgba(249, 115, 22, 0.25);
}

.sy-topic-emoji {
  font-size: 1.5rem;
}

.sy-topic-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
}

.sy-point {
  margin-bottom: 1rem;
}

.sy-point-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: #e8722a;
  margin-bottom: 0.35rem;
}

.sy-point-desc {
  font-size: 0.9rem;
  line-height: 1.75;
  color: #6b7280;
}

.sy-tip {
  margin-top: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 0.7rem;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 146, 60, 0.06));
  border: 1px dashed rgba(249, 115, 22, 0.35);
}

.sy-tip-label {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(90deg, #f97316, #fb923c);
  margin-bottom: 0.5rem;
}

.sy-tip-text {
  font-size: 0.88rem;
  line-height: 1.7;
  color: #4b5563;
}

/* 响应式 */
@media (max-width: 640px) {
  .sy-page {
    padding: 1.5rem 0.875rem 3rem;
  }
  .sy-hero {
    padding: 2.25rem 1rem;
  }
}
</style>
