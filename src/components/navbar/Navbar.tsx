import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Box,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  FolderOpen as FolderOpenIcon,
  Save as SaveIcon,
  FileDownload as ExportIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setZoom } from '../../store/canvasSlice';

interface NavbarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onNew,
  onOpen,
  onSave,
  onExport,
  onUndo,
  onRedo,
}) => {
  const dispatch = useDispatch();
  const zoom = useSelector((state: RootState) => state.canvas.zoom);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fileAnchorEl, setFileAnchorEl] = useState<null | HTMLElement>(null);

  const handleFileMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFileAnchorEl(event.currentTarget);
  };

  const handleFileMenuClose = () => {
    setFileAnchorEl(null);
  };

  const handleZoomIn = () => {
    dispatch(setZoom(Math.min(zoom + 0.1, 2)));
  };

  const handleZoomOut = () => {
    dispatch(setZoom(Math.max(zoom - 0.1, 0.5)));
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar variant="dense">
        {/* Logo and App Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          {/* <img src="/logo.svg" alt="Logo" style={{ height: 24, marginRight: 8 }} /> */}
          <Typography variant="h6" component="div">
            Vector Editor
          </Typography>
        </Box>

        {/* File Menu */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleFileMenuOpen}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={fileAnchorEl}
          open={Boolean(fileAnchorEl)}
          onClose={handleFileMenuClose}
        >
          <MenuItem onClick={() => { onNew(); handleFileMenuClose(); }}>
            <AddIcon sx={{ mr: 1 }} /> 新建
          </MenuItem>
          <MenuItem onClick={() => { onOpen(); handleFileMenuClose(); }}>
            <FolderOpenIcon sx={{ mr: 1 }} /> 打开
          </MenuItem>
          <MenuItem onClick={() => { onSave(); handleFileMenuClose(); }}>
            <SaveIcon sx={{ mr: 1 }} /> 保存
          </MenuItem>
          <MenuItem onClick={() => { onExport(); handleFileMenuClose(); }}>
            <ExportIcon sx={{ mr: 1 }} /> 导出
          </MenuItem>
        </Menu>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Edit Actions */}
        <Tooltip title="撤销">
          <IconButton color="inherit" onClick={onUndo}>
            <UndoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="重做">
          <IconButton color="inherit" onClick={onRedo}>
            <RedoIcon />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* View Controls */}
        <Tooltip title="放大">
          <IconButton color="inherit" onClick={handleZoomIn}>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="body2" sx={{ mx: 1 }}>
          {Math.round(zoom * 100)}%
        </Typography>
        <Tooltip title="缩小">
          <IconButton color="inherit" onClick={handleZoomOut}>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Tooltip title={isFullscreen ? "退出全屏" : "全屏"}>
          <IconButton color="inherit" onClick={handleFullscreen}>
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
