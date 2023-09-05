<template>
  <q-select
    ref="selectRef"
    :model-value="modelValue"
    :options="listFilterItems"
    :option-label="optionLabel"
    :option-value="optionValue"
    map-options
    emit-value
    use-input
    @filter="onListFilter"
    @input-value="filterLoading = true"
    @update:model-value="(val) => emit('update:model-value', val)"
  >
    <template #no-option="{ inputValue }">
      <q-item v-if="inputValue">
        <q-item-section>
          <q-item-label class="text-grey flex flex-nowrap items-center gap-2">
            <q-spinner v-if="filterLoading" color="primary"></q-spinner>
            <div>{{ inputValue ? '找不到符合的資料' : '沒有資料' }}</div>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template #option="scope">
      <slot name="option" v-bind="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label>
              <div
                v-html="
                  scope.opt.filterLabel || (isFunction(optionLabel) ? optionLabel(scope.opt) : scope.opt[optionLabel])
                "
              ></div>
            </q-item-label>
          </q-item-section>
        </q-item>
      </slot>
    </template>
  </q-select>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useFilter } from 'utils/quasar/use-filter.js'
import { pick, isFunction } from 'lodash-es'
import { useList } from 'utils/use-list.js'

const props = defineProps({
  modelValue: [String, Array],
  options: Array,
  optionLabel: { type: [String, Function], default: 'Name' },
  optionValue: { type: [String, Function], default: 'Id' },

  listKey: String,
  listFilterKeys: {
    type: Array,
    default: () => ['Id', 'Name'],
  },

  beforeFilter: Function,
})

const selectRef = ref({})
const myDynamicExpose = reactive({})

const qSelectComputed = computed(() => {
  const pickProperty = pick(selectRef.value, [
    'virtualScrollHorizontal',
    'onVirtualScroll',
    'virtualScrollSliceSize',
    'virtualScrollSliceRatioBefore',
    'virtualScrollSliceRatioAfter',
    'virtualScrollItemSize',
    'virtualScrollStickySizeStart',
    'virtualScrollStickySizeEnd',
    'tableColspan',
    'name',
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
    'multiple',
    'displayValue',
    'displayValueHtml',
    'dropdownIcon',
    'options',
    'optionValue',
    'optionLabel',
    'optionDisable',
    'hideSelected',
    'hideDropdownIcon',
    'fillInput',
    'maxValues',
    'optionsDense',
    'optionsDark',
    'optionsSelectedClass',
    'optionsHtml',
    'optionsCover',
    'menuShrink',
    'menuAnchor',
    'menuSelf',
    'menuOffset',
    'popupContentClass',
    'popupContentStyle',
    'useInput',
    'useChips',
    'newValueMode',
    'mapOptions',
    'emitValue',
    'inputDebounce',
    'inputClass',
    'inputStyle',
    'tabindex',
    'autocomplete',
    'transitionShow',
    'transitionHide',
    'transitionDuration',
    'behavior',
    'onNewValue',
    'onFilter',
    'scrollTo',
    'reset',
    'refresh',
    'showPopup',
    'hidePopup',
    'removeAtIndex',
    'add',
    'toggleOption',
    'getOptionIndex',
    'setOptionIndex',
    'moveOptionSelection',
    'filter',
    'updateMenuPosition',
    'updateInputValue',
    'isOptionSelected',
    'getEmittingOptionValue',
    'isOptionDisabled',
    'getOptionValue',
    'getOptionLabel',
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
    Object.assign(myDynamicExpose, qSelectComputed.value)
  }
  assign()
})

const emit = defineEmits(['update:model-value'])

const listComputed = computed(() => props.options ?? list.value)

const filterLoading = ref(false)
const { filterItems: listFilterItems, filterHandler } = useFilter(
  { items: listComputed, filterKeys: props.listFilterKeys },
  () => {
    filterLoading.value = false
  }
)

const onListFilter = async (val, done) => {
  if (typeof props.beforeFilter === 'function') await props.beforeFilter(val, done)

  filterHandler(val, done)
}

const listKeys = props.listKey ? [props.listKey] : []
const { [props.listKey]: list } = useList(listKeys)
</script>

