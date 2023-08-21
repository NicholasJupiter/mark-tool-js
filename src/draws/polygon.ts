import { TDrawValue } from '../types/svg';
import { guid } from '../utils/utils';
const polygon: TDrawValue = {
  onCreate(svgData, $svgContainer) {
    const draw = window.SVG($svgContainer.node).nested().move(svgData.x, svgData.y);
    const rect = draw
      .rect(svgData.child.width, svgData.child.height)
      .move(svgData.child.x, svgData.child.y)
      .addClass('svgjs-rect-' + guid());

    svgData.svgId = draw.id();
    svgData.child.svgId = rect.id();
    rect.node.setAttribute('transform', svgData.child.transform || '');
    return [draw, rect, 'rect', svgData];
  },

  onDrag(details, [_, rect]) {
    const { __startOffset, offsetX, offsetY } = details;
    const { offsetX: startX, offsetY: startY } = __startOffset;
    const width = Math.abs(offsetX - startX),
      height = Math.abs(offsetY - startY),
      mx = Math.min(offsetX, startX),
      my = Math.min(offsetY, startY);
    rect.size(width, height).move(mx, my);
  },

  onMouseUp(details, [svg]) {
    // const { __startOffset, offsetX, offsetY } = details;
    // const { offsetX: startX, offsetY: startY } = __startOffset;
    // if (offsetX === startX && offsetY === startY) {
    //   window.dispatchEvent(
    //     new CustomEvent('svgjs-del', {
    //       detail: {
    //         svgIds: [svg.id()],
    //         mode: 'notMove'
    //       }
    //     })
    //   );
    // }
  }
};

export default polygon;
