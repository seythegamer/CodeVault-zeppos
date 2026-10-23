import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve('node_modules/etiket/dist/encoders')
const MARKER = '// Patched by Code Vault: BigInt-free for Zepp OS (QuickJS without bignum).'

function read(file) {
  const full = path.join(ROOT, file)
  if (!fs.existsSync(full)) {
    throw new Error(`Missing etiket file: ${full}`)
  }
  return { full, text: fs.readFileSync(full, 'utf8') }
}

function replace(text, from, to, label) {
  if (!text.includes(from)) {
    throw new Error(`Patch target not found: ${label}`)
  }
  return text.split(from).join(to)
}

function patchDatabar() {
  const { full, text } = read('gs1-databar.mjs')
  if (text.startsWith(MARKER)) return
  let next = text
  next = replace(next, 'const OMN_LINKAGE_VALUE = 10000000000000n;', 'const OMN_LINKAGE_VALUE = 10000000000000;', 'omni linkage')
  next = replace(next, 'const LTD_LINKAGE_VALUE = 2015133531096n;', 'const LTD_LINKAGE_VALUE = 2015133531096;', 'ltd linkage')
  next = replace(next, 'let val = 0n;', 'let val = 0;', 'val init')
  next = replace(next, 'val = val * 10n + BigInt(digits13.charCodeAt(i) - 48);', 'val = val * 10 + (digits13.charCodeAt(i) - 48);', 'gtin accumulate')
  next = replace(next, 'const leftPair = Number(val / 4537077n);', 'const leftPair = Math.floor(val / 4537077);', 'omni divide')
  next = replace(next, 'const rightPair = Number(val % 4537077n);', 'const rightPair = val % 4537077;', 'omni modulo')
  next = replace(next, 'const pairVals = [Number(val / 2013571n), Number(val % 2013571n)];', 'const pairVals = [Math.floor(val / 2013571), val % 2013571];', 'ltd divide')
  fs.writeFileSync(full, `${MARKER}\n${next}`)
}

function patchPdf417() {
  const { full, text } = read('pdf417/encoder.mjs')
  if (text.startsWith(MARKER)) return
  const start = text.indexOf('function numericToBase900(digits) {')
  const end = text.indexOf('function encodeByteSegment', start)
  if (start < 0 || end < 0) {
    throw new Error('Patch target not found: pdf417 numericToBase900')
  }
  const replacement = `function numericToBase900(digits) {
	const base = 900;
	let value = "1" + digits;
	const result = [];
	while (value !== "0") {
		let remainder = 0;
		let quotient = "";
		for (let i = 0; i < value.length; i++) {
			const current = remainder * 10 + (value.charCodeAt(i) - 48);
			const digit = Math.floor(current / base);
			remainder = current % base;
			if (quotient.length > 0 || digit > 0) quotient += String(digit);
		}
		result.unshift(remainder);
		value = quotient.length > 0 ? quotient : "0";
	}
	return result;
}

`
  let next = text.slice(0, start) + replacement + text.slice(end)

  const bytesStart = next.indexOf('function bytesToBase900(bytes) {')
  const bytesEnd = next.indexOf('\n}', next.indexOf('return result;', bytesStart)) + 2
  if (bytesStart < 0 || bytesEnd < 2) {
    throw new Error('Patch target not found: pdf417 bytesToBase900')
  }
  const bytesReplacement = `function bytesToBase900(bytes) {
	let value = 0;
	for (const b of bytes) {
		value = value * 256 + b;
	}
	const result = Array.from({ length: 5 }, () => 0);
	const base = 900;
	for (let i = 4; i >= 0; i--) {
		result[i] = value % base;
		value = Math.floor(value / base);
	}
	return result;
}
`
  next = next.slice(0, bytesStart) + bytesReplacement + next.slice(bytesEnd)
  fs.writeFileSync(full, `${MARKER}\n${next}`)
}

function patchAztec() {
  const { full, text } = read('aztec/encoder.mjs')
  if (!text.includes('eciValue ??= ECI_UTF8;')) return
  const next = replace(
    text,
    'eciValue ??= ECI_UTF8;',
    'if (eciValue === undefined || eciValue === null) eciValue = ECI_UTF8;',
    'aztec nullish assignment'
  )
  fs.writeFileSync(full, `${MARKER}\n${next}`)
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.mjs')) out.push(full)
  }
  return out
}

function patchReplaceAll() {
  const dist = path.resolve('node_modules/etiket/dist')
  for (const full of walk(dist)) {
    const text = fs.readFileSync(full, 'utf8')
    if (!text.includes('.replaceAll(')) continue
    const next = text.split('.replaceAll(').join('.replace(')
    fs.writeFileSync(full, `${MARKER}\n${next}`)
  }
}

patchDatabar()
patchPdf417()
patchAztec()
patchReplaceAll()
console.log('etiket patched for BigInt-free Zepp OS build')
