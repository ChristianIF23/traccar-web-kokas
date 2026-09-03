import { useSelector } from 'react-redux';
import { Link, Chip, Box, Tooltip, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import {
  formatAlarm,
  formatAltitude,
  formatBoolean,
  formatCoordinate,
  formatCourse,
  formatDistance,
  formatNumber,
  formatNumericHours,
  formatPercentage,
  formatSpeed,
  formatTime,
  formatTemperature,
  formatVoltage,
  formatVolume,
  formatConsumption,
} from '../util/formatter';
import { speedToKnots } from '../util/converter';
import { useAttributePreference, usePreference } from '../util/preferences';
import { useTranslation } from './LocalizationProvider';
import { useDeviceReadonly } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import AddressValue from './AddressValue';
import GeofencesValue from './GeofencesValue';
import DriverValue from './DriverValue';

const PositionValue = ({ position, property, attribute }) => {
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();
  const positionAttributes = usePositionAttributes(t);

  const device = useSelector((state) => state.devices.items[position.deviceId]);

  const key = property || attribute;
  const value = property ? position[property] : position.attributes[attribute];

  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const coordinateFormat = usePreference('coordinateFormat');

  const formatValue = () => {
    switch (key) {
      case 'fixTime':
      case 'deviceTime':
      case 'serverTime':
        return formatTime(value, 'seconds');
      case 'latitude':
        return formatCoordinate('latitude', value, coordinateFormat);
      case 'longitude':
        return formatCoordinate('longitude', value, coordinateFormat);
      case 'obdSpeed':
        return formatSpeed(speedToKnots(value, 'kmh'), speedUnit, t);
      case 'course':
        return formatCourse(value);
      case 'altitude':
        return formatAltitude(value, altitudeUnit, t);
      case 'fuelConsumption':
        return formatConsumption(value, t);
      case 'coolantTemp':
        return formatTemperature(value);
      case 'alarm':
        return (
          <Chip
            size="small"
            color="error"
            icon={<ErrorOutlineIcon sx={{ '&&': { fontSize: 14 } }} />}
            label={formatAlarm(value, t)}
            sx={{
              height: 22,
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
            }}
          />
        );
      default:
        switch (positionAttributes[key]?.dataType) {
          case 'speed':
            return formatSpeed(value, speedUnit, t);
          case 'distance':
            return formatDistance(value, distanceUnit, t);
          case 'voltage':
            return formatVoltage(value, t);
          case 'percentage':
            return formatPercentage(value);
          case 'volume':
            return formatVolume(value, volumeUnit, t);
          case 'hours':
            return formatNumericHours(value, t);
          default:
            if (typeof value === 'number') {
              return formatNumber(value);
            }
            if (typeof value === 'boolean') {
              return (
                <Chip
                  size="small"
                  variant="outlined"
                  color={value ? 'success' : 'default'}
                  label={formatBoolean(value, t)}
                  sx={{
                    height: 20,
                    fontSize: '0.725rem',
                    fontWeight: 500,
                    borderRadius: '6px',
                    borderColor: value ? undefined : (theme) => theme.palette.divider,
                  }}
                />
              );
            }
            return value || '';
        }
    }
  };

  if (key === 'address') {
    return (
      <AddressValue
        latitude={position.latitude}
        longitude={position.longitude}
        originalAddress={value}
      />
    );
  }

  if (value == null) {
    return '';
  }

  switch (key) {
    case 'image':
    case 'video':
    case 'audio':
      return (
        <Link
          href={`/api/media/${device?.uniqueId}/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'primary.main',
            fontWeight: 500,
            fontSize: '0.8125rem',
          }}
        >
          {value}
          <LaunchIcon sx={{ fontSize: 13 }} />
        </Link>
      );
    case 'totalDistance':
    case 'hours':
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <span>{formatValue()}</span>
          {!deviceReadonly && (
            <Tooltip title={t('sharedAccumulators') || 'Accumulators'} arrow>
              <IconButton
                component={RouterLink}
                to={`/settings/accumulators/${position.deviceId}`}
                size="small"
                sx={{
                  p: 0.25,
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <SettingsOutlinedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    case 'network':
      return (
        <Link
          component={RouterLink}
          to={`/network/${position.id}`}
          underline="hover"
          sx={{
            color: 'primary.main',
            fontWeight: 500,
            fontSize: '0.8125rem',
          }}
        >
          {t('sharedInfoTitle')}
        </Link>
      );
    case 'geofenceIds':
      return <GeofencesValue geofenceIds={value} />;
    case 'driverUniqueId':
      return <DriverValue driverUniqueId={value} />;
    default:
      return formatValue();
  }
};

export default PositionValue;
