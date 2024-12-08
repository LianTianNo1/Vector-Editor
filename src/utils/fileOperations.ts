import { CanvasObject } from '../types/canvas';

interface FileData {
  version: string;
  objects: CanvasObject[];
}

export const saveToFile = async (objects: CanvasObject[]): Promise<void> => {
  const fileData: FileData = {
    version: '1.0.0',
    objects,
  };

  const blob = new Blob([JSON.stringify(fileData, null, 2)], { type: 'application/json' });
  const handle = await window.showSaveFilePicker({
    suggestedName: 'drawing.vec',
    types: [{
      description: 'Vector Drawing',
      accept: {
        'application/json': ['.vec'],
      },
    }],
  });

  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
};

export const openFile = async (): Promise<CanvasObject[]> => {
  const [handle] = await window.showOpenFilePicker({
    types: [{
      description: 'Vector Drawing',
      accept: {
        'application/json': ['.vec'],
      },
    }],
  });

  const file = await handle.getFile();
  const content = await file.text();
  const data: FileData = JSON.parse(content);

  // 版本检查和兼容性处理可以在这里添加
  return data.objects;
};

export const exportAsSVG = async (canvas: fabric.Canvas): Promise<void> => {
  const svg = canvas.toSVG();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const handle = await window.showSaveFilePicker({
    suggestedName: 'drawing.svg',
    types: [{
      description: 'SVG Image',
      accept: {
        'image/svg+xml': ['.svg'],
      },
    }],
  });

  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
};

export const createNew = (): CanvasObject[] => {
  return [];
};
