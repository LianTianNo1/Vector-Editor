import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CanvasState, CanvasObject, ToolType } from '../types/canvas';

const initialState: CanvasState = {
  objects: [],
  selectedObject: null,
  tool: 'select',
  zoom: 1,
  history: {
    past: [],
    future: []
  }
};

export const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    // 添加对象到画布
    addObject: (state, action: PayloadAction<CanvasObject>) => {
      state.objects.push(action.payload);
      state.history.past.push([...state.objects]);
      state.history.future = [];
    },
    
    // 更新对象属性
    updateObject: (state, action: PayloadAction<{ id: string; changes: Partial<CanvasObject> }>) => {
      const { id, changes } = action.payload;
      const objectIndex = state.objects.findIndex(obj => obj.id === id);
      if (objectIndex !== -1) {
        state.objects[objectIndex] = { ...state.objects[objectIndex], ...changes };
        state.history.past.push([...state.objects]);
        state.history.future = [];
      }
    },
    
    // 删除对象
    deleteObject: (state, action: PayloadAction<string>) => {
      state.objects = state.objects.filter(obj => obj.id !== action.payload);
      state.selectedObject = null;
      state.history.past.push([...state.objects]);
      state.history.future = [];
    },
    
    // 选择对象
    selectObject: (state, action: PayloadAction<string | null>) => {
      state.selectedObject = action.payload;
    },
    
    // 切换工具
    setTool: (state, action: PayloadAction<ToolType>) => {
      state.tool = action.payload;
    },
    
    // 设置缩放
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    
    // 撤销操作
    undo: (state) => {
      if (state.history.past.length > 0) {
        const previous = state.history.past[state.history.past.length - 1];
        state.history.past = state.history.past.slice(0, -1);
        state.history.future.push([...state.objects]);
        state.objects = previous;
      }
    },
    
    // 重做操作
    redo: (state) => {
      if (state.history.future.length > 0) {
        const next = state.history.future[state.history.future.length - 1];
        state.history.future = state.history.future.slice(0, -1);
        state.history.past.push([...state.objects]);
        state.objects = next;
      }
    }
  }
});

export const {
  addObject,
  updateObject,
  deleteObject,
  selectObject,
  setTool,
  setZoom,
  undo,
  redo
} = canvasSlice.actions;

export default canvasSlice.reducer;
