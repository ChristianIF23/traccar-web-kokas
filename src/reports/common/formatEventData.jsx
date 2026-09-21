import { Link } from '@mui/material';
import { formatNumber, formatSpeed } from '../../common/util/formatter';
import { prefixString } from '../../common/util/stringUtils';

const formatEventData = (event, { deviceUniqueId, speedUnit, t }) => {
  if (!event || !event.attributes) {
    return '';
  }

  const { attributes } = event;

  switch (event.type) {
    case 'alarm':
      return attributes.alarm ? t(prefixString('alarm', attributes.alarm)) : '';

    case 'deviceOverspeed':
      return attributes.speed != null ? formatSpeed(attributes.speed, speedUnit, t) : '';

    case 'driverChanged':
      return attributes.driverUniqueId || '';

    case 'deviceFuelDrop':
    case 'deviceFuelIncrease':
      if (attributes.after != null && attributes.before != null) {
        return formatNumber(Math.abs(attributes.after - attributes.before));
      }
      return '';

    case 'media':
      if (!attributes.file) return '';
      return (
        <Link
          href={`/api/media/${deviceUniqueId}/${attributes.file}`}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{
            color: 'primary.main',
            fontWeight: 500,
            fontSize: '0.85rem',
            transition: 'color 0.15s ease',
            '&:hover': {
              color: 'primary.dark',
            },
          }}
        >
          {attributes.file}
        </Link>
      );

    case 'commandResult':
      return attributes.result || '';

    default:
      return '';
  }
};

export default formatEventData;
