import { TYPE_MAP, TYPE_OPTIONS, typeLabel } from './../shared/catalog'
import {
  DEFAULT_CODES,
  DEFAULT_COLOR,
  STORAGE_KEY,
  isValidColor,
  normalizeCodes,
  normalizeColor
} from './../shared/defaults'

const UI_KEY = '__cv_ui'
const MAX_CONTENT = 4000
const SAMPLE_NAME = 'SAMPLE NAME'
const SAMPLE_CONTENT = 'SAMPLE CODE OR TEXT (QR)'

const COLORS = {
  bg: '#000000',
  card: '#141416',
  cardBorder: '#2a2a2e',
  field: '#1f1f22',
  fieldBright: '#f2f2f4',
  fieldBorder: '#c7c7cc',
  text: '#f2f2f7',
  muted: '#8e8e93',
  accent: '#ff6b3d',
  accentText: '#1a0f08',
  danger: '#ff453a'
}

const PAGE_STYLE = {
  background: COLORS.bg,
  color: COLORS.text,
  padding: '16px 16px 32px',
  minHeight: '100vh'
}

const CARD_STYLE = {
  background: COLORS.card,
  border: `1px solid ${COLORS.cardBorder}`,
  borderRadius: '12px',
  padding: '12px 14px'
}

const HEADER_STYLE = {
  color: COLORS.muted,
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.09em',
  margin: '0 0 8px 2px'
}

const FIELD_ROW = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: '10px'
}

const FIELD_LABEL = {
  width: '92px',
  flexShrink: 0,
  color: COLORS.muted,
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.04em'
}

const FIELD_BOX = {
  flex: 1,
  minWidth: 0,
  background: COLORS.fieldBright,
  border: `1px solid ${COLORS.fieldBorder}`,
  borderRadius: '10px',
  padding: '4px 8px'
}

const FIELD_BOX_PAD = Object.assign({}, FIELD_BOX, {
  display: 'flex',
  alignItems: 'center',
  padding: '9px 12px'
})

const FIELD_LABELSTYLE = {
  color: '#4b5563',
  fontSize: '12px'
}

const FIELD_SUBSTYLE = {
  color: '#111827',
  fontSize: '14px'
}

const TYPE_LIST = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  background: '#1f1f23',
  border: `1px solid ${COLORS.cardBorder}`,
  borderRadius: '10px',
  padding: '8px',
  marginTop: '8px'
}

const TYPE_CHIP = {
  fontSize: '12px',
  padding: '7px 11px',
  borderRadius: '15px',
  background: '#e5e7eb',
  color: '#111827',
  margin: '3px'
}

const TYPE_CHIP_ACTIVE = Object.assign({}, TYPE_CHIP, {
  background: COLORS.accent,
  color: COLORS.accentText,
  fontWeight: '700'
})

const TYPE_VALUE_TEXT = {
  flex: 1,
  minWidth: 0,
  color: '#111827',
  fontSize: '14px'
}

const CHANGE_BUTTON = {
  fontSize: '12px',
  padding: '5px 12px',
  borderRadius: '14px',
  background: '#111827',
  color: '#ffffff',
  marginLeft: '8px'
}

const ACTIONS_ROW = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: '12px',
  flexShrink: 0
}

const PRIMARY_BUTTON = {
  background: COLORS.accent,
  color: COLORS.accentText,
  fontSize: '13px',
  fontWeight: '700',
  padding: '8px 18px',
  borderRadius: '20px'
}

const SECONDARY_BUTTON = {
  background: COLORS.field,
  color: COLORS.text,
  fontSize: '13px',
  padding: '8px 16px',
  borderRadius: '20px',
  marginLeft: '8px'
}

const DANGER_BUTTON = {
  background: COLORS.danger,
  color: '#ffffff',
  fontSize: '13px',
  padding: '8px 16px',
  borderRadius: '20px',
  marginLeft: '8px'
}

const CARD_NAME_STYLE = {
  color: COLORS.text,
  fontSize: '15px',
  fontWeight: '600',
  lineHeight: '20px',
  whiteSpace: 'normal',
  wordBreak: 'break-word'
}

const CARD_TYPE_STYLE = {
  color: COLORS.muted,
  fontSize: '11px',
  letterSpacing: '0.04em',
  marginTop: '6px',
  whiteSpace: 'normal'
}

const CARD_CODE_STYLE = {
  color: COLORS.muted,
  fontSize: '12px',
  lineHeight: '17px',
  marginTop: '3px',
  whiteSpace: 'normal',
  wordBreak: 'break-all'
}

const INFO_TEXT_STYLE = {
  color: COLORS.text,
  fontSize: '14px',
  lineHeight: '21px'
}

const MESSAGE_OK_STYLE = {
  color: COLORS.accent,
  fontSize: '12px',
  marginTop: '8px'
}

const MESSAGE_ERROR_STYLE = {
  color: COLORS.danger,
  fontSize: '12px',
  marginTop: '8px'
}

function preview(content) {
  const text = String(content || '').replace(/\s+/g, ' ')
  return text.length > 54 ? `${text.slice(0, 51)}...` : text
}

function newId() {
  return `code-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function colorDotStyle(color, size) {
  const px = size || 22
  return {
    width: `${px}px`,
    height: `${px}px`,
    minWidth: `${px}px`,
    borderRadius: `${px / 2}px`,
    background: normalizeColor(color),
    border: `1px solid ${COLORS.cardBorder}`,
    marginLeft: '10px',
    flexShrink: 0
  }
}

function validate(type, content) {
  if (!TYPE_MAP[type]) return 'Choose a supported code type.'
  if (!content) return 'Enter the code content.'
  if (content.length > MAX_CONTENT) return `Content is too long (limit ${MAX_CONTENT} characters).`
  if (type === 'aztec-rune') {
    const value = Number(content)
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      return 'Aztec Rune requires an integer 0-255.'
    }
  }
  return ''
}

function header(title) {
  return Text({ style: HEADER_STYLE }, [title])
}

function fieldRow(label, control, top) {
  const rowStyle = top
    ? Object.assign({}, FIELD_ROW, { alignItems: 'flex-start' })
    : FIELD_ROW
  const labelStyle = top
    ? Object.assign({}, FIELD_LABEL, { paddingTop: '10px' })
    : FIELD_LABEL
  return View({ style: rowStyle }, [
    Text({ style: labelStyle }, [label]),
    View({ style: FIELD_BOX }, [control])
  ])
}

function category(title, children) {
  const body = children.filter(Boolean)
  return View({ style: { marginTop: '24px' } }, [title ? header(title) : false]
    .concat(body)
    .filter(Boolean))
}

AppSettingsPage({
  state: {
    codes: [],
    props: {},
    loaded: false,
    editingId: null,
    draftName: SAMPLE_NAME,
    draftType: 'qr',
    draftContent: SAMPLE_CONTENT,
    draftColor: DEFAULT_COLOR,
    error: '',
    pendingDelete: '',
    saved: false,
    typePickerOpen: false,
    uiTick: 0
  },

  sync(props) {
    this.state.props = props
    const raw = props.settingsStorage.getItem(STORAGE_KEY)
    if (raw === undefined || raw === null || raw === '') {
      if (!this.state.loaded) this.state.codes = [...DEFAULT_CODES]
      this.state.loaded = true
      return
    }
    try {
      const parsed = JSON.parse(raw)
      this.state.codes = Array.isArray(parsed)
        ? normalizeCodes(parsed)
        : [...DEFAULT_CODES]
    } catch (error) {
      this.state.codes = [...DEFAULT_CODES]
    }
    this.state.loaded = true
  },

  refresh() {
    try {
      this.state.uiTick = (this.state.uiTick || 0) + 1
      this.state.props.settingsStorage.setItem(UI_KEY, String(this.state.uiTick))
    } catch (error) {
      console.log('refresh failed', error)
    }
  },

  fail(message) {
    this.state.saved = false
    this.state.error = String(message || 'Unknown error.')
    this.refresh()
  },

  startEdit(code) {
    this.state.editingId = code.id
    this.state.draftName = code.name
    this.state.draftType = code.type
    this.state.draftContent = code.content
    this.state.draftColor = normalizeColor(code.color)
    this.state.error = ''
    this.state.pendingDelete = ''
    this.state.saved = false
    this.state.typePickerOpen = false
    this.refresh()
  },

  cancelEdit() {
    this.state.editingId = null
    this.state.draftName = SAMPLE_NAME
    this.state.draftType = 'qr'
    this.state.draftContent = SAMPLE_CONTENT
    this.state.draftColor = DEFAULT_COLOR
    this.state.error = ''
    this.state.saved = false
    this.state.typePickerOpen = false
    this.refresh()
  },

  save() {
    const name = String(this.state.draftName || '').trim()
    const type = String(this.state.draftType || '')
    const content = String(this.state.draftContent || '').trim()
    const colorInput = String(this.state.draftColor || '').trim()

    if (!name) return this.fail('Enter a code name.')
    if (!isValidColor(colorInput)) return this.fail('Enter a color as #RRGGBB.')
    const problem = validate(type, content)
    if (problem) return this.fail(problem)
    const color = normalizeColor(colorInput)

    const codes = this.state.codes.slice()
    if (this.state.editingId) {
      const index = codes.findIndex((code) => code.id === this.state.editingId)
      const item = { id: this.state.editingId, name, type, content, color }
      if (index >= 0) codes[index] = item
      else codes.unshift(item)
    } else {
      codes.unshift({ id: newId(), name, type, content, color })
    }

    this.state.codes = codes
    this.state.editingId = null
    this.state.draftName = SAMPLE_NAME
    this.state.draftType = 'qr'
    this.state.draftContent = SAMPLE_CONTENT
    this.state.draftColor = DEFAULT_COLOR
    this.state.error = ''
    this.state.pendingDelete = ''
    this.state.saved = true
    this.state.typePickerOpen = false
    this.state.props.settingsStorage.setItem(STORAGE_KEY, JSON.stringify(codes))
    this.refresh()
  },

  remove(code) {
    if (this.state.pendingDelete !== code.id) {
      this.state.pendingDelete = code.id
      this.state.error = ''
      this.refresh()
      return
    }
    const codes = this.state.codes.filter((item) => item.id !== code.id)
    this.state.codes = codes
    this.state.pendingDelete = ''
    this.state.saved = false
    if (this.state.editingId === code.id) {
      this.state.editingId = null
      this.state.draftName = SAMPLE_NAME
      this.state.draftType = 'qr'
      this.state.draftContent = SAMPLE_CONTENT
      this.state.draftColor = DEFAULT_COLOR
    }
    this.state.props.settingsStorage.setItem(STORAGE_KEY, JSON.stringify(codes))
    this.refresh()
  },

  toggleTypePicker() {
    this.state.typePickerOpen = !this.state.typePickerOpen
    this.refresh()
  },

  chooseType(typeId) {
    if (!TYPE_MAP[typeId]) return
    this.state.draftType = typeId
    this.state.typePickerOpen = false
    this.state.error = ''
    this.state.saved = false
    this.refresh()
  },

  typeRow() {
    const open = !!this.state.typePickerOpen
    const row = View({ style: FIELD_ROW }, [
      Text({ style: FIELD_LABEL }, ['CODE TYPE']),
      View({ style: FIELD_BOX_PAD }, [
        Text({ style: TYPE_VALUE_TEXT }, [typeLabel(this.state.draftType)]),
        Button({
          label: open ? 'Close' : 'Change',
          style: CHANGE_BUTTON,
          onClick: () => this.toggleTypePicker()
        })
      ])
    ])
    if (!open) return row
    const chips = TYPE_OPTIONS.map((option) =>
      Button({
        label: option.name,
        style:
          option.value === this.state.draftType ? TYPE_CHIP_ACTIVE : TYPE_CHIP,
        onClick: () => this.chooseType(option.value)
      })
    )
    return View({ style: {} }, [row, View({ style: TYPE_LIST }, chips)])
  },

  colorRow() {
    return View({ style: FIELD_ROW }, [
      Text({ style: FIELD_LABEL }, ['COLOR HEX']),
      View({ style: FIELD_BOX_PAD }, [
        View({ style: { flex: 1, minWidth: 0 } }, [
          TextInput({
            label: '',
            value: this.state.draftColor,
            maxLength: 7,
            labelStyle: FIELD_LABELSTYLE,
            subStyle: FIELD_SUBSTYLE,
            onChange: (value) => {
              this.state.draftColor = value
              this.state.error = ''
              this.state.saved = false
              this.refresh()
            }
          })
        ]),
        View({ style: colorDotStyle(this.state.draftColor, 20) })
      ])
    ])
  },

  codeCard(code, confirming) {
    return View(
      {
        style: Object.assign({}, CARD_STYLE, {
          marginBottom: '10px',
          display: 'flex',
          flexDirection: 'column'
        })
      },
      [
        View(
          {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center'
            }
          },
          [
            View({ style: { flex: 1, minWidth: 0 } }, [
              Text({ style: CARD_NAME_STYLE }, [code.name]),
              Text({ style: CARD_TYPE_STYLE }, [typeLabel(code.type)]),
              Text({ style: CARD_CODE_STYLE }, [preview(code.content)])
            ]),
            View({ style: colorDotStyle(code.color, 22) })
          ]
        ),
        View({ style: ACTIONS_ROW }, [
          Button({
            label: 'Edit',
            style: SECONDARY_BUTTON,
            onClick: () => this.startEdit(code)
          }),
          Button({
            label: confirming ? 'Confirm' : 'Delete',
            style: DANGER_BUTTON,
            onClick: () => this.remove(code)
          })
        ])
      ]
    )
  },

  infoCard() {
    return View({ style: CARD_STYLE }, [
      Text({ style: INFO_TEXT_STYLE }, [
        'Codes are saved on YOUR phone and are synchronized with your watch.'
      ])
    ])
  },

  formBox() {
    const editing = !!this.state.editingId
    const messages = []
    if (this.state.error) {
      messages.push(Text({ style: MESSAGE_ERROR_STYLE }, [this.state.error]))
    } else if (this.state.saved) {
      messages.push(
        Text({ style: MESSAGE_OK_STYLE }, [
          'Saved. Your watch updates after it syncs.'
        ])
      )
    }
    return View({ style: CARD_STYLE }, [
      fieldRow(
        'NAME',
        TextInput({
          label: '',
          value: this.state.draftName,
          maxLength: 60,
          labelStyle: FIELD_LABELSTYLE,
          subStyle: FIELD_SUBSTYLE,
          onChange: (value) => {
            this.state.draftName = value
            this.state.error = ''
            this.state.saved = false
            this.refresh()
          }
        })
      ),
      this.typeRow(),
      this.colorRow(),
      fieldRow(
        'CODE',
        TextInput({
          label: '',
          value: this.state.draftContent,
          multiline: true,
          rows: 3,
          maxLength: MAX_CONTENT,
          labelStyle: FIELD_LABELSTYLE,
          subStyle: FIELD_SUBSTYLE,
          onChange: (value) => {
            this.state.draftContent = value
            this.state.error = ''
            this.state.saved = false
            this.refresh()
          }
        }),
        true
      ),
      View({ style: ACTIONS_ROW }, [
        Button({
          label: editing ? 'Save changes' : 'Add code',
          style: PRIMARY_BUTTON,
          onClick: () => this.save()
        }),
        editing
          ? Button({
              label: 'Cancel',
              style: SECONDARY_BUTTON,
              onClick: () => this.cancelEdit()
            })
          : false
      ])
    ].concat(messages).filter(Boolean))
  },

  build(props) {
    try {
      this.sync(props)

      const list = this.state.codes.length
        ? this.state.codes.map((code) =>
            this.codeCard(code, this.state.pendingDelete === code.id)
          )
        : [
            View({ style: CARD_STYLE }, [
              Text({ style: INFO_TEXT_STYLE }, [
                'No codes yet. Add your first code above.'
              ])
            ])
          ]

      return View(
        { style: PAGE_STYLE },
        [
          category('', [this.infoCard()]),
          category('ADD NEW CODE', [this.formBox()]),
          category(`YOUR CODES (${this.state.codes.length})`, list)
        ].filter(Boolean)
      )
    } catch (error) {
      console.log('settings build failed', error)
      const message =
        error && error.message ? error.message : String(error || 'Unknown error')
      return View({ style: PAGE_STYLE }, [
        Text({ style: MESSAGE_ERROR_STYLE }, [`Settings error: ${message}`])
      ])
    }
  }
})
