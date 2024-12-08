import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addObject, updateObject, selectObject } from '../../store/canvasSlice';
import { CanvasObject } from '../../types/canvas';
import 'fabric';
declare const fabric: any;

interface CanvasProps {
  width: number;
  height: number;
}

const Canvas: React.FC<CanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any | null>(null);
  const dispatch = useDispatch();
  
  const { tool, selectedObject, objects } = useSelector((state: RootState) => state.canvas);

  // 初始化 FabricJS 画布
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      // 确保只初始化一次
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
      });

      // 监听选择事件
      fabricCanvasRef.current.on('selection:created', (e: any) => {
        const selected = e.selected?.[0];
        if (selected) {
          dispatch(selectObject(selected.data?.id));
        }
      });

      fabricCanvasRef.current.on('selection:cleared', () => {
        dispatch(selectObject(null));
      });

      // 监听对象修改事件
      fabricCanvasRef.current.on('object:modified', (e: any) => {
        const obj = e.target;
        if (obj && obj.data) {
          const id = obj.data.id;
          const changes: Partial<CanvasObject> = {
            left: obj.left || 0,
            top: obj.top || 0,
            width: obj.getScaledWidth() || 0,
            height: obj.getScaledHeight() || 0,
            angle: obj.angle || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
          };
          dispatch(updateObject({ id, changes }));
        }
      });

      // 初始化时渲染一次
      fabricCanvasRef.current.renderAll();
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [dispatch, width, height]);

  // 处理工具切换
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      
      // 先清除所有事件监听
      canvas.off('mouse:down');
      canvas.off('mouse:move');
      canvas.off('mouse:up');
      
      switch (tool) {
        case 'select':
          canvas.isDrawingMode = false;
          canvas.selection = true;
          break;
        case 'pen':
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush.width = 2;
          canvas.freeDrawingBrush.color = '#000000';
          break;
        case 'rectangle':
          canvas.isDrawingMode = false;
          canvas.selection = false;
          let startPoint: { x: number; y: number } | null = null;
          let rect: any = null;

          canvas.on('mouse:down', (o: any) => {
            const pointer = canvas.getPointer(o.e);
            startPoint = { x: pointer.x, y: pointer.y };
            rect = new fabric.Rect({
              left: startPoint.x,
              top: startPoint.y,
              width: 0,
              height: 0,
              fill: 'transparent',
              stroke: '#000000',
              strokeWidth: 1,
            });
            canvas.add(rect);
          });

          canvas.on('mouse:move', (o: any) => {
            if (!startPoint || !rect) return;
            const pointer = canvas.getPointer(o.e);
            const width = pointer.x - startPoint.x;
            const height = pointer.y - startPoint.y;
            rect.set({
              width: Math.abs(width),
              height: Math.abs(height),
              left: width > 0 ? startPoint.x : pointer.x,
              top: height > 0 ? startPoint.y : pointer.y,
            });
            canvas.renderAll();
          });

          canvas.on('mouse:up', () => {
            startPoint = null;
            if (rect) {
              rect.setCoords();
              const newObject: CanvasObject = {
                id: Date.now().toString(),
                type: 'rectangle',
                left: rect.left || 0,
                top: rect.top || 0,
                width: rect.width || 0,
                height: rect.height || 0,
                fill: rect.fill as string,
                stroke: rect.stroke as string,
                strokeWidth: rect.strokeWidth || 1,
                angle: rect.angle || 0,
                scaleX: rect.scaleX || 1,
                scaleY: rect.scaleY || 1,
                opacity: rect.opacity || 1,
              };
              dispatch(addObject(newObject));
            }
          });
          break;
        default:
          canvas.isDrawingMode = false;
          canvas.selection = true;
      }
    }
  }, [tool, dispatch]);

  // 同步对象状态
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      canvas.clear();
      
      objects.forEach((obj) => {
        let fabricObj;
        
        switch (obj.type) {
          case 'rectangle':
            fabricObj = new fabric.Rect({
              left: obj.left,
              top: obj.top,
              width: obj.width,
              height: obj.height,
              fill: obj.fill,
              stroke: obj.stroke,
              strokeWidth: obj.strokeWidth,
              angle: obj.angle,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              opacity: obj.opacity,
            });
            break;
          case 'circle':
            fabricObj = new fabric.Circle({
              left: obj.left,
              top: obj.top,
              radius: obj.width / 2,
              fill: obj.fill,
              stroke: obj.stroke,
              strokeWidth: obj.strokeWidth,
              angle: obj.angle,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              opacity: obj.opacity,
            });
            break;
          // 添加更多类型的处理...
        }

        if (fabricObj) {
          fabricObj.data = { id: obj.id };
          canvas.add(fabricObj);
        }
      });

      canvas.renderAll();
    }
  }, [objects]);

  return (
    <div className="canvas-container" style={{ 
      border: '1px solid #ccc',
      margin: '20px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Canvas;
