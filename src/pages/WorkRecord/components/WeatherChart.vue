<template>
  <canvas ref="chartRef"></canvas>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { colors } from 'quasar'
import Chart from 'chart.js/auto'

const { getPaletteColor } = colors

const chartRef = ref()
const props = defineProps({
  weatherDatas: Array,
})

const getDatasets = () => {
  const temperatureDatas = props.weatherDatas.map(({ Temperature }) => (Temperature > 0 ? Temperature : null))
  const precpDatas = props.weatherDatas.map(({ Precp }) => Precp)

  const temperatureColor = [
    { range: [35], color: 'red-10' },
    { range: [30, 35], color: 'red' },
    { range: [25, 30], color: 'amber' },
    { range: [20, 25], color: 'green' },
    { range: [15, 20], color: 'cyan' },
    { range: [], color: 'blue' },
  ]
  const pointColors = temperatureDatas.map((t) => {
    for (let i = 0; i < temperatureColor.length; i++) {
      const { range, color } = temperatureColor[i]
      if ((range[0] ? t > range[0] : true) && (range[1] ? t <= range[1] : true)) {
        return getPaletteColor(color)
      }
    }
  })
  return [
    {
      label: '降水量',
      data: precpDatas,
      backgroundColor: getPaletteColor('light-blue'),
    },
    {
      label: '露點溫度',
      data: temperatureDatas,
      pointBackgroundColor: pointColors,
      pointBorderColor: pointColors,
      type: 'line',
    },
  ]
}

const createChart = () => {
  const chart = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels: props.weatherDatas.map(({ ObsTime }) => `${ObsTime}`),
      datasets: getDatasets(),
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false,
        },
      },
    },
  })

  watch(
    () => props.weatherDatas,
    () => {
      chart.data.datasets = getDatasets()
      chart.update()
    }
  )
}

onMounted(createChart)
</script>

