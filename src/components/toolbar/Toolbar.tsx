import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Paper } from '@mui/material';
import { 
  MouseOutlined,
  CreateOutlined,
  RectangleOutlined,
  CircleOutlined,
  LinearScaleOutlined,
  TextFieldsOutlined,
  DeleteOutlineOutlined,
} from '@mui/icons-material';
import ToolButton from './ToolButton';
import { setTool } from '../../store/canvasSlice';
import { RootState } from '../../store';

const tools = [
  { id: 'select', icon: MouseOutlined, tooltip: '选择工具' },
  { id: 'pen', icon: CreateOutlined, tooltip: '画笔工具' },
  { id: 'rectangle', icon: RectangleOutlined, tooltip: '矩形工具' },
  { id: 'circle', icon: CircleOutlined, tooltip: '圆形工具' },
  { id: 'line', icon: LinearScaleOutlined, tooltip: '直线工具' },
  { id: 'text', icon: TextFieldsOutlined, tooltip: '文本工具' },
  { id: 'eraser', icon: DeleteOutlineOutlined, tooltip: '橡皮擦' },
];

const Toolbar: React.FC = () => {
  const dispatch = useDispatch();
  const currentTool = useSelector((state: RootState) => state.canvas.tool);

  const handleToolClick = (toolId: string) => {
    dispatch(setTool(toolId));
  };

  return (
    <Paper 
      elevation={3}
      sx={{
        position: 'fixed',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        padding: 1,
        backgroundColor: 'background.paper',
      }}
    >
      {tools.map((tool) => (
        <ToolButton
          key={tool.id}
          icon={tool.icon}
          tooltip={tool.tooltip}
          selected={currentTool === tool.id}
          onClick={() => handleToolClick(tool.id)}
        />
      ))}
    </Paper>
  );
};

export default Toolbar;
