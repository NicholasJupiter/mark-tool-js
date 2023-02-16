import { TDrawValue } from '../types/svg';
import { guid } from '../utils/utils';

const rect: TDrawValue = {
  onMouseDown(details) {
    const { __startOffset, $svgContainer } = details;
    const { offsetX: startX, offsetY: startY } = __startOffset;

    const draw = window.SVG($svgContainer.node).nested().move(startX, startY).draggable();

    const rect = draw
      .move(0, 0)
      .rect(1, 1)
      .addClass('svgjs-rect-' + guid())
      .resize();
    return [draw, rect, 'rect'];
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
