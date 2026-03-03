import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 使用完整 ecdict.csv，从中裁剪出高频+考试词汇子集
const inputPath = path.join(__dirname, '..', 'ECDICT', 'ecdict.csv')
const outputPath = path.join(__dirname, '..', 'src', 'dictionary', 'ecdict.ts')

console.log('Reading:', inputPath)

const text = fs.readFileSync(inputPath, 'utf8')
const lines = text.split(/\r?\n/).filter(Boolean)

// CSV header: word,phonetic,definition,translation,pos,collins,oxford,tag,bnc,frq,exchange,detail,audio
lines.shift() // remove header

/** @type {Record<string, string>} */
const dict = {}

for (const line of lines) {
  // 简单 CSV 解析：按逗号分列，处理双引号包裹
  const cols = []
  let cur = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (ch === ',' && !inQuotes) {
      cols.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  cols.push(cur)

  const rawWord = (cols[0] || '').trim()
  const rawTrans = (cols[3] || '').trim()
  const rawCollins = (cols[5] || '').trim()
  const rawOxford = (cols[6] || '').trim()
  const rawTag = (cols[7] || '').trim()
  const rawBnc = (cols[8] || '').trim()
  const rawFrq = (cols[9] || '').trim()

  if (!rawWord || !rawTrans) continue

  const word = rawWord.replace(/^'+|'+$/g, '').toLowerCase()
  if (!word) continue

  // 词频 & 标签信息
  const collins = parseInt(rawCollins || '0', 10) || 0
  const oxford = parseInt(rawOxford || '0', 10) || 0
  const bnc = parseInt(rawBnc || '0', 10) || 0
  const frq = parseInt(rawFrq || '0', 10) || 0
  const tag = rawTag

  // 1) 考试大纲词（tag 含 zk/gk/cet4/cet6/ky/gre/ielts/toefl）
  const examTags = ['zk', 'gk', 'cet4', 'cet6', 'ky', 'gre', 'ielts', 'toefl']
  const isExam =
    tag &&
    examTags.some(t => tag.split(/\s+/).includes(t))

  // 2) 高频词：BNC 或当代语料库词频前 20000
  const isHighFreq =
    (bnc > 0 && bnc <= 20000) ||
    (frq > 0 && frq <= 20000)

  // 3) 牛津 3000 或柯林斯 3 星及以上
  const isCore = oxford === 1 || collins >= 3

  if (!isExam && !isHighFreq && !isCore) {
    continue
  }

  // 只取中文释义第一行
  const trans = rawTrans.split('\\n')[0].trim()
  if (!trans) continue

  if (!dict[word]) {
    dict[word] = trans
  }
}

const entries = Object.entries(dict)
  .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
  .join('\n')

const output = `// 自动从 ECDICT 生成，请不要手动编辑
// 来源: https://gitcode.com/gh_mirrors/ec/ECDICT

export const ECDICT: Record<string, string> = {
${entries}
};
`

fs.writeFileSync(outputPath, output, 'utf8')
console.log('Generated:', outputPath, 'items:', Object.keys(dict).length)

