import { getDeviceInfo } from '@zos/device'
import { layoutBarcode, layoutMatrix } from '../shared/draw'

export const COLORS = {
  white: 0xffffff,
  black: 0x000000,
  dark: 0x000000,
  card: 0x141416,
  cardBorder: 0x2a2a2e,
  cardPressed: 0x1f1f22,
  field: 0x1f1f22,
  muted: 0x8e8e93,
  accent: 0xff6b3d,
  warn: 0xd9822b,
  danger: 0xff453a
}

export function screenSize() {
  const info = getDeviceInfo() || {}
  return {
    w: info.width || 466,
    h: info.height || 466
  }
}

function barOptions(w, h) {
  return {
    centerX: w / 2,
    centerY: h / 2,
    maxLong: Math.round(w * 0.9),
    maxLongRotated: Math.round(h * 0.815),
    barLength: Math.round(w * 0.343),
    barLengthRotated: Math.round(h * 0.386)
  }
}

function matrixOptions(w, h) {
  return {
    centerX: w / 2,
    centerY: Math.round(h * 0.536),
    maxSize: Math.round(Math.min(w, h) * 0.644)
  }
}

export function layoutEncoded(encoded, options) {
  const { w, h } = screenSize()
  if (encoded.kind === 'bars') {
    return layoutBarcode(encoded, {
      ...barOptions(w, h),
      rotate: options && options.rotate
    })
  }
  return layoutMatrix(encoded, {
    ...matrixOptions(w, h),
    dotMode: encoded.dotMode
  })
}

export function paintLayout(canvas, layout) {
  const { w, h } = screenSize()
  canvas.clear({ x: 0, y: 0, w, h })
  canvas.drawRect({ x1: 0, y1: 0, x2: w, y2: h, color: COLORS.white })
  if (!layout || !layout.ok) return
  for (const rect of layout.rects) {
    if (rect.dot) {
      const radius = Math.floor((rect.x2 - rect.x1) / 2)
      canvas.drawCircle({
        center_x: Math.round((rect.x1 + rect.x2) / 2),
        center_y: Math.round((rect.y1 + rect.y2) / 2),
        radius,
        color: COLORS.black
      })
    } else {
      canvas.drawRect({
        x1: Math.round(rect.x1),
        y1: Math.round(rect.y1),
        x2: Math.round(rect.x2),
        y2: Math.round(rect.y2),
        color: COLORS.black
      })
    }
  }
}

