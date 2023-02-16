import { TDrawType, TDrawValue } from "../types/svg";
import rect from "./rect";

export const Draws: {
  [K in TDrawType]: TDrawValue;
} = {
  rect,
  circle: {},
  polygon: {}
};
