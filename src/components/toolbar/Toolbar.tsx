import React from 'react';
import { Box, Divider } from '@mui/material';
import {
  MouseOutlined,
  CropSquare,
  RadioButtonUnchecked,
  Timeline,
  Create,
  TextFields,
  Delete
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setTool } from '../../store/canvasSlice';
import { ToolType } from '../../types/canvas';
import ToolButton from './ToolButton';

const Toolbar: React.FC = () => {
  const dispatch = useDispatch();
  const currentTool = useSelector((state: RootState) => state.canvas.tool);

  // 工具列表配置
  const tools: Array<{
    type: ToolType;
    icon: any;
    tooltip: string;
  }> = [
    { type: 'select', icon: MouseOutlined, tooltip: '选择工具' },
    { type: 'rectangle', icon: CropSquare, tooltip: '矩形工具' },
    { type: 'circle', icon: RadioButtonUnchecked, tooltip: '圆形工具' },
    { type: 'line', icon: Timeline, tooltip: '线条工具' },
    { type: 'pen', icon: Create, tooltip: '自由绘制' },
    { type: 'text', icon: TextFields, tooltip: '文本工具' },
    { type: 'eraser', icon: Delete, tooltip: '橡皮擦' },
  ];

  const handleToolClick = (toolType: ToolType) => {
    dispatch(setTool(toolType));
  };

  return (
    <Box
      sx={{
        width: 48,
        backgroundColor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 0',
      }}
    >
      {tools.map((tool, index) => (
        <React.Fragment key={tool.type}>
          <ToolButton
            icon={tool.icon}
            tooltip={tool.tooltip}
            selected={currentTool === tool.type}
            onClick={() => handleToolClick(tool.type)}
          />
          {index === 0 && <Divider sx={{ width: '80%', margin: '8px 0' }} />}
        </React.Fragment>
      ))}
    </Box>
  );
};

export default Toolbar;
