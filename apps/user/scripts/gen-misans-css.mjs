/**
 * 生成 apps/user/src/assets/styles/misans.css（勿手改生成物）。
 *
 * 背景：misans-webfont@4.3.1 分包后的 result.css 族名不统一 ——
 *   misans-regular   -> font-family:"MiSans"          font-weight:400
 *   misans-medium    -> font-family:"MiSans Medium"   font-weight:400
 *   misans-semibold  -> font-family:"MiSans Semibold" font-weight:400
 *   misans-bold      -> font-family:"MiSans"          font-weight:700
 * 若直接引入，CSS 字体匹配规则会让 font-weight:600 命中 Bold(700)，
 * 标题比设计稿更粗。本脚本把四档统一到族名 "MiSans" 并写入正确字重，
 * 使 font-weight:400/500/600/700 各命中真实字形（含上一轮定的标题 600）。
 *
 * 另做两件事：
 *   1. 删除 src:local(...)：避免本机装有不同版本 MiSans 时字形不一致。
 *   2. woff2 改为相对路径 -> Vite 会把分片作为本地 asset 打包，
 *      不产生 jsdelivr / unpkg 等境外请求（对齐 91a423f 移除境外 CDN）。
 *
 * 重生成（升级 misans-webfont 后必跑）：
 *   pnpm --filter @haifeng/user fonts:gen
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const USER_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PKG = path.join(USER_ROOT, 'node_modules', 'misans-webfont')
const OUT = path.join(USER_ROOT, 'src', 'assets', 'styles', 'misans.css')

// 从 src/assets/styles/ 出发，三级回到 apps/user/，再到 node_modules
const REL_PREFIX = '../../../node_modules/misans-webfont/misans'

const WEIGHTS = [
  ['regular', 400],
  ['medium', 500],
  ['semibold', 600],
  ['bold', 700],
]

const header = `/* 自动生成，请勿手改 —— 由 apps/user/scripts/gen-misans-css.mjs 产出。
   来源：misans-webfont@4.3.1（MiSans Global，© 小米科技有限责任公司）
   许可：《MiSans 字体知识产权许可协议》—— 免费商用，但须在软件中注明使用了 MiSans 字体
        （已写在 SiteFooter.vue 页脚）。不得改编字体或其组件；可调字重/间距。
   本文件仅改 CSS 声明（族名/字重/URL），未改动任何字体文件。
   unicode-range 分片由 cn-font-split 切好，浏览器只下载页面实际用到的分片。 */`

const chunks = [header]
const seenWeights = new Map()

for (const [name, weight] of WEIGHTS) {
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
for (const [w, n] of [...seenWeights].sort((a, b) => a[0] - b[0])) {
  console.log(`  MiSans ${w}: ${n} 分片`)
}
