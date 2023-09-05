import MySearchArea from 'components/MySearchArea.vue'
import MyDialogContent from 'components/MyDialogContent.vue'
import MyTitle from 'components/MyTitle.vue'
import MyDateInput from 'components/MyDateInput.vue'
import MyFilterSelect from 'components/MyFilterSelect.vue'
import MyEditCard from 'components/MyEditCard.vue'
import MyEditRow from 'components/MyEditRow.vue'
import MyWrapper from 'components/MyWrapper.js'

export default ({ app }) => {
  // we globally register our component in the app
  app.component('my-search-area', MySearchArea)
  app.component('my-dialog-content', MyDialogContent)
  app.component('my-title', MyTitle)
  app.component('my-date-input', MyDateInput)
  app.component('my-filter-select', MyFilterSelect)
  app.component('my-edit-card', MyEditCard)
  app.component('my-edit-row', MyEditRow)
  app.component('my-wrapper', MyWrapper)
}

