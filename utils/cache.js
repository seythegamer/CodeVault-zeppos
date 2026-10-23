import { localStorage } from '@zos/storage'
import { STORAGE_KEY, normalizeCodes } from '../shared/defaults'

export function readCachedCodes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === undefined || raw === null || raw === '') return null
    if (typeof raw === 'string') return normalizeCodes(JSON.parse(raw))
    return normalizeCodes(raw)
  } catch (error) {
    return null
  }
}

export function writeCachedCodes(codes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(codes))
  } catch (error) {
    console.log('cache write failed', error)
  }
}
