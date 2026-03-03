import { ECDICT } from './ecdict'

// 本地英汉词典（示例数据 + ECDICT）。你可以按需要扩充。
// key 一律用小写、单空格，例如： "good morning"
export const LOCAL_DICT: Record<string, string> = {
  // 小学高频
  apple: '苹果',
  banana: '香蕉',
  orange: '橙子',
  teacher: '老师',
  student: '学生',
  book: '书',
  school: '学校',
  friend: '朋友',
  family: '家庭',
  happy: '高兴的',
  sad: '难过的',
  good: '好的',
  bad: '坏的',
  morning: '早晨',
  afternoon: '下午',
  evening: '傍晚',
  night: '夜晚',
  'good morning': '早上好',
  'good night': '晚安',
  'thank you': '谢谢你',
  'see you': '再见',

  // 这里可以继续增加初中、高中、大学词汇……
}

export function normalizeKey(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

export function lookupLocal(text: string): string | null {
  const key = normalizeKey(text)
  if (!key) return null
  return LOCAL_DICT[key] ?? ECDICT[key] ?? null
}

