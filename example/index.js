// import { Container } from '../dist/index.min.js'
import { Container, MarkToolUtils } from '../src/index'

const $container = document.getElementById('work-container')
const testImg = require('./assets/img.jpeg')
const testImg1 = require('./assets/img1.jpeg')
const container = new Container($container)
window.container = container
// container.startDraw('rect')
const datas = []
const imgs = [testImg.default, testImg1.default]
let activeIndex = 0
container.switchImage(imgs[activeIndex])

window.addEventListener('onUpdateSvgData', ({ detail }) => {
  const { mode, svgsData } = detail

  if (!['switchImageBefore', 'switchImageAfter'].includes(mode)) {
    datas[activeIndex] = svgsData
    console.log(datas, datas[activeIndex], activeIndex, mode, 'onUpdateSvgData')
  }
})

window.addEventListener('onSelectSvg', (data) => {
  // console.log(data, 'onSelectSvg')
})

window.onDeleteAllClick = () => {
  container.$SvgWrap.deleteAllSvgDom()
}

window.onDeletebtnClick = () => {
  container.$SvgWrap.deleteSvgDom(container.$SvgWrap.svgsData[0].svgId)
}
window.onSwitchImage = () => {
  datas[activeIndex] = window.container.$SvgWrap.getCloneSvgsData()
  activeIndex = activeIndex ? 0 : 1
  container.switchImage(imgs[activeIndex]).then(() => {
    if (!datas[activeIndex]) return
    for (const data of datas[activeIndex]) {
      container.$SvgWrap.addSvgDom(data)
    }
  })
}
window.copySvg = () => {
  const data = JSON.parse(JSON.stringify(container.$SvgWrap.svgsData[0]))
  data.x += Math.random() * 100
  data.y += Math.random() * 100
  container.$SvgWrap.addSvgDom(data)
}

window.onSaveCoco = () => {
  const cocojson = MarkToolUtils.toCOCOJSON(imgs, datas)
  console.log(cocojson)
}

window.switchPreview = () => {
  container.$SvgWrap.switchPreviewStatus(true)
}

window.switchOperate = (type) => {
  container.startDraw(type)
  // container.$SvgWrap.switchPreviewStatus(!container.$SvgWrap.isPreview)
}
