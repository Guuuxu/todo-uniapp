/**
 * 格式化工具函数
 */

/**
 * 格式化日期
 * @param date 日期字符串或 Date 对象
 * @param format 格式字符串，默认 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: string = 'YYYY-MM-DD',
): string {
  // 处理 null 或 undefined
  if (!date) {
    return ''
  }

  const d = typeof date === 'string' ? new Date(date) : date

  // 检查 Date 对象是否有效
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    return ''
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
}

/**
 * 格式化时间
 * @param date 日期字符串或 Date 对象
 * @param format 格式字符串，默认 'HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatTime(
  date: string | Date | null | undefined,
  format: string = 'HH:mm:ss',
): string {
  // 处理 null 或 undefined
  if (!date) {
    return ''
  }

  const d = typeof date === 'string' ? new Date(date) : date

  // 检查 Date 对象是否有效
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    return ''
  }

  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化数字
 * @param num 数字
 * @param decimals 小数位数，默认 0
 * @param thousandsSeparator 是否使用千分位分隔符，默认 false
 * @returns 格式化后的数字字符串
 */
export function formatNumber(
  num: number,
  decimals: number = 0,
  thousandsSeparator: boolean = false,
): string {
  if (isNaN(num)) {
    return '0'
  }

  const fixed = num.toFixed(decimals)

  if (!thousandsSeparator) {
    return fixed
  }

  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return parts.join('.')
}
