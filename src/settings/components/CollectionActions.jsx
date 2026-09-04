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
import { useNavigate } from 'react-router-dom';
import RemoveDialog from '../../common/components/RemoveDialog';
import { useTranslation } from '../../common/components/LocalizationProvider';

const CollectionActions = ({ itemId, editPath, endpoint, onReload, customActions, readonly }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

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
              '&:hover': {
                backgroundColor: (th) =>
                  th.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            open={!!menuAnchorEl}
            anchorEl={menuAnchorEl}
            onClose={() => setMenuAnchorEl(null)}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  borderRadius: '12px',
                  border: (th) => `1px solid ${th.palette.divider}`,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  minWidth: 150,
                  py: 0.5,
                },
              },
            }}
          >
            {customActions &&
              customActions.map((action) => (
                <MenuItem
                  onClick={() => handleCustom(action)}
                  key={action.key}
                  sx={{ py: 1 }}
                >
                  {action.icon && (
                    <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
                      {action.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={action.title}
                    primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  />
                </MenuItem>
              ))}
            {!readonly && (
              <>
                {editPath && (
                  <MenuItem onClick={handleEdit} sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
                      <EditOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('sharedEdit')}
                      primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500 }}
                    />
                  </MenuItem>
                )}
                <MenuItem
                  onClick={handleRemove}
                  sx={{
                    py: 1,
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: (th) =>
                        th.palette.mode === 'dark'
                          ? 'rgba(211, 47, 47, 0.15)'
                          : 'rgba(211, 47, 47, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28, color: 'error.main' }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('sharedRemove')}
                    primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  />
                </MenuItem>
              </>
            )}
          </Menu>
        </>
      ) : (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
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
                      color: 'primary.main',
                      backgroundColor: (th) =>
                        th.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(0, 0, 0, 0.04)',
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
                        color: 'primary.main',
                        backgroundColor: (th) =>
                          th.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.04)',
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
                      backgroundColor: (th) =>
                        th.palette.mode === 'dark'
                          ? 'rgba(211, 47, 47, 0.15)'
                          : 'rgba(211, 47, 47, 0.08)',
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
