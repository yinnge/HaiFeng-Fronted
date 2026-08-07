// 扫描 apps/admin 与 apps/user 下所有无参 catch（catch { / catch ()），
// 输出 文件:行号 + 后续上下文，用于分类哪些是吞错、哪些是故意静默。
const fs = require('fs')
const path = require('path')

const roots = [
  'D:/SelfCompany/Project-HaiFeng-fronted/apps/admin/src',
  'D:/SelfCompany/Project-HaiFeng-fronted/apps/user/src',
]

const EXCLUDE_DIRS = new Set(['node_modules', 'dist', '.git'])

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (EXCLUDE_DIRS.has(name)) continue
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (/\.(vue|ts|js)$/.test(name)) out.push(p)
  }
  return out
}

const results = []
for (const root of roots) {
  for (const file of walk(root)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n')
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^\s*}?\s*catch\s*(\(\))?\s*\{\s*$/)
      if (!m) continue
      // 取 catch 后最多 3 行
      const ctx = lines.slice(i + 1, i + 4).map((l) => l.trim()).filter(Boolean)
      const rel = file.replace('D:/SelfCompany/Project-HaiFeng-fronted/', '')
      results.push({ file: rel, line: i + 1, ctx })
    }
  }
}

// 分类
const fix = []      // 吞错：有 ElMessage.error(固定文案) 或 console/throw
const cancel = []   // 取消：// cancel 或空 catch（需人工确认）
const other = []    // 其他

for (const r of results) {
  const joined = r.ctx.join(' | ')
  if (/cancel|用户取消|关闭/.test(joined) || r.ctx.length === 0) {
    cancel.push(r)
  } else if (/ElMessage\.(error|warning)/.test(joined) || /console\./.test(joined) || /throw/.test(joined)) {
    fix.push(r)
  } else {
    other.push(r)
  }
}

console.log('========== 总览 ==========')
console.log('无参 catch 总数:', results.length)
console.log('A. 吞错(需修):', fix.length)
console.log('B. 取消/空(跳过或人工):', cancel.length)
console.log('C. 其他(需看上下文):', other.length)

const byDir = {}
for (const r of results) {
  const d = r.file.split('/').slice(0, 4).join('/')
  byDir[d] = (byDir[d] || 0) + 1
}
console.log('\n========== 按目录分布 ==========')
for (const [d, c] of Object.entries(byDir).sort((a, b) => b[1] - a[1])) {
  console.log(c, d)
}

console.log('\n========== A. 吞错清单 (file:line: 上下文) ==========')
for (const r of fix) {
  console.log(`${r.file}:${r.line}: ${r.ctx.join(' ⏎ ')}`)
}

console.log('\n========== B. 取消/空 catch (file:line) ==========')
for (const r of cancel) {
  console.log(`${r.file}:${r.line}: ${r.ctx.join(' ⏎ ') || '(空)'}`)
}

console.log('\n========== C. 其他 (file:line: 上下文) ==========')
for (const r of other) {
  console.log(`${r.file}:${r.line}: ${r.ctx.join(' ⏎ ')}`)
}
