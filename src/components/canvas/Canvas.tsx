import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { addObject, updateObject, selectObject, removeObject } from '../../store/canvasSlice';
import { CanvasObject } from '../../types/canvas';
import 'fabric';
declare const fabric: any;

interface CanvasProps {
  width: number;
  height: number;
  zoom: number;
  canvasRef?: React.MutableRefObject<fabric.Canvas | null>;
}

const Canvas: React.FC<CanvasProps> = ({ width, height, zoom, canvasRef }) => {
  const canvasRefLocal = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any | null>(null);
  const dispatch = useDispatch();
  
  const { tool, selectedObject, objects } = useSelector((state: RootState) => state.canvas);

  // 初始化 FabricJS 画布
  useEffect(() => {
    if (canvasRefLocal.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRefLocal.current, {
        width,
        height,
        backgroundColor: '#1e1e1e',
        selection: true,
        preserveObjectStacking: true,
        allowTouchScrolling: true,
      });

      const canvas = fabricCanvasRef.current;

      // 创建网格背景
      const smallGridSize = 10;
      const mediumGridSize = 50;
      const largeGridSize = 100;
      
      const smallGridColor = 'rgba(255, 255, 255, 0.03)';
      const mediumGridColor = 'rgba(255, 255, 255, 0.07)';
      const largeGridColor = 'rgba(255, 255, 255, 0.12)';

      // 创建小网格
      for (let i = 0; i < width / smallGridSize; i++) {
        canvas.add(new fabric.Line([i * smallGridSize, 0, i * smallGridSize, height], {
          stroke: smallGridColor,
          strokeWidth: 0.5,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        }));
      }
      
      for (let i = 0; i < height / smallGridSize; i++) {
        canvas.add(new fabric.Line([0, i * smallGridSize, width, i * smallGridSize], {
          stroke: smallGridColor,
          strokeWidth: 0.5,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        }));
      }

      // 创建中等网格
      for (let i = 0; i < width / mediumGridSize; i++) {
        canvas.add(new fabric.Line([i * mediumGridSize, 0, i * mediumGridSize, height], {
          stroke: mediumGridColor,
          strokeWidth: 0.7,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        }));
      }
      
      for (let i = 0; i < height / mediumGridSize; i++) {
        canvas.add(new fabric.Line([0, i * mediumGridSize, width, i * mediumGridSize], {
          stroke: mediumGridColor,
          strokeWidth: 0.7,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        }));
      }

      // 创建大网格
      for (let i = 0; i < width / largeGridSize; i++) {
        canvas.add(new fabric.Line([i * largeGridSize, 0, i * largeGridSize, height], {
          stroke: largeGridColor,
          strokeWidth: 1,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        }));
      }
      
      for (let i = 0; i < height / largeGridSize; i++) {
        canvas.add(new fabric.Line([0, i * largeGridSize, width, i * largeGridSize], {
          stroke: largeGridColor,
          strokeWidth: 1,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        }));
      }

      // 创建中心参考线
      const centerX = width / 2;
      const centerY = height / 2;

      // 垂直中心线
      canvas.add(new fabric.Line([centerX, 0, centerX, height], {
        stroke: 'rgba(0, 162, 255, 0.5)',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
      }));

      // 水平中心线
      canvas.add(new fabric.Line([0, centerY, width, centerY], {
        stroke: 'rgba(0, 162, 255, 0.5)',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        excludeFromExport: true,
      }));

      // 将所有网格线移到最底层
      canvas.getObjects().forEach(obj => {
        if (obj.type === 'line') {
          canvas.sendToBack(obj);
        }
      });

      if (canvasRef) {
        canvasRef.current = canvas;
      }

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

      // 添加鼠标滚轮缩放
      canvas.on('mouse:wheel', function(opt) {
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        
        // 获取鼠标位置
        const pointer = canvas.getPointer(opt.e);
        const point = new fabric.Point(pointer.x, pointer.y);
        
        // 以鼠标位置为中心进行缩放
        canvas.zoomToPoint(point, zoom);
        
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      // 添加画布拖动功能
      let isDragging = false;
      let lastPosX: number;
      let lastPosY: number;

      canvas.on('mouse:down', function(opt) {
        // 只有在按住空格键或中键时才能拖动画布
        if (opt.e.button === 1 || opt.e.spaceKey) {
          isDragging = true;
          lastPosX = opt.e.clientX;
          lastPosY = opt.e.clientY;
          canvas.selection = false;
          canvas.defaultCursor = 'grabbing';
        }
      });

      canvas.on('mouse:move', function(opt) {
        if (isDragging) {
          const e = opt.e;
          const vpt = canvas.viewportTransform;
          if (!vpt) return;
          
          vpt[4] += e.clientX - lastPosX;
          vpt[5] += e.clientY - lastPosY;
          
          lastPosX = e.clientX;
          lastPosY = e.clientY;
          
          canvas.requestRenderAll();
        }
      });

      canvas.on('mouse:up', function() {
        isDragging = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
      });

      // 添加键盘事件监听
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
          canvas.defaultCursor = 'grab';
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
          canvas.defaultCursor = 'default';
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
        }
      };
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [dispatch, width, height, canvasRef]);

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
          canvas.defaultCursor = 'default';
          break;

        case 'pen':
          canvas.isDrawingMode = true;
          canvas.selection = false;
          canvas.freeDrawingBrush.width = 2;
          canvas.freeDrawingBrush.color = '#000000';
          canvas.defaultCursor = 'crosshair';

          canvas.on('path:created', (e: any) => {
            const path = e.path;
            const pathData = path.path; // 保存路径数据
            const newObject: CanvasObject = {
              id: Date.now().toString(),
              type: 'path',
              left: path.left || 0,
              top: path.top || 0,
              width: path.width || 0,
              height: path.height || 0,
              fill: 'transparent',
              stroke: path.stroke,
              strokeWidth: path.strokeWidth,
              angle: path.angle || 0,
              scaleX: path.scaleX || 1,
              scaleY: path.scaleY || 1,
              opacity: path.opacity || 1,
              path: pathData, // 添加路径数据
            };
            dispatch(addObject(newObject));
          });
          break;

        case 'rectangle':
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.defaultCursor = 'crosshair';
          let rectStartPoint: { x: number; y: number } | null = null;
          let rect: any = null;

          canvas.on('mouse:down', (o: any) => {
            const pointer = canvas.getPointer(o.e);
            rectStartPoint = { x: pointer.x, y: pointer.y };
            rect = new fabric.Rect({
              left: rectStartPoint.x,
              top: rectStartPoint.y,
              width: 0,
              height: 0,
              fill: 'transparent',
              stroke: '#000000',
              strokeWidth: 1,
            });
            canvas.add(rect);
          });

          canvas.on('mouse:move', (o: any) => {
            if (!rectStartPoint || !rect) return;
            const pointer = canvas.getPointer(o.e);
            const width = pointer.x - rectStartPoint.x;
            const height = pointer.y - rectStartPoint.y;
            rect.set({
              width: Math.abs(width),
              height: Math.abs(height),
              left: width > 0 ? rectStartPoint.x : pointer.x,
              top: height > 0 ? rectStartPoint.y : pointer.y,
            });
            canvas.renderAll();
          });

          canvas.on('mouse:up', () => {
            rectStartPoint = null;
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

        case 'circle':
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.defaultCursor = 'crosshair';
          let circleStartPoint: { x: number; y: number } | null = null;
          let circle: any = null;

          canvas.on('mouse:down', (o: any) => {
            const pointer = canvas.getPointer(o.e);
            circleStartPoint = { x: pointer.x, y: pointer.y };
            circle = new fabric.Circle({
              left: circleStartPoint.x,
              top: circleStartPoint.y,
              radius: 0,
              fill: 'transparent',
              stroke: '#000000',
              strokeWidth: 1,
            });
            canvas.add(circle);
          });

          canvas.on('mouse:move', (o: any) => {
            if (!circleStartPoint || !circle) return;
            const pointer = canvas.getPointer(o.e);
            const radius = Math.sqrt(
              Math.pow(pointer.x - circleStartPoint.x, 2) +
              Math.pow(pointer.y - circleStartPoint.y, 2)
            ) / 2;
            const center = {
              x: (pointer.x + circleStartPoint.x) / 2,
              y: (pointer.y + circleStartPoint.y) / 2,
            };
            circle.set({
              radius: radius,
              left: center.x - radius,
              top: center.y - radius,
            });
            canvas.renderAll();
          });

          canvas.on('mouse:up', () => {
            circleStartPoint = null;
            if (circle) {
              circle.setCoords();
              const newObject: CanvasObject = {
                id: Date.now().toString(),
                type: 'circle',
                left: circle.left || 0,
                top: circle.top || 0,
                width: circle.width || 0,
                height: circle.height || 0,
                fill: circle.fill as string,
                stroke: circle.stroke as string,
                strokeWidth: circle.strokeWidth || 1,
                angle: circle.angle || 0,
                scaleX: circle.scaleX || 1,
                scaleY: circle.scaleY || 1,
                opacity: circle.opacity || 1,
              };
              dispatch(addObject(newObject));
            }
          });
          break;

        case 'line':
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.defaultCursor = 'crosshair';
          let lineStartPoint: { x: number; y: number } | null = null;
          let line: any = null;

          canvas.on('mouse:down', (o: any) => {
            const pointer = canvas.getPointer(o.e);
            lineStartPoint = { x: pointer.x, y: pointer.y };
            line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
              stroke: '#000000',
              strokeWidth: 2,
              selectable: true,
              evented: true,
              originX: 'center',
              originY: 'center',
            });
            canvas.add(line);
          });

          canvas.on('mouse:move', (o: any) => {
            if (!lineStartPoint || !line) return;
            const pointer = canvas.getPointer(o.e);
            
            // 计算角度
            const dx = pointer.x - lineStartPoint.x;
            const dy = pointer.y - lineStartPoint.y;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            
            // 计算长度
            const length = Math.sqrt(dx * dx + dy * dy);
            
            // 更新线条
            line.set({
              x1: lineStartPoint.x,
              y1: lineStartPoint.y,
              x2: pointer.x,
              y2: pointer.y,
              angle: 0, // 保持角度为0，因为我们使用实际的端点
            });
            canvas.renderAll();
          });

          canvas.on('mouse:up', () => {
            if (!lineStartPoint || !line) return;
            
            // 获取最终位置和尺寸
            const x1 = line.x1;
            const y1 = line.y1;
            const x2 = line.x2;
            const y2 = line.y2;
            
            // 计算中心点
            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;
            
            // 计算宽度和高度
            const width = Math.abs(x2 - x1);
            const height = Math.abs(y2 - y1);
            
            // 创建新的线条对象
            const newLine = new fabric.Line(
              [x1, y1, x2, y2],
              {
                stroke: '#000000',
                strokeWidth: 2,
                selectable: true,
                evented: true,
                originX: 'center',
                originY: 'center',
                left: centerX,
                top: centerY,
              }
            );
            
            canvas.remove(line);
            canvas.add(newLine);
            canvas.renderAll();

            const newObject: CanvasObject = {
              id: Date.now().toString(),
              type: 'line',
              left: centerX,
              top: centerY,
              width: width,
              height: height,
              fill: 'transparent',
              stroke: newLine.stroke as string,
              strokeWidth: newLine.strokeWidth || 1,
              angle: newLine.angle || 0,
              scaleX: newLine.scaleX || 1,
              scaleY: newLine.scaleY || 1,
              opacity: newLine.opacity || 1,
              x1: x1,
              y1: y1,
              x2: x2,
              y2: y2,
            };
            dispatch(addObject(newObject));
            lineStartPoint = null;
            line = null;
          });
          break;

        case 'text':
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.defaultCursor = 'text';

          // 创建一个函数来处理文本的创建和编辑
          const createAndEditText = (pointer: { x: number; y: number }) => {
            // 创建新文本
            const text = new fabric.IText('点击编辑文本', {
              left: pointer.x,
              top: pointer.y,
              fontSize: 20,
              fill: '#000000',
              selectable: true,
              evented: true,
              editable: true,
            });

            // 添加到画布
            canvas.add(text);
            
            // 使用setTimeout确保DOM更新后再进入编辑模式
            setTimeout(() => {
              canvas.setActiveObject(text);
              text.enterEditing();
              text.selectAll();
              canvas.requestRenderAll();
            }, 0);

            // 监听文本修改完成事件
            text.on('editing:exited', () => {
              if (text.text.trim() === '') {
                canvas.remove(text);
                canvas.requestRenderAll();
                return;
              }
              const newObject: CanvasObject = {
                id: Date.now().toString(),
                type: 'text',
                left: text.left || 0,
                top: text.top || 0,
                width: text.width || 0,
                height: text.height || 0,
                fill: text.fill as string,
                stroke: text.stroke as string,
                strokeWidth: text.strokeWidth || 0,
                angle: text.angle || 0,
                scaleX: text.scaleX || 1,
                scaleY: text.scaleY || 1,
                opacity: text.opacity || 1,
                text: text.text,
              };
              dispatch(addObject(newObject));
            });
          };

          canvas.on('mouse:down', (o: any) => {
            // 如果点击了已存在的文本对象，不创建新文本
            if (o.target && o.target.type === 'i-text') {
              return;
            }

            // 检查是否有正在编辑的文本
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'i-text' && activeObject.isEditing) {
              activeObject.exitEditing();
              canvas.requestRenderAll();
              return;
            }

            // 移除所有现有的选择
            canvas.discardActiveObject();
            canvas.requestRenderAll();

            // 创建新文本
            const pointer = canvas.getPointer(o.e);
            createAndEditText(pointer);
          });

          // 添加双击事件处理
          canvas.on('mouse:dblclick', (o: any) => {
            if (o.target && o.target.type === 'i-text') {
              // 如果有其他正在编辑的文本，先退出编辑
              const activeObject = canvas.getActiveObject();
              if (activeObject && activeObject !== o.target && activeObject.type === 'i-text' && activeObject.isEditing) {
                activeObject.exitEditing();
                canvas.requestRenderAll();
              }

              // 使用setTimeout确保DOM更新后再进入编辑模式
              setTimeout(() => {
                canvas.setActiveObject(o.target);
                o.target.enterEditing();
                o.target.selectAll();
                canvas.requestRenderAll();
              }, 0);
            }
          });
          break;

        case 'eraser':
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.defaultCursor = 'not-allowed';

          canvas.on('mouse:down', (o: any) => {
            if (!o.target) return;
            const objectToRemove = o.target;
            const objectId = objectToRemove.data?.id;
            if (objectId) {
              canvas.remove(objectToRemove);
              canvas.renderAll();
              dispatch(removeObject(objectId));
            }
          });
          break;

        default:
          canvas.isDrawingMode = false;
          canvas.selection = true;
          canvas.defaultCursor = 'default';
      }
    }
  }, [tool, dispatch]);

  // 监听缩放变化
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const center = canvas.getCenter();
      canvas.setZoom(zoom);
      canvas.absolutePan({
        x: (canvas.getWidth() / 2 - center.left * zoom),
        y: (canvas.getHeight() / 2 - center.top * zoom)
      });
      canvas.requestRenderAll();
    }
  }, [zoom]);

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

          case 'line':
            fabricObj = new fabric.Line(
              [obj.x1, obj.y1, obj.x2, obj.y2],
              {
                stroke: obj.stroke,
                strokeWidth: obj.strokeWidth,
                angle: obj.angle,
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
                opacity: obj.opacity,
                selectable: true,
                evented: true,
                originX: 'center',
                originY: 'center',
                left: obj.left,
                top: obj.top,
              }
            );
            break;

          case 'text':
            fabricObj = new fabric.IText(obj.text || '点击编辑文本', {
              left: obj.left,
              top: obj.top,
              fontSize: 20,
              fill: obj.fill,
              angle: obj.angle,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              opacity: obj.opacity,
              selectable: true,
              evented: true,
              editable: true,
            });

            // 为恢复的文本对象添加编辑完成事件监听
            fabricObj.on('editing:exited', () => {
              if (fabricObj.text.trim() === '') {
                canvas.remove(fabricObj);
                dispatch(removeObject(obj.id));
                return;
              }
              dispatch(updateObject({
                id: obj.id,
                changes: {
                  text: fabricObj.text,
                  left: fabricObj.left,
                  top: fabricObj.top,
                  width: fabricObj.width,
                  height: fabricObj.height,
                  angle: fabricObj.angle,
                  scaleX: fabricObj.scaleX,
                  scaleY: fabricObj.scaleY,
                }
              }));
            });
            break;

          case 'path':
            fabricObj = new fabric.Path(obj.path, {
              left: obj.left,
              top: obj.top,
              fill: obj.fill,
              stroke: obj.stroke,
              strokeWidth: obj.strokeWidth,
              angle: obj.angle,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              opacity: obj.opacity,
              selectable: true,
              evented: true,
            });
            break;
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
    <div style={{
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      margin: '20px',
      backgroundColor: '#1e1e1e',
    }}>
      <canvas ref={canvasRefLocal} width={width} height={height} />
    </div>
  );
};

export default Canvas;
