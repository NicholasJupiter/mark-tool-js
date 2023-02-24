import { loadImage } from '../../utils/utils';

export class ImgWrap {
  width: string;
  height: string;
  src: string;
  $imgWrap: HTMLDivElement;
  $img: HTMLImageElement;

  constructor(_$imgWrap: HTMLDivElement, src: string) {
    this.initImgWrap(_$imgWrap, src);
  }

  initImgWrap(_$imgWrap: HTMLDivElement, src: string) {
    this.$imgWrap = _$imgWrap;
    this.src = src;
    this.updateSrc(this.src);
  }

  updateSrc(src: string) {
    if (!src) return;
    loadImage(src).then(($img) => {
      $img.setAttribute('draggable', 'false');
      $img.classList.add('work-img');
      this.$img = $img;

      if (this.$imgWrap.querySelector('.work-img')) {
        this.$imgWrap.querySelector('.work-img').remove();
      }

      this.$imgWrap.appendChild(this.$img);
      window.dispatchEvent(
        new CustomEvent('onWrapUpdateVars', {
          detail: {
            '--img-height': $img.height + 'px',
            '--img-width': $img.width + 'px'
          }
        })
      );
    });
  }
}
