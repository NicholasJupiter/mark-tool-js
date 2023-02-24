// import { Container } from '../dist/index.min.js'
import { Container } from '../src/index'

const $container = document.getElementById('work-container')
const testImg = require('./assets/img.jpeg')
const container = new Container($container, testImg.default)
window.container = container
container.startDraw('rect')

window.addEventListener('onUpdateSvgData', (data) => {
  console.log(data.detail.svgData)
})
