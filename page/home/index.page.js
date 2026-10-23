import { align, createWidget, deleteWidget, text_style, widget } from '@zos/ui'
import { push } from '@zos/router'
import { offGesture } from '@zos/interaction'
import { setTimeout } from '@zos/timer'
import { BasePage } from '@zeppos/zml/base-page'

import {
  colorToNumber,
  normalizeCodes,
  normalizeColor
} from '../../shared/defaults'
import { typeLabel } from '../../shared/catalog'
import { readCachedCodes, writeCachedCodes } from '../../utils/cache'
import { COLORS, screenSize } from '../../utils/render'

const CARD_HEIGHT = 210
const CARD_GAP = 14
const CARD_RADIUS = 44
const CARD_BORDER = 3
const CARD_INNER = 'card-inner.png'
const LIST_Y = 112

function countLabel(total) {
  return `${total} ${total === 1 ? 'CODE' : 'CODES'}`
}

function shortType(name) {
  const text = String(name || '').toUpperCase()
  return text.length > 18 ? `${text.slice(0, 17)}...` : text
}

Page(
  BasePage({
    state: {
      codes: [],
      loading: false,
      synced: false,
      built: false,
      active: false,
      dirty: false,
      opening: false,
      widgets: [],
      lastTapId: '',
      lastTapAt: 0
    },

    onInit() {
      const cached = readCachedCodes()
      this.state.codes = cached || []
      this.state.loading = !cached
      this.fetchCodes()
    },

    onCall(req) {
      if (req && req.type === 'CODES') {
        this.applyCodes(req.codes, true)
      }
    },

    fetchCodes() {
      this.request({ method: 'GET_CODES' })
        .then((res) => {
          if (res && res.codes) this.applyCodes(res.codes, true)
        })
        .catch(() => {
          this.state.loading = false
          this.state.dirty = true
          if (this.state.built && this.state.active) {
            this.state.dirty = false
            this.render()
          }
        })
    },

    applyCodes(codes, synced) {
      if (!Array.isArray(codes)) return
      const next = normalizeCodes(codes)
      this.state.codes = next
      this.state.loading = false
      this.state.synced = !!synced
      writeCachedCodes(next)
      this.state.dirty = true
      if (this.state.built && this.state.active) {
        this.state.dirty = false
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

    openCode(code) {
      if (this.state.opening) return
      const now = Date.now()
      if (this.state.lastTapId === code.id && now - this.state.lastTapAt < 600) {
        return
      }
      this.state.lastTapId = code.id
      this.state.lastTapAt = now
      this.state.opening = true
      const page = code.type === 'qr' ? 'page/qr/index.page' : 'page/view/index.page'
      try {
        push({
          url: page,
          params: { id: code.id }
        })
      } catch (error) {
        this.state.opening = false
        console.log('open code failed', error)
        return
      }
      setTimeout(() => {
        this.state.opening = false
      }, 800)
    },

    onPause() {
      this.state.active = false
    },

    onResume() {
      this.state.active = true
      this.state.opening = false
      offGesture()
      if (this.state.dirty) {
        this.state.dirty = false
        this.render()
      }
    },

    build() {
      this.state.built = true
      this.state.active = true
      this.state.dirty = false
      this.render()
    },

    render() {
      this.clearWidgets()
      const { w, h } = screenSize()
      const codes = this.state.codes

      this.add(
        createWidget(widget.FILL_RECT, {
          x: 0,
          y: 0,
          w,
          h,
          color: COLORS.dark
        })
      )

      this.add(
        createWidget(widget.TEXT, {
          x: Math.round(w * 0.2),
          y: 32,
          w: Math.round(w * 0.6),
          h: 36,
          color: COLORS.white,
          text_size: 25,
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
          text_style: text_style.ELLIPSIS,
          text: 'CODE VAULT'
        })
      )

      this.add(
        createWidget(widget.FILL_RECT, {
          x: Math.round((w - 28) / 2),
          y: 72,
          w: 28,
          h: 3,
          radius: 2,
          color: COLORS.accent
        })
      )

      this.add(
        createWidget(widget.TEXT, {
          x: Math.round(w * 0.2),
          y: 81,
          w: Math.round(w * 0.6),
          h: 20,
          color: COLORS.muted,
          text_size: 12,
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
          text_style: text_style.ELLIPSIS,
          text: this.state.loading && !codes.length ? 'SYNCING' : countLabel(codes.length)
        })
      )

      if (this.state.loading && !codes.length) {
        this.add(
          createWidget(widget.TEXT, {
            x: Math.round(w * 0.2),
            y: Math.round(h * 0.42),
            w: Math.round(w * 0.6),
            h: 60,
            color: COLORS.white,
            text_size: 18,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text: 'Loading'
          })
        )
        return
      }

      if (!codes.length) {
        this.add(
          createWidget(widget.TEXT, {
            x: Math.round(w * 0.14),
            y: Math.round(h * 0.32),
            w: Math.round(w * 0.72),
            h: 32,
            color: COLORS.white,
            text_size: 17,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text: 'NO CODES YET'
          })
        )
        this.add(
          createWidget(widget.TEXT, {
            x: Math.round(w * 0.13),
            y: Math.round(h * 0.42),
            w: Math.round(w * 0.74),
            h: 96,
            color: COLORS.muted,
            text_size: 13,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.WRAP,
            line_space: 4,
            text: 'Add codes in the Zepp app:\nDevice > Apps > Code Vault'
          })
        )
        return
      }

      const listX = Math.round(w * 0.09)
      const listW = w - listX * 2
      const listH = h - LIST_Y - Math.round(h * 0.05)
      const textW = listW - 76
      const innerW = listW - CARD_BORDER * 2
      const innerH = CARD_HEIGHT - CARD_BORDER * 2
      const colorConfigs = []
      const colorIds = {}
      const typeIds = codes.map((code) => {
        const color = normalizeColor(code.color)
        if (colorIds[color] === undefined) {
          colorIds[color] = colorConfigs.length + 1
          colorConfigs.push({ typeId: colorIds[color], color })
        }
        return colorIds[color]
      })
      const itemConfig = colorConfigs.map((entry) => ({
        type_id: entry.typeId,
        item_height: CARD_HEIGHT,
        item_bg_color: colorToNumber(entry.color),
        item_bg_radius: CARD_RADIUS,
        image_view: [
          {
            x: CARD_BORDER,
            y: CARD_BORDER,
            w: innerW,
            h: innerH,
            key: 'inner'
          }
        ],
        image_view_count: 1,
        text_view: [
          {
            x: 38,
            y: 36,
            w: textW,
            h: 108,
            color: COLORS.white,
            text_size: 32,
            key: 'name',
            action: true
          },
          {
            x: 38,
            y: 148,
            w: textW,
            h: 30,
            color: COLORS.muted,
            text_size: 15,
            key: 'type',
            action: true
          }
        ],
        text_view_count: 2
      }))
      const dataTypeConfig = typeIds.map((typeId, index) => ({
        start: index,
        end: index,
        type_id: typeId
      }))
      const data = codes.map((code) => ({
        name: code.name || 'Unnamed',
        type: shortType(typeLabel(code.type)),
        inner: CARD_INNER
      }))

      this.add(
        createWidget(widget.SCROLL_LIST, {
          x: listX,
          y: LIST_Y,
          w: listW,
          h: listH,
          item_space: CARD_GAP,
          item_config: itemConfig,
          item_config_count: itemConfig.length,
          data_type_config: dataTypeConfig,
          data_type_config_count: dataTypeConfig.length,
          data_array: data,
          data_count: data.length,
          enable_scroll_bar: true,
          item_click_func: (list, index, dataKey) => {
            if (dataKey !== 'name' && dataKey !== 'type') return
            const code = this.state.codes[index]
            if (code) this.openCode(code)
          }
        })
      )
    }
  })
)
