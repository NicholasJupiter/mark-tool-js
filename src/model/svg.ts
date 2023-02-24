import type { Svg } from '@svgdotjs/svg.js';
import { TCustomDragDetail, TDrawReturn, TDrawType, TSVGChlid, TSvgData } from '../types/svg';
import { Draws } from '../draws/index';
import { findParentBySvg, getNodeProps, throttle } from '../svg.js/utils/utils.svg';
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
  isPreview = false;

  constructor(_$svgWrap: HTMLDivElement) {
    this.initSvgWrap(_$svgWrap);
    this.$svgContainer = window.SVG(this.$svgWrap);

    this.$svgContainer.on('click', (event) => {
      if (!(event.target as HTMLElement).classList.contains('svg_select_points')) {
        this.removeSelectize();
      }
    });

    window.addEventListener('svgjs-del', (data: any) => {
      const $svg = data.detail.$svgEl as Svg;
      const index = this.svgsData.findIndex(({ svg }) => (svg.node as any) === $svg.node);
      this.svgsData.splice(index, 1);
      $svg.remove();
    });
  }

  removeSelectize(fn?: (child: Svg, contentEl?: Svg) => void) {
    for (let i = 0; i < this.$svgContainer.node.children.length; i++) {
      const child = this.$svgContainer.node.children.item(i);
      const contentEl = window.SVG.get(child.id).node.querySelector('[class^=svgjs-]');
      if (contentEl) {
        window.SVG.get(contentEl.id).selectize(false);
      }
      fn && fn(window.SVG.get(child.id), contentEl && window.SVG.get(contentEl.id));
    }
  }

  switchPreviewStatus(_isPreview: boolean): boolean {
    this.isPreview = _isPreview ?? !this.isPreview;
    this.removeSelectize((child) => {
      child.draggable(!this.isPreview);
    });
    return this.isPreview;
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
    window.dispatchEvent(
      new CustomEvent('onWrapClick', {
        detail: {
          event,
          svg
        }
      })
    );
  }

  private onTouchStart(event: MouseEvent | TouchEvent) {
    const offset = this.getEventOffset(event, {
      pcEvent: 'mousedown',
      mobileEvent: 'touchstart',
      mobileCall: (x, y) => {
        this.sendLinesLocation(x, y);
      }
    });
    if (!offset) return;
    const { x, y } = offset;
    if ((event.target as HTMLElement).parentElement === event.currentTarget && !this.isPreview) {
      this.mouseDownClient = {
        offsetX: x,
        offsetY: y
      };
      const currDraw = Draws[this.currDrawType];

      if (currDraw?.onCreate) {
        this.currSvg = currDraw.onCreate(
          {
            x: this.mouseDownClient.offsetX,
            y: this.mouseDownClient.offsetY,
            props: { label: '' },
            child: {
              x: 0,
              y: 0,
              type: 'rect',
              width: 1,
              height: 1
            }
          },
          this.$svgContainer
        );
        if (!this.isPreview) {
          this.currSvg[0].draggable();
        }
        this.currSvg[1].on(
          'click,touchstart',
          (event: any) => {
            if (!this.isPreview) {
              this.removeSelectize();
              const _svg = window.SVG.get(event.currentTarget.id);
              _svg.selectize().resize();
            }
            event.type !== 'touchstart' && event.stopPropagation();
          },
          false
        );

        this.observerDom();

        this.svgsData.push(this.currSvg[3]);
      }

      this.isMouseDown = true;
    }
    window.dispatchEvent(
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

    window.dispatchEvent(new CustomEvent('onWrapDrag', { detail }));
  }

  private onTouchMove(event: MouseEvent | TouchEvent) {
    const offset = this.getEventOffset(event, {
      pcEvent: 'mousemove',
      mobileEvent: 'touchmove'
    });
    if (!offset) return;
    const { x, y } = offset;
    this.sendLinesLocation(x, y);
    const detail = this.getDetails(event, x, y);

    if (this.isMouseDown) {
      this.onDrag(event, x, y);
    } else {
      window.dispatchEvent(new CustomEvent('onWrapMouseMove', { detail }));
    }
  }

  private onTouchEnd(event: MouseEvent | TouchEvent) {
    const offset = this.getEventOffset(event, {
      pcEvent: 'mouseup',
      mobileEvent: 'touchend'
    });
    if (!offset) return;
    const { x, y } = offset;
    const detail = this.getDetails(event, x, y);
    const currDraw = Draws[this.currDrawType];

    if (currDraw?.onMouseUp && this.currSvg) {
      currDraw.onMouseUp(detail, this.currSvg);
    }

    window.dispatchEvent(
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

  private getEventOffset(
    event: MouseEvent | TouchEvent,
    options: {
      mobileEvent: string;
      pcEvent: string;
      mobileCall?: (x: number, y: number) => void;
      pcCall?: (x: number, y: number) => void;
    }
  ) {
    let x: number, y: number;
    if (!isMobile() && event.type === options.pcEvent) {
      x = (event as MouseEvent).offsetX;
      y = (event as MouseEvent).offsetY;
      options.pcCall?.(x, y);
      return { x, y };
    } else if (isMobile() && event.type === options.mobileEvent) {
      const vertex = getVertexPosition(this.$svgWrap);
      const touch = (event as TouchEvent).changedTouches[0];
      x = touch.pageX - vertex.left;
      y = touch.pageY - vertex.top;
      options.mobileCall?.(x, y);
      return { x, y };
    } else {
      // touch start
      return false;
    }
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

  private sendLinesLocation(x: number, y: number) {
    window.dispatchEvent(
      new CustomEvent('onWrapUpdateVars', {
        detail: {
          '--location-x': x + 'px',
          '--location-y': y + 'px'
        }
      })
    );
  }

  addSvgDom(svgData: TSvgData) {
    const draw = Draws[svgData.child.type];
    if (draw) {
      const currSvgData = draw.onCreate(svgData, this.$svgContainer);
      this.svgsData.push(currSvgData[3]);
    }
  }

  /**
   *
   * @param svg string: querySelector([string])
   * @returns
   */
  deleteSvgDom(svg: string | HTMLElement) {
    if (!svg) return;
    let _svg: Svg;
    if (typeof svg === 'string') {
      if (svg.startsWith('#')) {
        const $svg = document.querySelector(svg);
        _svg = window.SVG.get($svg.id);
      } else {
        _svg = window.SVG.get(svg);
      }
    } else {
      _svg = window.SVG.get(svg.id);
    }

    window.dispatchEvent(
      new CustomEvent('svgjs-del', {
        detail: {
          $svgEl: _svg
        }
      })
    );
  }

  private observerDom() {
    const throCall = throttle((mutations: MutationCallback) => {
      const target = mutations[0].target as HTMLElement;
      const _svgData = this.svgsData.find(({ svg }) => (svg.node as any) === target);
      const { x: svgX, y: svgY } = getNodeProps(_svgData.svg.node as unknown as HTMLElement);
      const {
        x: childX,
        y: childY,
        width,
        height
      } = getNodeProps(_svgData.child.svg.node as unknown as HTMLElement);
      _svgData.x = svgX;
      _svgData.y = svgY;
      _svgData.child.x = childX;
      _svgData.child.y = childY;
      _svgData.child.width = width;
      _svgData.child.height = height;
      window.dispatchEvent(
        new CustomEvent('onUpdateSvgData', {
          detail: { svgsData: this.svgsData }
        })
      );
      console.log(_svgData);
    }, 1000);

    const observer = new window.MutationObserver(throCall);

    observer.observe(this.currSvg[0].node, {
      childList: true,
      attributes: true
    });
  }
}
