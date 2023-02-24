import { Svg } from '@svgdotjs/svg.js';
import { TDrawValue } from '../types/svg';
import { guid } from '../utils/utils';
const rect: TDrawValue = {
  onCreate(svgData, $svgContainer) {
    const draw = window.SVG($svgContainer.node).nested().move(svgData.x, svgData.y);
    const rect = draw
      .move(svgData.child.x, svgData.child.y)
      .rect(svgData.child.width, svgData.child.height)
      .addClass('svgjs-rect-' + guid());
    svgData.svgId = draw.id();
    svgData.child.svgId = rect.id();
    
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
    const { __startOffset, offsetX, offsetY } = details;

    const { offsetX: startX, offsetY: startY } = __startOffset;
    if (offsetX === startX && offsetY === startY) {
      // todo 发送事件删除元素
      window.dispatchEvent(
        new CustomEvent('svgjs-del', {
          detail: {
            $svgEl: svg
          }
        })
      );
    }
  }
};

export default rect;
