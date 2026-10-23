export const STORAGE_KEY = 'codes'
export const DEFAULT_COLOR = '#FFFFFF'

const HEX_COLOR = /^#?([0-9a-fA-F]{6})$/

export const DEFAULT_CODES = [
  {
    id: 'demo-qr',
    name: 'Sample QR',
    type: 'qr',
    content: 'https://docs.zepp.com',
    color: DEFAULT_COLOR
  },
  {
    id: 'demo-code128',
    name: 'Sample Code 128',
    type: 'code128',
    content: 'CODE-VAULT-123',
    color: DEFAULT_COLOR
  }
]

export function isValidColor(value) {
  return HEX_COLOR.test(String(value || '').trim())
}

export function normalizeColor(value) {
  const match = HEX_COLOR.exec(String(value || '').trim())
  return match ? `#${match[1].toUpperCase()}` : DEFAULT_COLOR
}

export function colorToNumber(value) {
  return parseInt(normalizeColor(value).slice(1), 16)
}

export function normalizeCodes(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((code) => code && code.id && code.type)
    .map((code) => ({
      id: String(code.id),
      name: String(code.name || 'Unnamed'),
      type: String(code.type),
      content: String(code.content || ''),
      color: normalizeColor(code.color)
    }))
}
