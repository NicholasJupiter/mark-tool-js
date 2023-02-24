// import { Container } from '../dist/index.min.js'
import { Container } from '../src/index'

const $container = document.getElementById('work-container')
const testImg = require('./assets/img.jpeg')
const container = new Container($container, testImg.default)
window.container = container
container.startDraw('rect')

const clear = document.querySelector('#clear')
const delBtn = document.querySelector('#del')

window.addEventListener('onUpdateSvgData', (data) => {
  console.log(data.detail.svgsData)
})

clear.addEventListener('click', () => {
  container.$SvgWrap.deleteAllSvgDom()
})

delBtn.addEventListener('click', () => {
  console.log(container.$SvgWrap.svgsData[0].svgId, 'container.$SvgWrap.svgsData[0].svgId')

  container.$SvgWrap.deleteSvgDom(container.$SvgWrap.svgsData[0].svgId)
})
