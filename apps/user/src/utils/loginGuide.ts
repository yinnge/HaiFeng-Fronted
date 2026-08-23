// apps/user/src/utils/loginGuide.ts
// 统一「登录引导」弹窗：品牌渐变浅橙主题（横幅点睛版），供全站未登录拦截场景复用
import { ElMessageBox } from 'element-plus'
import { h } from 'vue'

function LockIcon() {
  return h(
    'svg',
    {
      width: 26,
      height: 26,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: '#ffffff',
      'stroke-width': 1.8,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [h('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2 }), h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' })],
  )
}

/**
 * 弹出「请先登录」引导弹窗
 * @param message 正文说明文案，默认「登录后可查看详细内容」
 * @returns 点击「前往登录」返回 true；取消 / 关闭 / 点遮罩返回 false
 */
export function confirmLogin(message = '登录后可查看详细内容'): Promise<boolean> {
  return ElMessageBox({
    title: '',
    message: h('div', { class: 'login-guide' }, [
      h('div', { class: 'login-guide__banner' }, [h(LockIcon), h('span', '登录后解锁完整内容')]),
      h('div', { class: 'login-guide__body' }, [
        h('p', { class: 'login-guide__title' }, '请先登录'),
        h('p', { class: 'login-guide__desc' }, message),
      ]),
    ]),
    confirmButtonText: '前往登录',
    cancelButtonText: '暂不',
    customClass: 'login-guide-box',
    closeOnClickModal: true,
    showClose: false,
  })
    .then(() => true)
    .catch(() => false)
}
