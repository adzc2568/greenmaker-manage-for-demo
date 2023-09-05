import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'

import ExtendCard from './ExtendCard.vue'

export const Card = Node.create({
  name: 'card',

  group: 'block',

  content: 'block+',

  addCommands() {
    return {
      setCard:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({ type: 'card', attrs: options })
        },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'card',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['card', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(ExtendCard)
  },
})

