import { TYPES } from '../shared/catalog.js'
import { encodeCode } from '../shared/encode.js'
import { layoutBarcode, layoutMatrix, pointInCircle } from '../shared/draw.js'

const SCREEN = 466
const CENTER = 233
const RADIUS = SCREEN / 2 - 2

const barOptions = {
  centerX: CENTER,
  centerY: CENTER,
  maxLong: 420,
  maxLongRotated: 380,
  barLength: 160,
  barLengthRotated: 180
}

const matrixOptions = {
  centerX: CENTER,
  centerY: 250,
  maxSize: 300
}

function checkLayout(type, result) {
  if (result.kind === 'bars') {
    const layout = layoutBarcode(result, barOptions)
    if (!layout.ok) return layout.error
    const outside = layout.rects.some(
      (rect) =>
        !pointInCircle(rect.x1, rect.y1, CENTER, CENTER, RADIUS) ||
        !pointInCircle(rect.x2, rect.y1, CENTER, CENTER, RADIUS) ||
        !pointInCircle(rect.x1, rect.y2, CENTER, CENTER, RADIUS) ||
        !pointInCircle(rect.x2, rect.y2, CENTER, CENTER, RADIUS)
    )
    if (outside) return 'poza okręgiem'
    return `scale=${layout.scale} ${layout.rotated ? 'rot' : 'flat'}`
  }
  const layout = layoutMatrix(result, {
    ...matrixOptions,
    dotMode: type === 'dotcode'
  })
  if (!layout.ok) return layout.error
  const outside = layout.rects.some(
    (rect) =>
      !pointInCircle(rect.x1, rect.y1, CENTER, 250, RADIUS) ||
      !pointInCircle(rect.x2, rect.y1, CENTER, 250, RADIUS) ||
      !pointInCircle(rect.x1, rect.y2, CENTER, 250, RADIUS) ||
      !pointInCircle(rect.x2, rect.y2, CENTER, 250, RADIUS)
  )
  if (outside) return 'poza okręgiem'
  return `scale=${layout.scale}`
}

const samples = {
  qr: 'https://example.com',
  microqr: 'HELLO',
  rmqr: 'https://example.com',
  datamatrix: 'Hello',
  'gs1-datamatrix': '(01)12345678901231',
  pdf417: 'Hello PDF417',
  micropdf417: 'Hello',
  aztec: 'Hello Aztec',
  'aztec-rune': '42',
  dotcode: 'Hello',
  hanxin: 'Hello',
  codablockf: 'Hello',
  code16k: 'Hello',
  code128: 'ABC-12345',
  'gs1-128': '(01)12345678901234(17)260101',
  ean13: '4006381333931',
  ean8: '96385074',
  upca: '036000291452',
  upce: '01234565',
  ean2: '12',
  ean5: '52495',
  code39: 'HELLO',
  code39ext: 'Hello!',
  code93: 'HELLO',
  code93ext: 'Hello!',
  itf: '123456',
  itf14: '15400141288763',
  ean14: '15400141288763',
  sscc18: '003764950000000017',
  codabar: 'A123456A',
  msi: '1234567',
  code11: '123-45',
  plessey: '123456',
  pharmacode: '1234',
  isbn: '9780306406157',
  issn: '03178471',
  ismn: '9790060115615',
  code32: '01234567',
  pzn: '1234562',
  pzn8: '12345678',
  identcode: '563102430313',
  leitcode: '21348075016401',
  'gs1-databar': '00012345678905',
  'gs1-databar-limited': '00012345678905',
  'gs1-databar-expanded': '(01)12345678901231',
  'gs1-databar-truncated': '00012345678905',
  industrial2of5: '123456',
  iata2of5: '123456',
  matrix2of5: '123456',
  coop2of5: '123456',
  datalogic2of5: '123456'
}

let failed = 0
for (const type of TYPES) {
  const content = samples[type.id] || type.placeholder
  const result = encodeCode({ type: type.id, content })
  if (!result.ok) {
    failed++
    console.log(`FAIL ${type.id}: ${result.error}`)
    continue
  }
  if (result.kind === 'bars') {
    console.log(`OK   1D ${type.id.padEnd(22)} bars=${String(result.bars.length).padStart(3)} modules=${result.modules} layout=${checkLayout(type.id, result)}`)
  } else {
    console.log(`OK   2D ${type.id.padEnd(22)} matrix=${result.matrix[0].length}x${result.matrix.length} quiet=${result.quiet} layout=${checkLayout(type.id, result)}`)
  }
}
console.log(`\n${TYPES.length - failed}/${TYPES.length} types encoded`)
if (failed) process.exitCode = 1


