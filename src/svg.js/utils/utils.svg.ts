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
type TProps = 'x' | 'y' | 'width' | 'height';
const _props = ['x', 'y', 'width', 'height'];


export function getNodeProps(node: HTMLElement) {
  const ret: { [T in TProps]: number } = {
    height: 0,
    width: 0,
    x: 0,
    y: 0
  };
  for (const prop of _props) {
    ret[prop as TProps] = Number(node ? node.getAttribute(prop) : 0);
  }

  return ret;
}
