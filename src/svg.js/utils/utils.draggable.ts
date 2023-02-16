export const limitDragBox = (e) => {
  const { handler, box } = e.detail;
  e.preventDefault();

  let { x, y } = box;

  // // In case your dragged element is a nested element,
  // // you are better off using the rbox() instead of bbox()

  // if (x < constraints.x) {
  //   x = constraints.x;
  // }

  // if (y < constraints.y) {
  //   y = constraints.y;
  // }

  // if (box.x2 > constraints.x2) {
  //   x = constraints.x2 - box.w;
  // }

  // if (box.y2 > constraints.y2) {
  //   y = constraints.y2 - box.h;
  // }

  handler.move(x, y);
};
