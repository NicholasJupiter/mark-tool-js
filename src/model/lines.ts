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
    tooltip.innerHTML = `<span>X: ${this.x}</span><br /><span>Y: ${this.y}</span>`;
  }
}
