import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Canvas from './components/canvas/Canvas';
import Toolbar from './components/toolbar/Toolbar';
import Navbar from './components/navbar/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { undo, redo, setObjects } from './store/canvasSlice';
import { saveToFile, openFile, exportAsSVG, createNew } from './utils/fileOperations';
import './App.css'

// 创建主题
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3498db',
    },
    secondary: {
      main: '#2ecc71',
    },
    error: {
      main: '#e74c3c',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overflow: 'hidden', // 禁用滚动条
        },
      },
    },
  },
})

function App() {
  const dispatch = useDispatch();
  const zoom = useSelector((state: RootState) => state.canvas.zoom);
  const objects = useSelector((state: RootState) => state.canvas.objects);
  const canvasRef = React.useRef<fabric.Canvas | null>(null);

  const handleNew = () => {
    if (confirm('是否创建新文件？当前未保存的更改将丢失。')) {
      const newObjects = createNew();
      dispatch(setObjects(newObjects));
    }
  };

  const handleOpen = async () => {
    try {
      const objects = await openFile();
      dispatch(setObjects(objects));
    } catch (error) {
      if (error instanceof Error) {
        alert(`打开文件失败: ${error.message}`);
      } else {
        alert('打开文件失败');
      }
    }
  };

  const handleSave = async () => {
    try {
      await saveToFile(objects);
    } catch (error) {
      if (error instanceof Error) {
        alert(`保存失败: ${error.message}`);
      } else {
        alert('保存失败');
      }
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    try {
      await exportAsSVG(canvasRef.current);
    } catch (error) {
      if (error instanceof Error) {
        alert(`导出失败: ${error.message}`);
      } else {
        alert('导出失败');
      }
    }
  };

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleRedo = () => {
    dispatch(redo());
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Navbar
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          onExport={handleExport}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
        <Box sx={{ 
          display: 'flex', 
          flex: 1,
          overflow: 'hidden',
          backgroundColor: 'background.default',
        }}>
          <Toolbar />
          <Box sx={{ 
            flex: 1, 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            backgroundColor: '#1e1e1e',
          }}>
            <Canvas
              width={3000}
              height={2000}
              zoom={zoom}
              canvasRef={canvasRef}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
