export type TCOCOSegmentation = [number, number, number, number, number, number, number, number]

export type TCOCOAnnotation = {
  segmentation: [TCOCOSegmentation];
  iscrowd: number;
  image_id: number;
  ignore: number;
  id: number;
  category_id: number;
  bbox: [number, number, number, number];
  area: number;
};

export type TCOCOCategorie = {
  id: number;
  name: string;
  supercategory: 'none';
};

export type TCOCOImage = { file_name: string; height: number; width: number; id: number };

export type TCocoJson = Partial<{
  annotations: TCOCOAnnotation[];
  categories: TCOCOCategorie[];
  images: TCOCOImage[];
  type: 'instances';
}>;
