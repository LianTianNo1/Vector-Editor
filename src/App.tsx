import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import Canvas from './components/canvas/Canvas'
import Toolbar from './components/toolbar/Toolbar'
import './App.css'

// 创建主题
const theme = createTheme({
  palette: {
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
      default: '#ffffff',
    },
    text: {
      primary: '#333333',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        height: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}>
        {/* 工具栏 */}
        <Toolbar />
        
        {/* 主画布区域 */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#f5f5f5'
        }}>
          <Canvas width={800} height={600} />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
