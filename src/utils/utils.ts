import { TCOCOAnnotation, TCOCOSegmentation } from 'src/types/coco';

export function loadImage(imgSrc: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      res(img);
    };
    img.onerror = (err) => {
      console.log(err);

      rej({
        msg: 'Failed to load img.'
      });
    };
    img.src = imgSrc;
  });
}

export function guid() {
  return 'xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isMobile() {
  let flag = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  return flag;
}

export function getVertexPosition(el: HTMLElement) {
  let currentTarget = el;
  let top = 0;
  let left = 0;
  // while (currentTarget !== null) {
  top += currentTarget.getBoundingClientRect().top;
  left += currentTarget.getBoundingClientRect().left;
  //   currentTarget = currentTarget.parentElement;
  // }
  return { top, left };
}

export function pxToNumber(v: string) {
  return Number(Number(v.replace(/[^0-9]*$/, '')).toFixed(2));
}

export function ObjectForeach(
  obj: Record<any, any>,
  fn: (value: any, key: string, i: number) => void
) {
  const keys = Object.keys(obj);
  let i = 0;
  for (const key of keys) {
    fn && fn(obj[key], key, i);
  }
}

export function isMove(
  startOffset: { offsetX: number; offsetY: number },
  endOffset: { offsetX: number; offsetY: number }
) {
  return startOffset.offsetX !== endOffset.offsetX || startOffset.offsetY !== endOffset.offsetY;
}

export function calcArea(segmentation: TCOCOSegmentation) {
  let area = 0;
  let numCoords = segmentation.length;
  for (let i = 0; i < numCoords; i += 2) {
    const nexti = (i + 2) % numCoords; //make last+1 wrap around to zero
    area += segmentation[i] * segmentation[nexti + 1] - segmentation[i + 1] * segmentation[nexti];
  }
  return Math.abs(area / 2);
}
