
import { Container } from '../src/index';

const $container = document.getElementById('work-container');
const testImg = require('./assets/img.jpeg');
const container = new Container($container, testImg.default);

container.startDraw('rect');