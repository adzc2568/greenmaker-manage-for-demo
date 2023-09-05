import { h, computed } from 'vue'
import { createComponent } from 'utils/create.js'
import { useQuasar, QImg, QCard, QCardSection, QBtn, QPopupProxy } from 'quasar'

const quasarComponents = {
  QImg,
  QCard,
  QCardSection,
  QBtn,
  QPopupProxy,
}

export default createComponent({
  name: 'ArticleContents',

  props: {
    contents: {
      type: Array,
      default: () => [],
    },

    images: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const $q = useQuasar()

    const childNodesHandler = (childNodes) => {
      return childNodes.map((childNode) => elementRenderHandler(childNode))
    }

    const contentsComputed = computed(() => props.contents)
    const imagesComputed = computed(() => props.images)

    const elementRenderHandler = (item) => {
      if (/^Q/.test(item.type)) {
        let props = {}
        switch (item.type) {
          case 'QCard':
            props = { flat: true, class: 'bg-grey-3' }
            break
          case 'QImg': {
            const image = imagesComputed.value.find((image) => image._id === item.attributes['image-id'])
            item.attributes.src = image.FullPath
            break
          }
        }
        return h(quasarComponents[item.type], item.attributes ? Object.assign(item.attributes, props) : props, () =>
          item.childNodes ? childNodesHandler(item.childNodes) : null
        )
      } else {
        if (item.type === '#text') return item.textContent
        else return h(item.type, item.attributes, childNodesHandler(item.childNodes))
      }
    }

    return () => {
      const contentNodes = childNodesHandler(contentsComputed.value)
      return contentNodes
    }
  },
})

