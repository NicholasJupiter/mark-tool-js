export function findParentBySvg(dom: HTMLElement): HTMLElement {
  if (!dom) return;
  const id = dom.id || '';
  const tagName = dom.localName.toLowerCase();
  const isSvgJsDom = id.startsWith('Svgjs');
  if (!isSvgJsDom && tagName === 'svg') return null;
  // localName
  if (isSvgJsDom && tagName === 'svg') {
    return dom;
  }
  return findParentBySvg(dom.parentElement);
}
type TProps = 'x' | 'y' | 'width' | 'height' | 'transform';
const _props = ['x', 'y', 'width', 'height', 'transform'];

export function getNodeProps(node: HTMLElement | SVGSVGElement) {
  const ret: { [T in TProps]: any } = {
    height: 0,
    width: 0,
    x: 0,
    y: 0,
    transform: ''
  };
  for (const prop of _props) {
    const num = Number(node ? node.getAttribute(prop) : 0);
    ret[prop as TProps] = isNaN(num) ? node.getAttribute(prop) : num;
  }

  return ret;
}

export function throttle<T>(func: (...args: any[]) => T, delay: number = 1000) {
  let timeoutId: NodeJS.Timeout;
  return function (...args: any[]) {
    const context = this;
    if (timeoutId) return;
    const execute = () => {
      func.apply(context, args);
      timeoutId = null;
    };
    clearTimeout(timeoutId);
    timeoutId = setTimeout(execute, delay);
  };
}

export function findSvgChild(svg: HTMLElement | SVGSVGElement) {
  return svg.querySelector('[class^=svgjs-]') as HTMLElement;
}
