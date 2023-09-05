<template>
  <q-field ref="qFieldRef" :model-value="inputValue" :readonly="readonly" :disable="disable" v-bind="attrs">
    <input
      class="q-field__native q-placeholder"
      :value="inputValue"
      :maxlength="maxlength"
      :readonly="readonly"
      :disabled="disable"
      @keydown="keydown"
      @compositionstart="compositionstart"
      @compositionend="compositionend"
      @input="input"
    />
    <template #append>
      <slot name="append">
        <q-icon name="today" class="cursor-pointer">
          <q-popup-proxy ref="qDateProxy" cover transition-show="scale" transition-hide="scale" :target="qDateTarget">
            <q-date v-model="inputValue" mask="YYYY-MM-DD" v-bind="qDateBind" @update:model-value="onDateSelect"></q-date>
          </q-popup-proxy>
        </q-icon>
      </slot>
    </template>

    <template v-for="(slot, key) in $slots" v-slot:[key]="props">
      <slot :name="key" v-bind="props"></slot>
    </template>
  </q-field>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, useAttrs } from 'vue'
import { pick } from 'lodash-es'

/**
 * 所有附加在 QDate 的 Props 一律以 date- 開頭，例如 date-options
 */

const attrs = useAttrs()
const qDateProxy = ref()
const qFieldRef = ref()
const myDynamicExpose = reactive({})

const qFieldComputed = computed(() => {
  const pickProperty = pick(qFieldRef.value, [
    'dark',
    'modelValue',
    'error',
    'errorMessage',
    'noErrorIcon',
    'rules',
    'reactiveRules',
    'lazyRules',
    'label',
    'stackLabel',
    'hint',
    'hideHint',
    'prefix',
    'suffix',
    'labelColor',
    'color',
    'bgColor',
    'filled',
    'outlined',
    'borderless',
    'standout',
    'square',
    'loading',
    'labelSlot',
    'bottomSlots',
    'hideBottomSpace',
    'rounded',
    'dense',
    'itemAligned',
    'counter',
    'clearable',
    'clearIcon',
    'disable',
    'readonly',
    'autofocus',
    'for',
    'maxlength',
    'resetValidation',
    'validate',
    'hasError',
    'focus',
    'blur',
  ])

  return pickProperty
})

defineExpose(myDynamicExpose)

onMounted(() => {
  const assign = () => {
    Object.assign(myDynamicExpose, qFieldComputed.value)
  }
  assign()

  watch(qFieldComputed, assign, { deep: true })
})

const props = defineProps({
  modelValue: String,
  mask: {
    type: String,
    default: 'date', // [date, datetime]
  },

  readonly: Boolean,
  disable: Boolean,
})

const maxlength = computed(() => (props.mask === 'datetime' ? 16 : 10))

const connectionSymbolEndRegex = /\d[-: ]$/

const setValue = (input) => {
  if (!input) return ''

  input = input.replace(/\D/g, '')
  const sliceArray = [0, 4, 6, 8, 10, 12]

  const datetimeArray = []
  const length = props.mask === 'datetime' ? 5 : 3
  for (let i = 0; i < length; i++) {
    const start = sliceArray[i]
    const end = sliceArray[i + 1]
    const value = input.slice(start, end)
    datetimeArray.push(value)

    if ((i > 0 && value.length !== 2) || (i === 0 && value.length !== 4)) {
      break
    }
  }

  let output = datetimeArray.slice(0, 3).join('-')

  if (props.mask === 'datetime') {
    if (output.length === 10) {
      output += ' '
      output += datetimeArray.slice(3).join(':')
    }
  }

  return output
}

const inputValue = ref(setValue(props.modelValue))

watch(
  () => props.modelValue,
  (val) => {
    const dateValue = setValue(val)
    inputValue.value = dateValue
  }
)

const emit = defineEmits(['update:model-value', 'date-select'])

const data = reactive({
  key: null,
  isDashEnd: false,
  isComposition: false,
})

const inputHandler = (evt) => {
  let input = evt.target.value
  if (data.key === 'Backspace' && data.isDashEnd) {
    input = input.substr(0, input.length - 1)
  }

  const val = setValue(input)

  inputValue.value = val
  evt.target.value = val

  emit('update:model-value', val)

  if (connectionSymbolEndRegex.test(val) && val.length - data.selectionPosition === 1) {
    data.selectionPosition += 1
  }

  // 設定 SelectionRange 避免從中間輸入或選擇後輸入因連接符號導致 selection 位置錯誤
  evt.target.setSelectionRange(data.selectionPosition, data.selectionPosition)
}

const input = (evt) => {
  if (data.isComposition) {
    evt.preventDefault()
    return
  }

  inputHandler(evt)
}

const keydown = (evt) => {
  data.key = evt.key
  data.selectionPosition = evt.target.selectionStart

  if (data.key === 'Backspace') {
    data.selectionPosition -= 1
  } else {
    data.selectionPosition += 1
  }

  if (connectionSymbolEndRegex.test(evt.target.value)) {
    data.isDashEnd = true
  } else {
    data.isDashEnd = false
  }
}

const compositionend = (evt) => {
  inputHandler(evt)
  data.isComposition = false
}

const compositionstart = () => {
  data.isComposition = true
}

const qDateTarget = computed(() => {
  if (props.disable || props.readonly) return false
  else return true
})

const qDateBind = computed(() => {
  const regex = /^date-/
  const keys = Object.keys(attrs).filter((key) => regex.test(key))
  return keys.reduce((obj, key) => {
    return { ...obj, [key.replace(regex, '')]: attrs[key] }
  }, {})
})

const onDateSelect = (val) => {
  emit('update:model-value', val)
  emit('date-select', val)
  qDateProxy.value.hide()
}
</script>

