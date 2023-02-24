import { Circle, Element, Polygon, Rect, Svg } from '@svgdotjs/svg.js';

export type TSVGChlid = Rect | Circle | Polygon;

export type TCustomDragDetail = {
  event: MouseEvent | TouchEvent;
  __startOffset: {
    offsetX: number;
    offsetY: number;
  };
  offsetX: number;
  offsetY: number;
  $svgContainer: Svg;
};

export type TDrawType = 'rect' | 'circle' | 'polygon';
export type TDrawReturn = [Svg, TSVGChlid, TDrawType, TSvgData?];

export type TDrawValue = Partial<{
  onMouseDown: (svgData: TSvgData, $svgContainer: Svg, ...args: any[]) => TDrawReturn;
  onDrag: (event: TCustomDragDetail, drawSvg: TDrawReturn, ...args: any[]) => void;
  onMouseUp: (event: TCustomDragDetail, drawSvg: TDrawReturn, ...args: any[]) => void;
  onCreate: (svgData: TSvgData, $svgContainer: Svg) => TDrawReturn;
}>;

export type TSvgData = {
  props: Record<string, any> & { label: string };
  svg?: Element;
  x: number;
  y: number;
  child: {
    type: TDrawType;
    svg?: Element;
    x: number;
    y: number;
    width: number;
    height: number;
  };
};
