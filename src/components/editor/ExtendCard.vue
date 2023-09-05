<template>
  <node-view-wrapper>
    <q-card>
      <q-card-section>
        <node-view-content> </node-view-content>
      </q-card-section>
    </q-card>
  </node-view-wrapper>
</template>

<script setup>
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

console.log('test', props)
// props.editor.chain().focus().setParagraph()
</script>

