import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import {
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
} from '@mui/material';
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
      marginTop: 1,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      flexShrink: 0,
      marginLeft: 'auto',
    },
  };
});

const DeviceRow = ({ devices, index, style }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const item = devices && devices[index];
  if (!item) return null;

  const isSelected = selectedDeviceId === item.id;

  const getStatusText = (status) => {
    if (status === 'online') return 'Aktif';
    if (status === 'offline') return 'Nonaktif';
    return formatStatus(status, t) || 'Tidak Dikenal';
  };

  const dotStyle =
    item.status === 'online'
      ? { backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }
      : item.status === 'offline'
        ? { backgroundColor: '#ef4444' }
        : { backgroundColor: '#94a3b8' };

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
        <ListItemAvatar sx={{ minWidth: 46 }}>
          <Avatar className={classes.avatar}>
            <img className={classes.icon} src={mapIcons[mapIconKey(item.category)]} alt="" />
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Typography className={classes.title} noWrap>
              {item.name}
            </Typography>
          }
          secondary={
            <Box component="span" className={classes.subtitle}>
              <span>{item.uniqueId || item.id}</span>
              <span>•</span>
              <span>{getStatusText(item.status)}</span>
            </Box>
          }
        />

        <div className={classes.statusDot} style={dotStyle} />
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
