<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

/**
 * 百宝箱（与核心服务导航同级别的工具导航）：
 * 收纳原导航中的查询工具：院校查询 / 专业查询 / 城市查询 / 企业行业 / 竞赛证书。
 * 5 张暖色圆角卡平铺，每张卡内竖排条目（· 前缀 + 名称），无图标无筛选页签。
 * 主页区块与悬浮窗弹框共用本组件。
 */

interface BoxItem {
  label: string
  route?: string
}

interface BoxCard {
  title: string
  items: BoxItem[]
}

const cards: BoxCard[] = [
  {
    title: '院校查询',
    items: [{ label: '院校列表', route: '/university' }],
  },
  {
    title: '专业查询',
    items: [
      { label: '本科专业', route: '/major' },
      { label: '考研专业', route: '/postgrad-major' },
    ],
  },
  {
    title: '城市查询',
    items: [{ label: '城市列表', route: '/city' }],
  },
  {
    title: '企业行业',
    items: [
      { label: '企业查询', route: '/enterprise' },
      { label: '行业查询', route: '/industry' },
    ],
  },
  {
    title: '竞赛证书',
    items: [
      { label: '竞赛', route: '/competition' },
      { label: '证书', route: '/certificate' },
    ],
  },
]

const router = useRouter()

function go(item: BoxItem) {
  if (!item.route) {
    ElMessage.info('该功能正在开发中')
    return
  }
  router.push(item.route)
}
</script>

<template>
  <div class="treasure-box">
    <div class="tb-grid">
      <section v-for="card in cards" :key="card.title" class="tb-card">
        <h3 class="tb-card-title">{{ card.title }}</h3>
        <ul class="tb-list">
          <li v-for="item in card.items" :key="item.label">
            <button type="button" class="tb-item" @click="go(item)">
              <span class="tb-item-dot">·</span>
              <span class="tb-item-label">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.treasure-box {
  width: 100%;
}

/* 5 卡网格：宽屏 5 列，窄屏自动降列 */
.tb-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.1rem;
  align-items: stretch;
}

@media (max-width: 1200px) {
  .tb-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 720px) {
  .tb-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .tb-grid {
    grid-template-columns: 1fr;
  }
}

/* 暖纸色圆角卡片：柔和渐变替代生硬纯色，去塑料感 */
.tb-card {
  border-radius: 18px;
  background: linear-gradient(180deg, #fbfaf6, #f6f3ec);
  box-shadow: inset 0 0 0 1px rgba(212, 168, 90, 0.1);
  padding: 1.2rem 1.3rem 1.3rem;
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.tb-card:hover {
  transform: translateY(-4px);
  box-shadow:
    inset 0 0 0 1px rgba(212, 168, 90, 0.16),
    0 14px 30px rgba(180, 120, 40, 0.12);
}

.tb-card-title {
  font-size: 1.02rem;
  font-weight: 800;
  color: #44403c;
  margin-bottom: 0.95rem;
}

.tb-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

/* 条目：· 前缀 + 名称，行式按钮 */
.tb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.4rem 0.5rem;
  border-radius: 12px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.25s ease;
}

.tb-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateX(3px);
}

.tb-item:active {
  transform: scale(0.98);
}

.tb-item-dot {
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1;
  color: #d4a85a;
  flex-shrink: 0;
  transform: translateY(-2px);
}

.tb-item-label {
  font-size: 0.92rem;
  font-weight: 500;
  color: #57534e;
}

.tb-item:hover .tb-item-label {
  color: #e8722a;
}

@media (prefers-reduced-motion: reduce) {
  .tb-card,
  .tb-item {
    transition: none;
  }
}
</style>
