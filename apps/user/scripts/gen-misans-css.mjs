/**
 * 生成 apps/user/src/assets/styles/misans.css（勿手改生成物）。
 *
 * A) 族名统一。misans-webfont@4.3.1 分包后的 result.css 族名不统一 ——
 *      misans-regular   -> "MiSans"          font-weight:400
 *      misans-medium    -> "MiSans Medium"   font-weight:400
 *      misans-semibold  -> "MiSans Semibold" font-weight:400
 *      misans-bold      -> "MiSans"          font-weight:700
 *    直接引入会让 font-weight:600 在 MiSans 族里只能向上匹配到 Bold(700)。
 *    本脚本统一族名 "MiSans"，使各档按声明字重精确命中。
 *
 * B) 字重下移（2026-11-09 二次修正）。MiSans 真实字形比系统雅黑饱满，且本项目
 *    1176 处 CSS 字重声明里 83% 是 500+（700:337 / 600:331 / 500:259 / 400:198），
 *    另有 Tailwind font-medium 448 / font-bold 284 / font-semibold 205 处。
 *    装字体前系统栈只有 400/700，中文 500/600 靠合成几乎显不出粗细；补齐四档
 *    真实字形后全部「显形」，11–17px 小字（导航、筛选标签、文件列表）糊成黑团。
 *    实测 800/900 恰好全部是 >=24px 的大标题（Hero 46px / section 24px /
 *    file-banner 32px），用户认可那部分不动，因此只把 Bold 留给 800/900，
 *    中间档整体下移一级：
 *      400/500 -> Regular （范围声明，一份 CSS 覆盖两档，不增加体积）
 *      600     -> Medium  （原 Semibold）
 *      700     -> Semibold（原 Bold）
 *      800/900 -> Bold    （不变，大标题原样）
 *    静态字体声明 font-weight 范围是 CSS Fonts 4 合法写法：命中区间即使用该
 *    face，不做变轴插值，也不会触发浏览器合成加粗。
 *
 * 另做两件事：
 *   1. 删除 src:local(...)：避免本机装有不同版本 MiSans 时字形不一致。
 *   2. woff2 改为相对路径 -> Vite 会把分片作为本地 asset 打包，
 *      不产生 jsdelivr / unpkg 等境外请求（对齐 91a423f 移除境外 CDN）。
 *
 * 重生成（升级 misans-webfont 或调整映射后必跑）：
 *   pnpm --filter @haifeng/user fonts:gen
 *
 * 想恢复「原始字重」做对比：把 WEIGHT_MAP 改回
 *   [['regular','400'],['medium','500'],['semibold','600'],['bold','700']]
 * 重跑即可；dist 体积、URL、分片数完全不变，只是 CSS 里 4 个数字不同。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const USER_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PKG = path.join(USER_ROOT, 'node_modules', 'misans-webfont')
const OUT = path.join(USER_ROOT, 'src', 'assets', 'styles', 'misans.css')

// 从 src/assets/styles/ 出发，三级回到 apps/user/，再到 node_modules
const REL_PREFIX = '../../../node_modules/misans-webfont/misans'

// [源字重目录, 目标 font-weight 声明]。改这里即可整体调节全站视觉重量。
const WEIGHT_MAP = [
  ['regular', '400 500'],
  ['medium', '600'],
  ['semibold', '700'],
  ['bold', '800 900'],
]

const header = `/* 自动生成，请勿手改 —— 由 apps/user/scripts/gen-misans-css.mjs 产出。
   来源：misans-webfont@4.3.1（MiSans Global，© 小米科技有限责任公司）
   许可：《MiSans 字体知识产权许可协议》—— 免费商用，但须在软件中注明使用了 MiSans 字体
        （已写在 SiteFooter.vue 页脚）。不得改编字体或其组件；可调字重/间距。
   本文件仅改 CSS 声明（族名/字重/URL），未改动任何字体文件。
   字重映射见脚本 WEIGHT_MAP：400/500→Regular、600→Medium、700→Semibold、800/900→Bold。
   unicode-range 分片由 cn-font-split 切好，浏览器只下载页面实际用到的分片。 */`

const chunks = [header]
const seenWeights = new Map()

for (const [name, weight] of WEIGHT_MAP) {
  const src = path.join(PKG, 'misans', `misans-${name}`, 'result.css')
  if (!fs.existsSync(src)) throw new Error(`缺少字体 CSS：${src}`)
  const css = fs.readFileSync(src, 'utf8')
  const faces = css.match(/@font-face\s*\{[^}]*\}/g) || []
  if (faces.length < 100) {
    throw new Error(`misans-${name} 分片数异常：${faces.length}，疑似包结构变更`)
  }

  chunks.push(`\n/* ${name} -> MiSans ${weight}（${faces.length} 个 unicode-range 分片） */`)
  for (const face of faces) {
    const rewritten = face
      .replace(/font-family\s*:\s*"[^"]*"/, 'font-family:"MiSans"')
      .replace(/src\s*:\s*local\([^)]*\)\s*,\s*/, 'src:')
      .replace(/url\("\.\/(\d+\.woff2)"\)/g, `url("${REL_PREFIX}/misans-${name}/$1")`)
      .replace(/font-weight\s*:\s*\d+/, `font-weight:${weight}`)
    if (/local\(|https?:\/\/|font-family:"(?!MiSans")/.test(rewritten)) {
      throw new Error(`改写失败，残留非预期内容：${rewritten.slice(0, 180)}`)
    }
    chunks.push(rewritten)
    seenWeights.set(weight, (seenWeights.get(weight) || 0) + 1)
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, chunks.join('\n') + '\n', 'utf8')

console.log('生成:', OUT)
console.log(`体积: ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`)
for (const [w, n] of seenWeights) {
  console.log(`  MiSans ${w}: ${n} 分片`)
}
