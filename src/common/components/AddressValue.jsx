import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Typography, CircularProgress, Box } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useTranslation } from './LocalizationProvider';
import { useCatch } from '../../reactHelper';
import { formatAddress } from '../util/formatter';
import { usePreference } from '../util/preferences';
import fetchOrThrow from '../util/fetchOrThrow';

const AddressValue = ({ latitude, longitude, originalAddress }) => {
  const t = useTranslation();

  const addressEnabled = useSelector((state) => state.session.server.geocoderEnabled);
  const coordinateFormat = usePreference('coordinateFormat');

  const [address, setAddress] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAddress(originalAddress);
  }, [latitude, longitude, originalAddress]);

  const showAddress = useCatch(async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const query = new URLSearchParams({ latitude, longitude });
      const response = await fetchOrThrow(`/api/server/geocode?${query.toString()}`);
      setAddress(await response.text());
    } finally {
      setLoading(false);
    }
  });

  if (loading) {
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8 }}>
        <CircularProgress size={13} thickness={5} />
        <Typography variant="body2" component="span" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
          {t('sharedLoading')}...
        </Typography>
      </Box>
    );
  }

  if (address) {
    return (
      <Typography
        variant="body2"
        component="span"
        sx={{
          color: 'text.primary',
          fontSize: '0.85rem',
          lineHeight: 1.4,
          wordBreak: 'break-word',
        }}
      >
        {address}
      </Typography>
    );
  }

  if (addressEnabled) {
    return (
      <Link
        component="button"
        type="button"
        onClick={showAddress}
        underline="hover"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'primary.main',
          cursor: 'pointer',
          textAlign: 'left',
          '&:hover': {
            color: 'primary.dark',
          },
        }}
      >
        <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
        {t('sharedShowAddress')}
      </Link>
    );
  }

  return (
    <Typography
      variant="body2"
      component="span"
      sx={{
        color: 'text.secondary',
        fontSize: '0.8125rem',
        fontFamily: 'monospace',
      }}
    >
      {formatAddress({ latitude, longitude }, coordinateFormat)}
    </Typography>
  );
};

export default AddressValue;
