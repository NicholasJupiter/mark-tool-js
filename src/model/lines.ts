export class LinesWrap {
  $linesWrap: HTMLDivElement;
  x: number;
  y: number;

  constructor(_$linesWrap: HTMLDivElement) {
    this.init(_$linesWrap);
  }

  init(_$linesWrap: HTMLDivElement) {
    this.$linesWrap = _$linesWrap;
  }

  setOffset(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.updateTools();
  }

  updateTools() {
    const tooltip = this.$linesWrap.querySelector('.tooltip-span');
    tooltip.innerHTML = `X: ${this.x}<br />Y: ${this.y}`;
  }
}
