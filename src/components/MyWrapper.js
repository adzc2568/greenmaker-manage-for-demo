import { h, resolveComponent } from 'vue'
import { createComponent } from 'utils/create.js'

export default createComponent({
  name: 'my-wrapper',
  props: {
    wrapperType: {
      type: String,
      default: 'q-page',
    },
  },
  setup(props, { slots ,attrs}) {
    return () => {
      if (props.wrapperType === 'q-page') {
        return h(
          resolveComponent('q-page'),
          {
            ...attrs,
            class: 'p-4',
          },
          slots.default || null
        )
      } else {
        return h(props.wrapperType, {...attrs}, slots.default ? slots.default() : null)
      }
    }
  },
})

