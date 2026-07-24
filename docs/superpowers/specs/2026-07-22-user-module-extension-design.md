# 用户管理模块扩展设计文档

## 概述

在现有「用户管理」模块下扩展4个子页面：订单管理、佣金管理、通知管理、提现管理。遵循现有 admin 端页面模式（搜索栏 + 操作栏 + 表格 + 弹窗），背景色 `#f0f2f5`，白色圆角卡片。

## 导航结构

```
用户管理 (/user, icon: User)                     level=1, moduleCode 无
├── 用户列表 (/user/list)                        user_member - 已有，保持原名
├── 订单管理 (/user/order)                       user_order - 新增
├── 佣金管理 (/user/commission)                  user_commission - 新增
├── 通知管理 (/user/notification)                user_notification - 新增
└── 提现管理 (/user/withdraw)                    user_withdraw - 新增
```

路由文件：`apps/admin/src/router/modules/user.ts` — 保持顶部路径 `/user`，5个子路由平铺。

## 页面设计

### 1. 订单管理 (`/user/order`)

**搜索栏**（inline el-form，白色圆角卡片）：
| 字段 | 组件 | 说明 |
|-----|------|------|
| 手机号 | el-input | 模糊搜索，最长50字符 |
| 微信号 | el-input | 精确匹配（盲索引） |
| 操作人 | el-input | 模糊搜索 |
| 订单类型 | el-select | 全部 / 新开通 / 续费升级 |

**表格列**：
| 列 | 宽度 | 说明 |
|---|------|------|
| ID | 140 | |
| 订单号 | 180 | |
| 会员名称 | 100 | |
| 手机号 | 120 | 脱敏显示 |
| 微信号 | 120 | 脱敏显示，'-' 占位 |
| 订单类型 | 100 | new→新开通, renewal→续费升级 |
| 变更前类型 | 100 | normal/pro/vip 对应中文 |
| 变更后类型 | 100 | 同上 |
| 开通时长 | 100 | X 个月 |
| 金额 | 100 | ¥XX.XX |
| 创建时间 | 180 | |
| 操作 | 280 | fixed right |

**操作按钮**（link 类型）：
- 详情（primary）
- 查看微信（primary）— 频率限制，记录日志
- 禁用（danger）— 软删除
- 恢复（success）— 仅对已禁用记录显示
- 硬删除（danger）— 物理删除，有佣金关联则拒绝

**详情弹窗**（el-dialog, 700px）：el-descriptions border column=2 展示全部字段（含 memberId, beforeExpireAt, afterExpireAt, operatorName, remark, 创建时间, 更新时间），微信号行有"查看明文"按钮。

### 2. 佣金管理 (`/user/commission`)

**搜索栏**：
| 字段 | 组件 | 说明 |
|-----|------|------|
| 推荐人手机号 | el-input | 前缀匹配 |
| 推荐人名称 | el-input | 模糊搜索 |
| 被推荐人手机号 | el-input | 前缀匹配 |
| 被推荐人名称 | el-input | 模糊搜索 |
| 订单号 | el-input | 模糊搜索 |

**表格列**：ID / 推荐人名称 / 推荐人手机号(脱敏) / 被推荐人名称 / 被推荐人手机号(脱敏) / 订单金额(¥) / 佣金比例(%) / 佣金金额(¥) / 创建时间 / 操作

**操作按钮**：详情 / 禁用(danger) / 恢复(success) / 硬删除(danger)

**详情弹窗**（el-dialog, 700px）：el-descriptions 展示列表全部字段，无额外详情接口。

### 3. 通知管理 (`/user/notification`)

**搜索栏**：
| 字段 | 组件 | 说明 |
|-----|------|------|
| 用户ID | el-input | 精确查询 |
| 通知类型 | el-select | 全部 / 会员即将到期 / 会员已过期 / 佣金到账 / 佣金已发放 / 提现被拒绝 / 系统公告 / 会员续费成功 / 会员开通成功 |
| 是否已读 | el-select | 全部 / 已读 / 未读 |

**操作栏**：`群发公告` 按钮(primary) / `刷新` 按钮

**表格列**：ID / 用户ID / 用户名(脱敏) / 通知类型(中文) / 标题 / 内容 / 已读状态(已读`success`/未读`info`) / 创建时间 / 操作

**操作按钮**：详情 / 禁用(danger) / 恢复(success) / 硬删除(danger)

**群发公告弹窗**（el-dialog, 500px）：标题(el-input) + 内容(el-textarea rows=4) 表单，确认后调用 `POST /broadcast`

**通知类型映射**：
| member_expire_soon | 会员即将到期 |
| member_expired | 会员已过期 |
| commission_earned | 佣金到账 |
| commission_paid | 佣金已发放 |
| commission_rejected | 提现被拒绝 |
| system_notice | 系统公告 |
| member_renewed | 会员续费成功 |
| member_activation_success | 会员开通成功 |

### 4. 提现管理 (`/user/withdraw`)

**搜索栏**：
| 字段 | 组件 | 说明 |
|-----|------|------|
| 用户名 | el-input | 模糊搜索 |
| 手机号 | el-input | 模糊搜索 |
| 微信号 | el-input | 精确查询 |
| 状态 | el-select | 全部 / 待处理 / 已支付 / 已拒绝 |

**表格列**：ID / 用户名(脱敏) / 手机号(脱敏) / 微信号(脱敏) / 提现金额(¥) / 状态(待处理`warning`/已支付`success`/已拒绝`danger`) / 处理人 / 备注(show-overflow-tooltip) / 创建时间 / 更新时间 / 操作

**操作按钮**：
- 详情（primary）
- 查看微信（primary）— 频率限制，记录日志
- 处理提现（warning）— 仅对 status=pending 的记录显示
- 禁用（danger）— 软删除
- 恢复（success）— 仅对已禁用记录
- 硬删除（danger）

**处理提现弹窗**（el-dialog, 500px）：两个操作按钮「确认打款」「拒绝退款」，选中后显示备注输入框。确认后调用 `PUT /{id}/process`。

## 前端文件清单

每个新子页面需要：

### types/user/ 新增

```typescript
// order.ts
export interface OrderListVO { id, orderNo, memberName, phone, wechatId, orderType, beforeType, afterType, durationMonths, amount, createdAt }
export interface OrderDetailVO { ... + memberId, beforeExpireAt, afterExpireAt, operatorId, operatorName, remark, updatedAt }
export interface OrderQueryDTO extends BasePageQuery { phone?, wechatId?, operatorName?, orderType? }

// commission.ts
export interface CommissionListVO { id, referrerName, referrerPhone, refereeName, refereePhone, orderId, orderAmount, commissionRate, commissionAmount, createdAt }
export interface CommissionQueryDTO extends BasePageQuery { referrerPhone?, referrerName?, refereePhone?, refereeName?, orderNo? }

// notification.ts
export interface NotificationListVO { id, memberId, memberName, notificationType, title, content, isRead, createdAt, readAt }
export interface NotificationQueryDTO extends BasePageQuery { memberId?, notificationType?, isRead? }
export interface BroadcastDTO { title: string, content: string }

// withdraw.ts
export interface WithdrawListVO { id, memberId, memberName, phone, wechatId, amount, status, operatorName, remark, createdAt, updatedAt }
export interface WithdrawQueryDTO extends BasePageQuery { memberName?, phone?, wechatId?, status? }
export interface WithdrawProcessDTO { action: 'paid' | 'rejected', remark?: string }
```

### api/user/ 新增

```typescript
// order.ts
export const getOrderPage = (params: OrderQueryDTO) => request.get(`/api/v1/admin/user/order/list`, { params })
export const getOrderDetail = (id: number) => request.get(`/api/v1/admin/user/order/${id}`)
export const getOrderWechat = (id: number) => request.get(`/api/v1/admin/user/order/${id}/wechat`)
export const deleteOrder = (id: number) => request.delete(`/api/v1/admin/user/order/${id}`)
export const hardDeleteOrder = (id: number) => request.delete(`/api/v1/admin/user/order/${id}/hard`)
export const restoreOrder = (id: number) => request.put(`/api/v1/admin/user/order/${id}/restore`)

// commission.ts
export const getCommissionPage = (params) => request.get(`/api/v1/admin/user/commission/list`, { params })
export const deleteCommission = (id) => request.delete(`/api/v1/admin/user/commission/${id}`)
export const hardDeleteCommission = (id) => request.delete(`/api/v1/admin/user/commission/${id}/hard`)
export const restoreCommission = (id) => request.put(`/api/v1/admin/user/commission/${id}/restore`)

// notification.ts
export const getNotificationPage = (params) => request.get(`/api/v1/admin/user/notification/list`, { params })
export const broadcastNotification = (data: BroadcastDTO) => request.post(`/api/v1/admin/user/notification/broadcast`, data)
export const deleteNotification = (id) => request.delete(`/api/v1/admin/user/notification/${id}`)
export const hardDeleteNotification = (id) => request.delete(`/api/v1/admin/user/notification/${id}/hard`)
export const restoreNotification = (id) => request.put(`/api/v1/admin/user/notification/${id}/restore`)

// withdraw.ts
export const getWithdrawPage = (params) => request.get(`/api/v1/admin/user/withdraw/list`, { params })
export const getWithdrawWechat = (id) => request.get(`/api/v1/admin/user/withdraw/${id}/wechat`)
export const processWithdraw = (id, data: WithdrawProcessDTO) => request.put(`/api/v1/admin/user/withdraw/${id}/process`, data)
export const deleteWithdraw = (id) => request.delete(`/api/v1/admin/user/withdraw/${id}`)
export const hardDeleteWithdraw = (id) => request.delete(`/api/v1/admin/user/withdraw/${id}/hard`)
export const restoreWithdraw = (id) => request.put(`/api/v1/admin/user/withdraw/${id}/restore`)
```

### views/user/ 新增 4 个页面目录

每个页面一个 `index.vue` 文件，遵循 announcement 页的 4段式模式（搜索栏 → 操作栏 → 表格 + 分页 → 弹窗）。

### router/modules/user.ts 修改

在 children 中添加 4 个新子路由，顺序：list → order → commission → notification → withdraw。

## 错误处理

所有接口返回非 200 code 时使用 `ElMessage.error(res.data.msg)` 展示后端错误消息。常见错误：
- `400: 数据已被其他人修改，请刷新后重试`
- `400: 该订单存在关联的佣金记录，无法硬删除`
- `400: 请先禁用该佣金记录，再执行硬删除`
- `400: 该订单所属会员已不存在，无法恢复`
- `400: 处理失败，该提现记录状态已变更，请刷新后重试`

网络异常使用 try-catch 捕获，提示"操作失败"。

## 权限

路由添加 `meta.moduleCode`，与 AGENTS.md 定义一致：
- order: `user_order`
- commission: `user_commission`
- notification: `user_notification`
- withdraw: `user_withdraw`

## 注意事项

- 微信号查看接口有频率限制（每IP每分钟10次），前端无需额外处理
- 所有写操作记录操作日志（后端自动）
- 硬删除前后端校验外键约束，前端按返回消息提示
- 订单列表无 status/is_deleted 字段，无法区分已删除记录，禁用/恢复后手动刷新
- 佣金/通知/提现列表同样无 is_deleted 字段
