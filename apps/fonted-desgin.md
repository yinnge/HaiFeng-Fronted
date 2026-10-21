
## 任务

1. 优化前端主页面的导航矩阵
2. 删除原来的：<div data-v-0ef3d734="" class="section-head reveal-left revealed"></div>


+---------------------------------------------------------------------------------------+
| [LOGO] |
| 海枫未来规划院 | 
| 描述 |   
+---------------------------------------------------------------------------------------+
| | |
| [ 规划专栏矩阵 - 8 列 ] | [ 动态速递 - 4 列 ] |
| | |
| +-------------------+-----------------+ | +-------------------------------------+ |
| | 01 初中专栏 | 02 高中专栏 | | | 规划院公告 [查看全部 ↗] | |
| | 学业奠基与升学指导| 科目选修与生涯规划| | +-------------------------------------+ |
| +-------------------+-----------------+ | | [政策] 2026新高考志愿投档规则要点 【时间】| |
| | 03 高考志愿填报 | 04 大学专栏 ||
| | 院校位次与专业精选| 学分绩点与成长发展| | +-------------------------------------+ |
| +-------------------+-----------------+ | | [资讯] 四六级核心备考节点安排发布 【时间】| |
| | 05 英语练习 | 06 考研专栏 | | | 10-18 | |
| | 中考到考研英语在线练习| 择校初试与复试规划| | +-------------------------------------+ |
| +-------------------+-----------------+ | | [招录] 国家公务员招考报名重点解析 【时间】| |
| | 07 考公专栏 | 08 研究生专栏 | | | 10-15 | |
| | 国考省考选岗精算 | 学术科研与文献开题| | +-------------------------------------+ |
| +-------------------+-----------------+ | | [就业] 秋招头部企业网申通道汇编 【时间】| |
| | 09 博士专栏 | 10 就业信息专栏 | | | 10-12 | |
| | 申博流程与顶刊发表| 行业风向与名企直通| | +-------------------------------------+ |
| +-------------------+-----------------+ | |
+---------------------------------------------------------------------------------------+

### 前端注意点
1. LOGO + 网站名 要居中，LOGO是动态的动画，之前主页实现过，复用即可。
2. 可以看到前端针对于导航栏的布局方案：（8:4 分栏，左侧专栏矩阵+右侧公告栏），这个架构肯定会导致右边的消息空余，根据左边专栏的长度来确定公告列表最多展示几条数据。

### 接口实现
#### 全周期规划专栏
1. 这个点击专栏之后直接跳转页面即可。查看：D:\SelfCompany\Project-HaiFeng-fronted\apps\user\src\config\navigation.ts。里面的一级目录有对应的跳转。【注意：“英语练习” 跳转到 “英语四六级”】

#### 公告专栏
1. 已对接好公告的接口，删除之前主页的公告信息：<section data-v-0ef3d734="" class="section-wrapper section-alt grain-overlay"><div data-v-0ef3d734="" class="section-container reveal revealed"></section>。
2. 主页只展示：类型，标题名，时间;标题名太长超过一定字符改为：...省略;类型字段用：【】包裹。


一、整体布局结构
你导航栏的主色调是橙色+白底+细下划线激活态，风格偏简洁商务。首页主体建议保持同样的"留白感"，不要让卡片区显得拥挤。

CSS

.homepage-main {
max-width: 1280px;
margin: 32px auto;
display: grid;
grid-template-columns: 2fr 1fr;  /* 约等于 8:4 */
gap: 24px;
padding: 0 24px;
}
关键优化点：

整体背景建议用浅灰色 #F5F6FA，卡片区用白底+轻阴影，形成"卡片浮在底色上"的层次感（而不是白底卡片+白底背景，容易糊成一片）
顶部 Logo 区和导航栏之间、导航栏和主体内容之间，建议都留 32-40px 的呼吸间距，避免贴得太紧
二、规划专栏矩阵（8列区域）优化
1. 卡片内部布局：建议用"横向"而非"纵向"
   因为这个区域较宽（整行的2/3），每张卡片本身也会比较宽，如果图标在上、文字在下（纵向堆叠），会显得卡片内部空间利用率低、显得空。建议改成左右结构：

text

┌─────────────────────────────────┐
│ [图标]   01  初中专栏              │
│          学业奠基与升学指导         │
└─────────────────────────────────┘
HTML

<a href="/junior" class="plan-card">
  <div class="plan-card__icon">🎒</div>
  <div class="plan-card__body">
    <div class="plan-card__title">
      <span class="plan-card__num">01</span> 初中专栏
    </div>
    <div class="plan-card__desc">学业奠基与升学指导</div>
  </div>
  <div class="plan-card__arrow">→</div>
</a>
CSS

.plan-card {
display: flex;
align-items: center;
gap: 16px;
padding: 20px;
background: #fff;
border-radius: 12px;
border: 1px solid #EFEFEF;
transition: all .25s ease;
}
.plan-card:hover {
transform: translateY(-4px);
box-shadow: 0 8px 24px rgba(255, 122, 0, 0.12);
border-color: #FF7A00;
}
.plan-card__icon {
width: 48px; height: 48px;
display: flex; align-items: center; justify-content: center;
background: #FFF4E8;
border-radius: 10px;
font-size: 22px;
}
.plan-card__num {
color: #FF7A00;
font-weight: 600;
margin-right: 4px;
}
.plan-card__title { font-size: 16px; font-weight: 600; color: #222; }
.plan-card__desc { font-size: 13px; color: #888; margin-top: 4px; }
.plan-card__arrow {
margin-left: auto;
color: #CCC;
transition: transform .2s;
}
.plan-card:hover .plan-card__arrow {
color: #FF7A00;
transform: translateX(4px);
}
2. 图标建议（给每个专栏配专属icon，提升辨识度）
   专栏	建议图标意象
   初中专栏	书包 / 台灯
   高中专栏	书本 / 生涯规划罗盘
   高考志愿填报	旗帜 / 地图定位
   大学专栏	校徽 / 学士帽
   英语练习	对话气泡 / ABC
   考研专栏	放大镜 / 奖杯
   考公专栏	天平 / 政府楼
   研究生专栏	显微镜 / 文献
   博士专栏	博士帽 / 期刊
   就业信息专栏	公文包 / 握手
   统一用线性图标（outline风格），颜色跟随hover状态变橙色，平时用深灰色，风格会比emoji更专业。推荐用 iconfont / Phosphor Icons / Remix Icon 这类图标库。

3. 编号样式小优化
   数字"01、02..."建议做成小圆角徽标而不是纯文字前缀，视觉上更精致：

CSS

.plan-card__num-badge {
display: inline-flex;
width: 20px; height: 20px;
background: #FF7A00;
color: #fff;
border-radius: 4px;
font-size: 11px;
align-items: center;
justify-content: center;
}
4. 网格排布
   你原方案是 2列×5行，这个密度刚好（10个卡片不多不少）。CSS：

CSS

.plan-grid {
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 16px;
}
三、动态速递（公告栏）优化
1. 头部结构
   HTML

<div class="notice-panel">
  <div class="notice-panel__header">
    <h3>规划院公告</h3>
    <a href="/notices" class="notice-panel__more">查看全部 ↗</a>
  </div>
  <ul class="notice-list">
    <li class="notice-item">
      <span class="tag tag--policy">政策</span>
      <p class="notice-item__title">2026新高考志愿投档规则要点</p>
      <span class="notice-item__date">10-20</span>
    </li>
    ...
  </ul>
</div>
2. 标签分类配色（强烈建议加，信息一眼可辨）
CSS

.tag { font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-right: 6px; }
.tag--policy { background: #FFF1E6; color: #FF7A00; }  /* 政策-橙 */
.tag--news   { background: #E8F3FF; color: #2E7DFF; }  /* 资讯-蓝 */
.tag--exam   { background: #E9F9EE; color: #16A34A; }  /* 招录-绿 */
.tag--job    { background: #F3E8FF; color: #9333EA; }  /* 就业-紫 */
3. 单条公告排版建议
   现在的 ASCII 图里标题和日期是上下两行，建议改成同一行、左右分布，更紧凑、更像资讯列表：

text

[政策] 2026新高考志愿投档规则要点 ............ 10-20
CSS

.notice-item {
display: flex;
align-items: center;
padding: 12px 0;
border-bottom: 1px dashed #EEE;
cursor: pointer;
}
.notice-item__title {
flex: 1;
font-size: 14px;
color: #333;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
margin: 0 8px;
}
.notice-item__date {
font-size: 12px;
color: #999;
flex-shrink: 0;
}
.notice-item:hover .notice-item__title {
color: #FF7A00;
}
这样每条公告标题过长会自动省略号截断，不会撑破布局。

4. 头部"查看全部"按钮细节
   CSS

.notice-panel__header {
display: flex;
justify-content: space-between;
align-items: center;
padding-bottom: 12px;
border-bottom: 2px solid #FF7A00;
margin-bottom: 8px;
}
.notice-panel__more {
font-size: 12px;
color: #999;
}
.notice-panel__more:hover { color: #FF7A00; }
用橙色底边线强调标题区，和导航栏的橙色激活下划线风格呼应，形成视觉统一。

5. 补充建议：可以加"最新"红点提醒
   最新一条公告前加一个小红点或"NEW"徽章，增强时效感：

HTML

<li class="notice-item">
  <span class="dot-new"></span>
  <span class="tag tag--policy">政策</span>
  ...
</li>
四、与导航栏的视觉一致性检查
你截图里导航栏的特点：

橙色品牌色（logo火焰图标 + 首页激活态）
字体偏细、间距宽松、无多余装饰
激活项有橙色下划线
建议首页主体也统一遵循：

所有可点击元素（卡片hover、查看全部、公告hover）统一用同一个橙色 #FF7A00（具体取你logo火焰的颜色值）
字体粗细保持一致：标题 600，正文 400，不要出现多种字重混用
圆角统一：建议统一用 8px 或 12px，不要卡片是12px、标签是4px、按钮又是20px，太随意
五、响应式适配
屏幕宽度	处理方式
桌面端 (>1024px)	8:4 两栏布局，卡片矩阵2列
平板端 (768-1024px)	公告栏移到专栏矩阵下方，各占一行，卡片矩阵仍2列
移动端 (<768px)	导航栏收起为汉堡菜单；卡片矩阵改为单列；公告栏单列紧跟其后
CSS

@media (max-width: 1024px) {
.homepage-main { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
.plan-grid { grid-template-columns: 1fr; }
}
六、总结优化清单（按优先级）
优先级	优化项
高	卡片内部改横向布局（图标+文字左右排），提升空间利用率
高	公告每条标题超长做省略号截断，避免撑破右侧栏
高	公告类型加彩色标签（政策/资讯/招录/就业分色）
中	整体背景改浅灰，卡片白底+阴影，增加层次感
中	10个专栏统一配专属线性图标
中	hover态统一：卡片上浮+橙色描边，公告标题变橙色
低	最新公告加小红点/NEW标记
低	响应式断点处理（平板/手机)