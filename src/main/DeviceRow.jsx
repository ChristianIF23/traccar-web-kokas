import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import {
  IconButton,
  Tooltip,
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Typography,
} from '@mui/material';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
import Battery20Icon from '@mui/icons-material/Battery20';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import ErrorIcon from '@mui/icons-material/Error';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import {
  formatAlarm,
  formatBoolean,
  formatPercentage,
  formatStatus,
  getStatusColor,
} from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { mapIconKey, mapIcons } from '../map/core/preloadImages';
import { useAdministrator } from '../common/util/permissions';
import EngineIcon from '../resources/images/data/engine.svg?react';
import { useAttributePreference } from '../common/util/preferences';
import GeofencesValue from '../common/components/GeofencesValue';
import DriverValue from '../common/components/DriverValue';
import MotionBar from './components/MotionBar';

dayjs.extend(relativeTime);

const useStyles = makeStyles()((theme) => ({
  rowContainer: {
    padding: theme.spacing(0.5, 1),
    boxSizing: 'border-box',
  },
  listItemButton: {
    borderRadius: theme.spacing(1.2),
    transition: 'all 0.2s ease-in-out',
    border: '1px solid transparent',
    padding: theme.spacing(1, 1.5),
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
      borderColor: theme.palette.divider,
    },
  },
  selected: {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(96, 165, 250, 0.15) !important'
      : 'rgba(27, 42, 74, 0.08) !important',
    borderColor: `${theme.palette.primary.main} !important`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  avatar: {
    backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
    color: theme.palette.primary.main,
    border: `1px solid ${theme.palette.divider}`,
    width: 42,
    height: 42,
  },
  icon: {
    width: '24px',
    height: '24px',
    filter: theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none',
  },
  primaryText: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: theme.palette.text.primary,
  },
  secondaryWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: '0.78rem',
    color: theme.palette.text.secondary,
    marginTop: '2px',
  },
  statusBadge: {
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  success: {
    color: theme.palette.success.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  neutral: {
    color: theme.palette.neutral.main,
  },
  indicatorGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
  },
}));

const DeviceRow = ({ devices, index, style }) => {
  const { classes, cx } = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const item = devices[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const deviceSecondary = useAttributePreference('deviceSecondary', '');

  const resolveFieldValue = (field) => {
    if (field === 'geofenceIds') {
      const geofenceIds = position?.geofenceIds;
      return geofenceIds?.length ? <GeofencesValue geofenceIds={geofenceIds} /> : null;
    }
    if (field === 'driverUniqueId') {
      const driverUniqueId = position?.attributes?.driverUniqueId;
      return driverUniqueId ? <DriverValue driverUniqueId={driverUniqueId} /> : null;
    }
    if (field === 'motion') {
      return <MotionBar deviceId={item.id} />;
    }
    return item[field];
  };

  const primaryValue = resolveFieldValue(devicePrimary);
  const secondaryValue = resolveFieldValue(deviceSecondary);

  const secondaryText = () => {
    let status;
    if (item.status === 'online' || !item.lastUpdate) {
      status = formatStatus(item.status, t);
    } else {
      status = dayjs(item.lastUpdate).fromNow();
    }
    return (
      <span className={classes.secondaryWrapper}>
        {secondaryValue && (
          <>
            <span>{secondaryValue}</span>
            <span>•</span>
          </>
        )}
        <span className={cx(classes.statusBadge, classes[getStatusColor(item.status)])}>
          {status}
        </span>
      </span>
    );
  };

  return (
    <div style={style} className={classes.rowContainer}>
      <ListItemButton
        key={item.id}
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
        selected={selectedDeviceId === item.id}
        className={cx(classes.listItemButton, selectedDeviceId === item.id && classes.selected)}
      >
        <ListItemAvatar>
          <Avatar className={classes.avatar}>
            <img className={classes.icon} src={mapIcons[mapIconKey(item.category)]} alt="" />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={<Typography className={classes.primaryText} noWrap>{primaryValue}</Typography>}
          secondary={secondaryText()}
        />
        {position && (
          <div className={classes.indicatorGroup}>
            {position.attributes.hasOwnProperty('alarm') && (
              <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(position.attributes.alarm, t)}`}>
                <IconButton size="small">
                  <ErrorIcon fontSize="small" className={classes.error} />
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('ignition') && (
              <Tooltip
                title={`${t('positionIgnition')}: ${formatBoolean(position.attributes.ignition, t)}`}
              >
                <IconButton size="small">
                  {position.attributes.ignition ? (
                    <EngineIcon width={18} height={18} className={classes.success} />
                  ) : (
                    <EngineIcon width={18} height={18} className={classes.neutral} />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('batteryLevel') && (
              <Tooltip
                title={`${t('positionBatteryLevel')}: ${formatPercentage(position.attributes.batteryLevel)}`}
              >
                <IconButton size="small">
                  {(position.attributes.batteryLevel > 70 &&
                    (position.attributes.charge ? (
                      <BatteryChargingFullIcon fontSize="small" className={classes.success} />
                    ) : (
                      <BatteryFullIcon fontSize="small" className={classes.success} />
                    ))) ||
                    (position.attributes.batteryLevel > 30 &&
                      (position.attributes.charge ? (
                        <BatteryCharging60Icon fontSize="small" className={classes.warning} />
                      ) : (
                        <Battery60Icon fontSize="small" className={classes.warning} />
                      ))) ||
                    (position.attributes.charge ? (
                      <BatteryCharging20Icon fontSize="small" className={classes.error} />
                    ) : (
                      <Battery20Icon fontSize="small" className={classes.error} />
                    ))}
                </IconButton>
              </Tooltip>
            )}
          </div>
        )}
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
