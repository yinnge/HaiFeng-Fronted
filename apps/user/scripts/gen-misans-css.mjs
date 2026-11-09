/**
 * 生成 apps/user/src/assets/styles/misans.css（勿手改生成物）。
 *
 * A) 族名统一。misans-webfont@4.3.1 分包的 result.css 族名不统一 ——
 *      misans-regular   -> "MiSans"          font-weight:400
 *      misans-medium    -> "MiSans Medium"   font-weight:400
 *      misans-semibold  -> "MiSans Semibold" font-weight:400
 *      misans-bold      -> "MiSans"          font-weight:700
 *    直接引入会让 font-weight:600 在 MiSans 族里只能向上匹配到 Bold(700)。
 *
 * B) 字重治理（2026-11-09 第三轮，用户要求「除导航栏 / Hero 左标题外全部降低」）。
 *    项目里 1176 处 CSS 字重声明 83% >= 500，另有 Tailwind font-medium 448 /
 *    font-bold 284 / font-semibold 205 处。装字体前系统栈只有 400/700，
 *    中文 500/600 靠合成显不出粗细；补齐真实字形后 11–17px 小字集体发黑。
 *    逐模块改字重会没完没了，因此**在 @font-face 层一次性封顶**：
 *
 *      MiSans（全站默认，--hf-font-sans）
 *        100-600 -> Regular   （正文、标签、按钮、罗盘节点、下拉项）
 *        700     -> Medium    （次级强调）
 *        800-900 -> Semibold  （全站最重，替代原先的 Bold，不会再厚重）
 *      MiSans Display（--hf-font-strong，仅 3 处）
 *        100-900 -> Bold      （主导航菜单 / 顶部品牌名 / Hero 左标题）
 *
 *    这样业务 CSS 里任何 font-weight 值最多只到 Semibold，以后新增模块
 *    写 font-bold / 800 / 900 也不会再冒出「厚重」；只有显式引用
 *    --hf-font-strong 的地方才是 Bold。例外集中在一个变量，改一处即可。
 *    资料列表 banner 标题(800@24-32px) 与罗盘节点(700@14px) 自动落到轻档。
 *
 * C) 本地化：删除 src:local(...) 避免本机装了不同版本 MiSans 时字形不一致；
 *    woff2 改相对路径交由 Vite 打包，不产生 jsdelivr / unpkg 境外请求
 *    （对齐 91a423f 移除境外 CDN）。
 *
 * 静态字体声明 font-weight 范围是 CSS Fonts 4 合法写法：命中区间即使用该
 * face，不做变轴插值，也不触发浏览器合成加粗。
 *
 * 重生成（升级 misans-webfont 或调整任何字重策略后必跑）：
 *   pnpm --filter @haifeng/user fonts:gen
 *
 * 想恢复「原始字重」做对比：把 FACE_SPECS 的 family 全设成 'MiSans'、
 * 声明依次改回 400 / 500 / 600 / 700 重跑即可；dist 体积与 URL 不变。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const USER_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PKG = path.join(USER_ROOT, 'node_modules', 'misans-webfont')
const OUT = path.join(USER_ROOT, 'src', 'assets', 'styles', 'misans.css')

// 从 src/assets/styles/ 出发，三级回到 apps/user/，再到 node_modules
const REL_PREFIX = '../../../node_modules/misans-webfont/misans'

// [源字重目录, 目标 font-family, 目标 font-weight 声明, 用途]
// 改这张表即可整体调节全站视觉重量，无需改任何组件 CSS。
const FACE_SPECS = [
  ['regular', 'MiSans', '100 600', '全站默认：正文 / 标签 / 按钮 / 罗盘节点'],
  ['medium', 'MiSans', '700', '全站默认：次级强调'],
  ['semibold', 'MiSans', '800 900', '全站默认上限：替代 Bold，不再厚重'],
  ['bold', 'MiSans Display', '100 900', '仅 --hf-font-strong：主导航 / 品牌名 / Hero 左标题'],
]

const header = `/* 自动生成，请勿手改 —— 由 apps/user/scripts/gen-misans-css.mjs 产出。
   来源：misans-webfont@4.3.1（MiSans Global，© 小米科技有限责任公司）
   许可：《MiSans 字体知识产权许可协议》—— 免费商用，但须在软件中注明使用了 MiSans 字体
        （已写在 SiteFooter.vue 页脚）。不得改编字体或其组件；可调字重/间距。
   本文件仅改 CSS 声明（族名/字重/URL），未改动任何字体文件。
   字重策略见脚本 FACE_SPECS：MiSans 最重只到 Semibold；Bold 仅由
   --hf-font-strong（MiSans Display）提供给主导航 / 品牌名 / Hero 左标题。
   unicode-range 分片由 cn-font-split 切好，浏览器只下载页面实际用到的分片。 */`

const chunks = [header]
const seen = new Map()

for (const [name, family, weight, usage] of FACE_SPECS) {
  const src = path.join(PKG, 'misans', `misans-${name}`, 'result.css')
  if (!fs.existsSync(src)) throw new Error(`缺少字体 CSS：${src}`)
  const css = fs.readFileSync(src, 'utf8')
  const faces = css.match(/@font-face\s*\{[^}]*\}/g) || []
  if (faces.length < 100) {
    throw new Error(`misans-${name} 分片数异常：${faces.length}，疑似包结构变更`)
  }

  chunks.push(`\n/* ${name} -> ${family} ${weight}（${faces.length} 分片）｜${usage} */`)
  for (const face of faces) {
    const rewritten = face
      .replace(/font-family\s*:\s*"[^"]*"/, `font-family:"${family}"`)
      .replace(/src\s*:\s*local\([^)]*\)\s*,\s*/, 'src:')
      .replace(/url\("\.\/(\d+\.woff2)"\)/g, `url("${REL_PREFIX}/misans-${name}/$1")`)
      .replace(/font-weight\s*:\s*\d+/, `font-weight:${weight}`)
    if (/local\(|https?:\/\/|font-family:"(?!MiSans(?: Display)?")/.test(rewritten)) {
      throw new Error(`改写失败，残留非预期内容：${rewritten.slice(0, 180)}`)
    }
    chunks.push(rewritten)
    const key = `${family} ${weight}`
    seen.set(key, (seen.get(key) || 0) + 1)
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, chunks.join('\n') + '\n', 'utf8')

console.log('生成:', OUT)
console.log(`体积: ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`)
for (const [k, n] of seen) {
  console.log(`  ${k}: ${n} 分片`)
}
