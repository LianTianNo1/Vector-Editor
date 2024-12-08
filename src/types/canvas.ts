/**
 * 画布工具类型定义
 */
export type ToolType = 
  | 'select'    // 选择工具
  | 'rectangle' // 矩形
  | 'circle'    // 圆形
  | 'line'      // 线条
  | 'text'      // 文本
  | 'pen'       // 自由绘制
  | 'eraser';   // 橡皮擦

/**
 * 画布对象类型
 */
export interface CanvasObject {
  id: string;           // 对象唯一标识
  type: string;         // 对象类型
  left: number;         // 左边距
  top: number;          // 上边距
  width: number;        // 宽度
  height: number;       // 高度
  fill: string;         // 填充颜色
  stroke: string;       // 描边颜色
  strokeWidth: number;  // 描边宽度
  angle: number;        // 旋转角度
  scaleX: number;       // X轴缩放
  scaleY: number;       // Y轴缩放
  opacity: number;      // 透明度
}

/**
 * 画布状态接口
 */
export interface CanvasState {
  objects: CanvasObject[];    // 画布中的所有对象
  selectedObject: string | null; // 当前选中的对象ID
  tool: ToolType;             // 当前选中的工具
  zoom: number;               // 画布缩放比例
  history: {                  // 历史记录
    past: CanvasObject[][];
    future: CanvasObject[][];
  };
}

/**
 * 画布尺寸接口
 */
export interface CanvasSize {
  width: number;
  height: number;
}

/**
 * 画布配置接口
 */
export interface CanvasConfig {
  size: CanvasSize;
  backgroundColor: string;
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
}
