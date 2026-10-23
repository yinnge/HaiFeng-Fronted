// apps/user/src/composables/useProvinceLock.ts
// 高考省份锁定状态（模块级单例，多组件共享）：
// - false：游客（未登录）或 登录但服务端还没有档案 → 省份可随便切换
// - true ：已登录且已在服务端保存过档案 → 省份锁定，
//          导航栏吸附条与档案表单里的「高考省份」都不可再改（后端同样强制）。
// 状态由 utils/gaokaoArchive.ts 的 loadArchiveSmart / saveArchiveSmart 统一同步。
import { ref } from 'vue'

const provinceLocked = ref(false)

export function useProvinceLock() {
  function setProvinceLocked(val: boolean) {
    provinceLocked.value = val
  }
  return { provinceLocked, setProvinceLocked }
}
