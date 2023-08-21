import { TCocoJson, TCOCOSegmentation } from '../../types/coco';
import { TSvgData } from '../../types/svg';
import { calcArea } from '../../utils/utils';

type TImgData = {
  src: string,
  width: number;
  height: number;
}

export function toCOCOJSON(imgs: TImgData[], datas: TSvgData[][]): TCocoJson {
  const annotations = [];
  const categories = [];
  const images = [];

  let i = 1;
  for (const data of datas) {
    const img = imgs[i];
    images.push({
      file_name: img?.src || '',
      height: img?.height || 0,
      width: img?.width || 0,
      id: i
    });

    categories.push({
      id: i,
      name: 'uncategorized',
      supercategory: 'none'
    });
    let _i = 1;
    for (const item of data) {
      if (!item) break;
      const { x, y, width, height } = item.child;
      const x1 = item.x + x;
      const y1 = item.y + y;
      const segmentation = [x1, y1, x1 + width, y1, x1 + width, y1 + height, x1, y1 + height];
      annotations.push({
        segmentation: [segmentation],
        area: calcArea(segmentation as TCOCOSegmentation),
        iscrowd: 0,
        image_id: i,
        bbox: [x1, y1, width, height],
        category_id: i,
        id: _i,
        ignore: 0
      });
      _i += 1;
    }
    i += 1;
  }

  return {
    annotations,
    categories,
    images,
    type: 'instances'
  };
}

export function toFile(jsonData: Record<any, any>): File {
  const file = new File([JSON.stringify(jsonData)], '.json', {
    type: 'application/json',
    lastModified: Date.now()
  });
  return file;
}
