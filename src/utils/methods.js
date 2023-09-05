export const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const getRandomColor = () => {
  return `hsl(${getRandom(0, 360)}, 85%, 85%)`
}

export const numberFormat = (num) => {
  return new Intl.NumberFormat().format(num)
}

