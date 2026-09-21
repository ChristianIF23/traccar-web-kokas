import { useState } from 'react';
import { Link, Chip, CircularProgress, Box } from '@mui/material';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import { alpha } from '@mui/material/styles';
import { useCatch } from '../../reactHelper';
import { useTranslation } from '../../common/components/LocalizationProvider';
import fetchOrThrow from '../../common/util/fetchOrThrow';

const UserDevicesValue = ({ userId }) => {
  const t = useTranslation();

  const [devices, setDevices] = useState();
  const [loading, setLoading] = useState(false);

  const loadDevices = useCatch(async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const query = new URLSearchParams({ userId });
      const response = await fetchOrThrow(`/api/devices?${query.toString()}`);
      setDevices(await response.json());
    } finally {
      setLoading(false);
    }
  });

  if (loading) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: 0.25 }}>
        <CircularProgress size={16} thickness={4.5} sx={{ color: '#1d4ed8' }} />
      </Box>
    );
  }

  if (devices) {
    const hasDevices = devices.length > 0;

    return (
      <Chip
        icon={<DevicesOtherIcon sx={{ '&&': { fontSize: 13 } }} />}
        label={devices.length}
        size="small"
        sx={{
          height: 24,
          fontSize: '0.75rem',
          fontWeight: 700,
          borderRadius: '8px',
          fontVariantNumeric: 'tabular-nums',
          border: (theme) =>
            `1px solid ${
              hasDevices
                ? theme.palette.mode === 'dark'
                  ? 'rgba(29, 78, 216, 0.35)'
                  : 'rgba(29, 78, 216, 0.2)'
                : theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(15, 23, 42, 0.08)'
            }`,
          backgroundColor: (theme) =>
            hasDevices
              ? theme.palette.mode === 'dark'
                ? alpha('#1d4ed8', 0.2)
                : alpha('#1d4ed8', 0.08)
              : theme.palette.mode === 'dark'
                ? alpha('#ffffff', 0.04)
                : alpha('#0f172a', 0.04),
          color: (theme) =>
            hasDevices ? (theme.palette.mode === 'dark' ? '#60a5fa' : '#1d4ed8') : 'text.secondary',
          '& .MuiChip-icon': {
            color: 'inherit',
          },
        }}
      />
    );
  }

  return (
    <Link
      component="button"
      type="button"
      onClick={loadDevices}
      disabled={loading}
      underline="none"
      sx={{
        color: (theme) => (theme.palette.mode === 'dark' ? '#60a5fa' : '#1d4ed8'),
        fontWeight: 600,
        fontSize: '0.8125rem',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        px: 1,
        py: 0.25,
        borderRadius: '6px',
        transition: 'all 0.15s ease-in-out',
        '&:hover': {
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? alpha('#1d4ed8', 0.2) : alpha('#1d4ed8', 0.08),
        },
      }}
    >
      {t('reportShow')}
    </Link>
  );
};

export default UserDevicesValue;
