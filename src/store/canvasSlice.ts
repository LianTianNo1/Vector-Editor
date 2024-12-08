import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CanvasObject } from '../types/canvas';

interface CanvasState {
  tool: string;
  selectedObject: string | null;
  objects: CanvasObject[];
  zoom: number;
  history: {
    past: CanvasObject[][];
    future: CanvasObject[][];
  };
}

const initialState: CanvasState = {
  tool: 'select',
  selectedObject: null,
  objects: [],
  zoom: 1,
  history: {
    past: [],
    future: [],
  },
};

const MAX_HISTORY_LENGTH = 50;

export const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setTool: (state, action: PayloadAction<string>) => {
      state.tool = action.payload;
    },
    
    addObject: (state, action: PayloadAction<CanvasObject>) => {
      state.history.past.push([...state.objects]);
      state.history.future = [];
      if (state.history.past.length > MAX_HISTORY_LENGTH) {
        state.history.past.shift();
      }
      state.objects.push(action.payload);
    },
    
    updateObject: (state, action: PayloadAction<{ id: string; changes: Partial<CanvasObject> }>) => {
      const { id, changes } = action.payload;
      const object = state.objects.find(obj => obj.id === id);
      if (object) {
        state.history.past.push([...state.objects]);
        state.history.future = [];
        if (state.history.past.length > MAX_HISTORY_LENGTH) {
          state.history.past.shift();
        }
        Object.assign(object, changes);
      }
    },
    
    removeObject: (state, action: PayloadAction<string>) => {
      state.history.past.push([...state.objects]);
      state.history.future = [];
      if (state.history.past.length > MAX_HISTORY_LENGTH) {
        state.history.past.shift();
      }
      state.objects = state.objects.filter(obj => obj.id !== action.payload);
      if (state.selectedObject === action.payload) {
        state.selectedObject = null;
      }
    },
    
    selectObject: (state, action: PayloadAction<string | null>) => {
      state.selectedObject = action.payload;
    },
    
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    
    setObjects: (state, action: PayloadAction<CanvasObject[]>) => {
      state.history.past.push([...state.objects]);
      state.history.future = [];
      if (state.history.past.length > MAX_HISTORY_LENGTH) {
        state.history.past.shift();
      }
      state.objects = action.payload;
    },
    
    undo: (state) => {
      if (state.history.past.length > 0) {
        const previous = state.history.past[state.history.past.length - 1];
        state.history.past.pop();
        state.history.future.push([...state.objects]);
        state.objects = [...previous];
      }
    },
    
    redo: (state) => {
      if (state.history.future.length > 0) {
        const next = state.history.future[state.history.future.length - 1];
        state.history.future.pop();
        state.history.past.push([...state.objects]);
        state.objects = [...next];
      }
    },
  },
});

export const {
  setTool,
  addObject,
  updateObject,
  removeObject,
  selectObject,
  setZoom,
  setObjects,
  undo,
  redo,
} = canvasSlice.actions;

export default canvasSlice.reducer;
