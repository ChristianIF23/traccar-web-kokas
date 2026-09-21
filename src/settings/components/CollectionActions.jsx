import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Box,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import RemoveDialog from '../../common/components/RemoveDialog';
import { useTranslation } from '../../common/components/LocalizationProvider';

const CollectionActions = ({ itemId, editPath, endpoint, onReload, customActions, readonly }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();
  const isDark = theme.palette.mode === 'dark';

  const phone = useMediaQuery(theme.breakpoints.down('sm'));

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [removing, setRemoving] = useState(false);

  const handleEdit = () => {
    navigate(`${editPath}/${itemId}`);
    setMenuAnchorEl(null);
  };

  const handleRemove = () => {
    setRemoving(true);
    setMenuAnchorEl(null);
  };

  const handleCustom = (action) => {
    action.handler(itemId);
    setMenuAnchorEl(null);
  };

  const handleRemoveResult = (removed) => {
    setRemoving(false);
    if (removed) {
      onReload();
    }
  };

  return (
    <>
      {phone ? (
        <>
          <IconButton
            size="small"
            aria-label="actions"
            onClick={(event) => setMenuAnchorEl(event.currentTarget)}
            sx={{
              color: 'text.secondary',
              borderRadius: '8px',
              p: 0.75,
              transition: 'all 0.15s ease',
              '&:hover': {
                color: 'text.primary',
                backgroundColor: isDark
                  ? alpha(theme.palette.common.white, 0.08)
                  : alpha(theme.palette.common.black, 0.05),
              },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            open={Boolean(menuAnchorEl)}
            anchorEl={menuAnchorEl}
            onClose={() => setMenuAnchorEl(null)}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  borderRadius: '12px',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  border: `1px solid ${
                    isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
                  }`,
                  boxShadow: isDark
                    ? '0 10px 30px rgba(0, 0, 0, 0.5)'
                    : '0 8px 30px rgba(15, 23, 42, 0.08)',
                  minWidth: 160,
                  py: 0.5,
                  '& .MuiMenuItem-root': {
                    px: 1.75,
                    py: 1,
                    gap: 1.25,
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      backgroundColor: isDark
                        ? alpha(theme.palette.common.white, 0.06)
                        : alpha(theme.palette.common.black, 0.04),
                    },
                  },
                },
              },
            }}
          >
            {customActions &&
              customActions.map((action) => (
                <MenuItem onClick={() => handleCustom(action)} key={action.key}>
                  {action.icon && (
                    <ListItemIcon sx={{ minWidth: 24, color: 'text.secondary' }}>
                      {action.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={action.title}
                    primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }}
                  />
                </MenuItem>
              ))}
            {!readonly && (
              <>
                {editPath && (
                  <MenuItem onClick={handleEdit}>
                    <ListItemIcon sx={{ minWidth: 24, color: 'text.secondary' }}>
                      <EditOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('sharedEdit')}
                      primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }}
                    />
                  </MenuItem>
                )}
                <MenuItem
                  onClick={handleRemove}
                  sx={{
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: isDark
                        ? alpha(theme.palette.error.main, 0.15)
                        : alpha(theme.palette.error.main, 0.08),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 24, color: 'error.main' }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('sharedRemove')}
                    primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }}
                  />
                </MenuItem>
              </>
            )}
          </Menu>
        </>
      ) : (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 0.5,
          }}
        >
          {customActions &&
            customActions.map((action) => (
              <Tooltip title={action.title} key={action.key} arrow>
                <IconButton
                  size="small"
                  aria-label={action.title}
                  onClick={() => handleCustom(action)}
                  sx={{
                    color: 'text.secondary',
                    borderRadius: '8px',
                    p: 0.75,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      color: '#1d4ed8',
                      backgroundColor: isDark ? alpha('#1d4ed8', 0.12) : alpha('#1d4ed8', 0.08),
                    },
                  }}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
          {!readonly && (
            <>
              {editPath && (
                <Tooltip title={t('sharedEdit')} arrow>
                  <IconButton
                    size="small"
                    aria-label={t('sharedEdit')}
                    onClick={handleEdit}
                    sx={{
                      color: 'text.secondary',
                      borderRadius: '8px',
                      p: 0.75,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        color: '#1d4ed8',
                        backgroundColor: isDark ? alpha('#1d4ed8', 0.12) : alpha('#1d4ed8', 0.08),
                      },
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('sharedRemove')} arrow>
                <IconButton
                  size="small"
                  aria-label={t('sharedRemove')}
                  onClick={handleRemove}
                  sx={{
                    color: 'text.secondary',
                    borderRadius: '8px',
                    p: 0.75,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      color: 'error.main',
                      backgroundColor: isDark
                        ? alpha(theme.palette.error.main, 0.15)
                        : alpha(theme.palette.error.main, 0.08),
                    },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      )}

      <RemoveDialog
        style={{ transform: 'none' }}
        open={removing}
        endpoint={endpoint}
        itemId={itemId}
        onResult={handleRemoveResult}
      />
    </>
  );
};

export default CollectionActions;
