import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import {
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import { devicesActions } from '../store';
import { mapIconKey, mapIcons } from '../map/core/preloadImages';
import { useAdministrator } from '../common/util/permissions';
import { useTranslation } from '../common/components/LocalizationProvider';
import { formatStatus } from '../common/util/formatter';

const useStyles = makeStyles()((theme) => {
  const isDark = theme.palette.mode === 'dark';

  return {
    rowContainer: {
      padding: '4px 10px',
      boxSizing: 'border-box',
    },
    listItemButton: {
      borderRadius: 14,
      transition: 'all 0.2s ease',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)'}`,
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.4)' : '#ffffff',
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      '&:hover': {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(29, 78, 216, 0.04)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(29, 78, 216, 0.25)',
        transform: 'translateY(-1px)',
      },
    },
    avatar: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'}`,
      width: 36,
      height: 36,
      borderRadius: 10,
    },
    icon: {
      width: 20,
      height: 20,
      filter: isDark ? 'brightness(0) invert(1)' : 'none',
    },
    title: {
      fontWeight: 800,
      fontSize: '0.86rem',
      color: theme.palette.text.primary,
      letterSpacing: '-0.01em',
    },
    subtitle: {
      fontSize: '0.72rem',
      color: isDark ? '#94a3b8' : '#64748b',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    rightActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginLeft: 'auto',
      flexShrink: 0,
    },
    gpsStatusChip: {
      height: 20,
      fontSize: '0.68rem',
      fontWeight: 700,
      borderRadius: 6,
      padding: '0 4px',
      '& .MuiChip-label': {
        padding: '0 6px',
      },
      '& .MuiChip-icon': {
        marginLeft: 4,
        marginRight: -2,
      },
    },
  };
});

/**
 * Deteksi apakah perangkat memiliki dashcam / kamera
 */
const deviceHasCamera = (item) => {
  if (!item) return false;
  // 1. Cek dari atribut eksplisit
  if (
    item.attributes?.hasCamera === true ||
    item.attributes?.camera === true ||
    item.attributes?.hasCamera === 'true' ||
    item.attributes?.dashcam === true
  ) {
    return true;
  }
  // 2. Cek dari tipe model (JC181, JC400, JC200, Dashcam, JT1078, dll)
  const model = (item.model || '').toUpperCase();
  if (
    model.includes('JC') ||
    model.includes('CAM') ||
    model.includes('DASHCAM') ||
    model.includes('JT1078') ||
    model.includes('VIDEO')
  ) {
    return true;
  }
  // 3. Cek dari nama perangkat (misal: "JC181 test", "CAM-01")
  const name = (item.name || '').toUpperCase();
  if (name.includes('JC181') || name.includes('JC400') || name.includes('DASHCAM')) {
    return true;
  }
  // 4. Cek protocol jika ada
  const protocol = (item.protocol || '').toLowerCase();
  if (protocol.includes('jt1078')) {
    return true;
  }

  return false;
};

const DeviceRow = ({ devices, index, style, onOpenVideo }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const item = devices && devices[index];
  if (!item) return null;

  const isSelected = selectedDeviceId === item.id;
  const isGpsOnline = item.status === 'online';
  const isGpsOffline = item.status === 'offline';
  const hasCamera = deviceHasCamera(item);

  // Status GPS Teks
  const gpsText = isGpsOnline ? 'GPS Aktif' : isGpsOffline ? 'GPS Nonaktif' : (formatStatus(item.status, t) || 'GPS Tidak Dikenal');

  return (
    <div style={style} className={classes.rowContainer}>
      <ListItemButton
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
        selected={isSelected}
        className={classes.listItemButton}
        sx={
          isSelected
            ? {
                backgroundColor: 'rgba(29, 78, 216, 0.08) !important',
                borderColor: '#1d4ed8 !important',
                boxShadow: '0 4px 14px rgba(29, 78, 216, 0.15)',
              }
            : undefined
        }
      >
        <ListItemAvatar sx={{ minWidth: 44 }}>
          <Avatar className={classes.avatar}>
            <img className={classes.icon} src={mapIcons[mapIconKey(item.category)]} alt="" />
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          sx={{ my: 0 }}
          primary={
            <Typography className={classes.title} noWrap>
              {item.name}
            </Typography>
          }
          secondary={
            <Box component="span" className={classes.subtitle}>
              <span>{item.uniqueId || item.id}</span>
            </Box>
          }
        />

        {/* Bagian Status: Terpisah jelas antara Status Kamera dan Status GPS */}
        <Box className={classes.rightActions}>
          {/* 1. Status & Aksi Kamera */}
          {hasCamera ? (
            isGpsOnline ? (
              <Tooltip title="Kamera Terpasang (Siap Live Streaming)" arrow>
                <IconButton
                  aria-label={`Buka kamera ${item.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenVideo?.(item);
                  }}
                  size="small"
                  sx={{
                    color: '#059669',
                    bgcolor: 'rgba(16, 185, 129, 0.12)',
                    p: 0.6,
                    borderRadius: 1.5,
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(16, 185, 129, 0.25)',
                      transform: 'scale(1.08)',
                    },
                    transition: 'all 0.15s ease',
                  }}
                >
                  <VideocamOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Kamera Terpasang (GPS Offline / Kamera Siaga)" arrow>
                <IconButton
                  aria-label={`Buka kamera offline ${item.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenVideo?.(item);
                  }}
                  size="small"
                  sx={{
                    color: '#64748b',
                    bgcolor: 'rgba(100, 116, 139, 0.1)',
                    p: 0.6,
                    borderRadius: 1.5,
                    border: '1px solid rgba(100, 116, 139, 0.2)',
                    '&:hover': { bgcolor: 'rgba(100, 116, 139, 0.2)' },
                  }}
                >
                  <VideocamOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )
          ) : (
            <Tooltip title="Tidak Terpasang Kamera" arrow>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0.6,
                  color: '#94a3b8',
                  opacity: 0.35,
                  cursor: 'not-allowed',
                }}
              >
                <VideocamOffOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
            </Tooltip>
          )}

          {/* 2. Badge Status GPS */}
          <Tooltip title={`Status GPS: ${gpsText}`} arrow>
            <Chip
              label={isGpsOnline ? 'Aktif' : isGpsOffline ? 'Nonaktif' : 'Unknown'}
              size="small"
              className={classes.gpsStatusChip}
              sx={{
                bgcolor: isGpsOnline
                  ? 'rgba(16, 185, 129, 0.12)'
                  : isGpsOffline
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'rgba(148, 163, 184, 0.12)',
                color: isGpsOnline ? '#059669' : isGpsOffline ? '#dc2626' : '#64748b',
                border: `1px solid ${
                  isGpsOnline
                    ? 'rgba(16, 185, 129, 0.25)'
                    : isGpsOffline
                      ? 'rgba(239, 68, 68, 0.25)'
                      : 'rgba(148, 163, 184, 0.25)'
                }`,
              }}
            />
          </Tooltip>
        </Box>
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
