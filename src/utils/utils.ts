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
