import { align, createWidget, deleteWidget, text_style, widget } from '@zos/ui'
import { back } from '@zos/router'
import { GESTURE_RIGHT, offGesture, onGesture } from '@zos/interaction'
import { clearTimeout, setTimeout } from '@zos/timer'
import { BasePage } from '@zeppos/zml/base-page'

import { typeLabel } from '../../shared/catalog'
import { normalizeCodes } from '../../shared/defaults'
import { encodeCode } from '../../shared/encode'
import { readCachedCodes } from '../../utils/cache'
import {
  COLORS,
  layoutEncoded,
  paintLayout,
  screenSize
} from '../../utils/render'

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
      widgets: [],
      message: '',
      scale: 0,
      timer: null
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
      this.startRender()
    },

    startRender() {
      this.showLoading()
      if (!this.state.ready) return
      if (this.state.timer) clearTimeout(this.state.timer)
      this.state.timer = setTimeout(() => {
        this.state.timer = null
        this.render()
      }, 60)
    },

    showLoading() {
      this.clearWidgets()
      const { w, h } = screenSize()
      this.add(
        createWidget(widget.FILL_RECT, { x: 0, y: 0, w, h, color: COLORS.white })
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
      console.log('view render failed:', message)
      if (error && error.stack) {
        String(error.stack)
          .split('\n')
          .forEach((line) => console.log('view stack', line))
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
            y: h - 42,
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
        console.log('view error screen failed:', describeError(nested))
      }
    },

    draw() {
      this.clearWidgets()
      this.state.message = ''
      const { w, h } = screenSize()
      const code = this.current()
      this.add(
        createWidget(widget.CANVAS, {
          x: 0,
          y: 0,
          w,
          h
        })
      )
      const canvas = this.state.widgets[0]

      if (!code) {
        paintLayout(canvas, null)
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

      const encoded = encodeCode(code)
      let layout = null
      if (encoded.ok) {
        layout = layoutEncoded(encoded, {})
        if (!layout.ok) this.state.message = layout.error
      } else {
        this.state.message = encoded.error
      }
      this.state.scale = layout && layout.ok ? layout.scale : 0

      paintLayout(canvas, layout && layout.ok ? layout : null)

      this.add(
        createWidget(widget.TEXT, {
          x: Math.round(w * 0.2),
          y: 42,
          w: Math.round(w * 0.6),
          h: 28,
          color: COLORS.black,
          text_size: 21,
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
          text_style: text_style.ELLIPSIS,
          text: code.name
        })
      )

      const dense = layout && layout.ok && layout.scale < 2
      const subtitle = `${typeLabel(code.type)}` + (dense ? ' - DENSE' : '')

      this.add(
        createWidget(widget.TEXT, {
          x: Math.round(w * 0.18),
          y: 70,
          w: Math.round(w * 0.64),
          h: 20,
          color: dense ? COLORS.warn : COLORS.accent,
          text_size: 13,
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
          text_style: text_style.ELLIPSIS,
          text: subtitle
        })
      )

      if (this.state.message) {
        this.add(
          createWidget(widget.TEXT, {
            x: Math.round(w * 0.12),
            y: Math.round(h * 0.43),
            w: Math.round(w * 0.76),
            h: 110,
            color: COLORS.danger,
            text_size: 16,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.WRAP,
            text: `Unable to display this code\n\n${this.state.message}`
          })
        )
      }

      this.add(
        createWidget(widget.TEXT, {
          x: Math.round(w * 0.2),
          y: h - 42,
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
