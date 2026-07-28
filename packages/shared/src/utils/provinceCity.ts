// @ts-expect-error - china-area-data has no types
import chinaAreaData from 'china-area-data'

const data = chinaAreaData as any

// 直辖市列表（city下级为"市辖区"，需要展开到区级）
const DIRECT_CONTROLLED_MUNICIPALITIES = ['北京', '天津', '上海', '重庆']

// 省份简称 → china-area-data 全称映射
const PROVINCE_FULL_NAME_MAP: Record<string, string> = {
  '北京': '北京市',
  '天津': '天津市',
  '河北': '河北省',
  '山西': '山西省',
  '内蒙古': '内蒙古自治区',
  '辽宁': '辽宁省',
  '吉林': '吉林省',
  '黑龙江': '黑龙江省',
  '上海': '上海市',
  '江苏省': '江苏省',
  '江苏': '江苏省',
  '浙江': '浙江省',
  '安徽': '安徽省',
  '福建': '福建省',
  '江西': '江西省',
  '山东': '山东省',
  '河南': '河南省',
  '湖北': '湖北省',
  '湖南': '湖南省',
  '广东': '广东省',
  '广西': '广西壮族自治区',
  '海南': '海南省',
  '重庆': '重庆市',
  '四川': '四川省',
  '贵州': '贵州省',
  '云南': '云南省',
  '西藏': '西藏自治区',
  '陕西': '陕西省',
  '甘肃': '甘肃省',
  '青海': '青海省',
  '宁夏': '宁夏回族自治区',
  '新疆': '新疆维吾尔自治区',
  '香港': '香港特别行政区',
  '澳门': '澳门特别行政区',
  '台湾': '台湾省',
}

interface CityOption {
  value: string
  label: string
}

// 缓存：省份 → 城市选项列表
const cache = new Map<string, CityOption[]>()

/**
 * 根据省份名称获取该省份下的城市选项列表
 * - 普通省份：返回地级市（去掉"市"后缀）
 * - 直辖市：展开到区级（如"东城区"、"朝阳区"）
 */
export function getCityOptionsByProvince(province: string): CityOption[] {
  if (!province) return []
  if (cache.has(province)) return cache.get(province)!

  const fullName = PROVINCE_FULL_NAME_MAP[province]
  if (!fullName) return []

  // 在 china-area-data 中查找该省份的 code
  const provinces: Record<string, string> = data['86'] || {}
  const provinceCode = Object.entries(provinces).find(([, name]) => name === fullName)?.[0]
  if (!provinceCode) return []

  const cityMap: Record<string, string> = data[provinceCode] || {}
  const result: CityOption[] = []

  for (const [, cityName] of Object.entries(cityMap)) {
    if (cityName === '市辖区') {
      // 直辖市：展开到区级
      const districtMap: Record<string, string> = data[provinceCode.replace(/00$/, '01')] || {}
      for (const [, districtName] of Object.entries(districtMap)) {
        if (districtName !== '市辖区') {
          result.push({ value: districtName as string, label: districtName as string })
        }
      }
    } else {
      // 普通地级市：去掉"市"后缀
      const cleanName = (cityName as string).replace(/市$/, '')
      result.push({ value: cleanName, label: cleanName })
    }
  }

  cache.set(province, result)
  return result
}
