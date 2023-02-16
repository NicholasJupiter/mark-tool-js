import type { Svg } from '@svgdotjs/svg.js';
import { TCustomDragDetail, TDrawReturn, TDrawType, TSVGChlid, TSvgData } from '../types/svg';
import { Draws } from '../draws/index';
import { findParentBySvg, getNodeProps } from '../svg.js/utils/utils.svg';
import { getVertexPosition, isMobile } from '../utils/utils';

export class SVGWrap {
  $svgWrap: HTMLDivElement;
  $svgContainer: Svg;
  mouseDownClient = { offsetX: 0, offsetY: 0 };
  currDrawType: TDrawType;
  isMouseDown = false;
  currSvg: TDrawReturn = null;
  currClickSvg: Svg;
  svgsData: TSvgData[] = [];

  constructor(_$svgWrap: HTMLDivElement) {
    this.initSvgWrap(_$svgWrap);
    this.$svgContainer = window.SVG(this.$svgWrap);

    this.$svgContainer.on(
      'click',
      () => {
        for (let i = 0; i < this.$svgContainer.node.children.length; i++) {
          const child = this.$svgContainer.node.children.item(i);
          const contentEl = window.SVG.get(child.id).node.querySelector('[class^=svgjs-]');
          if (contentEl) {
            window.SVG.get(contentEl.id).selectize(false);
          }
        }
      },
      false
    );

    window.addEventListener('svgjs-del', (data: any) => {
      const $svg = data.detail.$svgEl;
      const index = this.svgsData.findIndex(({ svg }) => (svg.node as any) === $svg.node);
      this.svgsData.splice(index, 1);
      $svg.remove();
    });
  }

  initSvgWrap(_$svgWrap: HTMLDivElement) {
    this.$svgWrap = _$svgWrap;
    this.addEventListener();
  }

  addEventListener() {
    try {
      document.createEvent('TouchEvent');
      this.$svgWrap.removeEventListener('touchmove', this.onTouchMove.bind(this));
      this.$svgWrap.removeEventListener('touchstart', this.onTouchStart.bind(this));
      this.$svgWrap.removeEventListener('touchend', this.onTouchEnd.bind(this));
      this.$svgWrap.addEventListener('touchmove', this.onTouchMove.bind(this));
      this.$svgWrap.addEventListener('touchstart', this.onTouchStart.bind(this));
      this.$svgWrap.addEventListener('touchend', this.onTouchEnd.bind(this));
    } catch (error) {
      this.$svgWrap.removeEventListener('mousemove', this.onTouchMove.bind(this));
      this.$svgWrap.removeEventListener('mousedown', this.onTouchStart.bind(this));
      this.$svgWrap.removeEventListener('mouseup', this.onTouchEnd.bind(this));
      this.$svgWrap.addEventListener('mousemove', this.onTouchMove.bind(this));
      this.$svgWrap.addEventListener('mousedown', this.onTouchStart.bind(this));
      this.$svgWrap.addEventListener('mouseup', this.onTouchEnd.bind(this));
    }

    this.$svgWrap.removeEventListener('click', this.onClick.bind(this));
    this.$svgWrap.addEventListener('click', this.onClick.bind(this));
  }

  private onClick(event: PointerEvent) {
    const target = event.target as HTMLElement;
    const svg = findParentBySvg(target);
    event.stopPropagation();
    document.dispatchEvent(
      new CustomEvent('onWrapClick', {
        detail: {
          event,
          svg
        }
      })
    );
  }

  private onTouchStart(event: MouseEvent | TouchEvent) {
    let x = 0;
    let y = 0;

    if (!isMobile() && event.type === 'mousedown') {
      x = (event as MouseEvent).offsetX;
      y = (event as MouseEvent).offsetY;
    } else if (isMobile() && event.type === 'touchstart') {
      const vertex = getVertexPosition(this.$svgWrap);
      const touch = (event as TouchEvent).changedTouches[0];
      x = touch.pageX - vertex.left;
      y = touch.pageY - vertex.top;
      this.sendLinesLocation(x, y);
    } else {
      // touch start
      return;
    }

    this.mouseDownClient = {
      offsetX: x,
      offsetY: y
    };
    const detail = this.getDetails(event, x, y);
    const currDraw = Draws[this.currDrawType];
    if (currDraw?.onMouseDown) {
      this.currSvg = currDraw.onMouseDown(detail);

      this.currSvg[1].on(
        'click',
        (event: any) => {
          const _svg = window.SVG.get(event.currentTarget.id);
          _svg.selectize().resize();
          event.stopPropagation();
        },
        false
      );

      const observer = new window.MutationObserver((mutations) => {
        const target = mutations[0].target as unknown as HTMLElement;
        const _svgData = this.svgsData.find(({ svg }) => (svg.node as any) === target);
        const { x: svgX, y: svgY } = getNodeProps(_svgData.svg.node as unknown as HTMLElement);
        const { x: childX, y: childY } = getNodeProps(
          _svgData.child.svg.node as unknown as HTMLElement
        );
        _svgData.x = svgX;
        _svgData.y = svgY;
        _svgData.child.x = childX;
        _svgData.child.y = childY;
      });

      observer.observe(this.currSvg[0].node, {
        childList: true,
        attributes: true
      });

      this.svgsData.push({
        props: { label: '' },
        svg: this.currSvg[0],
        x: 0,
        y: 0,
        child: {
          type: this.currSvg[2],
          svg: this.currSvg[1],
          x: 0,
          y: 0,
          width: 0,
          height: 0
        }
      });
    }

    this.isMouseDown = true;
    document.dispatchEvent(
      new CustomEvent('onWrapMouseDown', {
        detail: event
      })
    );
  }

  private onDrag(event: MouseEvent | TouchEvent, x: number, y: number) {
    const detail = this.getDetails(event, x, y);

    const currDraw = Draws[this.currDrawType];
    if (currDraw?.onDrag && this.currSvg) {
      currDraw.onDrag(detail, this.currSvg);
    }

    document.dispatchEvent(new CustomEvent('onWrapDrag', { detail }));
  }

  private onTouchMove(event: MouseEvent | TouchEvent) {
    let x = 0;
    let y = 0;
    if (!isMobile() && event.type === 'mousemove') {
      x = (event as MouseEvent).offsetX;
      y = (event as MouseEvent).offsetY;
    } else if (isMobile() && event.type === 'touchmove') {
      const vertex = getVertexPosition(this.$svgWrap);
      const touch = (event as TouchEvent).changedTouches[0];
      x = touch.pageX - vertex.left;
      y = touch.pageY - vertex.top;
    } else {
      // touch move
      return;
    }
    this.sendLinesLocation(x, y);
    const detail = this.getDetails(event, x, y);

    if (this.isMouseDown) {
      this.onDrag(event, x, y);
    } else {
      window.dispatchEvent(new CustomEvent('onWrapMouseMove', { detail }));
    }
  }

  private onTouchEnd(event: MouseEvent | TouchEvent) {
    let x = 0;
    let y = 0;
    if (!isMobile() && event.type === 'mouseup') {
      x = (event as MouseEvent).offsetX;
      y = (event as MouseEvent).offsetY;
      // const { offsetX: x, offsetY: y } = event;
    } else if (isMobile() && event.type === 'touchend') {
      const vertex = getVertexPosition(this.$svgWrap);
      const touch = (event as TouchEvent).changedTouches[0];
      x = touch.pageX - vertex.left;
      y = touch.pageY - vertex.top;
    } else {
      // touch start
      return;
    }
    const detail = this.getDetails(event, x, y);
    const currDraw = Draws[this.currDrawType];
    if (currDraw?.onMouseUp) {
      currDraw.onMouseUp(detail, this.currSvg);
    }

    document.dispatchEvent(
      new CustomEvent('onWrapMouseUp', {
        detail
      })
    );

    this.isMouseDown = false;
    this.mouseDownClient = {
      offsetX: 0,
      offsetY: 0
    };
  }

  getDetails(event: MouseEvent | TouchEvent, offsetX: number, offsetY: number): TCustomDragDetail {
    return {
      event,
      __startOffset: { ...this.mouseDownClient },
      $svgContainer: this.$svgContainer,
      offsetX,
      offsetY
    };
  }

  sendLinesLocation(x: number, y: number) {
    window.dispatchEvent(
      new CustomEvent('onWrapUpdateVars', {
        detail: {
          '--location-x': x + 'px',
          '--location-y': y + 'px'
        }
      })
    );
  }
}
