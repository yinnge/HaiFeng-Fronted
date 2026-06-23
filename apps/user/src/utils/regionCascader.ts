// @ts-expect-error - china-area-data has no types
import chinaAreaData from 'china-area-data'

export interface CascaderOption {
  value: string
  label: string
  children?: CascaderOption[]
}

export function buildRegionOptions(): CascaderOption[] {
  const provinces: Record<string, string> = (chinaAreaData as any)['86'] || {}
  return Object.entries(provinces).map(([provinceCode, provinceName]) => ({
    value: provinceName as string,
    label: provinceName as string,
    children: buildChildren(provinceCode),
  }))
}

function buildChildren(parentCode: string): CascaderOption[] {
  const data: Record<string, string> = (chinaAreaData as any)[parentCode] || {}
  const children: CascaderOption[] = []

  for (const [code, name] of Object.entries(data)) {
    if (name === '市辖区') {
      const sub: Record<string, string> = (chinaAreaData as any)[code] || {}
      for (const [, subName] of Object.entries(sub)) {
        if (subName !== '市辖区') {
          children.push({ value: subName as string, label: subName as string })
        }
      }
    } else {
      const sub: Record<string, string> = (chinaAreaData as any)[code] || {}
      const subChildren = Object.entries(sub)
        .filter(([, n]) => n !== '市辖区')
        .map(([, n]) => ({ value: n as string, label: n as string }))
      if (subChildren.length > 0) {
        children.push({
          value: name as string,
          label: name as string,
          children: subChildren,
        })
      } else {
        children.push({ value: name as string, label: name as string })
      }
    }
  }

  return children
}
