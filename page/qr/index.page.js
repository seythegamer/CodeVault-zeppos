import { align, createWidget, deleteWidget, text_style, widget } from '@zos/ui'
import { back } from '@zos/router'
import { GESTURE_RIGHT, offGesture, onGesture } from '@zos/interaction'
import { clearTimeout, setTimeout } from '@zos/timer'
import { BasePage } from '@zeppos/zml/base-page'

import { typeLabel } from '../../shared/catalog'
import { normalizeCodes } from '../../shared/defaults'
import { readCachedCodes } from '../../utils/cache'
import { COLORS, screenSize } from '../../utils/render'

const HINT = 'SWIPE RIGHT TO GO BACK'

function parseId(params) {
  if (!params) return ''
  if (typeof params === 'string') {
    try {
      return JSON.parse(params).id || ''
    } catch (error) {
      return ''
    }
  }
  return params.id || ''
}

function describeError(error) {
  if (!error) return 'Unknown error'
  if (error.message) return String(error.message)
  return String(error)
}

function sameCode(a, b) {
  if (!a || !b) return a === b
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.type === b.type &&
    a.content === b.content
  )
}

Page(
  BasePage({
    state: {
      codes: [],
      index: 0,
      loading: false,
      built: false,
      ready: false,
      timer: null,
      widgets: [],
      message: ''
    },

    onInit(params) {
      const cached = readCachedCodes()
      this.state.codes = cached || []
      const id = parseId(params)
      const found = this.state.codes.findIndex((code) => code.id === id)
      if (found >= 0) {
        this.state.index = found
        this.state.loading = false
        this.state.ready = true
        return
      }
      this.state.index = 0
      this.state.loading = true
      this.state.ready = false
      this.fetchCodes()
    },

    onCall(req) {
      if (req && req.type === 'CODES') this.applyCodes(req.codes)
    },

    fetchCodes() {
      this.request({ method: 'GET_CODES' })
        .then((res) => {
          if (res && res.codes) this.applyCodes(res.codes)
        })
        .catch(() => {
          this.state.loading = false
          this.state.ready = true
          if (this.state.built && !this.state.timer) this.render()
        })
    },

    applyCodes(codes) {
      if (!Array.isArray(codes)) return
      const next = normalizeCodes(codes)
      const prev = this.current()
      const found = prev ? next.findIndex((code) => code.id === prev.id) : -1
      const nextIndex = found >= 0 ? found : 0
      const nextCode = next[nextIndex] || null
      const wasLoading = this.state.loading
      const changed = !sameCode(prev, nextCode)
      this.state.codes = next
      this.state.index = nextIndex
      this.state.loading = false
      this.state.ready = true
      if (this.state.built && !this.state.timer && (changed || wasLoading)) {
        this.render()
      }
    },

    clearWidgets() {
      this.state.widgets.forEach((item) => {
        try {
          deleteWidget(item)
        } catch (error) {
          console.log('delete widget failed', error)
        }
      })
      this.state.widgets = []
    },

    add(item) {
      this.state.widgets.push(item)
      return item
    },

    current() {
      return this.state.codes[this.state.index] || null
    },

    bindGestures() {
      onGesture({
        callback: (gesture) => {
          if (gesture === GESTURE_RIGHT) {
            back()
            return true
          }
          return false
        }
      })
    },

    onResume() {
      this.bindGestures()
    },

    onDestroy() {
      if (this.state.timer) {
        clearTimeout(this.state.timer)
        this.state.timer = null
      }
      offGesture()
      this.clearWidgets()
    },

    build() {
      this.state.built = true
      this.bindGestures()
      this.showLoading()
      if (!this.state.ready) return
      this.state.timer = setTimeout(() => {
        this.state.timer = null
        this.render()
      }, 70)
    },

    showLoading() {
      try {
        this.clearWidgets()
        const { w, h } = screenSize()
        this.add(
          createWidget(widget.FILL_RECT, {
            x: 0,
            y: 0,
            w,
            h,
            color: COLORS.white
          })
        )
        this.add(
          createWidget(widget.TEXT, {
            x: Math.round(w * 0.2),
            y: Math.round(h * 0.42),
            w: Math.round(w * 0.6),
            h: 60,
            color: COLORS.black,
            text_size: 18,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text: 'Loading'
          })
        )
      } catch (error) {
        console.log('qr loading screen failed:', describeError(error))
      }
    },

    render() {
      if (this.state.timer) {
        clearTimeout(this.state.timer)
        this.state.timer = null
      }
      try {
        this.draw()
      } catch (error) {
        this.showError(error)
      }
    },

    showError(error) {
      const message = describeError(error)
      console.log('qr render failed:', message)
      if (error && error.stack) {
        String(error.stack)
          .split('\n')
          .forEach((line) => console.log('qr stack', line))
      }
      try {
        this.clearWidgets()
        const { w, h } = screenSize()
        this.add(
          createWidget(widget.FILL_RECT, { x: 0, y: 0, w, h, color: COLORS.white })
        )
        this.add(
          createWidget(widget.TEXT, {
            x: Math.round(w * 0.1),
            y: Math.round(h * 0.34),
            w: Math.round(w * 0.8),
            h: 140,
            color: COLORS.danger,
            text_size: 16,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.WRAP,
            text: `Unable to display this code\n\n${message}`
          })
        )
        this.add(
          createWidget(widget.TEXT, {
            x: Math.round(w * 0.2),
            y: h - 40,
            w: Math.round(w * 0.6),
            h: 18,
            color: COLORS.muted,
            text_size: 10,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text: HINT
          })
        )
      } catch (nested) {
        console.log('qr error screen failed:', describeError(nested))
      }
    },

    draw() {
      this.clearWidgets()
      this.state.message = ''
      const { w, h } = screenSize()
      const code = this.current()
      this.add(createWidget(widget.FILL_RECT, { x: 0, y: 0, w, h, color: COLORS.white }))

      if (!code) {
        this.add(
          createWidget(widget.TEXT, {
            x: Math.round(w * 0.2),
            y: Math.round(h * 0.42),
            w: Math.round(w * 0.6),
            h: 60,
            color: COLORS.black,
            text_size: 18,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text: this.state.loading ? 'Loading' : 'No code to display'
          })
        )
        return
      }

      if (code.type !== 'qr') {
        this.add(
          createWidget(widget.TEXT, {
            x: Math.round(w * 0.15),
            y: Math.round(h * 0.42),
            w: Math.round(w * 0.7),
            h: 60,
            color: COLORS.black,
            text_size: 16,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.WRAP,
            text: 'This screen supports QR codes only'
          })
        )
        return
      }

      if (code.content) {
        const qrSize = Math.round(w * 0.61)
        const qrX = Math.round((w - qrSize) / 2)
        const qrY = Math.round(h * 0.223)
        this.add(
          createWidget(widget.QRCODE, {
            content: code.content,
            x: qrX,
            y: qrY,
            w: qrSize,
            h: qrSize,
            bg_x: qrX - 8,
            bg_y: qrY - 8,
            bg_w: qrSize + 16,
            bg_h: qrSize + 16,
            bg_radius: 12
          })
        )
      } else {
        this.state.message = 'Enter code content'
      }

      this.add(
        createWidget(widget.TEXT, {
          x: Math.round(w * 0.18),
          y: Math.round(h * 0.095),
          w: Math.round(w * 0.64),
          h: 30,
          color: COLORS.black,
          text_size: 21,
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
          text_style: text_style.ELLIPSIS,
          text: code.name
        })
      )

      this.add(
        createWidget(widget.TEXT, {
          x: Math.round(w * 0.18),
          y: Math.round(h * 0.159),
          w: Math.round(w * 0.64),
          h: 22,
          color: COLORS.accent,
          text_size: 13,
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
          text_style: text_style.ELLIPSIS,
          text: typeLabel(code.type)
        })
      )

      if (this.state.message) {
        this.add(
          createWidget(widget.TEXT, {
            x: Math.round(w * 0.12),
            y: Math.round(h * 0.44),
            w: Math.round(w * 0.76),
            h: 100,
            color: COLORS.danger,
            text_size: 16,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.WRAP,
            text: this.state.message
          })
        )
      }

      this.add(
        createWidget(widget.TEXT, {
          x: Math.round(w * 0.2),
          y: h - 40,
          w: Math.round(w * 0.6),
          h: 18,
          color: COLORS.muted,
          text_size: 10,
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
          text: HINT
        })
      )
    }
  })
)
