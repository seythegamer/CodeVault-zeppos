function runRects(matrix, quiet, scale, originX, originY, dotMode) {
  const rects = []
  const rows = matrix.length
  const cols = matrix[0].length
  for (let row = 0; row < rows; row++) {
    let start = -1
    for (let col = 0; col <= cols; col++) {
      const dark = col < cols && matrix[row][col]
      if (dark && start === -1) start = col
      if (!dark && start !== -1) {
        const x1 = originX + (quiet + start) * scale
        const x2 = originX + (quiet + col) * scale
        const y1 = originY + (quiet + row) * scale
        const y2 = y1 + scale
        if (dotMode) {
          const pad = Math.max(1, Math.floor(scale * 0.18))
          rects.push({ x1: x1 + pad, y1: y1 + pad, x2: x2 - pad, y2: y2 - pad, dot: true })
        } else {
          rects.push({ x1, y1, x2, y2 })
        }
        start = -1
      }
    }
  }
  return rects
}

export function layoutMatrix(result, options) {
  const matrix = result.matrix
  const rows = matrix.length
  const cols = matrix[0].length
  const quiet = result.quiet || 0
  const maxSize = options.maxSize
  const dotMode = !!options.dotMode
  const gridCols = cols + quiet * 2
  const gridRows = rows + quiet * 2
  const scale = Math.floor(maxSize / Math.max(gridCols, gridRows))
  if (scale < 2) {
    return {
      ok: false,
      error: `Code is too dense for this screen (${cols}x${rows} modules)`
    }
  }
  const spanX = gridCols * scale
  const spanY = gridRows * scale
  const originX = Math.round(options.centerX - spanX / 2)
  const originY = Math.round(options.centerY - spanY / 2)
  return {
    ok: true,
    kind: 'matrix',
    scale,
    rotated: false,
    rects: runRects(matrix, quiet, scale, originX, originY, dotMode),
    bounds: { x1: originX, y1: originY, x2: originX + spanX, y2: originY + spanY }
  }
}

function barsLayout(result, options, rotated) {
  const bars = result.bars
  const quiet = result.quiet || 10
  const maxLong = rotated ? options.maxLongRotated : options.maxLong
  const barLength = rotated ? options.barLengthRotated : options.barLength
  const total = bars.reduce((sum, width) => sum + width, 0) + quiet * 2
  const scale = Math.floor(maxLong / total)
  if (scale < 1) {
    return {
      ok: false,
      error: `Code is too long for this screen (${total} modules)`,
      scale
    }
  }
  const span = total * scale
  const start = Math.round((rotated ? options.centerY : options.centerX) - span / 2)
  const crossStart = Math.round(
    (rotated ? options.centerX : options.centerY) - barLength / 2
  )
  const crossEnd = crossStart + barLength
  const rects = []
  let cursor = start + quiet * scale
  let dark = true
  for (let i = 0; i < bars.length; i++) {
    const width = bars[i] * scale
    if (dark) {
      if (rotated) {
        rects.push({
          x1: crossStart,
          y1: Math.round(cursor),
          x2: crossEnd,
          y2: Math.round(cursor + width)
        })
      } else {
        rects.push({
          x1: Math.round(cursor),
          y1: crossStart,
          x2: Math.round(cursor + width),
          y2: crossEnd
        })
      }
    }
    cursor += width
    dark = !dark
  }
  return {
    ok: true,
    kind: 'bars',
    scale,
    rotated,
    modules: total,
    rects,
    bounds: rotated
      ? { x1: crossStart, y1: start, x2: crossEnd, y2: start + span }
      : { x1: start, y1: crossStart, x2: start + span, y2: crossEnd }
  }
}

export function layoutBarcode(result, options) {
  const flat = barsLayout(result, options, false)
  const turned = barsLayout(result, options, true)
  if (options.rotate === true) return turned
  if (options.rotate === false) return flat
  if (!flat.ok && !turned.ok) return flat
  if (!flat.ok) return turned
  if (!turned.ok) return flat
  return turned.scale > flat.scale ? turned : flat
}

export function pointInCircle(x, y, centerX, centerY, radius) {
  const dx = x - centerX
  const dy = y - centerY
  return dx * dx + dy * dy <= radius * radius
}
