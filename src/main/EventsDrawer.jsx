import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Tooltip,
  Chip,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { formatNotificationTitle, formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { eventsActions } from '../store';

const EventsDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);
  const events = useSelector((state) => state.events.items);

  const formatType = (event) =>
    formatNotificationTitle(t, {
      type: event.type,
      attributes: {
        alarms: event.attributes?.alarm,
      },
    });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 0,
        sx: {
          width: (theme) => theme.dimensions?.eventsDrawerWidth || 360,
          borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
          borderTopLeftRadius: { xs: 0, sm: '16px' },
          borderBottomLeftRadius: { xs: 0, sm: '16px' },
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Toolbar
        sx={{
          px: 2,
          py: 1,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
        disableGutters
      >
        <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
          {t('reportEvents')}
        </Typography>

        {events.length > 0 && (
          <Chip
            size="small"
            label={events.length}
            color="primary"
            sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
          />
        )}

        {events.length > 0 && (
          <Tooltip title={t('sharedRemoveAll') || t('sharedRemove')}>
            <IconButton
              size="small"
              onClick={() => dispatch(eventsActions.deleteAll())}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'error.main' },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Toolbar>

      <Box sx={{ overflowY: 'auto', p: 1.5, height: '100%' }}>
        {events.length > 0 ? (
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {events.map((event) => (
              <ListItemButton
                key={event.id}
                onClick={() => {
                  navigate(`/event/${event.id}`);
                  onClose();
                }}
                disabled={!event.id}
                sx={{
                  borderRadius: '10px',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
                  p: 1.5,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#f8fafc',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>
                      {devices[event.deviceId]?.name || event.deviceId}
                    </Typography>
                  }
                  secondary={
                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {formatType(event)}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatTime(event.eventTime, 'seconds')}
                      </Typography>
                    </Box>
                  }
                />
                <IconButton
                  size="small"
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(eventsActions.delete(event));
                  }}
                  sx={{
                    color: 'text.disabled',
                    '&:hover': { color: 'error.main' },
                    ml: 1,
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '70%',
              gap: 1.5,
            }}
          >
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">
              {t('sharedNoData')}
            </Typography>
            <Typography variant="caption" color="text.disabled" align="center">
              Belum ada notifikasi atau event baru yang tercatat.
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default EventsDrawer;
