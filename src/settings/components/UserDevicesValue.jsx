import { useState } from 'react';
import { Link, Chip, CircularProgress, Box } from '@mui/material';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
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
      <Box sx={{ display: 'inline-flex', alignItems: 'center', py: 0.25 }}>
        <CircularProgress size={14} thickness={5} />
      </Box>
    );
  }

  if (devices) {
    return (
      <Chip
        icon={<DevicesOtherIcon sx={{ '&&': { fontSize: 14 } }} />}
        label={devices.length}
        size="small"
        variant="outlined"
        sx={{
          height: 24,
          fontSize: '0.75rem',
          fontWeight: 600,
          borderRadius: '6px',
          fontVariantNumeric: 'tabular-nums',
          borderColor: (theme) => theme.palette.divider,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
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
      underline="hover"
      sx={{
        color: 'primary.main',
        fontWeight: 500,
        fontSize: '0.8125rem',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        p: 0,
        verticalAlign: 'baseline',
        '&:hover': {
          color: 'primary.dark',
        },
      }}
    >
      {t('reportShow')}
    </Link>
  );
};

export default UserDevicesValue;
