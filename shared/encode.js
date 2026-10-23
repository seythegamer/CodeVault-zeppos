import './polyfills.js'
import { encodeBars } from 'etiket/barcode'
import { encodeQR, encodeMicroQR, encodeRMQR } from 'etiket/qr'
import { encodeDataMatrix, encodeGS1DataMatrix } from 'etiket/datamatrix'
import { encodePDF417, encodeMicroPDF417 } from 'etiket/pdf417'
import { encodeAztec, encodeAztecRune } from 'etiket/aztec'
import {
  encodeDotCode,
  encodeHanXin,
  encodeCodablockF,
  encodeCode16K
} from 'etiket/2d'

const MAX_CONTENT = 4000

const MATRIX_QUIET = {
  qr: 4,
  microqr: 2,
  rmqr: 2,
  datamatrix: 1,
  'gs1-datamatrix': 1,
  pdf417: 2,
  micropdf417: 2,
  aztec: 1,
  'aztec-rune': 1,
  dotcode: 1,
  hanxin: 2,
  codablockf: 2,
  code16k: 2
}

function asMatrix(result) {
  if (Array.isArray(result)) return result
  if (result && Array.isArray(result.matrix)) return result.matrix
  throw new Error('Failed to build the code matrix')
}

function encode1D(content, type) {
  const bars = encodeBars(content, { type })
  return {
    ok: true,
    kind: 'bars',
    bars,
    quiet: 10,
    modules: bars.reduce((sum, width) => sum + width, 0)
  }
}

function encodeMatrix(type, content) {
  let matrix
  switch (type) {
    case 'qr':
      matrix = encodeQR(content, { ecLevel: 'M' })
      break
    case 'microqr':
      matrix = encodeMicroQR(content)
      break
    case 'rmqr':
      matrix = encodeRMQR(content)
      break
    case 'datamatrix':
      matrix = encodeDataMatrix(content)
      break
    case 'gs1-datamatrix':
      matrix = encodeGS1DataMatrix(content)
      break
    case 'pdf417':
      matrix = asMatrix(encodePDF417(content))
      break
    case 'micropdf417':
      matrix = asMatrix(encodeMicroPDF417(content))
      break
    case 'aztec':
      matrix = encodeAztec(content)
      break
    case 'aztec-rune': {
      const value = Number(content)
      if (!Number.isInteger(value) || value < 0 || value > 255) {
        throw new Error('Aztec Rune requires an integer from 0 to 255')
      }
      matrix = encodeAztecRune(value)
      break
    }
    case 'dotcode':
      matrix = encodeDotCode(content)
      break
    case 'hanxin':
      matrix = encodeHanXin(content)
      break
    case 'codablockf':
      matrix = asMatrix(encodeCodablockF(content))
      break
    case 'code16k':
      matrix = asMatrix(encodeCode16K(content))
      break
    default:
      throw new Error(`Unsupported 2D type: ${type}`)
  }
  if (!matrix.length || !matrix[0].length) throw new Error('Empty code')
  return {
    ok: true,
    kind: 'matrix',
    matrix,
    quiet: MATRIX_QUIET[type] || 1,
    dotMode: type === 'dotcode'
  }
}

const MATRIX_TYPES = new Set(Object.keys(MATRIX_QUIET))

export function encodeCode(code) {
  const type = code && code.type ? code.type : 'code128'
  const content = String((code && code.content) || '').trim()

  try {
    if (!content) throw new Error('Enter code content')
    if (content.length > MAX_CONTENT) {
      throw new Error(`Content is too long (limit ${MAX_CONTENT} characters)`)
    }
    if (MATRIX_TYPES.has(type)) return encodeMatrix(type, content)
    return encode1D(content, type)
  } catch (error) {
    try {
      console.log('encode failed:', type, error && error.stack ? error.stack : error)
    } catch (logError) {}
    let message
    if (error && error.message) message = String(error.message)
    else if (error === undefined || error === null) {
      message = `Unable to encode this code (${type})`
    } else message = String(error)
    return {
      ok: false,
      error: message
    }
  }
}
