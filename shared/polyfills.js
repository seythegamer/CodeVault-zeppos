const root =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof global !== 'undefined'
      ? global
      : {}

if (typeof root.TextEncoder === 'undefined') {
  root.TextEncoder = class TextEncoder {
    get encoding() {
      return 'utf-8'
    }

    encode(input) {
      const text = input === undefined ? '' : String(input)
      const bytes = []
      for (let i = 0; i < text.length; i += 1) {
        let code = text.charCodeAt(i)
        if (code < 0x80) {
          bytes.push(code)
        } else if (code < 0x800) {
          bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
        } else if (code >= 0xd800 && code <= 0xdbff) {
          const next = i + 1 < text.length ? text.charCodeAt(i + 1) : 0
          if (next >= 0xdc00 && next <= 0xdfff) {
            i += 1
            const point = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00)
            bytes.push(
              0xf0 | (point >> 18),
              0x80 | ((point >> 12) & 0x3f),
              0x80 | ((point >> 6) & 0x3f),
              0x80 | (point & 0x3f)
            )
          } else {
            bytes.push(0xef, 0xbf, 0xbd)
          }
        } else if (code >= 0xdc00 && code <= 0xdfff) {
          bytes.push(0xef, 0xbf, 0xbd)
        } else {
          bytes.push(
            0xe0 | (code >> 12),
            0x80 | ((code >> 6) & 0x3f),
            0x80 | (code & 0x3f)
          )
        }
      }
      return new Uint8Array(bytes)
    }
  }
}
