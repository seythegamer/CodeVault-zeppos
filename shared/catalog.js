export const TYPES = [
  { id: 'qr', group: '2D', name: 'QR Code', hint: 'Tekst, URL, WiFi, vCard', placeholder: 'https://example.com' },
  { id: 'microqr', group: '2D', name: 'Micro QR', hint: 'Krótki tekst (do ~15 znaków)', placeholder: 'HELLO' },
  { id: 'rmqr', group: '2D', name: 'rMQR', hint: 'Prostokątny QR, URL', placeholder: 'https://example.com' },
  { id: 'datamatrix', group: '2D', name: 'Data Matrix', hint: 'Przemysł, logistyka', placeholder: 'Hello' },
  { id: 'gs1-datamatrix', group: '2D', name: 'GS1 Data Matrix', hint: 'Format (01)GTIN(17)DATA', placeholder: '(01)12345678901231' },
  { id: 'pdf417', group: '2D', name: 'PDF417', hint: 'Bilety, dokumenty, dużo danych', placeholder: 'Hello World' },
  { id: 'micropdf417', group: '2D', name: 'MicroPDF417', hint: 'Kompaktowy PDF417', placeholder: 'Hello' },
  { id: 'aztec', group: '2D', name: 'Aztec Code', hint: 'Bilety kolejowe/lotnicze', placeholder: 'Hello World' },
  { id: 'aztec-rune', group: '2D', name: 'Aztec Rune', hint: 'Liczba 0-255', placeholder: '42' },
  { id: 'dotcode', group: '2D', name: 'DotCode', hint: 'Kropkowy, przemysł', placeholder: 'Hello' },
  { id: 'hanxin', group: '2D', name: 'Han Xin', hint: 'Chiński standard', placeholder: 'Hello' },
  { id: 'codablockf', group: '2D', name: 'Codablock F', hint: 'Stacked Code 128', placeholder: 'Hello' },
  { id: 'code16k', group: '2D', name: 'Code 16K', hint: 'Stacked, wiele wierszy', placeholder: 'Hello' },

  { id: 'code128', group: '1D', name: 'Code 128', hint: 'ASCII, auto A/B/C', placeholder: 'ABC-12345' },
  { id: 'gs1-128', group: '1D', name: 'GS1-128', hint: 'Format (01)GTIN(17)DATA', placeholder: '(01)12345678901234(17)260101' },
  { id: 'ean13', group: '1D', name: 'EAN-13', hint: '12 lub 13 cyfr', placeholder: '4006381333931' },
  { id: 'ean8', group: '1D', name: 'EAN-8', hint: '7 lub 8 cyfr', placeholder: '96385074' },
  { id: 'upca', group: '1D', name: 'UPC-A', hint: '11 lub 12 cyfr', placeholder: '036000291452' },
  { id: 'upce', group: '1D', name: 'UPC-E', hint: '6-8 cyfr', placeholder: '01234565' },
  { id: 'ean2', group: '1D', name: 'EAN-2 dodatek', hint: '2 cyfry', placeholder: '12' },
  { id: 'ean5', group: '1D', name: 'EAN-5 dodatek', hint: '5 cyfr', placeholder: '52495' },
  { id: 'code39', group: '1D', name: 'Code 39', hint: 'Cyfry, A-Z, kilka znaków', placeholder: 'HELLO' },
  { id: 'code39ext', group: '1D', name: 'Code 39 Extended', hint: 'Pełny ASCII', placeholder: 'Hello!' },
  { id: 'code93', group: '1D', name: 'Code 93', hint: 'Kompaktowy 1D', placeholder: 'HELLO' },
  { id: 'code93ext', group: '1D', name: 'Code 93 Extended', hint: 'Pełny ASCII', placeholder: 'Hello!' },
  { id: 'itf', group: '1D', name: 'ITF (Interleaved 2 of 5)', hint: 'Parzysta liczba cyfr', placeholder: '123456' },
  { id: 'itf14', group: '1D', name: 'ITF-14', hint: '13 lub 14 cyfr', placeholder: '15400141288763' },
  { id: 'ean14', group: '1D', name: 'GS1 EAN-14', hint: '13 lub 14 cyfr', placeholder: '15400141288763' },
  { id: 'sscc18', group: '1D', name: 'SSCC-18', hint: '17 lub 18 cyfr', placeholder: '003764950000000013' },
  { id: 'codabar', group: '1D', name: 'Codabar', hint: 'Cyfry i - $ : / . +', placeholder: 'A123456A' },
  { id: 'msi', group: '1D', name: 'MSI Plessey', hint: 'Cyfry', placeholder: '1234567' },
  { id: 'code11', group: '1D', name: 'Code 11', hint: 'Cyfry i -', placeholder: '123-45' },
  { id: 'plessey', group: '1D', name: 'Plessey', hint: 'Cyfry i A-F', placeholder: '123456' },
  { id: 'pharmacode', group: '1D', name: 'Pharmacode', hint: 'Liczba 3-131070', placeholder: '1234' },
  { id: 'isbn', group: '1D', name: 'ISBN', hint: 'ISBN-10/13', placeholder: '9780306406157' },
  { id: 'issn', group: '1D', name: 'ISSN', hint: '8 cyfr', placeholder: '03178471' },
  { id: 'ismn', group: '1D', name: 'ISMN', hint: 'Numer muzyczny', placeholder: '9790060115615' },
  { id: 'code32', group: '1D', name: 'Code 32 (Italian Pharmacode)', hint: '8 cyfr', placeholder: '01234567' },
  { id: 'pzn', group: '1D', name: 'PZN', hint: '6 lub 7 cyfr', placeholder: '1234567' },
  { id: 'pzn8', group: '1D', name: 'PZN8', hint: '7 lub 8 cyfr', placeholder: '12345678' },
  { id: 'identcode', group: '1D', name: 'Identcode (DP)', hint: '11 lub 12 cyfr', placeholder: '563102430313' },
  { id: 'leitcode', group: '1D', name: 'Leitcode (DP)', hint: '13 lub 14 cyfr', placeholder: '21348075016401' },
  { id: 'gs1-databar', group: '1D', name: 'GS1 DataBar Omnidirectional', hint: 'GTIN', placeholder: '00012345678905' },
  { id: 'gs1-databar-limited', group: '1D', name: 'GS1 DataBar Limited', hint: 'GTIN', placeholder: '00012345678905' },
  { id: 'gs1-databar-expanded', group: '1D', name: 'GS1 DataBar Expanded', hint: 'AI string', placeholder: '(01)12345678901231' },
  { id: 'gs1-databar-truncated', group: '1D', name: 'GS1 DataBar Truncated', hint: 'GTIN', placeholder: '00012345678905' },
  { id: 'industrial2of5', group: '1D', name: 'Industrial 2 of 5', hint: 'Cyfry', placeholder: '123456' },
  { id: 'iata2of5', group: '1D', name: 'IATA 2 of 5', hint: 'Cyfry', placeholder: '123456' },
  { id: 'matrix2of5', group: '1D', name: 'Matrix 2 of 5', hint: 'Cyfry', placeholder: '123456' },
  { id: 'coop2of5', group: '1D', name: 'COOP 2 of 5', hint: 'Cyfry', placeholder: '123456' },
  { id: 'datalogic2of5', group: '1D', name: 'Datalogic 2 of 5', hint: 'Cyfry', placeholder: '123456' }
]

export const TYPE_MAP = TYPES.reduce((acc, type) => {
  acc[type.id] = type
  return acc
}, {})

export const TYPE_OPTIONS = TYPES.map((type) => ({
  name: `${type.group} - ${type.name}`,
  value: type.id
}))

export function typeLabel(id) {
  return TYPE_MAP[id] ? TYPE_MAP[id].name : id
}
