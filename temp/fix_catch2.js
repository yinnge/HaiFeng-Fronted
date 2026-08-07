// 补充修复2：catch { 后允许 0~2 个空行，再匹配 ElMessage.error/warning（幂等）
const fs = require('fs')
const path = require('path')

const roots = [
  'D:/SelfCompany/Project-HaiFeng-fronted/apps/admin/src',
  'D:/SelfCompany/Project-HaiFeng-fronted/apps/user/src',
]
const SKIP_FILES = new Set([path.normalize('D:/SelfCompany/Project-HaiFeng-fronted/apps/admin/src/views/city/list/_fixed.vue')])
const EXCLUDE_DIRS = new Set(['node_modules', 'dist'])

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

const CATCH_RE = /^(\s*)\}?\s*catch\s*\{\s*$/
const MSG_RE = /^(\s*)ElMessage\.(error|warning)\((.*)\)\s*;?\s*$/

let total = 0
const files = []
for (const root of roots) {
  for (const file of walk(root)) {
    if (SKIP_FILES.has(path.normalize(file))) continue
    const lines = fs.readFileSync(file, 'utf8').split('\n')
    let dirty = false
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(CATCH_RE)
      if (!m) continue
      // 跳过最多 2 个空行
      let j = i + 1
      let blank = 0
      while (j < lines.length && lines[j].trim() === '' && blank < 2) { j++; blank++ }
      if (j >= lines.length) continue
      const nm = lines[j].match(MSG_RE)
      if (!nm) continue
      const indent = m[1]
      const msgIndent = nm[1]
      const method = nm[2]
      let arg = nm[3]
      if (/\?/.test(arg)) arg = `(${arg})`
      const hasClose = lines[i].includes('}')
      lines[i] = hasClose ? `${indent}} catch (e: any) {` : `${indent}catch (e: any) {`
      lines[j] = `${msgIndent}ElMessage.${method}(e?.response?.data?.msg || e?.message || ${arg})`
      dirty = true
      total++
      i = j // 从该行之后继续
    }
    if (dirty) {
      fs.writeFileSync(file, lines.join('\n'), 'utf8')
      files.push(file.replace('D:/SelfCompany/Project-HaiFeng-fronted/', ''))
    }
  }
}
console.log('补充修复2:', total)
for (const f of files) console.log(' ', f)
