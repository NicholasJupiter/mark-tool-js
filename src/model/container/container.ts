import { pxToNumber } from '../../utils/utils';
import { TDrawType } from '../../types/svg';
import { ImgWrap } from '../img/imgWrap';
import { LinesWrap } from '../lines';
import { SVGWrap } from '../svg';

type TCssVar = {
  '--location-x': string;
  '--location-y': string;
  '--img-width': string;
  '--img-height': string;
  // '--lines-color': string;
};

export class Container {
  $container: HTMLDivElement;
  cssVars: TCssVar;
  $SvgWrap: SVGWrap;
  $ImgWrap: ImgWrap;
  $LinesWrap: LinesWrap;
  src: string;
  isVideo = false;
  currDrawType: TDrawType;

  constructor(_$container: HTMLDivElement, src: string) {
    this.cssVars = {
      '--location-x': '0px',
      '--location-y': '0px',
      '--img-width': '0px',
      '--img-height': '0px'
    };
    this.initContainer(_$container, src);
  }

  initContainer(_$container: HTMLDivElement, src: string, _cssVars?: Partial<TCssVar>) {
    this.$container = _$container;
    this.updateContainerVars(_cssVars);
    const $svgWrap = this.$container.querySelector('.work-container__svg-wrap') as HTMLDivElement;
    const $imgWrap = this.$container.querySelector(
      '.work-container__content-wrap'
    ) as HTMLDivElement;
    this.$SvgWrap = new SVGWrap($svgWrap);
    this.$ImgWrap = new ImgWrap($imgWrap, src);
    this.$LinesWrap = new LinesWrap($imgWrap.querySelector('.work-container__lines-wrap'));

    window.addEventListener('onWrapUpdateVars', (options) => {
      this.updateContainerVars((options as any).detail);
    });
  }

  updateContainerVars(_cssVars?: Partial<TCssVar>) {
    Object.assign(this.cssVars, _cssVars);
    Object.keys(this.cssVars).forEach((key) => {
      this.$container.style.setProperty(key, this.cssVars[key]);
    });
    this.$LinesWrap &&
      this.$LinesWrap.setOffset(
        pxToNumber(this.cssVars['--location-x']),
        pxToNumber(this.cssVars['--location-y'])
      );
  }

  startDraw(type: TDrawType) {
    this.$ImgWrap.$imgWrap.style.overflow = !type ? 'auto' : 'hidden';
    this.$SvgWrap.currDrawType = type;
  }

  endDraw() {
    this.$SvgWrap.currDrawType = null;
  }

  async switchImage(src: string) {
    await this.$ImgWrap.updateSrc(src);
    this.$SvgWrap.sendCustomEvent('onUpdateSvgData', {
      svgsData: this.$SvgWrap.svgsData,
      mode: 'switchImageBefore'
    });
    this.$SvgWrap.deleteAllSvgDom('switchImageAfter');
  }
}
