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
import { alpha } from '@mui/material/styles';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
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
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.65)' : 'rgba(15, 23, 42, 0.3)',
            backdropFilter: 'blur(4px)',
          },
        },
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          width: (theme) => theme.dimensions?.eventsDrawerWidth || 380,
          maxWidth: '88vw',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? alpha('#162447', 0.96) : 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderLeft: (theme) =>
            `1px solid ${
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
            }`,
          borderTopLeftRadius: { xs: 0, sm: 24 },
          borderBottomLeftRadius: { xs: 0, sm: 24 },
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '-16px 0 45px rgba(0, 0, 0, 0.75)'
              : '-16px 0 45px rgba(22, 36, 71, 0.1)',
        },
      }}
    >
      {/* Header Toolbar Drawer */}
      <Toolbar
        sx={{
          px: 2.5,
          py: 1.5,
          minHeight: '68px !important',
          borderBottom: (theme) =>
            `1px solid ${
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'
            }`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
        }}
        disableGutters
      >
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, letterSpacing: -0.3, fontSize: '1.05rem' }}
          >
            {t('reportEvents')}
          </Typography>
          {events.length > 0 && (
            <Chip
              size="small"
              label={events.length}
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 700,
                borderRadius: '8px',
                backgroundColor: '#1d4ed8',
                color: '#ffffff',
              }}
            />
          )}
        </Box>

        {events.length > 0 && (
          <Tooltip title={t('sharedRemoveAll') || t('sharedRemove')}>
            <IconButton
              size="small"
              onClick={() => dispatch(eventsActions.deleteAll())}
              sx={{
                borderRadius: '10px',
                color: 'text.secondary',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#ef4444',
                  backgroundColor: alpha('#ef4444', 0.1),
                },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            color: 'text.secondary',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: 'text.primary',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(15, 23, 42, 0.06)',
            },
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Toolbar>

      {/* Konten Daftar Event Notifikasi */}
      <Box sx={{ overflowY: 'auto', p: 2, height: '100%' }}>
        {events.length > 0 ? (
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {events.map((event) => (
              <ListItemButton
                key={event.id}
                onClick={() => {
                  navigate(`/event/${event.id}`);
                  onClose();
                }}
                disabled={!event.id}
                sx={{
                  borderRadius: '14px',
                  border: (theme) =>
                    `1px solid ${
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(15, 23, 42, 0.06)'
                    }`,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? alpha('#0f172a', 0.5) : '#ffffff',
                  p: 1.6,
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? alpha('#0f172a', 0.8) : '#ffffff',
                    borderColor: '#1d4ed8',
                    transform: 'translateX(-2px)',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 6px 16px rgba(0, 0, 0, 0.4)'
                        : '0 6px 16px rgba(29, 78, 216, 0.08)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.88rem' }}
                      noWrap
                    >
                      {devices[event.deviceId]?.name || event.deviceId}
                    </Typography>
                  }
                  secondary={
                    <Box
                      component="span"
                      sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mt: 0.5 }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.78rem' }}
                        noWrap
                      >
                        {formatType(event)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.disabled',
                          fontVariantNumeric: 'tabular-nums',
                          fontSize: '0.7rem',
                        }}
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
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#ef4444',
                      backgroundColor: alpha('#ef4444', 0.1),
                    },
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
              px: 3,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.common.white, 0.04)
                    : alpha('#162447', 0.04),
                color: 'text.disabled',
                mb: 0.5,
              }}
            >
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {t('sharedNoData')}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', textAlign: 'center', maxWidth: 220 }}
            >
              Belum ada notifikasi atau event baru yang tercatat.
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default EventsDrawer;
