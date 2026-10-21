export function formatRate(value?: number | null): string {
  if (value == null) return '—'
  return `${value.toFixed(1)}%`
}

function salaryToK(value: number): string {
  return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
}

export function formatSalary(min?: number | null, max?: number | null): string {
  if (min == null && max == null) return '—'
  if (min != null && max != null) {
    return min === max ? salaryToK(min) : `${salaryToK(min)}–${salaryToK(max)}`
  }
  return salaryToK((min ?? max) as number)
}

export function formatGdp(value?: number | null): string {
  if (value == null) return '—'
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1).replace(/\.0$/, '')} 万亿`
  }
  return `${value.toFixed(2).replace(/\.00$/, '')} 亿元`
}

export function formatFee(value?: number | null): string {
  if (value == null) return '—'
  return `¥${value.toLocaleString('zh-CN')}`
}

export function formatGrowth(value?: number | null): string {
  if (value == null) return '—'
  return `${value.toFixed(1)}%`
}
