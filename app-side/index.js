import { BaseSideService, settingsLib } from '@zeppos/zml/base-side'

import { DEFAULT_CODES, STORAGE_KEY, normalizeCodes } from '../shared/defaults'

function getCodes() {
  const raw = settingsLib.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_CODES
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return DEFAULT_CODES
    return normalizeCodes(parsed)
  } catch (error) {
    return DEFAULT_CODES
  }
}

AppSideService(
  BaseSideService({
    onInit() {},

    onRequest(req, res) {
      if (req && req.method === 'GET_CODES') {
        res(null, { codes: getCodes() })
        return
      }
      res(null, { codes: getCodes() })
    },

    onSettingsChange({ key }) {
      if (key !== STORAGE_KEY) return
      try {
        this.call({ type: 'CODES', codes: getCodes() })
      } catch (error) {
        console.log('push codes failed', error)
      }
    },

    onRun() {},

    onDestroy() {}
  })
)
