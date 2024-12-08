import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface ToolButtonProps {
  icon: SvgIconComponent;
  tooltip: string;
  selected: boolean;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  icon: Icon,
  tooltip,
  selected,
  onClick,
}) => {
  return (
    <Tooltip title={tooltip} placement="right">
      <IconButton
        onClick={onClick}
        sx={{
          backgroundColor: selected ? 'primary.main' : 'transparent',
          color: selected ? 'white' : 'text.primary',
          '&:hover': {
            backgroundColor: selected ? 'primary.dark' : 'action.hover',
          },
          width: 40,
          height: 40,
          borderRadius: 1,
        }}
      >
        <Icon />
      </IconButton>
    </Tooltip>
  );
};

export default ToolButton;
