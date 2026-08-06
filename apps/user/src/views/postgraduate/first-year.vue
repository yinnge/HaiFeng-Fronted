<script setup lang="ts">
interface TipCard {
  emoji: string
  title: string
  desc: string
  items: string[]
}

interface GuideItem {
  emoji: string
  text: string
}

interface ModuleBlock {
  emoji: string
  title: string
  desc: string
  cards: TipCard[]
  guideTitle?: string
  guideItems?: GuideItem[]
}

const modules: ModuleBlock[] = [
  {
    emoji: '🧭',
    title: '学习规划',
    desc: '研一是研究生阶段打基础的关键时期，合理的学习规划能帮助你快速适应科研节奏，为后续研究工作奠定坚实基础。',
    cards: [
      {
        emoji: '⏰',
        title: '时间管理',
        desc: '建立科学的时间管理体系，平衡课程学习、文献阅读、科研入门和个人生活：',
        items: [
          '每日固定2-3小时文献阅读时间，培养学术思维',
          '每周预留整块时间（4-6小时）进行深度思考和总结',
          '使用番茄工作法，提高学习和科研效率',
          '每月制定学习目标，季度复盘调整规划',
        ],
      },
      {
        emoji: '🎯',
        title: '阶段目标',
        desc: '分阶段设定清晰的学习目标，循序渐进完成角色转变：',
        items: [
          '第1-2个月：适应研究生节奏，熟悉课题组研究方向',
          '第3-6个月：完成核心课程学习，确定研究兴趣点',
          '第7-12个月：深入文献调研，完成开题报告初稿',
          '全年目标：从"学习者"向"研究者"角色转变',
        ],
      },
      {
        emoji: '⚖️',
        title: '学研平衡',
        desc: '把握课程学习与科研入门的平衡关系：',
        items: [
          '课程成绩是基础，但科研能力培养更重要',
          '优先保证核心课程学习质量，选修课服务于研究方向',
          '尽早参与课题组讨论和科研项目，积累实践经验',
          '避免过度投入课程成绩，忽视科研思维培养',
        ],
      },
    ],
    guideTitle: '快速适应小贴士',
    guideItems: [
      { emoji: '✅', text: '主动向师兄师姐请教本专业研究生学习的特点和注意事项' },
      { emoji: '✅', text: '建立个人知识库，分类整理课程笔记和文献阅读心得' },
      { emoji: '✅', text: '参加学术讲座和研讨会，拓宽学术视野' },
      { emoji: '✅', text: '保持规律作息，避免熬夜赶作业/看文献' },
    ],
  },
  {
    emoji: '🎓',
    title: '课程选择',
    desc: '研一课程选择直接影响后续研究方向和科研效率，需结合个人研究兴趣和导师建议综合考量。',
    cards: [
      {
        emoji: '📖',
        title: '核心课程选择',
        desc: '核心课程是研究生阶段的知识基础，选择原则：',
        items: [
          '优先选择与研究方向高度相关的核心课程',
          '关注课程师资，优先选择课题组导师授课的课程',
          '参考往届师兄师姐的选课经验和课程评价',
          '核心课程不宜过多，保证学习深度而非广度',
        ],
      },
      {
        emoji: '📚',
        title: '选修课程策略',
        desc: '选修课应服务于研究方向和能力提升：',
        items: [
          '选择能补充研究方法和技能的课程（如数据分析、编程等）',
          '适当选择跨学科课程，拓宽研究视野',
          '控制选修课数量，避免占用过多科研时间',
          '优先选择实践性强、能直接应用于研究的课程',
        ],
      },
      {
        emoji: '💬',
        title: '选课沟通',
        desc: '选课阶段与导师的沟通要点：',
        items: [
          '提前与导师沟通，明确研究方向对课程的要求',
          '向导师请教本领域必备的知识体系和技能',
          '结合个人基础，与导师探讨需要补充的课程',
          '避免盲目选课，导致课程与研究方向脱节',
        ],
      },
    ],
    guideTitle: '选课避坑指南',
    guideItems: [
      { emoji: '⚠️', text: '避免贪多求全，选择过多课程导致学习质量下降' },
      { emoji: '⚠️', text: '避免仅凭兴趣选课，忽视研究方向需求' },
      { emoji: '⚠️', text: '避免忽视方法论课程，如科研方法、论文写作等' },
      { emoji: '⚠️', text: '避免选课过于分散，缺乏知识体系的连贯性' },
    ],
  },
  {
    emoji: '🤝',
    title: '导师沟通',
    desc: '良好的导师沟通是研究生阶段成功的关键，建立高效、互信的师生关系能大幅提升科研效率。',
    cards: [
      {
        emoji: '📆',
        title: '沟通频率与时机',
        desc: '把握与导师沟通的节奏和时机：',
        items: [
          '初期：每周/每两周主动沟通一次，汇报学习进展',
          '稳定期：每月固定1-2次正式沟通，辅以即时消息沟通',
          '关键节点：开题、中期等提前预约深入沟通',
          '避免：长时间不沟通或过度频繁打扰导师',
        ],
      },
      {
        emoji: '📋',
        title: '沟通准备工作',
        desc: '每次沟通前做好充分准备，提高沟通效率：',
        items: [
          '提前整理要请教的问题，按优先级排序',
          '准备学习/科研进展报告，数据和资料齐全',
          '对要讨论的问题有自己的思考和初步方案',
          '提前预约沟通时间，不临时打扰',
        ],
      },
      {
        emoji: '🤗',
        title: '沟通技巧',
        desc: '掌握高效的沟通技巧，建立良好师生关系：',
        items: [
          '尊重导师的时间，沟通直奔主题，简洁明了',
          '虚心请教但不盲从，敢于提出自己的想法',
          '及时反馈导师的建议和要求，闭环沟通',
          '保持真诚和谦逊，展现学习和科研的积极性',
        ],
      },
      {
        emoji: '❓',
        title: '沟通重点内容',
        desc: '研一阶段与导师沟通的核心内容：',
        items: [
          '研究方向的确定和细化',
          '课程选择和学习重点',
          '文献阅读的范围和方法',
          '科研技能的培养计划',
          '课题组的研究规范和要求',
        ],
      },
    ],
    guideTitle: '师生沟通黄金法则',
    guideItems: [
      { emoji: '⭐', text: '主动汇报进展，而非等导师追问' },
      { emoji: '⭐', text: '遇到问题先自己思考解决方案，再请教导师' },
      { emoji: '⭐', text: '尊重导师的意见，但也要清晰表达自己的想法' },
      { emoji: '⭐', text: '保持长期稳定的沟通，建立信任关系' },
    ],
  },
  {
    emoji: '🔬',
    title: '学术入门指导',
    desc: '研一是学术思维和科研能力培养的关键期，掌握正确的学术入门方法能让你少走弯路。',
    cards: [
      {
        emoji: '🔍',
        title: '文献阅读方法',
        desc: '建立系统的文献阅读体系，高效获取学术知识：',
        items: [
          '先读综述类文章，建立领域知识框架',
          '再读近5年的高水平期刊论文，把握研究前沿',
          '精读与泛读结合，核心文献精读，相关文献泛读',
          '建立文献管理系统（EndNote/Zotero），分类整理',
        ],
      },
      {
        emoji: '✍️',
        title: '学术写作入门',
        desc: '提前培养学术写作能力，为论文发表做准备：',
        items: [
          '从课程论文开始，练习学术写作规范',
          '模仿高水平论文的写作结构和语言表达',
          '学习本领域的学术写作规范和格式要求',
          '定期写作总结，锻炼逻辑思维和表达能力',
        ],
      },
      {
        emoji: '👥',
        title: '学术交流',
        desc: '积极参与学术交流，提升学术视野和表达能力：',
        items: [
          '参加课题组每周/每月的学术讨论会',
          '主动在组会上汇报文献阅读心得',
          '参加学校和学院组织的学术讲座',
          '尝试参加本领域的学术会议，了解研究前沿',
        ],
      },
      {
        emoji: '🛠️',
        title: '科研技能培养',
        desc: '掌握必备的科研技能，提升研究效率：',
        items: [
          '学习数据分析软件（SPSS/R/Python等）',
          '掌握实验/调研设计方法',
          '学习学术绘图和可视化技能',
          '熟悉本领域的科研工具和平台',
        ],
      },
    ],
    guideTitle: '学术入门进阶建议',
    guideItems: [
      { emoji: '💡', text: '找到1-2个研究方向相近的师兄师姐，建立长期请教关系' },
      { emoji: '💡', text: '建立个人学术博客/笔记，梳理和沉淀所学知识' },
      { emoji: '💡', text: '尝试复现经典论文的实验/分析过程，加深理解' },
      { emoji: '💡', text: '关注本领域顶级期刊和学者，追踪研究前沿' },
    ],
  },
]
</script>

<template>
  <div class="fy-page">
    <!-- Hero -->
    <section class="fy-hero">
      <div class="fy-hero-badge">Postgraduate Year 1 · 基础阶段</div>
      <h1 class="fy-hero-title">研究生一年级</h1>
      <p class="fy-hero-desc">
        从课程选择到导师沟通，从学术入门到生活适应，全方位助力你顺利开启研究生阶段的学习与科研之旅
      </p>
    </section>

    <!-- 模块 -->
    <section v-for="m in modules" :key="m.title" class="fy-module">
      <div class="fy-module-head">
        <span class="fy-module-emoji">{{ m.emoji }}</span>
        <div>
          <h2 class="fy-module-title">{{ m.title }}</h2>
          <p class="fy-module-desc">{{ m.desc }}</p>
        </div>
      </div>

      <div class="fy-tip-grid">
        <div v-for="c in m.cards" :key="c.title" class="fy-tip-card">
          <h3 class="fy-tip-title"><span class="fy-tip-emoji">{{ c.emoji }}</span>{{ c.title }}</h3>
          <p class="fy-tip-desc">{{ c.desc }}</p>
          <ul class="fy-tip-list">
            <li v-for="it in c.items" :key="it">{{ it }}</li>
          </ul>
        </div>
      </div>

      <div v-if="m.guideTitle && m.guideItems" class="fy-guide">
        <h3 class="fy-guide-title">{{ m.guideTitle }}</h3>
        <div class="fy-guide-list">
          <div v-for="g in m.guideItems" :key="g.text" class="fy-guide-item">
            <span class="fy-guide-emoji">{{ g.emoji }}</span>
            <p>{{ g.text }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.fy-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
}

/* Hero */
.fy-hero {
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

.fy-hero-badge {
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

.fy-hero-title {
  margin-top: 1.25rem;
  font-size: clamp(1.6rem, 2.6vw, 2.6rem);
  font-weight: 800;
  color: #1f2937;
  letter-spacing: 1px;
}

.fy-hero-desc {
  max-width: 720px;
  margin: 1rem auto 0;
  font-size: 1rem;
  line-height: 1.9;
  color: #6b7280;
}

/* 模块 */
.fy-module {
  margin-top: 2.5rem;
  padding: 1.75rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
}

.fy-module-head {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.fy-module-emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  font-size: 1.6rem;
  flex-shrink: 0;
  border-radius: 0.9rem;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.22);
}

.fy-module-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1f2937;
}

.fy-module-desc {
  margin-top: 0.3rem;
  font-size: 0.92rem;
  line-height: 1.7;
  color: #6b7280;
}

/* 提示卡 */
.fy-tip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.fy-tip-card {
  padding: 1.25rem;
  border-radius: 0.85rem;
  background: linear-gradient(160deg, #fffdf9, #fff7ed);
  border: 1px solid rgba(249, 115, 22, 0.12);
  transition: all 0.25s ease;
}

.fy-tip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 26px rgba(249, 115, 22, 0.12);
  border-color: rgba(249, 115, 22, 0.3);
}

.fy-tip-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1f2937;
}

.fy-tip-emoji {
  font-size: 1.15rem;
}

.fy-tip-desc {
  margin-top: 0.6rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #6b7280;
}

.fy-tip-list {
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
}

.fy-tip-list li {
  position: relative;
  padding: 0.35rem 0 0.35rem 1.15rem;
  font-size: 0.9rem;
  line-height: 1.65;
  color: #4b5563;
}

.fy-tip-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.95rem;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #fb923c);
}

/* 指南 */
.fy-guide {
  margin-top: 1.25rem;
  padding: 1.25rem;
  border-radius: 0.85rem;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 146, 60, 0.06));
  border: 1px dashed rgba(249, 115, 22, 0.35);
}

.fy-guide-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #e8722a;
  margin-bottom: 0.75rem;
}

.fy-guide-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.75rem;
}

.fy-guide-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.9rem;
  border-radius: 0.6rem;
  background: #ffffff;
  border: 1px solid rgba(249, 115, 22, 0.15);
}

.fy-guide-emoji {
  font-size: 1rem;
  flex-shrink: 0;
}

.fy-guide-item p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #4b5563;
}

/* 响应式 */
@media (max-width: 640px) {
  .fy-page {
    padding: 1.5rem 0.875rem 3rem;
  }
  .fy-hero {
    padding: 2.25rem 1rem;
  }
  .fy-module {
    padding: 1.25rem;
  }
}
</style>
