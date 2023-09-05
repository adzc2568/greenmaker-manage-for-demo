<template>
  <div>
    <editor-menu @btn-click="menuBtnClickHandler"></editor-menu>
    <editor-content ref="editorRef" :editor="editor" class="h-[640px] overflow-y-auto border" />
    <div class="text-end">統計字數：{{ numberFormat(length) }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import EditorMenu from './EditorMenu.vue'
import AddImageDialog from './AddImageDialog.vue'
import { cloneDeep } from 'lodash-es'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { numberFormat } from 'utils/methods.js'

// tiptap
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import Dropcursor from '@tiptap/extension-dropcursor'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import History from '@tiptap/extension-history'
import Bold from '@tiptap/extension-bold'
import TextAlign from '@tiptap/extension-text-align'
import Gapcursor from '@tiptap/extension-gapcursor'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import BulletList from '@tiptap/extension-bullet-list'
import CharacterCount from '@tiptap/extension-character-count'
import { Extension } from '@tiptap/core'

const $q = useQuasar()
const route = useRoute()

const props = defineProps({
  id: String,
  content: Object,
  images: Array,
})

const emit = defineEmits(['update:content', 'update:images'])

const CreateUuid = Extension.create({
  addGlobalAttributes() {
    return [
      {
        types: ['heading', 'paragraph', 'listItem', 'bulletList', 'orderedList'],
        attributes: {
          id: {
            renderHTML: () => ({
              id: uuidv4(),
            }),
          },
        },
      },
    ]
  },
})

const length = computed(() => editor.value?.storage.characterCount.characters())
const editorRef = ref()
const editor = useEditor({
  content: '',
  extensions: [
    CharacterCount,
    CreateUuid,
    Document,
    Heading.configure({
      levels: [1, 2, 3],
    }),
    Paragraph,
    Text,
    Color.configure({
      types: ['textStyle'],
    }),
    TextStyle,
    History,
    Bold,
    TextAlign,
    Dropcursor,
    Gapcursor,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Image.extend({
      addAttributes() {
        return {
          src: {
            default: null,
          },
          alt: {
            default: null,
          },
          title: {
            default: null,
          },
          'image-id': {
            default: null,
          },
        }
      },

      addCommands() {
        return {
          setImage:
            (options) =>
            ({ commands }) => {
              return commands.insertContent({
                type: 'image',
                attrs: options,
              })
            },
        }
      },
    }),
    ListItem,
    OrderedList,
    BulletList,
  ],
  onUpdate({ editor }) {
    const content = [editor.getJSON()]

    const trimAttrs = (data) => {
      if (data.type === 'image') {
        data.attrs.src = undefined
        return
      }

      if (data.content) {
        data.content.forEach(trimAttrs)
      }
    }

    content.forEach(trimAttrs)

    emit('update:content', content)
  },
})

const getImageSrc = (image) => {
  return image.Temp
    ? `${process.env.API_HOST}/${image.Origin.BasePath}`
    : `https://firebasestorage.googleapis.com/v0/b/mrgreen-dbf25.appspot.com/o/${image.Origin.BasePath}?alt=media`
}

const menuBtnClickHandler = async ({ key, data }) => {
  switch (key) {
    case 'listBullet':
      editor.value.chain().focus().toggleBulletList().run()
      break
    case 'listNumber':
      editor.value.chain().focus().toggleOrderedList().run()
      break
    case 'image': {
      $q.dialog({
        component: AddImageDialog,
        componentProps: {
          id: props.id,
          type: 'Article',
          images: props.images,
          selectable: true,
          'onUpdate:images': (images) => emit('update:images', images),
        },
      }).onOk((images) => {
        images.forEach((image, index) => {
          if (index > 0) {
            editor.value.commands.enter()
            editor.value.commands.focus('end')
          }

          editor.value.commands.setImage({
            src: getImageSrc(image),
            'image-id': image._id,
          })
        })
      })
      break
    }
    case 'textColor': {
      if (data.color === 'black') editor.value.chain().focus().unsetColor().run()
      else editor.value.chain().focus().setColor(data.color).run()
      break
    }
    case 'textBold':
      editor.value.chain().focus().toggleBold().run()
      break
    case 'heading':
      editor.value.chain().focus().toggleHeading({ level: data }).run()
      break
  }
}

defineExpose({
  setContent: () => {
    const content = cloneDeep(props.content)

    if (content) {
      const imgSrcSet = (data) => {
        if (data.type === 'image') {
          const imageId = data.attrs['image-id']
          const image = props.images.find((image) => image._id === imageId)
          if (image) data.attrs.src = getImageSrc(image)
          return
        }

        if (data.content) {
          data.content.forEach(imgSrcSet)
        }
      }

      content.forEach(imgSrcSet)
    }

    editor.value.commands.setContent(content)
  },
})
</script>

<style lang="scss">
.ProseMirror {
  @apply min-h-full p-4;

  :where(:is(h2, h3) + *) {
    @apply mt-0 #{!important};
  }

  p {
    @apply my-6 text-slate-700;
  }

  h2 {
    @apply mb-4 mt-20;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: revert;
    font-weight: revert;
    line-height: revert;
  }

  ul {
    @apply list-disc;
  }
  ol {
    @apply list-decimal;
  }
  ul,
  ol {
    @apply my-10 pl-6;

    li {
      @apply pl-3;
    }
  }

  a {
    color: #14b8a6;
  }

  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;

    td,
    th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      text-align: left;
      background-color: #f1f3f5;
    }

    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: '';
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: -2px;
      width: 4px;
      background-color: #adf;
      pointer-events: none;
    }
  }

  img {
    @apply my-8 h-auto max-w-full;

    &.ProseMirror-selectednode {
      outline: 3px solid #68cef8;
    }
  }
}
</style>

