// 全局修复无参 catch 吞错：
//   模式：catch { \n ElMessage.error('固定文案')  (紧邻下一行)
//   改为：catch (e: any) { \n ElMessage.error(e?.response?.data?.msg || e?.message || '固定文案')
// 跳过：故意静默（下一行不是 ElMessage.error/warning 的）与 city/list/_fixed.vue（备份）
const fs = require('fs')
const path = require('path')

const roots = [
  'D:/SelfCompany/Project-HaiFeng-fronted/apps/admin/src',
  'D:/SelfCompany/Project-HaiFeng-fronted/apps/user/src',
]
const SKIP_FILES = new Set(['D:/SelfCompany/Project-HaiFeng-fronted/apps/admin/src/views/city/list/_fixed.vue'])

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

let totalFixed = 0
const changedFiles = []

for (const root of roots) {
  for (const file of walk(root)) {
    if (SKIP_FILES.has(file)) continue
    const lines = fs.readFileSync(file, 'utf8').split('\n')
    let dirty = false
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(CATCH_RE)
      if (!m) continue
      const next = i + 1 < lines.length ? lines[i + 1] : ''
      const nm = next.match(MSG_RE)
      if (!nm) continue
      const indent = m[1]
      const msgIndent = nm[1]
      const method = nm[2]
      let arg = nm[3]
      if (/\?/.test(arg)) arg = `(${arg})` // 三元表达式包括号，避免 || 优先级错误
      const hasClose = lines[i].includes('}')
      lines[i] = hasClose ? `${indent}} catch (e: any) {` : `${indent}catch (e: any) {`
      lines[i + 1] = `${msgIndent}ElMessage.${method}(e?.response?.data?.msg || e?.message || ${arg})`
      dirty = true
      totalFixed++
      i++
    }
    if (dirty) {
      fs.writeFileSync(file, lines.join('\n'), 'utf8')
      changedFiles.push(file.replace('D:/SelfCompany/Project-HaiFeng-fronted/', ''))
    }
  }
}

console.log('总修复 catch 数:', totalFixed)
console.log('涉及文件数:', changedFiles.length)
console.log('\n=== 修改的文件 ===')
for (const f of changedFiles) console.log(f)
