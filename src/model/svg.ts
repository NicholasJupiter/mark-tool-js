import type { Svg } from '@svgdotjs/svg.js';
import { TCustomDragDetail, TDrawReturn, TDrawType, TSVGChlid, TSvgData } from '../types/svg';
import { Draws } from '../draws/index';
import { findParentBySvg, findSvgChild, getNodeProps, throttle } from '../svg.js/utils/utils.svg';
import { getVertexPosition, isMobile, isMove, ObjectForeach } from '../utils/utils';
export class SVGWrap {
  $svgWrap: HTMLDivElement;
  $svgContainer: Svg;
  mouseDownClient?: { offsetX: number; offsetY: number } = null;
  currDrawType: TDrawType;
  isMouseDown = false;
  currSvg: TDrawReturn = null;
  currClickSvg: Svg;
  svgsData: TSvgData[] = [];
  isPreview = false;
  childMaxLen = 1; // -1无限

  constructor(_$svgWrap: HTMLDivElement) {
    this.initSvgWrap(_$svgWrap);
    this.$svgContainer = window.SVG(this.$svgWrap);

    this.$svgContainer.on('click', (event) => {
      // 判断是为了避免拖动问题
      if (!(event.target as HTMLElement).classList.contains('svg_select_points')) {
        this.sendCustomEvent('onContainerClick', { event });
        this.removeSelectize();
      }
    });

    window.addEventListener('svgjs-del', (data: any) => {
      const del = (svgId: string) => {
        const index = this.svgsData.findIndex((svg) => svg.svgId === svgId);
        this.svgsData.splice(index, 1);
        window.SVG.get(svgId).remove();
      };
      const { svgIds, mode } = data.detail;
      if (Array.isArray(svgIds)) {
        for (const id of svgIds) {
          del(id);
        }
      }
      this.sendCustomEvent('onUpdateSvgData', { svgsData: this.getCloneSvgsData(), mode });
    });
  }

  removeSelectize(fn?: (child: Svg, contentEl?: Svg) => void) {
    for (const svg of this.$svgContainer.node.children) {
      const contentEl = findSvgChild(svg as HTMLElement);
      if (contentEl) {
        window.SVG.get(contentEl.id).selectize(false);
      }
      fn && fn(window.SVG.get(svg.id), contentEl && window.SVG.get(contentEl.id));
    }
    this.sendCustomEvent('onCancelSelectSvg');
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
    this.sendCustomEvent('onWrapClick', { event, svgId: svg.id });
  }

  private _onCreate(svgData: TSvgData): TDrawReturn | null {
    const currDraw = Draws[svgData.child.type];
    if (currDraw?.onCreate) {
      const svgResult = currDraw.onCreate(svgData, this.$svgContainer);
      if (!this.isPreview) {
        svgResult[0].draggable();
      }
      svgResult[1].on(
        'click,touchstart',
        (event: any) => {
          if (!this.isPreview) {
            this.removeSelectize();
            const _svg = window.SVG.get(event.currentTarget.id);
            _svg
              .selectize({
                pointSize: 14
              })
              .resize();
            this.sendCustomEvent('onSelectSvg', { svgId: event.currentTarget.parentElement.id });
          }
          event.type !== 'touchstart' && event.stopPropagation();
        },
        false
      );

      this.observerDom(svgResult);

      this.svgsData.push(svgResult[3]);
      this.sendCustomEvent('onUpdateSvgData', { svgsData: this.getCloneSvgsData(), mode: 'push' });
      return svgResult;
    }
  }

  private _onDrag(event: MouseEvent | TouchEvent, x: number, y: number) {
    const detail = this.getDetails(event, x, y);

    const currDraw = Draws[this.currDrawType];
    if (currDraw?.onDrag && this.currSvg) {
      currDraw.onDrag(detail, this.currSvg);
    }
    this.sendCustomEvent('onWrapDrag', detail);
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

    if (
      (event.target as HTMLElement).parentElement === event.currentTarget &&
      !this.isPreview &&
      !this.getWhetherLenOver()
    ) {
      this.mouseDownClient = {
        offsetX: x,
        offsetY: y
      };
      const svgData = {
        x: 0,
        y: 0,
        props: { label: '' },
        child: {
          x: this.mouseDownClient.offsetX,
          y: this.mouseDownClient.offsetY,
          type: this.currDrawType,
          width: 1,
          height: 1
        }
      };

      const svgResult = this._onCreate(svgData);
      if (svgResult) {
        this.currSvg = svgResult;
      }

      this.isMouseDown = true;
    }
    this.sendCustomEvent('onWrapMouseDown', { event });
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
      this._onDrag(event, x, y);
    } else {
      this.sendCustomEvent('onWrapMouseMove', detail);
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

    if (currDraw?.onMouseUp && this.currSvg && this.mouseDownClient) {
      if (!isMove(this.mouseDownClient, { offsetX: x, offsetY: y })) {
        this.removeSelectize();
      }
      currDraw.onMouseUp(detail, this.currSvg);
      const svgData = this.svgsData.find(({ svgId }) => svgId === this.currSvg[0].id());
      if (svgData) {
        const prop = getNodeProps(findSvgChild(window.SVG.get(svgData!.svgId).node));
        ObjectForeach(prop, (value, key) => {
          svgData.child[key] = value;
        });
      }
      this.sendCustomEvent('onUpdateSvgData', {
        svgsData: this.getCloneSvgsData(),
        mode: 'touchEnd'
      });
      this.currSvg = null;
    }
    this.sendCustomEvent('onWrapMouseUp', detail);

    this.isMouseDown = false;
    this.mouseDownClient = null;
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

  private sendLinesLocation(x: number, y: number) {
    this.sendCustomEvent('onWrapUpdateVars', {
      '--location-x': x + 'px',
      '--location-y': y + 'px'
    });
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

  getWhetherLenOver() {
    if (this.childMaxLen === -1) return false;
    return this.childMaxLen <= this.svgsData.length;
  }

  addSvgDom(svgData: TSvgData) {
    if (!this.getWhetherLenOver()) {
      this._onCreate(svgData);
    }
  }

  /**
   *
   * @param id string: querySelector([string]) | dom
   * @returns
   */
  deleteSvgDom(id: string | HTMLElement) {
    if (!id) return;
    let svgId: string = id as string;
    if (typeof id === 'string') {
      if (id.startsWith('#')) {
        svgId = document.querySelector(id)?.id;
      } else {
        svgId = id;
      }
    } else {
      svgId = (id as HTMLElement).id;
    }
    this.sendCustomEvent('svgjs-del', { svgIds: [svgId], mode: 'delete' });
  }

  deleteAllSvgDom(mode = 'deleteAll') {
    this.sendCustomEvent('svgjs-del', {
      svgIds: this.svgsData.map(({ svgId }) => svgId),
      mode
    });
  }

  sendCustomEvent(name: string, detail: Record<string, any> = {}) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  private observerDom(svgResult: TDrawReturn) {
    const throCall = throttle((mutations: MutationCallback) => {
      const target = mutations[0].target as HTMLElement;
      const svgData = this.svgsData.find(({ svgId }) => svgId === target.id);
      if (!svgData?.svgId) return;
      const $svg = window.SVG.get(svgData.svgId);
      const $svgChild = window.SVG.get(svgData.child.svgId);
      const { x: svgX, y: svgY } = getNodeProps($svg.node);
      const { x: childX, y: childY, width, height, transform } = getNodeProps($svgChild.node);
      svgData.x = svgX;
      svgData.y = svgY;
      svgData.child.x = childX;
      svgData.child.y = childY;
      svgData.child.width = width;
      svgData.child.height = height;
      svgData.child.transform = transform;
      this.sendCustomEvent('onUpdateSvgData', {
        svgsData: this.getCloneSvgsData(),
        mode: 'domUpdate'
      });
    }, 200);

    const observer = new window.MutationObserver(throCall);

    observer.observe(svgResult[0].node, {
      childList: true,
      attributes: true
    });
  }

  getCloneSvgsData() {
    return JSON.parse(JSON.stringify(this.svgsData));
  }
}
